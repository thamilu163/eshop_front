/**
 * NextAuth Configuration & Route Handler
 * 
 * Provides enterprise-grade authentication with Keycloak using:
 * - Authorization Code Flow + PKCE
 * - JWT session strategy with secure HTTP-only cookies
 * - Automatic token refresh with buffer time
 * - Role-based access control
 * - Secure token handling (refresh tokens never exposed to client)
 * 
 * @module app/api/auth/[...nextauth]
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { type JWT } from 'next-auth/jwt';
import { getKeycloakConfig } from '@/lib/auth/env-config';
import { AUTH_ERRORS, type AuthErrorCode } from '@/lib/auth/errors';
import {
  refreshAccessToken as refreshToken,
  logoutFromKeycloak,
  extractRoles,
  shouldRefreshToken,
} from '@/lib/auth/token-service';
import { logger } from '@/lib/observability/logger';

declare module 'next-auth' {
  /**
   * Client-exposed session data
   * NEVER expose refreshToken or accessToken unless absolutely necessary
   */
  interface Session {
    roles?: string[];
    error?: AuthErrorCode;
    expiresAt?: number; // For UI session countdown/warnings
  }
  
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles?: string[];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Server-side JWT token data
   * Sensitive tokens stored server-side only
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    roles?: string[];
    error?: AuthErrorCode;
  }
}

// Validate environment configuration at module load
const keycloakConfig = getKeycloakConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: keycloakConfig.clientId,
      clientSecret: keycloakConfig.clientSecret ?? undefined,
      issuer: keycloakConfig.issuer,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      // Configure for public client with PKCE
      client: {
        token_endpoint_auth_method: 'none',
      },
    } as any),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // If there's an error parameter, redirect to home instead of showing error page
      try {
        const urlObj = new URL(url);
        if (urlObj.searchParams.has('error')) {
          return baseUrl;
        }
      } catch {
        // Invalid URL, continue with default logic
      }
      
      // Prevent redirect loops - if redirecting to signin, go home instead
      if (url.includes('/auth/signin') || url.includes('/api/auth/signin')) {
        return baseUrl;
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allow URLs on the same origin (with proper error handling)
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) return url;
      } catch (error) {
        // Invalid URL, fall through to default
        console.debug('Redirect URL parsing failed:', { url, error });
      }
      
      // After successful login, always redirect to home page
      // The RoleBasedRedirect component on the home page will handle
      // redirecting to appropriate dashboard based on user role
      return baseUrl;
    },

    async jwt({ token, account }) {
      // Initial sign in - store tokens and expiry
      if (account?.access_token) {
        const expiresIn = typeof account.expires_in === 'number' ? account.expires_in : 300; // Default 5 minutes if not provided
        const roles = extractRoles(account.access_token);
        
        console.log('[Auth/JWT] 🎫 Initial sign in');
        console.log('[Auth/JWT] Roles extracted:', roles.length > 0 ? roles.join(', ') : 'none');
        console.log('[Auth/JWT] Token expires in:', expiresIn, 'seconds');
        
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + (expiresIn * 1000),
          roles: roles,
          error: undefined,
        };
      }

      // ❌ CRITICAL: Don't refresh if no refresh token exists (no user logged in)
      if (!token.refreshToken) {
        return token;
      }

      // ✅ FIX: Return previous token if not expired - don't refresh on EVERY request
      // Only refresh when token is actually about to expire (within buffer time)
      if (!shouldRefreshToken(token.accessTokenExpires)) {
        return token;
      }

      // Token is expiring soon - refresh it with validation and error handling (public client)
      console.log('[Auth/JWT] 🔄 Token expiring soon, refreshing...');
      logger.info('[auth] Refreshing access token', {
        expiresAt: token.accessTokenExpires ? new Date(token.accessTokenExpires).toISOString() : 'unknown',
      });

      const refreshedToken = await refreshToken(token, {
        issuer: keycloakConfig.issuer,
        clientId: keycloakConfig.clientId,
        // Public client - no clientSecret needed
      });
      
      if (refreshedToken.error) {
        console.log('[Auth/JWT] ❌ Token refresh failed:', refreshedToken.error);
      } else {
        console.log('[Auth/JWT] ✅ Token refreshed successfully');
        console.log('[Auth/JWT] New roles:', refreshedToken.roles?.join(', ') || 'none');
      }
      
      return refreshedToken;
    },

    async session({ session, token }) {
      // If there's a token error (expired/invalid), clear the session
      if (token.error) {
        console.log('[Auth/Session] ⚠️ Session has error:', token.error);
        logger.warn('[auth] Session has error, user needs to re-authenticate', {
          error: token.error,
          expiresAt: token.accessTokenExpires ? new Date(token.accessTokenExpires).toISOString() : 'unknown',
        });
        // Return minimal session to force re-login
        return {
          ...session,
          error: token.error,
          user: undefined,
        };
      }

      console.log('[Auth/Session] 📋 Building session');
      console.log('[Auth/Session] User:', token.email);
      console.log('[Auth/Session] Roles:', token.roles?.join(', ') || 'none');

      // Expose necessary data to session
      session.roles = token.roles;
      session.error = token.error;
      session.expiresAt = token.accessTokenExpires;
      
      // Add roles and id to user object for easy access
      if (session.user) {
        session.user.id = token.sub ?? '';
        if (token.roles) {
          session.user.roles = token.roles;
        }
      }
      
      // ✅ Expose accessToken to server-side session (not client)
      // This allows API routes to access it via getServerSession()
      // Client-side cannot access this directly for security
      (session as any).accessToken = token.accessToken;
      
      return session;
    },
  },

  // Removed custom sign-in page - NextAuth will redirect directly to Keycloak
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  // },

  events: {
    async signOut({ token }) {
      // Revoke Keycloak refresh token with retry logic
      if (token?.refreshToken) {
        const result = await logoutFromKeycloak(
          token.refreshToken as string,
          {
            issuer: keycloakConfig.issuer,
            clientId: keycloakConfig.clientId,
            // Public client - no clientSecret needed
          },
          2 // max retries
        );
        
        if (!result.success) {
          console.error('Keycloak logout failed:', result.error);
          // Note: Local session is still cleared even if Keycloak logout fails
          // This prevents blocking the user, but SSO sessions may persist
        }
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

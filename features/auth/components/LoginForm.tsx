/**
 * Login Form Component - Enterprise Implementation
 * 
 * Features:
 * - Form validation with zod + react-hook-form
 * - OAuth/Keycloak integration
 * - Rate limiting feedback
 * - Accessible form controls
 * - Loading states
 * - Error display
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useLogin';
import { env } from '@/env';
import { cn } from '@/lib/utils';
import { LoginRequest } from '@/types/auth.types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
  status?: number;
};

type RateLimitInfo = {
  isLimited: boolean;
  retryAfter?: number;
  attemptsRemaining?: number;
};

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(254, 'Username is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
}) satisfies z.ZodType<LoginRequest>;

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  id?: string;
  redirectTo?: string | null;
  error?: string;
  message?: string;
  rateLimitInfo?: RateLimitInfo;
}



function getErrorMessage(status?: number): string {
  switch (status) {
    case 401:
      return 'Invalid username or password.';
    case 403:
      return 'Your account is locked. Please contact support.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
      return 'Authentication service is unavailable. Please try again later.';
    default:
      return 'Unable to sign in. Please try again.';
  }
}

export function LoginForm({
  id,
  redirectTo,
  error: serverError,
  message: serverMessage,
  rateLimitInfo,
}: LoginFormProps) {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(rateLimitInfo?.retryAfter || 0);
  const [popupBlocked, _setPopupBlocked] = useState(false);
  const [popupError, _setPopupError] = useState<string | null>(null);

  const loginMutation = useLogin({ disableRedirect: true, redirectTo: redirectTo ?? undefined });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const displayError = useMemo(() => {
    if (serverError) return serverError;

    const mutationError = loginMutation.error as AxiosError<ApiErrorResponse> | null;
    if (mutationError) {
      const status = mutationError.response?.status ?? mutationError.response?.data?.status;
      return (
        mutationError.response?.data?.message ||
        mutationError.response?.data?.error ||
        getErrorMessage(status)
      );
    }

    return null;
  }, [loginMutation.error, serverError]);

  const isRateLimited = rateLimitInfo?.isLimited && countdown > 0;
  const isFormDisabled =
    isSubmitting || loginMutation.isPending || isOAuthLoading || Boolean(isRateLimited);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (rateLimitInfo?.retryAfter) {
      setCountdown(rateLimitInfo.retryAfter);
    }
  }, [rateLimitInfo?.retryAfter]);

  useEffect(() => {
    if (loginMutation.isError) {
      reset({ username: getValues('username'), password: '' });
      errorRef.current?.focus();
      setFocus('password');
    }
  }, [getValues, loginMutation.isError, reset, setFocus]);

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      try {
        await loginMutation.mutateAsync(data);

        setShowSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(redirectTo || '/customer/dashboard');
      } catch (_err) {
        // Mutation errors are surfaced via displayError and toast in the hook
      }
    },
    [loginMutation, redirectTo, router]
  );

  const handleOAuthLogin = useCallback(async () => {
    setIsOAuthLoading(true);

    // Use a server-side navigation to the authorize endpoint with direct redirect.
    // This ensures the server stores the PKCE state cookie (HttpOnly) in the
    // Use NextAuth's signin endpoint with Keycloak provider
    // This properly initiates PKCE flow without custom routes
    try {
      const params = new URLSearchParams();
      if (redirectTo) {
        params.set('callbackUrl', redirectTo);
      }

      const url = `/api/auth/signin/keycloak?${params.toString()}`;
      window.location.href = url;
    } finally {
      // loading state will be cleared by navigation, but clear if navigation blocked
      setIsOAuthLoading(false);
    }
  }, [redirectTo]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <Card
      className={cn(
        'w-full max-w-md relative overflow-hidden',
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl',
        'border border-slate-200/60 dark:border-slate-800/60',
        'shadow-xl shadow-slate-900/10 dark:shadow-slate-950/30',
        'animate-in fade-in-0 slide-in-from-bottom-8 duration-700 ease-out',
        'sm:max-w-lg'
      )}
      id={id}
      role="region"
      aria-label="Login form"
    >
      {showSuccess && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-md dark:bg-slate-900/95"
          role="status"
          aria-live="polite"
        >
          <div className="animate-in zoom-in-95 fade-in-0 duration-300 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Welcome back!
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}

      <CardHeader className="space-y-2 pb-6 pt-8 px-6 sm:px-8 sm:pt-10">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20">
          <Lock className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div
          ref={errorRef}
          tabIndex={-1}
          className={cn(
            'rounded-lg p-4 text-sm flex items-start gap-3 outline-none transition-all duration-300',
            displayError
              ? 'mb-5 bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300'
              : 'h-0 overflow-hidden p-0 mb-0 opacity-0'
          )}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          id="form-error"
        >
          {displayError && (
            <>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium">Authentication failed</p>
                <p className="mt-0.5 text-sm opacity-90">{displayError}</p>
              </div>
            </>
          )}
        </div>

        {serverMessage && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300" role="status">
            {serverMessage}
          </div>
        )}

        {isRateLimited && (
          <div
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">Too many attempts</p>
              <p className="mt-1 opacity-90">Please wait {countdown} seconds before trying again.</p>
            </div>
          </div>
        )}

        {rateLimitInfo?.attemptsRemaining && rateLimitInfo.attemptsRemaining <= 3 && !isRateLimited && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300" role="status">
            <p className="font-medium">⚠️ Warning: Only {rateLimitInfo.attemptsRemaining} login attempts remaining</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-busy={isSubmitting || loginMutation.isPending}
          aria-describedby={displayError ? 'form-error' : undefined}
        >
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Username<span className="text-red-500 ml-1" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className={cn(
                  'h-12 pl-11 text-base',
                  'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/50',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus-visible:border-blue-500 focus-visible:ring-blue-500/20',
                  'transition-all duration-200',
                  errors.username && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                )}
                autoComplete="username"
                autoFocus
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
                {...register('username')}
                disabled={isFormDisabled}
              />
            </div>
            {errors.username && (
              <p id="username-error" className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password<span className="text-red-500 ml-1" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={cn(
                  'h-12 pl-11 pr-12 text-base',
                  'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/50',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus-visible:border-blue-500 focus-visible:ring-blue-500/20',
                  'transition-all duration-200',
                  errors.password && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                )}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                disabled={isFormDisabled}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2',
                  'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end -mt-1">
            <Link
              href="/forgot-password"
              className={cn(
                'text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'rounded-md px-2 py-1 -mx-2 -my-1'
              )}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className={cn(
              'w-full h-12 text-base font-semibold',
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
              'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30',
              'transition-all duration-200',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none'
            )}
            disabled={isFormDisabled}
            aria-describedby={isSubmitting || loginMutation.isPending ? 'submit-status' : undefined}
          >
            {isSubmitting || loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
                <span id="submit-status" className="sr-only" role="status">
                  Please wait while we verify your credentials
                </span>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" aria-hidden="true" />
                Sign in
              </>
            )}
          </Button>
              {popupBlocked && (
                <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="mb-2">Popup blocked. Please allow popups for this site.</p>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleOAuthLogin} disabled={isOAuthLoading}>
                      Retry SSO
                    </Button>
                    <Link href="/auth/debug-redirect" className="text-sm text-blue-600 underline">
                      Open debug redirect
                    </Link>
                  </div>
                </div>
              )}

              {popupError && !popupBlocked && (
                <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  <p>{popupError}</p>
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={handleOAuthLogin} disabled={isOAuthLoading}>
                      Try again
                    </Button>
                  </div>
                </div>
              )}
        </form>

        {env.enableOAuth && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
                <span className="bg-white/95 dark:bg-slate-900/95 px-3 text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full h-12 text-base font-semibold',
                'border-2 border-slate-300 dark:border-slate-700',
                'bg-white hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-800/50',
                'text-slate-700 dark:text-slate-200',
                'transition-all duration-200',
                'hover:border-blue-400 dark:hover:border-blue-600',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              onClick={handleOAuthLogin}
              disabled={isFormDisabled}
            >
              {isOAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Connecting to Keycloak...
                </>
              ) : (
                <>
                  <KeycloakIcon className="mr-2 h-5 w-5" />
                  Sign in with SSO
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-6 sm:px-8">
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className={cn(
              'font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              'rounded-md px-1.5 py-0.5 -mx-1.5'
            )}
          >
            Sign up
          </Link>
        </p>
        <p className="text-xs text-center text-slate-500 dark:text-slate-500">
          🔒 Secured by Keycloak
        </p>
      </CardFooter>
    </Card>
  );
}

function KeycloakIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M52.8 29.2L50 28.8L51.2 25.6L49.2 22.8L46 23.6L44 21.2L44.8 18L41.6 16.4L40 19.2L36.8 19.2L35.2 16.4L32 18L32.4 21.2L30 23.2L26.8 22.4L24.8 25.2L26 28.4L23.2 29.2L23.2 32.8L26 33.6L24.8 36.8L26.8 39.6L30 38.8L32 41.2L31.2 44.4L34.4 46L36 43.2L39.2 43.2L40.8 46L44 44.4L43.6 41.2L46 39.2L49.2 40L51.2 37.2L50 34L52.8 33.2L52.8 29.2Z"
        fill="currentColor"
      />
      <circle cx="38" cy="31" r="6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

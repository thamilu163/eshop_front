/**
 * Environment Configuration Validation
 * Ensures all required auth environment variables are present
 */

/**
 * Required Keycloak environment variables
 */
const REQUIRED_ENV_VARS = [
  'KEYCLOAK_CLIENT_ID',
  'KEYCLOAK_ISSUER',
] as const;

/**
 * Optional Keycloak environment variables (for confidential clients)
 */
const OPTIONAL_ENV_VARS = [
  'KEYCLOAK_CLIENT_SECRET',
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];
type OptionalEnvVar = (typeof OPTIONAL_ENV_VARS)[number];

/**
 * Validated Keycloak configuration
 */
export interface KeycloakConfig {
  clientId: string;
  clientSecret?: string;
  issuer: string;
}

/**
 * Validate and extract Keycloak configuration from environment variables
 * Throws descriptive error if any required variable is missing
 * KEYCLOAK_CLIENT_SECRET is optional (for public clients with PKCE)
 */
export function validateKeycloakConfig(): KeycloakConfig {
  const missingVars: string[] = [];
  const config: Partial<KeycloakConfig> = {};

  // Check required vars
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      missingVars.push(envVar);
    } else {
      // Map env var names to config keys
      switch (envVar) {
        case 'KEYCLOAK_CLIENT_ID':
          config.clientId = value;
          break;
        case 'KEYCLOAK_ISSUER':
          config.issuer = value;
          break;
      }
    }
  }

  // Check optional vars (clientSecret for confidential clients)
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  if (clientSecret && clientSecret.trim() !== '') {
    config.clientSecret = clientSecret;
  }

  if (missingVars.length > 0) {
    const varList = missingVars.join(', ');
    throw new Error(
      `Missing required environment variables for Keycloak authentication: ${varList}\n` +
      `Please ensure these variables are set in your .env.local file.`
    );
  }

  return config as KeycloakConfig;
}

/**
 * Get validated Keycloak configuration
 * Memoized to validate only once
 */
let cachedConfig: KeycloakConfig | null = null;

export function getKeycloakConfig(): KeycloakConfig {
  if (!cachedConfig) {
    cachedConfig = validateKeycloakConfig();
  }
  return cachedConfig;
}

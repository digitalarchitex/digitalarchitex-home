/**
 * GCP Workload Identity Federation helper for Vercel
 *
 * Exchanges Vercel's OIDC token for a GCP access token to call Cloud Run services
 */

const PROJECT_NUMBER = '474964350921';
const POOL_ID = 'vercel-pool';
const PROVIDER_ID = 'vercel-provider';
const SERVICE_ACCOUNT = 'vercel-auth-caller@sylvan-journey-474401-f9.iam.gserviceaccount.com';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Get a GCP access token using Workload Identity Federation
 */
export async function getGcpAccessToken(): Promise<string> {
  // Get Vercel's OIDC token from environment
  const vercelOidcToken = process.env.VERCEL_OIDC_TOKEN;

  if (!vercelOidcToken) {
    throw new Error('VERCEL_OIDC_TOKEN not found in environment');
  }

  // Step 1: Exchange Vercel OIDC token for a GCP STS token
  const stsUrl = 'https://sts.googleapis.com/v1/token';
  const audience = `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}`;

  const stsResponse = await fetch(stsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience: audience,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: vercelOidcToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    }),
  });

  if (!stsResponse.ok) {
    const errorText = await stsResponse.text();
    throw new Error(`STS token exchange failed: ${stsResponse.status} - ${errorText}`);
  }

  const stsToken: TokenResponse = await stsResponse.json();

  // Step 2: Exchange STS token for service account access token
  const iamUrl = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`;

  const iamResponse = await fetch(iamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${stsToken.access_token}`,
    },
    body: JSON.stringify({
      scope: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  if (!iamResponse.ok) {
    const errorText = await iamResponse.text();
    throw new Error(`IAM token generation failed: ${iamResponse.status} - ${errorText}`);
  }

  const iamToken = await iamResponse.json();

  return iamToken.accessToken;
}

/**
 * Call a Cloud Run service with authentication
 */
export async function callCloudRun(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = await getGcpAccessToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

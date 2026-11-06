# Google OAuth Setup

Configure Google OAuth as a web application in Google Cloud Console.

## Local development

Add the following server-only values to `.env.local`:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_URL=http://localhost:3000`

Configure these URLs:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Production

Use the deployed HTTPS origin in Google Cloud Console:

- Authorized JavaScript origin: `https://<production-domain>`
- Authorized redirect URI: `https://<production-domain>/api/auth/callback/google`

Configure the equivalent secrets through the production environment secret manager.
Do not place OAuth credentials in client-exposed `NEXT_PUBLIC_` variables.

Only existing ACTIVE academy users with an independently verified
`emailVerified` date can link a verified Google identity.

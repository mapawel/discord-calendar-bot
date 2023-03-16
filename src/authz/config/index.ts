import { config } from 'dotenv';
config();

export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTHZ_SECRET,
  baseURL: process.env.APP_BASE_URL,
  clientID: process.env.AUTHZ_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,
};

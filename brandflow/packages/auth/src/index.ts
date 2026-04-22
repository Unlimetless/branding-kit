// BrandFlow Auth Package
// Better Auth configuration with Google OAuth

export const authConfig = {
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    },
  },
  database: {
    type: 'postgresql',
    url: process.env.DATABASE_URL!,
  },
  session: {
    secret: process.env.BETTER_AUTH_SECRET!,
    expiry: '30 days',
  },
}

export type AuthConfig = typeof authConfig
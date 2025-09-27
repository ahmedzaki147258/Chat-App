import passport from "passport";
import { Request } from "express";
import { User } from "src/db/index";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.SERVER_URL}/api/auth/google/callback`
          : `http://localhost:${process.env.PORT}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails![0].value,
            googleId: profile.id,
            authProvider: "google",
            imageUrl: profile?.photos?.[0].value.replace(/=s\d+-c/, '=s256-c') || null,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
import passport from "passport";
import { Request } from "express";
import { User } from "src/db/index";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20";

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
        // Check if user already exists with this Google ID
        let user = await User.findOne({ where: { googleId: profile.id } });
        if (user) {
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email but different auth provider
        user = await User.findOne({ where: { email: profile.emails![0].value } });
        if (user) {
          // Link Google account to existing user and update profile image if available
          user.name = profile.displayName;
          user.googleId = profile.id;
          user.authProvider = "google";

          // Upload profile image from Google if available and user doesn't have one
          if (profile.photos && profile.photos[0] && !user.imageUrl) {
            try {
              user.imageUrl = profile.photos[0].value;
            } catch (error) {
              console.error("Error uploading profile image:", error);
              // Continue without profile image if upload fails
            }
          }

          await user.save();
          return done(null, user);
        }

        // Prepare new user data
        const userData = {
          name: profile.displayName,
          email: profile.emails![0].value,
          googleId: profile.id,
          authProvider: "google" as const,
          imageUrl: '',
          // No password needed for Google auth
        };

        // Upload profile image from Google if available
        if (profile.photos && profile.photos[0]) {
          try {
            userData.imageUrl = profile.photos[0].value;
          } catch (error) {
            console.error("Error uploading profile image:", error);
            // Continue without profile image if upload fails
          }
        }

        // Create new user
        const newUser = await User.create(userData);
        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done: (err: any, id: number) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done: (err: any, user: Express.User | null) => void) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
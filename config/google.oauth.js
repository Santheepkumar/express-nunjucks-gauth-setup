const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const config = require("./env.config");
const Users = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // Inserting and finding the google authed user if thay login 1st time
      // It thay registered user then simply finding and returning it
      return Users.findOne({ id: profile.id })
        .then((usr) => {
          if (!usr) {
            const user = new Users();
            user.firstName = profile.given_name;
            user.lastName = profile.family_name;
            user.userId = profile.id;
            user.email = profile.email;
            user.picture = profile.picture;
            user.createdAt = new Date();

            return user.save().then(() => {
              return Users.findOne({ userId: profile.id });
            });
          }
          return Users.findOne({ userId: profile.id });
        })
        .then((usr) => {
          return done(null, usr);
        })
        .catch((e) => done(e));
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.userId);
});

passport.deserializeUser(function (id, done) {
  return Users.findOne({ userId: id })
    .then((user) => {
      return done(null, user);
    })
    .catch((e) => done(e));
});

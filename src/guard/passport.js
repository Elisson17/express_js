const passport = require("passport");
const bcrypt = require("bcrypt");
const database = require("../db");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "DDeeC6PvDryaAJphyA7P7QbSbcrtKJRJ104tbSzIMoA=";

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    database.one('SELECT * FROM users WHERE id = $1', [jwt_payload.sub])
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => {
            return done(err, false);
        });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

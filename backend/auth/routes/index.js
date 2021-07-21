const joi = require("joi");
const { createUser, getUser, loginUser } = require("../controllers");
const models = require("../../database/models");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// passport strategy
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

router.post("/me", getUser);

router.post("/signup", createUser);

passport.use(
  new LocalStrategy(function (email, password, done) {
    models.users.findOne({ where: { email } }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Unknown user " + email });
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (!result) {
          return done(null, false, { message: "Incorrect password." });
        } else {
          return done(null, user);
        }
      });
    });
  })
);

router.post("/login", loginUser);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  models.users.findOne({ where: { id } }).then((err, user) => {
    done(err, user);
  });
});

router.get("/login/failed", (req, res) => {
  res.json({ msg: "Username or password invalid ", auth: false });
});

module.exports = router;

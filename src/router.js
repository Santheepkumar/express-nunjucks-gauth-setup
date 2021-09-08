const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");

// Pages
router.get("/", function (req, res) {
  return res.render("home.html");
});

router.get("/about", function (req, res) {
  return res.render("aboutus.html", { active: "about" });
});

router.get("/features", function (req, res) {
  return res.render("features.html", { active: "features" });
});

router.get("/contact", function (req, res) {
  return res.render("contactus.html", { active: "contact" });
});

router.get("/testimonials", function (req, res) {
  return res.render("testimonials.html", { active: "testimonials" });
});

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure"
  })
);

router.get("/success", isLoggedIn, (req, res) => {
  res.send(`Hi ${req.user.firstName} you are logged in`);
});

router.get("/failure", (req, res) => {
  res.send("Login Failed");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect("/");
});

module.exports = router;

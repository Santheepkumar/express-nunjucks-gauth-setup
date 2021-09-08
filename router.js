const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport")
router.get("/", function (req, res) {
  return res.render("index.html");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  })
);
const isLoggedIn = (rq, rs, nxt) => {
  if (rq.user) {
    nxt();
  } else {
    rs.sendStatus(401);
  }
};

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

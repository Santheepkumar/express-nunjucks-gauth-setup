const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const csrf = require("csurf");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const nunjucks = require("nunjucks");
require("./config/mongoose.config");
require("./config/google.oauth");
const router = require("./router");
const appConfig = require("./config/env.config");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: appConfig.sessionSecret,
    saveUninitialized: false, // don't create session until something stored
    resave: false,
    store: MongoStore.create({
      mongoUrl: appConfig.sessionDbUrl,
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: "interval",
      autoRemoveInterval: 10, // In minutes. Default
      touchAfter: 4 * 3600, // time period in seconds
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((err, req, res, next) => {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      res.send("Errors: Cross site request forgery detected.");
      req.session.save(() => res.redirect("/"));
    } else {
      res.render("404");
    }
  }
});

app.set("view engine", "html");

nunjucks.configure(["views/"], {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use("/", router);
app.use(express.static("public"));

const port = appConfig.port;
app.listen(port, () =>
  console.info(`App is running on http://localhost:${port}`)
);

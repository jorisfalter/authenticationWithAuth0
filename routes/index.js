//jshint esversion:6

require("dotenv").config();
var router = require("express").Router();
const { requiresAuth } = require("express-openid-connect");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

router.use(bodyParser.urlencoded({ extended: true }));

// mongoose connection
mongoose.connect(
  "mongodb+srv://joristoptal:" +
    process.env.MONGO_KEY +
    "@cluster0.bchijyg.mongodb.net/db-name",
  {
    useNewUrlParser: true,
  },
  (err) => {
    if (err) console.log(err);
    else console.log("mongdb is connected");
  }
);

// usersSchema
const usersSchema = new mongoose.Schema({
  email: String,
});
const User = mongoose.model("User", usersSchema);

////////////////////////////////////////////
// apis
router.get("/admin", function (req, res) {
  // console.log(req.oidc.user);
  User.findOne({ email: req.oidc.user.email }, function (err, user) {
    console.log(user);
    console.log(user._id);
    console.log(user.toObject().connection);
    // console.log(keys(user));
    // console.log(values(user));

    // if (err) {
    //   console.log(err);
    // } else {
    //   if (user.permissionLevel === "Admin") {
    //     res.render("admin", {
    //       userProfile: JSON.stringify(req.oidc.user, null, 2),
    //       title: "Admin page",
    //     });
    //   } else {
    //     res.status(401);
    //     console.log("no access");
    //   }
    // }
  });
});

router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Joris Super App",
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

router.get("/profile", requiresAuth(), function (req, res, next) {
  res.render("profile", {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: "Profile page",
  });
});

router.get("/changeEmail", requiresAuth(), function (req, res) {
  res.render("changeemail", {
    userEmail: JSON.stringify(req.oidc.user.email, null, 2),
  });
});

router.get("/changeemailsucces", requiresAuth(), function (req, res) {
  res.render("changeemailsucces", {
    userEmail: JSON.stringify(req.oidc.user.email, null, 2),
  });
});

router.post("/changeEmail", requiresAuth(), function (req, res) {
  newEmail = req.body.newEmailName;
  console.log("this is the new email: " + newEmail);

  // it should check if the email already exists
  console.log("this is the old email: " + req.oidc.user.email);

  User.findOneAndUpdate(
    { email: req.oidc.user.email },
    { email: newEmail },
    function (err) {
      if (!err) {
        console.log("succesfully updated");
        res.redirect("/changeemailsucces");
      }
    }
  );
});

module.exports = router;

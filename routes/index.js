//jshint esversion:6

require("dotenv").config();
var router = require("express").Router();
var axios = require("axios").default;
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

//////// admin apis ////////
router.get("/admin", function (req, res) {
  // check if user is admin
  User.findOne({ email: req.oidc.user.email }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      if (user.toObject().permissionLevel === "Admin") {
        res.render("admin", {
          userProfile: JSON.stringify(req.oidc.user, null, 2),
          title: "Admin page",
        });
      } else {
        res.status(401);
        //console.log(res.statusCode);
        console.log("no access");
        res.render("fouroone");
      }
    }
  });
});

// list all users in the browser
router.get("/allusers", function (req, res) {
  // check if user is admin
  User.findOne({ email: req.oidc.user.email }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      if (user.toObject().permissionLevel === "Admin") {
        // fetch mongoose data
        User.find({}, function (err, users) {
          var userMap = {};
          var userList = [];
          var counter = 0;
          users.forEach(function (user) {
            userMap[user.email] = user;
            userList[counter] = user.email;
            counter++;
          });
          console.log(userList);
          res.render("allusers", { userList: userList });
          // res.send(userMap);
        });
        // fetch auth0 db user data  >not functinoal
        // https://auth0.com/docs/manage-users/user-search/retrieve-users-with-get-users-endpoint
        // var options = {
        //   method: "GET",
        //   url: "https://dev-8t8sluw6k3s51r4r.us.auth0.com/api/v2/users",
        //   params: { search_engine: "v3" },
        //   headers: { authorization: "Bearer {yourMgmtApiAccessToken}" },
        // };
        // axios
        //   .request(options)
        //   .then(function (response) {
        //     console.log(response.data);
        //   })
        //   .catch(function (error) {
        //     console.error(error);
        //   });
      } else {
        res.status(401);
        //console.log(res.statusCode);
        console.log("no access");
        res.render("fouroone");
      }
    }
  });
});

// see users' activity
//// login / logout > from auth0
//// password reset > from auth0
//// confirmation email > from auth0
//// profile update > from my own db > i don't have this functionality yet

//////// client apis ////////
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

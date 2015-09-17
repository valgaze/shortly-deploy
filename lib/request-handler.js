var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');

var curentEnvironment = process.env.NODE_ENV;


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};


if (curentEnvironment === "production"){

  var User = require('../app/mongohelpers/mongo_user');
  var Link = require('../app/mongohelpers/mongo_url');

  exports.fetchLinks = function(req, res) {
    
    // User.find({username: 'Horatio'}, function(err, result) {
    //   if (err) {
    //     return console.log('Error!!!', err);
    //   }

    //   else {
    //     console.log(result);
    //   }
    // })

   Link.find(function(err, links) {
      if (err) {
        console.log('Error fetching links', err);
      } else {
        res.send(200, links);
      }
    });
   
    //Query all links from DB and return res.send(200, the_results)
  };

  exports.saveLink = function(req, res) {
    var uri = req.body.url;
    var linkInstance = new Link({ url: uri });

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.send(404);
    }
 
    Link.find(linkInstance, function(err, result) {
     if (err) return console.log('Error finding link', err);
     if (result.length === 0) {
         util.getUrlTitle(uri, function(err, title) {
               if (err) {
                   console.log('Error reading URL heading: ', err);
                   return res.send(404);
               }
               var newLink = new Link({
                   url: uri,
                   title: title,
                   base_url: req.headers.origin
               });

               newLink.encodeLink();
               newLink.save(function(err, result) {
                   if (err) return console.log("Error saving", err);
                   res.send(200, result);

               });

         });

     }
     else { 
         res.send(200, result)

     }

    });
  };



  exports.loginUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    //Make User object, call hashPassword method, then query DB 
   
    User.find({username: username}, function(err, user) {
      console.log("user: ", user);
    
      if (err) {
        return console.log("Lol, we messed up", err);
      }
      if (user.length > 0) {
        var foundPassword = user[0].password;
        bcrypt.compare(password, foundPassword, function(err, passwordsMatch) {
          if (err) return console.log(err);

          if (passwordsMatch){
            util.createSession(req, res, user);
          }else{
            console.log('Username or password does not match', passwordsMatch);
            res.redirect("/login");
          }
        });
      }else{
        console.log('Username not found');
        res.redirect('/login');
      }
    });
      //If User not in DB, res.redict('/login');
      //If User found, make a helper function with the compare password function with the user in the DB
      //If a match, make create session
        //    util.createSession(req, res, user);
      //If password doesn't match res.redirect('/login');
  };

  exports.signupUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    //Make a User object
      //Query User DB
      User.find({username:username}, function(err, result){
        if (err) return console.log(err);

        if (result.length === 0){
          var userCandidate = new User({username: username});

          userCandidate.hashPassword(password);

          userCandidate.save(function(err, result){
            if (err) return console.log(err);

            console.log("We think everythings cool, saved with this user", result);

            util.createSession(req, res, result)
          });
          
        }
        else{
          console.log('Username is already taken');
          res.redirect('/signup');
        }

      });

  };


  exports.navToLink = function(req, res) {

    Link.find({url: req.params[0]}, function(err, result){
      if (err) return console.log(err);

      if (result.length === 0){
        res.redirect('/');
      }else{
        res.redirect(result[0].url);
      }   

    });
    //Make Link object with req.params[0]
      //Query DB
        // If code doesn't exist in DB, redirect res.redirect('/');
        // If code does exist in database
          //Retrieve the URL's visits, then get visits and increment by 1
  };

}else{

  var User = require('../app/models/user');
  var Link = require('../app/models/link');
  var Users = require('../app/collections/users');
  var Links = require('../app/collections/links');


  exports.fetchLinks = function(req, res) {
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    })
  };

  exports.saveLink = function(req, res) {
    var uri = req.body.url;

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.send(404);
    }

    new Link({ url: uri }).fetch().then(function(found) {
      if (found) {
        res.send(200, found.attributes);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.send(404);
          }
          var newLink = new Link({
            url: uri,
            title: title,
            base_url: req.headers.origin
          });
          newLink.save().then(function(newLink) {
            Links.add(newLink);
            res.send(200, newLink);
          });
        });
      }
    });
  };

  exports.loginUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    new User({ username: username })
      .fetch()
      .then(function(user) {
        if (!user) {
          res.redirect('/login');
        } else {
          user.comparePassword(password, function(match) {
            if (match) {
              util.createSession(req, res, user);
            } else {
              res.redirect('/login');
            }
          })
        }
    });
  };

  exports.signupUser = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    new User({ username: username })
      .fetch()
      .then(function(user) {
        if (!user) {
          var newUser = new User({
            username: username,
            password: password
          });
          newUser.save()
            .then(function(newUser) {
              Users.add(newUser);
              util.createSession(req, res, newUser);
            });
        } else {
          console.log('Account already exists');
          res.redirect('/signup');
        }
      });
  };

  exports.navToLink = function(req, res) {
    new Link({ code: req.params[0] }).fetch().then(function(link) {
      if (!link) {
        res.redirect('/');
      } else {
        link.set({ visits: link.get('visits') + 1 })
          .save()
          .then(function() {
            return res.redirect(link.get('url'));
          });
      }
    });
  };

}


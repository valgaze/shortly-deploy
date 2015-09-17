var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Schema = db.Schema;

  var userSchema = Schema({
    username: String,
    password: String,
    timestamp: Date
  });

  userSchema.methods.hashPassword = function(){
    var salt = bcrypt.genSaltSync(10);
    var password = bcrypt.hashSync(this.password, salt);
    this.password = password;
  }

  var User = db.model('User', userSchema);

  module.exports = User;

/**** USAGE:
  //Instantiate:
  var aUser = new User({username:"myUser123", password:""})
  //Hashpassword
  aUser.hashPassword()// {username:"myUser123", password: "asdfihasdjkfjasld"}

  
  //For login: you don't need to store the salt with bcrypt's implementation. This means 
  // you cannot use ===, but use their compare function will hash the input and return true/false in a callback
  var password = bcrypt.hashSync("apples123", salt);

    bcrypt.compare("apples123", '$2a$10$hMxvvhXRyjixsZPZjORjdOEbaatg99ztk/OOd4fcqAqrphLUhys/m', function(err, res) {
    console.log(res);
       // If res is true, then log them in and do all the rest

       // If res is false
    })

****/
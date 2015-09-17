var path = require('path');
var curentEnvironment = process.env.NODE_ENV;


  //Do some mongo stuff
  

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  mongoose.connect('mongodb://localhost/test');



  var urlSchema = Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    visits: {type: Number, default: 0},
    timestamp: {type: Date, default: Date.now}
  });

    var Url = mongoose.model('url', urlSchema);
    var instance = new Url({url:'http://www.cnn.com'});

instance.save(function (err) {
  if (err) // ...
  console.log('meow');
});







var db = require('../config');
var crypto = require('crypto');
var Schema = db.Schema;

  var urlSchema = Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    visits: {type: Number, default: 0},
    timestamp: {type: Date, default: Date.now}
  });

  urlSchema.methods.encodeLink = function(){
    var shasum = crypto.createHash('sha1');
      shasum.update(this.url);
      this.code = shasum.digest('hex').slice(0, 5);
  }

  var Url = db.model('url', urlSchema);

  module.exports = Url;

  //var aLink = new Url({url:"http://www.google.com"}); 
    //Before saving:
    //1) Check if a valid URL (utility library)
    //2) Check if it already exists in the database (query, make a proper mongo object for querying)
        //If all good, retrieve the title (utility library)
          //When that's done with a callback, then attach the base_url
          //Then save it to the database
            //If no error, get the data and send it back to the user!

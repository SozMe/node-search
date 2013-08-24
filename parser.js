var db = require("mongous").Mongous;
var cheerio = require('cheerio');
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var nbUrls = 100;

eventEmitter.on("parseFinished", parseFinished);
eventEmitter.on("AllparseFinished", parse);

var get_title = function ($) {
  var titles = $("title");
  var ret = [];

  for (var i = titles.length - 1; i >= 0; i--) {
    ret.push($(titles[i]).text());
  }
  titles = null;
  return ret;
};

var get_keywords = function ($) {
  var keywords = $("meta[name=keywords]");
  var ret = [];

  for (var i = keywords.length - 1; i >= 0; i--) {
    // ret.push($(keywords[i]).attr("content"));
    ret.push($(keywords[i]).attr("content"));
  }
  keywords = null;
  return ret;
};

var get_description = function ($) {
  var descriptions = $("meta[name=description]");
  var ret = [];

  for (var i = descriptions.length - 1; i >= 0; i--) {
    // ret.push($(descriptions[i]).attr("content"));
    ret.push($(descriptions[i]).attr("content"));
  }
  descriptions = null;
  return ret;
};

var get_lang = function ($) {
  var langs = $("html");
  var ret = [];

  for (var i = langs.length - 1; i >= 0; i--) {
    // ret.push($(langs[i]).attr("content"));
    ret.push($(langs[i]).attr("lang"));
  }
  lans = null;
  return ret;
};

var get_h1 = function ($) {
  var h1s = $("h1");
  var ret = [];

  for (var i = h1s.length - 1; i >= 0; i--) {
    // ret.push($(h1s[i]).attr("content"));
    ret.push($(h1s[i]).text());
  }
  h1s = null;
  return ret;
};

var get_h2 = function ($) {
  var h2s = $("h2");
  var ret = [];

  for (var i = h2s.length - 1; i >= 0; i--) {
    // ret.push($(h2s[i]).attr("content"));
    ret.push($(h2s[i]).text());
  }
  h2s = null;
  return ret;
};

var get_h3 = function ($) {
  var h3s = $("h3");
  var ret = [];

  for (var i = h3s.length - 1; i >= 0; i--) {
    // ret.push($(h3s[i]).attr("content"));
    ret.push($(h3s[i]).text());
  }
  h3s = null;
  return ret;
};

tags = {
   "title": get_title ,
   "keywords": get_keywords ,
   "description": get_description,
   "lang": get_lang ,
   "h1": get_h1 ,
   "h2": get_h2 ,
   "h3": get_h3
};

var errcount = 0;

var get_page_info = function (err, res, body) {
  var urlparsed = {};

  if (!err) {
    try {
      $ = cheerio.load(body);
      console.log(res.request.href);
      for (var key in tags){
        urlparsed[key] = tags[key]($);
      }
      urlparsed["url"] = res.request.href;
      // console.log(urlparsed);
      db("search.parsedurls").save(urlparsed);
    }
    catch (e) {
      console.log("error parsing dom");
      eventEmitter.emit("parseFinished");
    }
  } else {
    console.log(err);
    console.log(++errcount);
    // db("search.parsedurls").save(urlparsed);
  }
  eventEmitter.emit("parseFinished");
};

var countParseFinished = 0;
var expectedFinished = 0;
function parseFinished () {
  ++countParseFinished;
  if (countParseFinished == expectedFinished) {
    countParseFinished = 0;
    eventEmitter.emit("AllparseFinished");
  }

}

function parse () {
  db("search.urls").find(nbUrls, function (reply) {
    var documents = reply.documents;
    expectedFinished = documents.length;

    for (var i = documents.length - 1; i >= 0; i--) {

      request(documents[i], get_page_info);
      db("search.urls").remove(documents[i], true);

    }

  });
}

parse();
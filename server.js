/*
==================

Server for scrapping two sites and mix them

NYU ITP
October 2016
Cristóbal Valenzuela

==================
*/

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var nlp = require('nlp_compromise');
var app = express(); // Starting the express()
var portName = '8081';
const BASE = '/';
var json = {nytimes: "", buzzfeed: ""};

/* Middleware */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

/* Index page */
app.get(BASE, function(req,res){
  //res.sendFile(__dirname + '/index.html');
  res.render("index.pug");
});


/* Rquest to mix pages */
app.post(BASE+'breaker', function(req,res){

  /* urls */
  nytimes = 'http://www.nytimes.com/';
  buzzfeed = 'http://www.theonion.com/';


  /* New York Times */
  request(nytimes, function(error, response, html){

     if(!error){  // Check for no errors
       /* Cheerio for jQuery functionality */
       var $ = cheerio.load(html);
       /* Variables to capture */
       var titles = [];
       /* JSON file */

      /* Search for all News Heading in the NYTimes */
      $('.story-heading').each(function(){
        var title = $(this).text();
        title = title.replace(/\s+/g, ' ');
        if(title != ""){
          if(title.charAt(0) === ' '){
            title = title.substr(1);
          }
          titles.push(title);
        }
      })
      json.nytimes = titles;
      secondUrl()
     }
  })

  /* Buzzfeed */
  function secondUrl(){
    request(buzzfeed, function(error, response, html){

       if(!error){  // Check for no errors
         /* Cheerio for jQuery functionality */

         var $ = cheerio.load(html);

         /* Variables to capture */
         var titles = [];
        /* Search for all News Heading in the Buzzfeed */
        $('h2').each(function(){
          var title = $(this).text();
          title = title.replace(/\s+/g, ' ');
          if(title != ""){
            if(title.charAt(0) === ' '){
              title = title.substr(1);
            }
          titles.push(title);
          }
        })
        json.buzzfeed = titles;
        writeFile();
      }
    })
  }


  function writeFile(){
    /* Output everything to a JSON file */
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      if (json.buzzfeed.length > 2){
        try{
          var randomArticleNytimes = json.nytimes[getRandomIntInclusive(0,json.nytimes.length)];
          var randomArticleBuzzfeed = json.buzzfeed[getRandomIntInclusive(0,json.buzzfeed.length)];
          var nounsNyTimes = nlp.sentence(randomArticleNytimes).nouns();
          var nounsBuzzfeed = nlp.sentence(randomArticleBuzzfeed).nouns();
          var randomNounNyTimes = nounsNyTimes[getRandomIntInclusive(0,nounsNyTimes.length-1)].text;
          var randomNounBuzzfeed = nounsBuzzfeed[getRandomIntInclusive(0,nounsBuzzfeed.length-1)].text;
          var verbsNytimes = nlp.sentence(randomArticleNytimes).verbs();
          var verbsBuzzfeed = nlp.sentence(randomArticleBuzzfeed).verbs();
          var randomVerbNyTimes = verbsNytimes[0].text;
          var randomVerbBuzzfeed = verbsBuzzfeed[0].text;
          var peopleNytimes = nlp.sentence(randomArticleNytimes).people();
          var peopleBuzzfeed= nlp.sentence(randomArticleBuzzfeed).people();
          var randomPersonNytimes = peopleNytimes[getRandomIntInclusive(0,peopleNytimes.length-1)].text;
          var randomPersonBuzzfeed = peopleBuzzfeed[0].text;

          console.log("=====");
          console.log("NYTime: " + randomArticleNytimes);
          console.log("Buzzfeed: " + randomArticleBuzzfeed);
          console.log(" ");
          console.log("Noun NYTime: " + randomNounNyTimes);
          console.log("Noun Buzzfeed: " + randomNounBuzzfeed);
          console.log(" ");
          console.log("Verb NYTime: " + randomVerbNyTimes);
          console.log("Verb Buzzfeed: " + randomVerbBuzzfeed);
          console.log(" ");
          console.log("Person NYTimes: " + randomPersonNytimes);
          console.log("Person Buzzfeed: " + randomPersonBuzzfeed);
          console.log("=====");

          var changeNoun = nlp.sentence(randomArticleNytimes).replace(randomNounNyTimes, randomNounBuzzfeed).text();
          console.log("First Mix: " + changeNoun);
          var changeVerb =  nlp.sentence(changeNoun).replace(randomVerbNyTimes, randomVerbBuzzfeed).text();
          console.log("Final Mix: " + changeVerb);

          res.render("index.pug",{message:changeVerb,titleone:randomArticleNytimes,titletwo:randomArticleBuzzfeed})
          // res.send(changeVerb);
        }
        catch(err){
          console.log(err);
          writeFile();
        }
      }
      else{
      console.log("Sometimes pages don't like being scraped. Please try again!")
      res.render("index.pug", {message:"Sometimes pages don't like being scraped. Please try again!"});
      // res.sendFile(__dirname + '/index.html');
      // res.send("Could not load Buzzfeed, try again");
      }
    })
  }

})

/* Random number */
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* Start the server */
app.listen(process.env.PORT || portName);
console.log('Server running at ' + portName);
exports = module.exports = app;

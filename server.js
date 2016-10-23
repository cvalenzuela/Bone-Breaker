/*
==================

Server for scrapping
Based on: https://scotch.io/tutorials/scraping-the-web-with-node-js

==================
*/

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var nlp = require('nlp_compromise');
var app = express(); // Starting the express()
var portName = '8081';
const BASE = '/';
var json = {nytimes: "", buzzfeed: ""};


app.get(BASE, function(req,res){

  /* urls */
  nytimes = 'http://www.nytimes.com/';
  buzzfeed = 'https://www.buzzfeed.com/';

  /* New York Times */
  request(nytimes, function(error, response, html){

     if(!error){  // Check for no errors
       /* Cheerio for jQuery functionality */
       var $ = cheerio.load(html);
       /* Variables to capture */
       var titles = []
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
        json.nytimes = titles;
      })

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
         var titles = []

        /* Search for all News Heading in the Buzzfeed */
        $('h2').each(function(){
          var title = $(this).text();
          title = title.replace(/\s+/g, ' ');
          if(title != "" && title.length > 2){
            if(title.charAt(0) === ' '){
              title = title.substr(1);
            }
            titles.push(title);
          }
          json.buzzfeed = titles;
        })
        writeFile();
      }
    })
  }

  function writeFile(){
    /* Output everything to a JSON file */
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

      try{
        var randomArticleNytimes = json.nytimes[getRandomIntInclusive(0,json.nytimes.length)];
        var randomArticleBuzzfeed = json.buzzfeed[getRandomIntInclusive(0,json.buzzfeed.length)];
        var nounsNyTimes = nlp.sentence(randomArticleNytimes).nouns();
        var nounsBuzzfeed = nlp.sentence(randomArticleBuzzfeed).nouns();
        var randomNounNyTimes = nounsNyTimes[getRandomIntInclusive(0,nounsNyTimes.length)].text;
        var randomNounBuzzfeed = nounsBuzzfeed[getRandomIntInclusive(0,nounsBuzzfeed.length)].text;
        var peopleNytimes = nlp.sentence(randomArticleNytimes).people();
        var peopleBuzzfeed= nlp.sentence(randomArticleBuzzfeed).people();
        var randomPersonNytimes = peopleNytimes[getRandomIntInclusive(0,peopleNytimes.length-1)].text;
        var randomPersonBuzzfeed = peopleBuzzfeed[0].text;

        console.log("NYTime: " + randomArticleNytimes);
        console.log("Buzzfeed: " + randomArticleBuzzfeed);
        console.log("Noun NYTime: " + randomNounNyTimes);
        console.log("Noun Buzzfeed: " + randomNounBuzzfeed);
        console.log("Person NYTimes: " + randomPersonNytimes);
        console.log("Person Buzzfeed: " + randomPersonBuzzfeed);
        res.send('All good!');
      }
      catch(err){
        //console.log(err);
        writeFile();
      }


      //
      // var newthing = nlp.sentence(randomArticleNytimes).replace(firstNoun, secondNoun).text();
      // console.log("Mix: " + newthing);
      // console.log("======================");


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
app.listen(portName);
console.log('Server running at ' + portName);
exports = module.exports = app;

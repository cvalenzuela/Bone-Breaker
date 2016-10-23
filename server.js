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
var app = express(); // Starting the express()
var portName = '8081';
const BASE = '/';
var json = {nytimes: "", buzzfeed: ""};

app.get(BASE, function(req,res){

  /* Scrape */
  nytimes = 'http://www.nytimes.com/';
  buzzfeed = 'https://www.buzzfeed.com/';

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
          titles.push(title);
        }
        json.nytimes = titles;
      })
     }
  })


  request(buzzfeed, function(error, response, html){

     if(!error){  // Check for no errors
       /* Cheerio for jQuery functionality */
       var $ = cheerio.load(html);
       /* Variables to capture */
       var titles = []

      /* Search for all News Heading in the NYTimes */
      $('h2').each(function(){
        var title = $(this).text();
        title = title.replace(/\s+/g, ' ');
        if(title != ""){
          titles.push(title);
        }
        json.buzzfeed = titles;
      })
     }

    /* Output everything to a JSON file */
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('NY Times pages scrapped - Check for output.json');
    })
    /*Send a response */
    res.send('All good!')
  })
  /* Scrape */




})

/* Start the server */
app.listen(portName);
console.log('Server running at ' + portName);
exports = module.exports = app;

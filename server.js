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

app.get(BASE, function(req,res){

  url = 'http://www.imdb.com/title/tt2085059/'; // URL to scrape

  request(url, function(error, response, html){

     if(!error){  // Check for no errors

       var $ = cheerio.load(html);  // Cheerio for jQuery functionality

       // Variables to capture
       var title, release, rating;
       var json = {title: "", release: "", rating: ""}

        // Get the title and release which are in the same div
        $('.title_wrapper').filter(function(){
          var data = $(this);
          title = data.children().first().text();   // In examining the DOM we notice that the title rests within the first child element of the header tag.
          release = data.children().last().children().last().text();

          json.title = title;
          json.release = release;
        })

        // Get the Rating
        $('.ratingValue').filter(function() {
        var data = $(this);

        rating = data.children().first().children().first().text();
        json.rating = rating;
        });

     }

    // Output everything to a JSON file
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })
    res.send('Check your console!')

  })
})

app.listen(portName);
console.log('Server running at ' + portName);

exports = module.exports = app;

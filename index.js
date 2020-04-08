'use strict'
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');
const movies = require('./movie');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
app.post('/booking', (req, res) => {
	console.log('webhook');
    console.log(req.body);
	let location;
	if(req.body.queryResult.intent.displayName === 'movies'){
		let  x=[], i;
		location = req.body.queryResult.parameters['geo-city'].toLowerCase();		
		console.log('movies[location]', movies[location]);
			for (i in movies[location]) {				
				x.push(					
					{
						"title": movies[location][i].name +" Rating: "+ movies[location][i].rating +"/5",
						"image_url": movies[location][i].image,
						"subtitle": "Actor: "+ movies[location][i].actor +" Synopsis: "+ movies[location][i].synopsis +" Director: "+movies[location][i].director +" Language: "+ movies[location][i].language +" Theatre: "+ movies[location][i].theatre +" Adult: "+ movies[location][i].adultprice +" Child: "+ movies[location][i].childprice,
						"buttons": [
							{
								"type": "postback",
								"title": "Book",
								"payload": "booking movie ticket"
							}
						]
					}					
				);
			}
		console.log('x',x);
		return res.json({
			"fulfillmentText": "displayed&spoken response",			
			"source": "facebook",
			'payload': {		
				"facebook": {
					"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": x
						}
					}
				}
			}		  
		});
	}
});

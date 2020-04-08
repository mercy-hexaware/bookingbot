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
let location, booking_movie;
app.post('/booking', (req, res) => {
	console.log('webhook');
    console.log(req.body);	
	if(req.body.queryResult.intent.displayName === 'movies'){
		let  x=[], i;
		location = req.body.queryResult.parameters['geo-city'].toLowerCase();		
		console.log('movies[location]', movies[location]);
			for (i in movies[location]) {				
				x.push(					
					{
						"title": movies[location][i].name,
						"image_url": movies[location][i].image,
						"subtitle": "Actor: "+ movies[location][i].actor +"\n Rating: "+ movies[location][i].rating +"/5 \n Language: "+ movies[location][i].language +"\n Price: "+ movies[location][i].price +"\n Theatre: "+ movies[location][i].theatre,
						"buttons": [
							{
								"type": "postback",
								"title": movies[location][i].name,
								"payload": "booking movie ticket"
							}
						]
					}					
				);
			}
		console.log('x',x);
		return res.json({
			"fulfillmentText": "Now playing movies",			
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
	}else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket'){
		console.log('data',req.body.originalDetectIntentRequest.payload.data.postback['title']);
        booking_movie = req.body.originalDetectIntentRequest.payload.data.postback['title'];		
	}else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-count'){
		console.log('ticket_count',req.body.queryResult.parameters['ticket_count']);
        console.log('booking_date',req.body.queryResult.parameters['booking_date']);
		console.log('time',req.body.originalDetectIntentRequest.payload['data']);
	}
});

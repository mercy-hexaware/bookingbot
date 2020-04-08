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
let location, booking_movie, ticket_count, booking_date, booking_time;
app.post('/booking', (req, res) => {
	console.log('webhook');
    console.log(req.body);	
	if(req.body.queryResult.intent.displayName === 'movies'){
		let  x=[], i;
		location = req.body.queryResult.parameters['geo-city'].toLowerCase();
		console.log('location',location);
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
		ticket_count = req.body.queryResult.parameters['ticket_count'];
        console.log('booking_date',req.body.queryResult.parameters['booking_date']);
		booking_date = req.body.queryResult.parameters['booking_date'];	
	}else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-time'){		
        booking_time = req.body.originalDetectIntentRequest.payload.data.message.quick_reply['payload'].toLowerCase();
	    console.log('booking_time',booking_time);
		return res.json({
			"fulfillmentText": "Now playing movies",			
			"source": "facebook",
			'payload': {		
				"facebook": {					
					"text": "Shall we go for payment process",
					"quick_replies":[
						{
							"content_type":"text",
							"title":"Yes",
							"payload":"payment yes"								
						},
						{
							"content_type":"text",
							"title":"Home",
							"payload":"Hi"
						}
					]					
				}
			}
		});	
	}else if(req.body.queryResult.intent.displayName === 'Payment_card-number-mobno-otp'){
		let customDel, j,customerData,i, ticket_count, booking_date, booking_time, payment_card, card_number,phone_number,given
		_name, moviedetails, subtotal, total_cost;
		console.log('outputContexts',req.body.queryResult.outputContexts);
		customDel = req.body.queryResult.outputContexts;
		for (j in customDel) {
			if(customDel[j].lifespanCount){
				console.log('j',j);
			}
		}
		console.log('card-number',req.body.queryResult.outputContexts[j-1]);
		customerData = req.body.queryResult.outputContexts[j-1];
		console.log("location",customerData.parameters["geo-city"]);		
		ticket_count = customerData.parameters["ticket_count"];
		booking_date = customerData.parameters["booking_date"];	  	
		booking_time = customerData.parameters["booking_time.original"];
		payment_card = customerData.parameters["payment_card"];
		card_number = customerData.parameters["card-number"];
		phone_number = customerData.parameters["phone-number"];
		given_name = customerData.parameters["given-name"];
		for (i in movies[location]) {
			if(movies[location].name.toLowerCase() == "booking_movie"){
				console.log('i',i);
			}
		}
		console.log('moviedetails',movies[location][i-1]);
		moviedetails = movies[location][i-1];
		subtotal = ticket_count * moviedetails["price"];
		total_cost = subtotal + 6.19;
		return res.json({
			"fulfillmentText": "Movie Ticket",			
			"source": "facebook",
			'payload': {
				"facebook": {
					"attachment": {
					   "type": "template",
					   "payload": {
							"template_type": "receipt",
							"recipient_name": given_name, 
							"order_number": "12345678902",
							"currency": "INR",
							"payment_method": payment_card +" "+ card_number,        
							"timestamp": "1428444852",        
							"summary": {
							  "subtotal": subtotal,							  
							  "total_tax": 6.19,
							  "total_cost": total_cost
							},       
							"elements": [
								{
									"title": booking_movie,
									"subtitle": moviedetails["theatre"],
									"quantity": ticket_count,
									"price": moviedetails["price"],
									"currency": "INR",
									"image_url": moviedetails["image"]
								}
							]
						}
					}
				}
			}		  
		});
	}
});

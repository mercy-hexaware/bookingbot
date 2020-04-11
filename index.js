'use strict'
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');
const movies = require('./movie');
const events = require('./event');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
let location, booking_movie, ticket_count, booking_date, booking_time, event_name, event_count, event_date, event_no;
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
        booking_movie = req.body.originalDetectIntentRequest.payload.data.postback['title'].toLowerCase();		
	}else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-count'){
		console.log('ticket_count',req.body.queryResult.parameters['ticket_count']);
		ticket_count = req.body.queryResult.parameters['ticket_count'];
        console.log('booking_date',req.body.queryResult.parameters['booking_date']);
		booking_date = req.body.queryResult.parameters['booking_date'];	
	}else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-time'){
		let i, indexNo, moviedetails, subtotal, tax
        booking_time = req.body.originalDetectIntentRequest.payload.data.message.quick_reply['payload'].toLowerCase();
	    console.log('booking_time',booking_time);
		for (i in movies[location]) {
			if(movies[location][i].name.toLowerCase() == booking_movie){
				indexNo = i;
				console.log('i',indexNo);				
			}
		}
		console.log('moviedetails',movies[location][indexNo]);
		moviedetails = movies[location][indexNo];		
		subtotal = ticket_count * eval(moviedetails["price"]);
		tax = eval(subtotal) * eval(0.06);		
		let taxvalue = fmtPrice(tax);
		console.log('taxvalue',taxvalue);
		let total_cost = eval(subtotal) + eval(taxvalue);
		console.log('total_cost',total_cost);
		total_cost = fmtPrice(total_cost);
		return res.json({
			"fulfillmentText": "Now playing movies",			
			"source": "facebook",
			'payload': {		
				"facebook": {
					"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [
								{
									"title": moviedetails.name,
									"image_url": moviedetails.image,
									"subtitle": "Total payment amount include tax Rs."+total_cost,
									"buttons": [
										{
											"type": "postback",
											"title": 'Payment',
											"payload": "payment yes"
										},
										{
											"type": "postback",
											"title": 'Home',
											"payload": "Hi"
										}
									]
								}
						    ]	
						}
					}
				}
			}		  
		});
	}
	else if(req.body.queryResult.intent.displayName === 'Payment_card-number-mobno-otp'){
		let customDel, j,customerData,i, ticket_count, booking_date, booking_time, payment_card, card_number,phone_number,given_name,moviedetails, subtotal, total_cost,indexNo, indexJ ;
		console.log('outputContexts',req.body.queryResult.outputContexts);
		customDel = req.body.queryResult.outputContexts;
		for (j in customDel) {
			if(customDel[j].lifespanCount){
				indexJ = j;
				console.log('j',indexJ);
			}
		}
		console.log('customerData',req.body.queryResult.outputContexts[indexJ]);
		customerData = req.body.queryResult.outputContexts[indexJ];
		console.log("location",location);		
		ticket_count = customerData.parameters["ticket_count"];
		booking_date = customerData.parameters["booking_date"];	  	
		booking_time = customerData.parameters["booking_time.original"];
		payment_card = customerData.parameters["payment_card"];
		card_number = customerData.parameters["card-number"];
		phone_number = customerData.parameters["phone-number"];
		given_name = customerData.parameters["given-name"];
		console.log('booking_movie',booking_movie);
		for (i in movies[location]) {
			if(movies[location][i].name.toLowerCase() == booking_movie){
				indexNo = i;
				console.log('i',indexNo);				
			}
		}
		console.log('moviedetails',movies[location][indexNo]);
		moviedetails = movies[location][indexNo];		
		subtotal = ticket_count * eval(moviedetails["price"]);
		let tax = eval(subtotal) * eval(0.06);		
		let taxvalue = fmtPrice(tax);
		console.log('taxvalue',taxvalue);
		total_cost = eval(subtotal) + eval(taxvalue);
		console.log('total_cost',total_cost);
		total_cost = fmtPrice(total_cost);		
		let date = new Date(booking_date);
		let year = date.getFullYear();
		let month = date.getMonth()+1;
		let dt = date.getDate();
		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}
		let bookDay = year+'-' + month + '-'+dt;
		console.log(year+'-' + month + '-'+dt);
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
							"timestamp": Math.floor(Date.now() / 1000),        
							"summary": {
							  "subtotal": subtotal,                              						  
							  "total_tax": taxvalue,
							  "total_cost": total_cost
							},       
							"elements": [
								{
									"title": booking_movie[0].toUpperCase() + booking_movie.slice(1),
									"subtitle": bookDay +" "+ booking_time +", "+  moviedetails["theatre"],
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
	else if(req.body.queryResult.intent.displayName === 'events - city'){
		console.log('data', req.body.originalDetectIntentRequest.payload.data.message['text'].toLowerCase());
		let  x=[], i, info;
		location = req.body.originalDetectIntentRequest.payload.data.message['text'].toLowerCase();
		console.log('location',location);
		console.log('events[location]', events[location]);
			for (i in events[location]) {
				info = events[location][i].event === 0 ? "18+ event" : "";
				x.push(					
					{
						"title": events[location][i].name,
						"image_url": events[location][i].image,
						"subtitle": info +" \n Price: "+ events[location][i].price +"\n Venue: "+ events[location][i].venue +" \n synopsis: "+ events[location][i].synopsis,
						"buttons": [
							{
								"type": "postback",
								"title": events[location][i].name,
								"payload": "booking event"
							}
						]
					}					
				);
			}
		console.log('x',x);
		return res.json({
			"fulfillmentText": "Now playing Events",			
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
	else if(req.body.queryResult.intent.displayName === 'events - booking-ticket'){
		let i;
		console.log('data', req.body.originalDetectIntentRequest.payload.data.postback['title']);
		event_name = req.body.originalDetectIntentRequest.payload.data.postback['title'].toLowerCase();
		for (i in events[location]) {
			if(events[location][i].name.toLowerCase().search(event_name) != -1){
				event_no = i;
				console.log('i',event_no);				
			}
		}
		return res.json({
			"fulfillmentText": "Now playing Events",			
			"source": "facebook",
			'payload': 
				{
				  "facebook": {
					"text": "The following date are available for this event. Please select your date",
					"quick_replies": [
						{
							"content_type": "text",
							"title": events[location][event_no].date[0],
							"payload": "event booking date"							
						},
						{
							"content_type": "text",
							"title": events[location][event_no].date[1],
							"payload": "event booking date"
						},
						{
							"content_type": "text",
							"title": events[location][event_no].date[2],
							"payload": "event booking date"
						}
					]
				}
			}
			
		});		
	}
	else if(req.body.queryResult.intent.displayName ==="events - booking-ticket - custom"){
		console.log('booking date',req.body.originalDetectIntentRequestpayload.data.message['text']	 );
	    event_date = req.body.originalDetectIntentRequest.payload.data.message['text'];
	}
	else if(req.body.queryResult.intent.displayName === 'events - booking-ticket -count'){
		let i, eventdetails, subtotal, tax;
        console.log('event_count',req.body.queryResult.parameters['ticketCount']);
		booking_count = req.body.queryResult.parameters['ticketCount'];	    
		console.log('event_no',event_no);
		console.log('eventdetails',events[location][event_no]);
		eventdetails = events[location][event_no];		
		subtotal = event_count * eval(eventdetails["price"]);
		tax = eval(subtotal) * eval(0.06);		
		let taxvalue = fmtPrice(tax);
		console.log('taxvalue',taxvalue);
		let total_cost = eval(subtotal) + eval(taxvalue);
		console.log('total_cost',total_cost);
		total_cost = fmtPrice(total_cost);
		return res.json({
			"fulfillmentText": "Request for payment",			
			"source": "facebook",
			'payload': {		
				"facebook": {
					"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"elements": [
								{
									"title": moviedetails.name,
									"image_url": moviedetails.image,
									"subtitle": "Total payment amount include tax Rs."+total_cost,
									"buttons": [
										{
											"type": "postback",
											"title": 'Payment',
											"payload": "payment yes"
										},
										{
											"type": "postback",
											"title": 'Home',
											"payload": "Hi"
										}
									]
								}
						    ]	
						}
					}
				}
			}		  
		});
	}
	
function fmtPrice(tax)
 	{
		let result=Math.floor(tax)+".";
		let cents=100*(tax-Math.floor(tax))+0.5;
		result += Math.floor(cents/10);
		result += Math.floor(cents%10);
		return result;
	}
});


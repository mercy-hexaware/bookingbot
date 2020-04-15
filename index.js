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
let location, booking_movie, ticket_count, booking_date, booking_time, event_name, event_count, event_date, event_no, confirm, datas = [];
app.post('/booking', (req, res) => {
	console.log('webhook');
    console.log(req.body);	
	if(req.body.queryResult.intent.displayName === 'movies'){
		let  x=[], i;
		location = req.body.queryResult.parameters['geo-city'].toLowerCase();
		if(location === "bangalore"){location = "bengaluru"}
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
	}
	else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket'){
		let dateArr = [], today, tomorrow, tomw, dayAfttomw, currentDate, day, month, year;
		console.log('data',req.body.originalDetectIntentRequest.payload.data.postback['title']);
        booking_movie = req.body.originalDetectIntentRequest.payload.data.postback['title'].toLowerCase();
		today = new Date(); dateCal(today);
		tomorrow = new Date(today);
		tomw = tomorrow.setDate(tomorrow.getDate() +1);dateCal(tomw);
		dayAfttomw = tomorrow.setDate(tomorrow.getDate() +1);dateCal(dayAfttomw);
		function dateCal(tomdd){
		    currentDate =new Date(tomdd);
		    day = currentDate.getDate();
			month = currentDate.getMonth() + 1;
			year = currentDate.getFullYear();
			day = day < 10 ? "0"+day : day;
            month = month < 10 ? "0"+month : month ;
			dateArr.push(day + "-" + month + "-" + year);
		}
		return res.json({
			"fulfillmentText": "Movie date",			
			"source": "facebook",
			'payload': 
				{
				  "facebook": {
					"text": "The following date are available for this movie. Please select your date",
					"quick_replies": [
						{
							"content_type": "text",
							"title": dateArr[0],
							"payload": "movie booking date"							
						},
						{
							"content_type": "text",
							"title": dateArr[1],
							"payload": "movie booking date"
						},
						{
							"content_type": "text",
							"title": dateArr[2],
							"payload": "movie booking date"
						}
					]
				}
			}
			
		});
	}
	else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-count'){
		let bookingD, today, week;		
        console.log('booking_date',req.body.queryResult.parameters['booking_date']);
		booking_date = req.body.queryResult.parameters['booking_date'];
		if(booking_date == ""){
			console.log('outputContexts',req.body.originalDetectIntentRequest.payload.data.message['text']);
			booking_date = req.body.originalDetectIntentRequest.payload.data.message['text'];
		}else{			
			bookingD = new Date(booking_date);			
			today = new Date();
			week = new Date(today);
			week = week.setDate(week.getDate() +7);
			week = new Date(week);
			if ((today.getTime() <= bookingD.getTime()) && (bookingD.getTime() <= week.getTime()) )
				console.log('in date');
			else{
				booking_date = " ";
				return res.json({
					"fulfillmentText": "Movie date",			
					"source": "facebook",
					'payload': {
						"facebook": {
							"text": "Sorry, Your booking date must be within coming 7days. Please enter your booking date"
						}
					}
				});
			}	
		}
	}
	else if(req.body.queryResult.intent.displayName === 'booking-movie-ticket-time - count' || req.body.queryResult.intent.displayName === 'direct_movie_booking - moviedetails'){
		let i, indexNo, moviedetails, subtotal, tax, bookingoutput, bookingDetails, j, indexJ;
		confirm = "movie"; 
        if(req.body.queryResult.intent.displayName === 'direct_movie_booking - moviedetails')
		{
			booking_time = datas[0].booking_time;
			booking_date = datas[0].booking_date;
		    ticket_count = datas[0].ticket_count;
			booking_movie = datas[0].booking_movie;
			location = datas[0].location;
		}
		else{
			console.log('outputContexts',req.body.queryResult.outputContexts);	
			bookingoutput = req.body.queryResult.outputContexts;
			for (j in bookingoutput) {
				if(bookingoutput[j].lifespanCount){
					indexJ = j;
					console.log('j',indexJ);break;
				}
			}
			bookingDetails = req.body.queryResult.outputContexts[indexJ];
			ticket_count = bookingDetails.parameters['ticket_count'];
			booking_time = bookingDetails.parameters['booking_time.original'];
			console.log('booking_time',booking_time);
		}
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
									"subtitle": booking_time+", "+bookDay +", "+ moviedetails.theatre +" Total payment amount include tax Rs."+total_cost,
									"buttons": [
										{
											"type": "postback",
											"title": 'Book Now',
											"payload": "payment yes"
										},
										{
											"type": "postback",
											"title": 'See other movies',
											"payload": "Hi"
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
	else if(req.body.queryResult.intent.displayName === 'events - city'){
		console.log('data', req.body.originalDetectIntentRequest.payload.data.message['text'].toLowerCase());
		let  x=[], i, info;
		location = req.body.originalDetectIntentRequest.payload.data.message['text'].toLowerCase();
		if(location === "bangalore"){location = "bengaluru"}
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
		console.log('booking date',req.body.originalDetectIntentRequest.payload.data.message['text']);
	    event_date = req.body.originalDetectIntentRequest.payload.data.message['text'];
	}
	else if(req.body.queryResult.intent.displayName === 'events - booking-ticket -count'){
		let i, eventdetails, subtotal, tax;
		confirm = "event";
        console.log('event_count',req.body.queryResult.parameters['ticket_count']);
		event_count = req.body.queryResult.parameters['ticket_count'];	    
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
									"title": eventdetails.name,
									"image_url": eventdetails.image,
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
	else if(req.body.queryResult.intent.displayName ==='direct_movie_booking'){
		let i, z, indexNo, x=[], bookingD, today, week, error, payment= false;
	    ticket_count = req.body.queryResult.parameters['ticket_count'];
		booking_movie = req.body.queryResult.parameters['movie_name'];
		booking_date = req.body.queryResult.parameters['booking_date'];
		booking_time = req.body.queryResult.parameters['booking_time'];
		location = req.body.queryResult.parameters['geo-city'].toLowerCase();		
		console.log('movies[location]', movies[location]);
		if(booking_date != ""){
			bookingD = new Date(booking_date);			
			today = new Date();
			week = new Date(today);
			week = week.setDate(week.getDate() +7);
			week = new Date(week);
			if ((today.getTime() <= bookingD.getTime()) && (bookingD.getTime() <= week.getTime()) )
			{   
				datas.length = 0;
				datas.push ({						
						booking_date : booking_date,
						ticket_count : ticket_count,
						booking_movie: booking_movie,
						location : location
				});
				console.log('in date');
				if(booking_time != " "){					
					let splitD = booking_time.split('+');					
					let newDate = new Date(splitD[0]);
					booking_time = newDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
				 	if(booking_time != "07:00 AM" && booking_time != "01:00 PM" && booking_time != "07:00 PM")
					{  
						let dTime = new Date(splitD[0]);  
						let h = addZero(dTime.getHours());
						let m = addZero(dTime.getMinutes());
						let s = addZero(dTime.getSeconds());  
						console.log(h + ":" + m + ":" + s);
						let currentD = new Date(booking_date);
						let jj = new Date(booking_date);
						let iu = new Date(booking_date); 
						let cv = new Date(booking_date);
						let bt = cv.setHours(h,m,s);
						console.log(bt);
						let zero = parseInt('00', 8);
						let es = iu.setHours(19,zero,0); console.log(es);
						let f  = jj.setHours(13,zero,0); console.log(f);
						let ms  = currentD.setHours(7,zero,0); console.log(ms);
						console.log("happy hour?")
						if(bt < ms)
						{
						   console.log("before 7!");
						   error = "This movie is available at 07:00 AM. Can you change your booking time?";
						}    
						else if(ms < bt && bt < f)
						{
						   console.log("no, before 1");
						   error = "This movie is available at 01:00 PM. Can you change your booking time?";
						}
						else if(f < bt  && bt < es)
						{
						   console.log("no, before 7");
						   error = "This movie is available at 07:00 PM. Can you change your booking time?";
						}else if(bt > es)
						{
						   console.log("no, after 7");
						   error = "This movie is not available after 07:00 PM. Can you change your booking time?";
						}  
						return res.json({
							"fulfillmentText": "Movie date",			
							"source": "facebook",
							'payload': {
								"facebook": {
									"text": error
								}
							}
						});
					}else{
					        datas.length = 0;
						    payment = true;
						    console.log('success');
						    datas.push ({
								booking_time : booking_time,
								booking_date : booking_date,
								ticket_count : ticket_count,
								booking_movie: booking_movie,
								location : location
							});
					}
						 
					function addZero(z) {
						if (z < 10) {
							z = "0" + z;
						}
						    return z;
					}
 
				}
				else{
					return res.json({
						"fulfillmentText": "Movie date",			
						"source": "facebook",
						'payload': 
							{
							  "facebook": {
									"text": "The following date are available for this movie. Please select your show time",
									"quick_replies": 
									[
										{
											"content_type": "text",
											"title": '07:00 AM',
											"payload": "show time"							
										},
										{
											"content_type": "text",
											"title": '01:00 PM',
											"payload": "show time"
										},
										{
											"content_type": "text",
											"title": '07:00 PM',
											"payload": "show time"
										}
									]
								}
							}
						
					}); 
				}
			}
			else
			{	
				return res.json({
					"fulfillmentText": "Movie date",			
					"source": "facebook",
					'payload': {
						"facebook": {
							"text": "Sorry, Your booking date must be within coming 7days. Please enter your booking date"
						}
					}
				}); 
		    } 
		}else{
			 datas.push ({				
				ticket_count : ticket_count,
				booking_movie: booking_movie,
				location : location
			});
		}		
		for (i in movies[location]) {
			if(booking_movie !="" && movies[location][i].name.toLowerCase().search(booking_movie)!= -1)
			{					
				indexNo = i;
				console.log('i',indexNo);
				x.length = 0;
				x.push(					
					{
						"title": movies[location][indexNo].name,
						"image_url": movies[location][indexNo].image,
						"subtitle": "Actor: "+ movies[location][i].actor +"\n Rating: "+ movies[location][i].rating +"/5 \n Language: "+ movies[location][indexNo].language +"\n Price: "+ movies[location][i].price +"\n Theatre: "+ movies[location][indexNo].theatre,
						"buttons": [
							{
								"type": "postback",
								"title": movies[location][indexNo].name,
								"payload": "selected movie"
							}
						]
					}					
				);
				break;
			}
			else
			{								
				x.push(					
					{
						"title": movies[location][i].name,
						"image_url": movies[location][i].image,
						"subtitle": "Actor: "+ movies[location][i].actor +"\n Rating: "+ movies[location][i].rating +"/5 \n Language: "+ movies[location][i].language +"\n Price: "+ movies[location][i].price +"\n Theatre: "+ movies[location][i].theatre,
						"buttons": [
							{
								"type": "postback",
								"title": movies[location][i].name,
								"payload": "selected movie"
							}
						]
					}					
				);
	
			}
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
	}
	else if(req.body.queryResult.intent.displayName === 'direct_movie_booking - details'){
		let i, z, indexNo, x=[], bookingD, today, week, error, payment= false;
		booking_time = req.body.queryResult.parameters['booking_time'];
		booking_date == req.body.queryResult.parameters['booking_date'] ? req.body.queryResult.parameters['booking_date'] : booking_date;		
		if(booking_date != ""){
			bookingD = new Date(booking_date);			
			today = new Date();
			week = new Date(today);
			week = week.setDate(week.getDate() +7);
			week = new Date(week);
			if ((today.getTime() <= bookingD.getTime()) && (bookingD.getTime() <= week.getTime()) )
			{   				
				console.log('in date');
				if(booking_time != " "){					
					let splitD = booking_time.split('+');					
					let newDate = new Date(splitD[0]);
					booking_time = newDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
				 	if(booking_time != "07:00 AM" && booking_time != "01:00 PM" && booking_time != "07:00 PM")
					{  
						let dTime = new Date(splitD[0]);  
						let h = addZero(dTime.getHours());
						let m = addZero(dTime.getMinutes());
						let s = addZero(dTime.getSeconds());  
						console.log(h + ":" + m + ":" + s);
						let currentD = new Date(booking_date);
						let jj = new Date(booking_date);
						let iu = new Date(booking_date); 
						let cv = new Date(booking_date);
						let bt = cv.setHours(h,m,s);
						console.log(bt);
						let zero = parseInt('00', 8);
						let es = iu.setHours(19,zero,0); console.log(es);
						let f  = jj.setHours(13,zero,0); console.log(f);
						let ms  = currentD.setHours(7,zero,0); console.log(ms);
						console.log("happy hour?")
						if(bt < ms)
						{
						   console.log("before 7!");
						   error = "This movie is available at 07:00 AM. Can you change your booking time?";
						}    
						else if(ms < bt && bt < f)
						{
						   console.log("no, before 1");
						   error = "This movie is available at 01:00 PM. Can you change your booking time?";
						}
						else if(f < bt  && bt < es)
						{
						   console.log("no, before 7");
						   error = "This movie is available at 07:00 PM. Can you change your booking time?";
						}else if(bt > es)
						{
						   console.log("no, after 7");
						   error = "This movie is not available after 07:00 PM. Can you change your booking time?";
						}  
						return res.json({
							"fulfillmentText": "Movie date",			
							"source": "facebook",
							'payload': {
								"facebook": {
									"text": error
								}
							}
						});
					}
					else{					       
						    payment = true;
						    console.log('success');
						    datas[0].booking_time = booking_time;
							datas[0].booking_date = booking_date;
							for (i in movies[location]) {
							if(booking_movie !="" && movies[location][i].name.toLowerCase().search(booking_movie)!= -1)
							{					
								indexNo = i;
								console.log('i',indexNo);
								x.length = 0;
								x.push(					
									{
										"title": movies[location][indexNo].name,
										"image_url": movies[location][indexNo].image,
										"subtitle": "Actor: "+ movies[location][i].actor +"\n Rating: "+ movies[location][i].rating +"/5 \n Language: "+ movies[location][indexNo].language +"\n Price: "+ movies[location][i].price +"\n Theatre: "+ movies[location][indexNo].theatre,
										"buttons": [
											{
												"type": "postback",
												"title": movies[location][indexNo].name,
												"payload": "selected movie"
											}
										]
									}					
								);
								break;
							}
							else
							{								
								x.push(					
									{
										"title": movies[location][i].name,
										"image_url": movies[location][i].image,
										"subtitle": "Actor: "+ movies[location][i].actor +"\n Rating: "+ movies[location][i].rating +"/5 \n Language: "+ movies[location][i].language +"\n Price: "+ movies[location][i].price +"\n Theatre: "+ movies[location][i].theatre,
										"buttons": [
											{
												"type": "postback",
												"title": movies[location][i].name,
												"payload": "selected movie"
											}
										]
									}					
								);
					
							}
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
					}
						 
					function addZero(z) {
						if (z < 10) {
							z = "0" + z;
						}
						    return z;
					}
 
				}				
			}
			else
			{	
				return res.json({
					"fulfillmentText": "Movie date",			
					"source": "facebook",
					'payload': {
						"facebook": {
							"text": "Sorry, Your booking date must be within coming 7days. Please enter your booking date"
						}
					}
				}); 
		    } 
		}
	}
	else if(req.body.queryResult.intent.displayName === 'Payment_card-number-mobno-otp'){
		let customDel, j,customerData,i, ticket_count, booking_time, payment_card, card_number,phone_number,given_name,moviedetails, subtotal, total_cost,indexNo, indexJ, details;
		console.log('outputContexts',req.body.queryResult.outputContexts);
		customDel = req.body.queryResult.outputContexts;
		for (j in customDel) {
			if(customDel[j].lifespanCount){
				indexJ = j;
				console.log('j',indexJ);break;
			}
		}
		console.log('customerData',req.body.queryResult.outputContexts[indexJ]);
		customerData = req.body.queryResult.outputContexts[indexJ];
		console.log("location",location);		
		ticket_count = customerData.parameters["ticket_count"];
	    payment_card = customerData.parameters["payment_card"]
		card_number = customerData.parameters["card-number"].substring(customerData.parameters["card-number"].length-3);
		phone_number = customerData.parameters["phone-number"];
		given_name = customerData.parameters["given-name"];
		if(confirm === "movie"){				  	
			booking_time = customerData.parameters["booking_time.original"];
			console.log('booking_date',booking_date);
			for (i in movies[location]) {
				if(movies[location][i].name.toLowerCase().search(booking_movie)!= -1){
					indexNo = i;
					console.log('i',indexNo);					
				}
			}
			console.log('moviedetails',movies[location][indexNo]);
			moviedetails = movies[location][indexNo];		
			subtotal = ticket_count * eval(moviedetails["price"]);
			details = booking_time+", "+moviedetails['theatre'];
		}
		else {
			booking_date = event_date;console.log('booking_date',booking_date);
			console.log('event_name',event_name);
			for (i in events[location]) {
				if(events[location][i].name.toLowerCase().search(event_name) != -1){
					indexNo = i;
					console.log('i',indexNo);				
				}
			}
			console.log('eventdetails',events[location][indexNo]);
			moviedetails = events[location][indexNo];		
			subtotal = ticket_count * eval(moviedetails["price"]);
			details = moviedetails['venue'];
		}		
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
		confirm = "";
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
							"payment_method":  payment_card +'  **** **** **** *'+card_number,        
							"timestamp": Math.floor(Date.now() / 1000),        
							"summary": {
							  "subtotal": subtotal,                              						  
							  "total_tax": taxvalue,
							  "total_cost": total_cost
							},       
							"elements": [
								{
									"title": moviedetails["name"][0].toUpperCase() + moviedetails["name"].slice(1),
									"subtitle": booking_date +", "+ details,
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
function fmtPrice(tax)
 	{
		let result=Math.floor(tax)+".";
		let cents=100*(tax-Math.floor(tax))+0.5;
		result += Math.floor(cents/10);
		result += Math.floor(cents%10);
		return result;
	}
});


'use strict'
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');
const restapi = require('./restapi');
const mobileDel = require('./mobileDelapi');
const db = require('./cusData');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
let mobile_buy,buyMob_del,mobilemodel1,mobilemodel2, j, customDel, customerData, brandname, storage, mobileArr=[], mob_storage=[], savedetails=[];
app.post('/mobile', (req, res) => {
	console.log('webhook');
    console.log(req.body);
	if(req.body.queryResult.intent.displayName === 'buy_mobile_start_brand'){
		console.log('brandname', JSON.stringify(req.body.originalDetectIntentRequest.payload.inputs[0].rawInputs[0].query));
        brandname = req.body.originalDetectIntentRequest.payload.inputs[0].rawInputs[0].query.toLowerCase();
		return res.json({
			"fulfillmentText":  "sample text",
			"source": "example.com",
			"payload": {
				"google": {
					"expectUserResponse": true,							 
					"richResponse": {
					"items": [
						{
							"simpleResponse": {
								"textToSpeech": "I have latest mobile models in "+brandname[0].toUpperCase() + brandname.slice(1) +". May I know your mobile budget."
								}
						}
					]
					}
				}
			}
		});
	
	}
	if(req.body.queryResult.intent.displayName === 'brand_name' || req.body.queryResult.intent.displayName === 'brand_name - budgetChange'){
	    console.log('restapi',JSON.stringify(restapi));
		let branddetails = restapi, x =[], app=[], i, j, k, apiMobileRate, mobile_brands, unit_currency, storage, budget_range, unit_currency1, apiprice, availStorage, error_message;
        if(req.body.queryResult.intent.displayName === 'brand_name - budgetChange'){
			if(savedetails.length === 1){
				mobile_brands = savedetails[0]['mobile_brands'].toLowerCase();				
				storage = savedetails[0]['storage'].toLowerCase()		
			}
			console.log('unit_currency',req.body.queryResult.parameters['unit-currency'][0]['amount']);			
			console.log('budget_range',req.body.queryResult.parameters['budget_range']);
			unit_currency = req.body.queryResult.parameters['unit-currency'][0]['amount'];
			budget_range = req.body.queryResult.parameters['budget_range'].toLowerCase();
		}else{  		
			console.log('mobile_brands',req.body.queryResult.parameters['mobile_brands']);
			console.log('unit_currency',req.body.queryResult.parameters['unit-currency'][0]['amount']);
			console.log('storage',req.body.queryResult.parameters['storage']);
			console.log('budget_range',req.body.queryResult.parameters['budget_range']);
			
			mobile_brands = req.body.queryResult.parameters['mobile_brands'].toLowerCase();
			unit_currency = req.body.queryResult.parameters['unit-currency'][0]['amount'];
			storage = req.body.queryResult.parameters['storage'].toLowerCase();
			budget_range = req.body.queryResult.parameters['budget_range'].toLowerCase();
			//unit_currency1 = req.body.queryResult.parameters['unit-currency1'][0]['amount'];
		}
		savedetails.length = 0;
		savedetails.push({'mobile_brands':mobile_brands,'storage':storage});
	    console.log('branddetails[mobile_brands]',branddetails[mobile_brands]);
		for (i in branddetails[mobile_brands]){  
			for (j in branddetails[mobile_brands][i]){			
				for (k in branddetails[mobile_brands][i][j]){
					apiprice = branddetails[mobile_brands][i][j][k].price.match(/\d+/g).toString().replace(/,/g, '');
					console.log('apiprice',apiprice);				
					if(storage != ""){
						availStorage = branddetails[mobile_brands][i][j][k].storage.toLowerCase().search(storage);			
			            console.log('availStorage',availStorage);
						if (budget_range === "under" || budget_range === ""){							
							if(parseInt(apiprice) <= unit_currency && availStorage != -1){
								console.log('title', branddetails[mobile_brands][i][j][k].title);
								console.log('price', branddetails[mobile_brands][i][j][k].price);
								x.push({
									"title": branddetails[mobile_brands][i][j][k].title,
									"price": branddetails[mobile_brands][i][j][k].price,
									"image": branddetails[mobile_brands][i][j][k].image['url'],
									"description": branddetails[mobile_brands][i][j][k].description,
									"storage": branddetails[mobile_brands][i][j][k].storage								
								});
								mobileArr.push(branddetails[mobile_brands][i][j][k].title);
							}else{
							    error_message = "Sorry, No mobiles are available under your specification."
							}
						}
						else
						{	
							if(parseInt(apiprice) > unit_currency && availStorage != -1){
								console.log('title', branddetails[mobile_brands][i][j][k].title);
								console.log('price', branddetails[mobile_brands][i][j][k].price);
								x.push({
									"title": branddetails[mobile_brands][i][j][k].title,
									"price": branddetails[mobile_brands][i][j][k].price,
									"image": branddetails[mobile_brands][i][j][k].image['url'],
									"description": branddetails[mobile_brands][i][j][k].description,
									"storage": branddetails[mobile_brands][i][j][k].storage								
								});
								mobileArr.push(branddetails[mobile_brands][i][j][k].title);
							}else{
							    error_message = "Sorry, No mobiles are available under your specification."
							}
						}
					}
					else {
						if (budget_range === "under" || budget_range === ""){						
							if(parseInt(apiprice) <= unit_currency)
							{
								console.log('title', branddetails[mobile_brands][i][j][k].title);
								console.log('price', branddetails[mobile_brands][i][j][k].price);
								x.push({
									"title": branddetails[mobile_brands][i][j][k].title,
									"price": branddetails[mobile_brands][i][j][k].price,
									"image": branddetails[mobile_brands][i][j][k].image['url'],
									"description": branddetails[mobile_brands][i][j][k].description,
									"storage": branddetails[mobile_brands][i][j][k].storage								
								});
								mobileArr.push(branddetails[mobile_brands][i][j][k].title);
							}else{
							    error_message = "Sorry, No mobiles are available under your budget."
							}
						}
						else
						{								
							if(parseInt(apiprice) > unit_currency)
							{
								console.log('title', branddetails[mobile_brands][i][j][k].title);
								console.log('price', branddetails[mobile_brands][i][j][k].price);
								x.push({
									"title": branddetails[mobile_brands][i][j][k].title,
									"price": branddetails[mobile_brands][i][j][k].price,
									"image": branddetails[mobile_brands][i][j][k].image['url'],
									"description": branddetails[mobile_brands][i][j][k].description,
									"storage": branddetails[mobile_brands][i][j][k].storage								
								});
								mobileArr.push(branddetails[mobile_brands][i][j][k].title);
							}else{
							    error_message = "Sorry, No mobiles are available under your budget."
							}
						}
					}
				}
			}
		}
		console.log('x',x);
		if(x != undefined && x.length > 1) {
			for (i in x) {
				
				app.push({
					"title": x[i].title[0].toUpperCase() + x[i].title.slice(1) +" "+ x[i].storage,
					"optionInfo":
					{
						"key": x[i].title[0].toUpperCase() + x[i].title.slice(1) +" "+ x[i].storage
					},
					"description": x[i].price+". "+x[i].description,				
					"image": {
						"url": x[i].image,
						"accessibilityText" : "alt"
					}
				});			
			}
		}
		console.log('app',app);
		if(app != undefined && app.length > 1){
			return res.json({
				"fulfillmentText":  "sample text",
				"source": "example.com",
				"payload": {
					"google": {
						"expectUserResponse": true,
						"systemIntent": {
						"intent": "actions.intent.OPTION",
						"data": {
							"@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",								   
							"carouselSelect": {
								"items": app
						    }
						}
						},
						"richResponse": {
							"items": [
							{
								"simpleResponse": {
								  "textToSpeech": "Within your budget range, we have few mobiles detils"
								}
							}
						    ]
						}
					}
				}
			});
		}
		else if(x != undefined && x.length ==1){
			return res.json({
				"fulfillmentText":  "sample text",
				"source": "example.com",
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
							  {
								"simpleResponse": {
								  "textToSpeech": "Details of "+x[0].title[0].toUpperCase() + x[0].title.slice(1)
								}
							  },
							  {
								"tableCard": {
									"title":  x[0].title[0].toUpperCase() + x[0].title.slice(1),
									"subtitle": "Details",
									"image": {
										"url":x[0].image,
										"accessibilityText": "Alt Text"
										},
									"rows": [
										{
										"cells": [
											{
											  "text": "Storage"
											},
											{
											  "text": x[0].storage
											}
										  ],
										"dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Price"
											},
											{
											  "text":x[0].price
											}
										  ],
										  "dividerAfter": true
										},
										{
											"cells": [
												{
												  "text": "Description"
												},
												{
												  "text": x[0].description
												}
											  ],
											"dividerAfter": true
										}								
									],
									"columnProperties": [
										{
											"header": "Feature"						  
										},
										{
											"header": x[0].title[0].toUpperCase() + x[0].title.slice(1)
										}
									]
								}
							},
							{
								"simpleResponse": {
									"textToSpeech": "We are offering some options for you"
								}
							}
						],
							"suggestions": [
							  {
								"title": x[0].title[0].toUpperCase() + x[0].title.slice(1)+" "+x[0].storage 
							  },
							  {
								"title": "Home"
							  }				  
							]
						}
					}
				}
			});	
		}
		else{
			let suggChip=[],mobInfo = mobileDel, mobPrice;
			for(i in mobInfo){
				for(j in mobInfo[i]){
                    mobPrice = mobInfo[i][j].price.match(/\d+/g).toString().replace(/,/g, '');			
				   if(parseInt(mobPrice) <= unit_currency){
						suggChip.push({"title": i});
					}
				}
			}
			console.log('suggChip',suggChip);
			console.log('apiprice',apiprice);
			  return res.json({
					"fulfillmentText":  "sample text",
					"source": "example.com",
						"payload": {
							"google": {
							"expectUserResponse": true,
							"richResponse": {
							"items": [
							  {
								"simpleResponse": {
								   "textToSpeech": 'This model is not available in your budget amount, Please change',
								   "displayText": error_message
								}
							  }
							],
							"suggestions": suggChip
						  }
						}
					  }
				});	
		}
	}	
	if(req.body.queryResult.intent.displayName === "Looking-for-new-mobile" || req.body.queryResult.intent.displayName === 'Looking-for-new-mobile - budgetChange'){		
		let i, j, mobileList = mobileDel, mobPrice, unit_currency, arr =[], x=[], storage, budget_range, availStorage, error_message;
		storage = req.body.queryResult.parameters['storage'].toLowerCase();
		budget_range = req.body.queryResult.parameters['budget_range'].toLowerCase();
		unit_currency = req.body.queryResult.parameters['unit-currency'][0]['amount'];	
		for(i in mobileList){
			for(j in mobileList[i]){
				mobPrice = mobileList[i][j].price.match(/\d+/g).toString().replace(/,/g, '');
				availStorage = mobileList[i][j].storage.toLowerCase().search(storage);			
				console.log('availStorage',availStorage);
				if(storage != ""){	
					if (budget_range === "under" || budget_range === ""){							
						if(parseInt(mobPrice) <= unit_currency && availStorage != -1){
							x.push({
								"title": i[0].toUpperCase() + i.slice(1),
								"price": mobileList[i][j].price,
								"image": mobileList[i][j].image,
								"description": mobileList[i][j].camera+". "+mobileList[i][j].platform,
								"storage": mobileList[i][j].storage							
							});
							mobileArr.push(i);
						}else{
								error_message = "Sorry, No mobile are available under your specification."
						}
					}else{
						if(parseInt(mobPrice) > unit_currency && availStorage != -1){
							x.push({
								"title": i[0].toUpperCase() + i.slice(1),
								"price": mobileList[i][j].price,
								"image": mobileList[i][j].image,
								"description": mobileList[i][j].camera+". "+mobileList[i][j].platform,
								"storage": mobileList[i][j].storage							
							});
							mobileArr.push(i);
						}else{
								error_message = "Sorry, No mobile are available under your specification."
						}
					}
				}
				else {
					if (budget_range === "under" || budget_range === ""){							
						if(parseInt(mobPrice) <= unit_currency){
							x.push({
								"title": i[0].toUpperCase() + i.slice(1),
								"price": mobileList[i][j].price,
								"image": mobileList[i][j].image,
								"description": mobileList[i][j].camera+". "+mobileList[i][j].platform,
								"storage": mobileList[i][j].storage							
							});
							mobileArr.push(i);
						}else{
								error_message = "Sorry, No mobiles are available under your specification."
						}
					}else{
						if(parseInt(mobPrice) > unit_currency){
							x.push({
								"title": i[0].toUpperCase() + i.slice(1),
								"price": mobileList[i][j].price,
								"image": mobileList[i][j].image,
								"description": mobileList[i][j].camera+". "+mobileList[i][j].platform,
								"storage": mobileList[i][j].storage							
							});
							mobileArr.push(i);
						}else{
								error_message = "Sorry, No mobiles are available under your specification."
						}
					}
				}
			}
		}       
	 	console.log('x',x);
		if(x != undefined && x.length > 1) {
			for (i in x) {				
				arr.push({
					"title": x[i].title[0].toUpperCase() + x[i].title.slice(1) +" "+ x[i].storage,
					"optionInfo":
					{
						"key": x[i].title[0].toUpperCase() + x[i].title.slice(1) +" "+ x[i].storage
					},
					"description": x[i].price+". "+x[i].description,				
					"image": {
						"url": x[i].image,
						"accessibilityText" : "alt"
					}
				});			
			}
		}console.log('arr',arr);
		if(arr != undefined && arr.length > 1){
			return res.json({
				"fulfillmentText":  "sample text",
				"source": "example.com",
				"payload": {
					"google": {
					  "expectUserResponse": true,
					  "systemIntent": {
						"intent": "actions.intent.OPTION",
						"data": {
						  "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",								   
						  "carouselSelect": {
							"items": arr
						  }
						}
					  },
					  "richResponse": {
						"items": [
						  {
							"simpleResponse": {
							  "textToSpeech": "Latest smartphones"
							}
						  }
						]
					  }
					}
				}
			});
		}
		else if(x != undefined && x.length ==1){
			return res.json({
				"fulfillmentText":  "sample text",
				"source": "example.com",
				"payload": {
					"google": {
						"expectUserResponse": true,
						"richResponse": {
							"items": [
							  {
								"simpleResponse": {
								  "textToSpeech": "Details of "+x[0].title[0].toUpperCase() + x[0].title.slice(1)
								}
							  },
							  {
								"tableCard": {
									"title":  x[0].title[0].toUpperCase() + x[0].title.slice(1),
									"subtitle": "Details",
									"image": {
										"url":x[0].image,
										"accessibilityText": "Alt Text"
										},
									"rows": [
										{
										"cells": [
											{
											  "text": "Storage"
											},
											{
											  "text": x[0].storage
											}
										  ],
										"dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Price"
											},
											{
											  "text":x[0].price
											}
										  ],
										  "dividerAfter": true
										},
										{
											"cells": [
												{
												  "text": "Description"
												},
												{
												  "text": x[0].description
												}
											  ],
											"dividerAfter": true
										}								
									],
									"columnProperties": [
										{
											"header": "Feature"						  
										},
										{
											"header": x[0].title[0].toUpperCase() + x[0].title.slice(1)
										}
									]
								}
							},
							{
								"simpleResponse": {
									"textToSpeech": "We are offering some options for you"
								}
							}
						],
							"suggestions": [
							  {
								"title": x[0].title[0].toUpperCase() + x[0].title.slice(1)+" "+x[0].storage 
							  },
							  {
								"title": "Home"
							  }							  					  
							]
						}
					}
				}
			});	
		}
		else
		{
			let suggChip=[],mobInfo = mobileDel, mobPrice;
			for(i in mobInfo){
				for(j in mobInfo[i]){
                    mobPrice = mobInfo[i][j].price.match(/\d+/g).toString().replace(/,/g, '');			
				   if(parseInt(mobPrice) <= unit_currency){
						suggChip.push({"title": i[0].toUpperCase() + i.slice(1)});
					}
				}
			}
			console.log('suggChip',suggChip);			
			  return res.json({
					"fulfillmentText":  "sample text",
					"source": "example.com",
						"payload": {
							"google": {
							"expectUserResponse": true,
							"richResponse": {
							"items": [
							  {
								"simpleResponse": {
								   "textToSpeech": 'Mobile not available in your budget amount. Do you change your budget',
								   "displayText": error_message
								}
							  }
							],
							"suggestions": suggChip
						  }
						}
					  }
				});	
		}
	}
	if(req.body.queryResult.intent.displayName === 'Mobile_brands_list - custom'){
		let brandname = req.body.queryResult.parameters['brand'].toLowerCase();		
		console.log('outputContexts',JSON.stringify(req.body.queryResult.outputContexts));    
		let outputContextsName = req.body.queryResult.outputContexts[0].name;
		console.log('brandname',brandname);
		console.log('restapi',JSON.stringify(restapi));
		let brand  = restapi;
		console.log('brand',brand);	
		let x =[],i;
        for (i in brand[brandname]) {
			x.push(
				{
				"title": brand[brandname][i].title,
				"optionInfo":
					{
						"key": i
					},
				 "description": brand[brandname][i].description,				
				 "image": {
				     "url": brand[brandname][i].image.url,
					 "accessibilityText" : brand[brandname][i].image.accessibilityText}
				}	
			);
		}
	 	console.log('x',x);	
		return res.json({
				 	"fulfillmentText":  "sample text",
				    "source": "example.com",
				    "payload": {
						"google": {
						    "expectUserResponse": true,
							"systemIntent": {
								"intent": "actions.intent.OPTION",
								"data": {
									"@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",								   
									"carouselSelect": {
										"items": x
									}
								}
							},
							"richResponse": {
								"items": [
								{
									"simpleResponse": {
									  "textToSpeech": "I have few models in "+brandname.toUpperCase()
									}
								}
								]
							}
						}
				    }
				});		
	}
	if(req.body.queryResult.intent.displayName === 'mobile_comparison'){
		mobilemodel1 = req.body.queryResult.parameters['mobile1'].toLowerCase();
        mobilemodel2 = req.body.queryResult.parameters['mobile2'].toLowerCase();
		console.log('mobileDel',JSON.stringify(mobileDel));
		let mobilesdata_1  = mobileDel[mobilemodel1];
		let mobilesdata_2  = mobileDel[mobilemodel2];		
		return res.json({
		  "fulfillmentText": mobilemodel1 +" Vs "+ mobilemodel2,		  
		  "source": "example.com",
		    "payload": {
				"google": {
				  "expectUserResponse": true,
				  "richResponse": {
					"items": [
					  {
						"simpleResponse": {
						  "textToSpeech": mobilemodel1 +" Vs "+ mobilemodel2
						}
					  },
					  {
						"tableCard": {
						  "rows": [
							{
							  "cells": [							    
								{
								  "text":mobilesdata_1[0]['price']
								},
								{
								  "text":mobilesdata_2[0]['price']
								}								
							  ],
							  "dividerAfter": true
							},
							{
							  "cells": [							    
								{
								  "text":mobilesdata_1[0]['size']
								},
								{
								  "text":mobilesdata_2[0]['size']
								}								
							  ],
							  "dividerAfter": true
							},
							{
							  "cells": [
								{
								  "text":mobilesdata_1[0]['design']
								},
								{
								  "text": mobilesdata_2[0]['design']
								}
							  ],
							  "dividerAfter": true
							},														
							{
							  "cells": [
								{
								  "text": mobilesdata_1[0]['camera']
								},
								{
 								  "text": mobilesdata_2[0]['camera']
								}
							  ],
							  "dividerAfter": true
							},
							{
							  "cells": [
								{
								  "text": mobilesdata_1[0]['water']
								},
								{
								  "text": mobilesdata_2[0]['water']
								}
							  ],
							  "dividerAfter": true
							},
							{
							  "cells": [
								{
								  "text": mobilesdata_1[0]['display']
								},
								{
								  "text": mobilesdata_2[0]['display']
								}
							  ],
							  "dividerAfter": true
							}
						  ],
						  "columnProperties": [
							{
							  "header": mobilemodel1,
							  "horizontalAlignment": "CENTER"							  
							},
							{
							  "header": mobilemodel2,
							  "horizontalAlignment": "CENTER"							  
							}							
						  ]
						}
					  },
					  {
						"simpleResponse": {
						  "textToSpeech": "Would you like do buy?"
						}
					  }
					],
					"suggestions": [
					  {
						"title": mobilemodel1.toUpperCase()
					  },
					  {
						"title": mobilemodel2.toUpperCase()
					  },
				      {
						"title": "No"
					  }						  
					]
				  }
				}
			  }		  
		});	
	}	
	if(req.body.queryResult.intent.displayName === 'particular_mobile_buy' || req.body.queryResult.intent.displayName === "particular_mobile_buy - custom" || req.body.queryResult.intent.displayName === "brand_name - custom" || req.body.queryResult.intent.displayName === 'Looking-for-new-mobile - custom'){
		let i;
		if(req.body.queryResult.intent.displayName === "particular_mobile_buy - custom" || req.body.queryResult.intent.displayName === "brand_name - custom" || req.body.queryResult.intent.displayName === 'Looking-for-new-mobile - custom'){
			mobile_buy = req.body.originalDetectIntentRequest.payload.inputs[0].rawInputs[0].query.toLowerCase();
			console.log('mobileArr',mobileArr)
			for(i in mobileArr){  
				if(mobile_buy.search(mobileArr[i].toLowerCase()) != -1){
				   console.log(i);
				   mobile_buy = mobileArr[i].toLowerCase();
				   console.log('if',mobile_buy);
				   break;
				}
			}
			let query = req.body.originalDetectIntentRequest.payload.inputs[0].rawInputs[0].query;
			storage = query.search("64GB") != -1 ? "64GB" : (query.search("128GB") != -1 ? "128GB" : query.search("512GB") != -1 ? "512GB":" ");
			storage = storage.toLowerCase();
		}else{
			mobile_buy = req.body.queryResult.parameters['mobile_name'].toLowerCase();
			mobileArr.push(mobile_buy);
			storage = req.body.queryResult.parameters['storage'].toLowerCase();
			console.log('mobile_buyele',mobile_buy);  
		}	
		singlemobile(mobile_buy, storage);
	}
	function singlemobile(mobile_buy, storage){
		let i,buyMob_del,availStorage;
		//console.log('mobileDel',mobileDel);		
		if(storage && mobile_buy){
		   console.log('mobile_buy',mobile_buy);
			console.log('storage',storage);
			buyMob_del = mobileDel[mobile_buy];
			console.log('buyMob_del',buyMob_del);
			for (i in buyMob_del) {
				availStorage = buyMob_del[i].storage.toLowerCase().search(storage);			
			    console.log('availStorage',availStorage);
				if(availStorage != -1 ){
				    mob_storage.length = 0;
					mob_storage.push({
						"title": mobile_buy,
						"storage": buyMob_del[i].storage,
						"image": buyMob_del[i].image,
						"network": buyMob_del[i].network,
						"platform": buyMob_del[i].platform,
						"battery": buyMob_del[i].battery,
						"size": buyMob_del[i].size,
						"design": buyMob_del[i].design,
						"camera": buyMob_del[i].camera,
						"display": buyMob_del[i].display,
						"price": buyMob_del[i].price,
						"water": buyMob_del[i].water
					});
					break;
				}				
			}
			if(mob_storage.length == 0){
				    return res.json({
						"fulfillmentText":  "sample text",
						"source": "example.com",
							"payload": {
								"google": {
								"expectUserResponse": true,
								"richResponse": {
								"items": [
								  {
									"simpleResponse": {
									  "textToSpeech": "Sorry, This specification mobile not available",
									  "displayText": "Sorry, This specification mobile not available"
									}
								  }
								]
							  }
							}
						  }
					});	
				}
			console.log('mob_storage',mob_storage);
			if(mob_storage != undefined && mob_storage.length == 1){
				return res.json({
				  "fulfillmentText": mobile_buy,		  
				  "source": "example.com",
					"payload": {
						"google": {
						  "expectUserResponse": true,
						  "richResponse": {
							"items": [
							{
								"simpleResponse": {
								"textToSpeech": "Details About "+ mobile_buy[0].toUpperCase() + mobile_buy.slice(1)
								}
							},
							{
								"tableCard": {
									"title":  mobile_buy[0].toUpperCase() + mobile_buy.slice(1),
									"subtitle": "Details",
									"image": {
										"url": mob_storage[0]['storage'],
										"accessibilityText": "Alt Text"
									},
									"columnProperties": [ 
									{
									  "header": "Feature"						  
									},
									{
									  "header": mobile_buy						  
									}							
									],
									"rows": [
										{
										"cells": [
											{
											  "text": "Storage"
											},
											{
											  "text": mob_storage[0]['storage']
											}
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Network"
											},
											{
											  "text": mob_storage[0]['network']
											}
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Platform"
											},
											{
											  "text": mob_storage[0]['platform']
											}
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Battery"
											},
											{
											  "text": mob_storage[0]['battery']
											}
										  ],
										  "dividerAfter": true
										},
										{
										  "cells": [							    
											{
											  "text":"Size"
											},
											{
											  "text":mob_storage[0]['size']
											}								
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text":"Design"
											},
											{
											  "text": mob_storage[0]['design']
											}
										  ],
										  "dividerAfter": true
										},														
										{
										"cells": [
											{
											  "text": "Camera"
											},
											{
											  "text": mob_storage[0]['camera']
											}
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Water"
											},
											{
											  "text": mob_storage[0]['water']
											}
										  ],
										  "dividerAfter": true
										},
										{
										"cells": [
											{
											  "text": "Display"
											},
											{
											  "text": mob_storage[0]['display']
											}
										  ],
										  "dividerAfter": true
										},							
										{
										"cells": [
											{
											  "text": "Price"
											},
											{
											  "text": mob_storage[0]['price']
											}
										  ],
										  "dividerAfter": true
										}
									]					 
								}
							  },
							  {
								"simpleResponse": {
								  "textToSpeech": "Can you confirm, Are you select this model and we go for payment process?"
								}
							  }	
							],
							"suggestions": [
							  {
								"title": "Yes"
							  },
							  {
								"title": "Home"
							  }					  
							]
						  }
						}
					}		  
				});	
			}
		}
		else if(mobile_buy && storage ==''){
			let x =[],i;
			let len = mobileDel[mobile_buy].length;
			for (i in mobileDel[mobile_buy]) {
				if(len === 1){
					return res.json({
							"fulfillmentText": mobile_buy,		  
							"source": "example.com",
							"payload": {
								"google": {
								  "expectUserResponse": true,
								  "richResponse": {
									"items": [
									{
										"simpleResponse": {
										"textToSpeech": "Details About "+ mobile_buy[0].toUpperCase() + mobile_buy.slice(1)
										}
									},
									{
										"tableCard": {
											"title":  mobile_buy[0].toUpperCase() + mobile_buy.slice(1)+" "+mobileDel[mobile_buy][i].storage,
											"subtitle": "Details",
											"image": {
												"url": mobileDel[mobile_buy][i].image,
												"accessibilityText": "Alt Text"
											},
											"columnProperties": [ 
											{
											  "header": "Feature"						  
											},
											{
											  "header": mobile_buy						  
											}							
											],
											"rows": [
												{
												"cells": [
													{
													  "text": "Storage"
													},
													{
													  "text": mobileDel[mobile_buy][i].storage
													}
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text": "Network"
													},
													{
													  "text":mobileDel[mobile_buy][i].network
													}
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text": "Platform"
													},
													{
													  "text": mobileDel[mobile_buy][i].platform
													}
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text": "Battery"
													},
													{
													  "text": mobileDel[mobile_buy][i].battery
													}
												  ],
												  "dividerAfter": true
												},
												{
												  "cells": [							    
													{
													  "text":"Size"
													},
													{
													  "text":mobileDel[mobile_buy][i].size
													}								
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text":"Design"
													},
													{
													  "text": mobileDel[mobile_buy][i].design
													}
												  ],
												  "dividerAfter": true
												},														
												{
												"cells": [
													{
													  "text": "Camera"
													},
													{
													  "text": mobileDel[mobile_buy][i].camera
													}
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text": "Water"
													},
													{
													  "text": mobileDel[mobile_buy][i].water
													}
												  ],
												  "dividerAfter": true
												},
												{
												"cells": [
													{
													  "text": "Display"
													},
													{
													  "text": mobileDel[mobile_buy][i].display
													}
												  ],
												  "dividerAfter": true
												},							
												{
												"cells": [
													{
													  "text": "Price"
													},
													{
													  "text": mobileDel[mobile_buy][i].price
													}
												  ],
												  "dividerAfter": true
												}
											]					 
										}
									  },
									  {
										"simpleResponse": {
										  "textToSpeech": "Can you confirm, Are you select this model and we go for payment process?"
										}
									  }	
									],
									"suggestions": [
									  {
										"title": "Yes"
									  },
									  {
										"title": "Home"
									  }					  
									]
								  }
								}
							}		  
						});
				}
				x.push({
						"optionInfo": {
						  "key": mobileDel[mobile_buy][i].storage						 
						},
						"description": mobileDel[mobile_buy][i].price+". "+mobileDel[mobile_buy][i].platform+". "+mobileDel[mobile_buy][i].camera,
						"image": {
						  "url":  mobileDel[mobile_buy][i].image,
						  "accessibilityText": "Image alternate text"
						},
						"title":  mobile_buy+" "+mobileDel[mobile_buy][i].storage
				});	
			}
			console.log('mob',x);
		
		    return res.json({
				"fulfillmentText":  mobile_buy[0].toUpperCase() + mobile_buy.slice(1),
				"source": "example.com",
				"payload": {
					"google": {
						"expectUserResponse": true,
						"systemIntent": {
							"intent": "actions.intent.OPTION",
							"data": {
								"@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
								"carouselSelect": {
									"items": x
								}
							}
						 },
						"richResponse": {
							"items": [
							{
								"simpleResponse": {
								  "textToSpeech": "Latest models in "+mobile_buy[0].toUpperCase() + mobile_buy.slice(1)
								}
							}
							]
						}
					}
				}
			}); 	
		}
	}
	if(req.body.queryResult.intent.displayName ==="payment_cardholdername_mobNO"){
	   console.log('outputContexts',JSON.stringify(req.body.queryResult.outputContexts));
	   console.log('fulfillmentMessages',JSON.stringify(req.body.queryResult.fulfillmentMessages));
	   customDel = req.body.queryResult.outputContexts;
	   for (j in customDel) {
			if(customDel[j].lifespanCount){
              console.log('j',j);
            }
		}
		 console.log('card-number',req.body.queryResult.outputContexts[j-1]);
		 customerData = req.body.queryResult.outputContexts[j-1];
		 console.log("given-name",customerData.parameters["given-name"]);
	}
	if(req.body.queryResult.intent.displayName === "payment_otp"){
		 const details = {		 
			  name: customerData.parameters["given-name"],
			  mobile: mobile_buy.toUpperCase(),
			  image: mob_storage[0]['image'],
			  price: mob_storage[0]['price'],
			  cardnumber: customerData.parameters["card-number"],
			  phonenumber: customerData.parameters["phone-number"]
		 };
		  db.push(details);
		  console.log('db',db);
		  let data = fs.readFileSync('./tmp/input.json');		
		  console.log('words',data);
		  fs.writeFile('./input.txt', 'Hello Node.js', (err) => {
			if (err)
			console.log('err',err);
			console.log('The file has been saved!');
			});
		  let datas = JSON.stringify(details);console.log('datas',datas);
		  fs.writeFile('./tmp/input.json', datas, finished);
		  function finished(err){
			console.log('err',err);
		  }
		 
		  return res.json({
			"fulfillmentText": "Your Payment Successfully completed",		  
			"source": "example.com",
			"payload": {
				"google": {
					"expectUserResponse": true,
					"richResponse": {
						"items": [
						{
							"simpleResponse": {
							    "textToSpeech": "Your Mobile details"
							   
							}
						},
						{
							"basicCard": {
								"title": "Mobile Model: "+mobile_buy.toUpperCase(),
								"subtitle": mob_storage[0]['price'],								
								"image": {
									"url": mob_storage[0]['image'],
									"accessibilityText": mobile_buy
								},
								"imageDisplayOptions": "CROPPED"
							}	
						},
						{
							"simpleResponse": {
								"textToSpeech": "Thank You "+customerData.parameters["given-name"] +". Your payment successfully completed"
							}
						}
					   ]
					}
				}
			}
	    });  
	}
});  
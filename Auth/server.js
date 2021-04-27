'use strict';
require('dotenv').config()
const express = require('express');
const request = require('request');
const randomstring = require('randomstring');
const moment = require('moment');

const PORT = 80;
const HOST = '0.0.0.0';

var cookies = {}

// App
const app = express();
app.get('/api/auth/status', (req, res) => {
  res.status(200).json({"service":"Auth"});
});


app.post('/api/auth/login', (req, res) => {
	request({
		url: "http://localhost:8080/api/user/login",
		method: "POST",
		json: {
			email: "test@gmail.com",
			password: "12345678"
		},
	}, function(err,response,body){
		if(err){
			console.log(err)
			res.status(500).json({})
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==401){
				res.status(401).json({});
			}else if(response.statusCode==200){
				var auth_token = randomstring.generate(32);
				var expire = moment().add(10,'d').toDate();
				cookies[auth_token] = {
					"userId": body["userId"],
					"expire": expire
				}
				res.status(200).json({
					"auth_token": auth_token,
					"expire": expire
				});
			}
		}
	})
})

app.get('/api/auth/check/:auth_token/', (req, res) => {
	var auth_token = req.params.auth_token;
	
	var session = cookies[auth_token];
	if(session!=null){
		if(session["expire"].getTime() < new Date().getTime()){
			res.status(401).json({"error":"Expired Session"});
			delete cookies[auth_token];
		}else{
			res.status(200).json(session);
		}
	}else{
		res.status(401).json({"error":"Invalid Session"})
	}
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

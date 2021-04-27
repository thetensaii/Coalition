'use strict';
const express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var randomstring = require("randomstring");
const { v4: uuidV4 } = require('uuid');

// Connection to db file
let db = new sqlite3.Database('./data/user.db');
db.serialize(function() {
	db.run("CREATE TABLE Users(userID VARCHAR(255) PRIMARY KEY, firstname VARCHAR(255), lastname VARCHAR(255), username VARCHAR(255), email VARCHAR(255), password_hash VARCHAR(255), salt VARCHAR(20), created DATETIME, updated DATETIME, UNIQUE(email))",(err)=>{});
})

const PORT = 80;
const HOST = '0.0.0.0';

// Starting server
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/users/status', (req, res) => {
	res.status(200).json({"service":"User"});
});

app.post("/api/users",(req,res)=>{
	let userID = uuidV4();
	var firstname = req.body.firstname;
	var lastname = req.body.lastname; 
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var salt = randomstring.generate(7);
	var hash = sha256(password+salt);
	console.log(req.body)
	db.run("INSERT INTO Users(userID, firstname,lastname,username,email,password_hash,salt,created) VALUES(?,?,?,?,?,?,?,DATETIME('now'));",[userID, firstname,lastname,username,email,hash,salt],function(err){
		if(err){
			console.log(err);
			if(err.errno == 19){
				res.status(409).json({});
			}else{
				res.status(500).json({});
			}
		}else{
			res.status(201).json({
				"userID": userID
			});
		}
	})
});

app.put("/api/users/:userID/",(req,res)=>{
	var userID = req.params.userID;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var salt = randomstring.generate(7);
	var hash = sha256(password+salt);

	// db.run("REPLACE INTO Users(userID,firstname,lastname,username,email,password_hash,salt,created) VALUES(?,?,?,?,?,?,?,DATETIME('now'));",[userID,firstname,lastname,username,email,hash,salt],function(err){
	db.run("UPDATE Users SET firstname = ?,lastname = ?,username = ?,email = ?,password_hash = ?,salt = ?, updated = DATETIME('now') WHERE userID = ?;",[firstname,lastname,username,email,hash,salt,userID],function(err){
		if(err){
			console.log(err);
			res.status(500).json({});
		}else if(this.changes == 0){
			res.status(404).json({});
		}else{
			res.status(200).json({});
		}
	})
});

app.get('/api/users',(req,res)=>{
	var userID = req.params.userID;
	db.all("SELECT userID, firstname, lastname, username, email, created, updated FROM Users;",(err,rows)=>{
		if(err){
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(rows);
		}
	})
});

app.get('/api/users/:userID/',(req,res)=>{
	var userID = req.params.userID;
	db.get("SELECT firstname, lastname, username, email, created, updated FROM Users WHERE userid = ?;",[userID],(err,row)=>{
		if(err){
			console.log(err);
			res.status(500).json({});
		}else if(row){
			res.status(200).json(row);
		}else{
			res.status(404).json({error : "User doesn't exist"});
		}
	})
});

app.delete("/api/users/:userID/",(req,res)=>{
	var userID = req.params.userID;
	db.run("DELETE FROM Users WHERE userID = ?;",[userID],(err,rows)=>{
		if(err){
			console.log(err)
			res.status(500).json({});
		}else{
			res.status(204).json({});
		}
	})
});
 
app.post("/api/users/login",(req,res)=>{
	var email = req.body.email;
	var password = req.body.password;
	db.get("SELECT username,userID,password_hash,salt FROM Users WHERE email = ?;",[email],function(err,row){
		if(err){
			console.log(err);
			res.status(500).json({});
		}else{
			if(row){
				var hash = sha256(password+row.salt);
				if(hash==row.password_hash){
					res.status(200).json({
						"userID": row.userID,
						"username": row.username
					});
				}else{
					res.status(401).json({});
				}
			}else{
				res.status(401).json({});
			}
		}
	})
})
 
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

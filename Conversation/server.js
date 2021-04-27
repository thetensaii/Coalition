'use strict';
const express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var randomstring = require("randomstring");

// Connection to db file
let db = new sqlite3.Database('./data/conversation.db');
db.serialize(function() {
	db.run("CREATE TABLE Conv(convID INTEGER PRIMARY KEY AUTOINCREMENT);", (err)=>{});
	db.run("CREATE TABLE Message(messageID INTEGER PRIMARY KEY AUTOINCREMENT, convID INTEGER, userID VARCHAR(255), message VARCHAR(2000), created DATETIME);",(err)=>{});
})

const PORT = 80;
const HOST = '0.0.0.0';

// Starting server
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/conversations/status', (req, res) => {
	res.status(200).json({"service":"Conversation"});
});

app.get('/api/conversations/:convID/:messageID/',(req,res)=>{
	var convID = req.params.convID;
	var messageID = req.params.messageID;

	db.get("SELECT convID FROM Conv where convID = ?;", [convID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
			db.get("SELECT convID, userID, message, created FROM Message where messageID = ?;", [messageID], (err, row) => {
				if(err){
					console.log(err);
					res.status(500).json({});
				} else if(row) {
					if(row.convID == convID){
						delete row.convID;
						res.status(200).json(row);
					}else {
						console.log("row.convID : " + row.convID)
						console.log("convID : " + convID)
						res.status(404).json({error : "Message is not in this conversation"});
					}
				} else {
					res.status(404).json({error : "Message doesn't exist"});
				}
			});
		} else {
            res.status(404).json({error : "Conversation doesn't exist"});
        }
    });
});

app.get('/api/conversations/',(req,res)=>{
	db.all("SELECT * FROM Conv;", (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else {
			res.status(200).json(rows);
		}
    });
});

app.get('/api/conversations/:convID/',(req,res)=>{
	var convID = req.params.convID;

	db.get("SELECT convID FROM Conv where convID = ?;", [convID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
			db.all("SELECT messageID, userID, message, created FROM Message WHERE convID = ? ORDER BY created;",[convID],(err,rows)=>{
				if(err){
					console.log(err);
					res.status(500).json({});
				}else{
					res.status(200).json(rows);
				}
			})
		} else {
            res.status(404).json({error : "Conversation doesn't exist"});
        }
    });
});

app.post("/api/conversations/:convID/",(req,res)=>{
	var convID = req.params.convID;
	var userID = req.body.userID;
	var message = req.body.message;

	db.get("SELECT convID FROM Conv where convID = ?;", [convID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
			db.run("INSERT INTO Message(convID,userID,message,created) VALUES(?,?,?,DATETIME('now'));",[convID,userID,message],function(err){
				if(err){
					console.log(err);
					if(err.errno==19){
						res.status(409).json({});
					}else{
						res.status(500).json({});
					}
				}else{
					res.status(201).json({
						"messageID": this.lastID
					});
				}
			});
		} else {
            res.status(404).json({error : "Conversation doesn't exist"});
        }
    });

});

app.post("/api/conversations/",(req,res)=>{

	db.run("INSERT INTO Conv DEFAULT VALUES;",function(err){
		if(err){
			console.log(err);
			res.status(500).json({});
		}else{
			res.status(201).json({
				"convID": this.lastID
			});
		}
	})
});

app.delete("/api/conversations/:convID/:messageID/",(req,res)=>{
	var convID = req.params.convID;
	var messageID = req.params.messageID;
	let userID = req.body.userID;

	db.get("SELECT convID FROM Conv where convID = ?;", [convID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
			db.get("SELECT * FROM Message where messageID = ?;", [messageID], (err, row) => {
				if(err){
					console.log(err);
					res.status(500).json({});
				} else if(row) {
					if(row.userID != userID){
						res.status(403).json({error : "User is not owner of this message"});
					}else if(row.convID != convID){
						res.status(404).json({error : "Message is not in this conversation"});
					}else {
						db.run("DELETE FROM Message WHERE convID = ? AND messageID = ?;",[convID,messageID],function(err){
							if(err){
								console.log(err);
								res.status(500).json(null);
							} else {
								res.status(204).json(null);
							}
						})
					}
				} else {
					res.status(404).json({error : "Message doesn't exist"});
				}
			});
		} else {
            res.status(404).json({error : "Conversation doesn't exist"});
        }
    });
});
 


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

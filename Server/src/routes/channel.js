const express = require("express")
const channelRouter = express.Router()

const httpRequest = require("../core/httpRequest.js");
let db = require("../core/database");

// Create one
channelRouter.post("/", async (req, res) => {
    let serverID = req.body.serverID;
    let channelName = req.body.channelName;
    let userID = req.body.userID;

    db.get("SELECT server_id, owner_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], async (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            if(row.owner_id == userID){
                // Create the new conv associated
                let convRes = await httpRequest.createConv();
                if(convRes.status != 201){
                    res.status(convRes.status).json(convRes.data);
                } else {
                    let convID = convRes.data.convID;
    
                    db.run("INSERT INTO CHANNELS(server_id, conv_id, channel_name, created_at) VALUES(?, ?, ?, DATETIME('now'));", [serverID, convID, channelName], function(err) {
                        if(err){
                            console.log(err);
                            res.status(500).json({error : err.message});
                        } else {
                            res.status(201).json();
                        }
                    });
                } 
            } else {
                res.status(403).json({error : "User is not server owner"})
            }
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });

	
});

// Update one
channelRouter.put("/", async (req, res) => {
    let serverID = req.body.serverID;
    let userID = req.body.userID;
    let channelName = req.body.channelName;
    let convID = req.body.convID;


    db.get("SELECT server_id, owner_id FROM SERVERS WHERE server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if (row){
            if(row.owner_id == userID){
                db.run("UPDATE CHANNELS SET channel_name = ?, updated_at = DATETIME('now') WHERE server_id = ? AND conv_id = ? AND deleted = 0;",[channelName, serverID, convID], function(err) {
                    if(err){
                        console.log(err);
                        res.status(500).json({error : err.message});
                    } else if (this.changes == 0) {
                        res.status(404).json({error : "Channel doesn't exist"});
                    } else {
                        res.status(200).json({});
                    }
                });
            } else {
                res.status(500).json({error : "User is not server owner"})
            }
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });

    
});

// Remove one
channelRouter.delete("/", async (req, res) => {
    let serverID = req.body.serverID;
    let convID = req.body.convID;
    let userID = req.body.userID;


    db.get("SELECT server_id, owner_id FROM SERVERS WHERE server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if (row){
            if(row.owner_id == userID){
                db.run("UPDATE CHANNELS SET deleted = 1, deleted_at = DATETIME('now') WHERE server_id = ? AND conv_id = ? AND deleted = 0;", [serverID, convID], (err) => {
                    if(err){
                        console.log(err);
                        res.status(500).json({error : err.message});
                    } else if (this.changes == 0) {
                        res.status(404).json({error : "Channel doesn't exist"});
                    } else {
                        res.status(200).json({});
                    }
                });
            } else {
                res.status(403).json({error : "User is not server owner"})
            }
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });
}); 

// Get channel by server
channelRouter.get("/server/:serverID", async (req, res) => {
    let serverID = req.params.serverID;
    let userID = req.body.userID;

    db.get("SELECT server_id, owner_id FROM SERVERS WHERE server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if (row){
            db.get("SELECT server_id, user_id FROM MEMBERS WHERE server_id = ? AND user_id = ?;", [serverID, userID], (err, row) => {
                if(err){
                    console.log(err);
                    res.status(500).json({});
                } else if(row){
                    db.all("SELECT conv_id, channel_name, created_at, updated_at FROM CHANNELS where server_id = ? AND deleted = 0;", [serverID], (err, rows) => {
                        if(err){
                            console.log(err);
                            res.status(500).json({});
                        } else {
                            res.status(200).json(rows);
                        }
                    });
                } else {
                    res.status(403).json({error : "User is not member of this server"});
                }
            });
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });

    
});

// Get all
channelRouter.get("/", (req, res) => {
    db.all("SELECT server_id, conv_id, channel_name, created_at, updated_at FROM CHANNELS WHERE deleted = 0;", (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else {
            res.status(200).json(rows);
        }
    });
}); 

module.exports = channelRouter;
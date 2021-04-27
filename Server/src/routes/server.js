const express = require("express");
const ServerRouter = express.Router();

let db = require("../core/database.js");

const httpRequest = require("../core/httpRequest.js");

let channelRouter = require("./channel");
let memberRouter = require("./member");


ServerRouter.use("/members", memberRouter);
ServerRouter.use("/channels", channelRouter);

ServerRouter.get('/status', (req, res) => {
    res.status(200).json({"service":"Server"});
});

// Create one
ServerRouter.post("/", async (req, res) => {
    let serverName = req.body.serverName;
    let ownerID = req.body.ownerID;

    db.run("INSERT INTO SERVERS(server_name, owner_id, created_at) VALUES(?, ?, DATETIME('now'));",[serverName, ownerID], function(err) {
        if(err){
            console.log(err);
            res.status(500).json({error : err.message});
        } else {
            let serverID = this.lastID;
            db.run("INSERT INTO MEMBERS(server_id, user_id, created_at) VALUES(?, ?, DATETIME('now'));",[serverID, ownerID], function(err) {
                if(err){
                    console.log(err);
                    res.status(500).json({error : err.message});
                } else {
                    res.status(201).json({
                        serverID : serverID
                    });
                }
            });
        }
    });
});

// Remove one
ServerRouter.delete("/:serverID", async (req, res) => {
    let serverID = req.params.serverID;
    let userID = req.body.userID;

    db.get("SELECT server_id, owner_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            if(row.owner_id == userID){
                db.run("UPDATE SERVERS SET deleted = 1, deleted_at = DATETIME('now') WHERE server_id = ? AND owner_id = ? AND deleted = 0;", [serverID, userID], (err) => {
                    if(err){
                        console.log(err.message);
                        res.status(500).json({error : err.message});
                    } else {
                        db.run("DELETE FROM MEMBERS WHERE server_id = ?;", [serverID], function(err) {
                            if(err){
                                console.log(err)
                                res.status(500).json({error : err.message});
                            } else {
                                db.run("UPDATE CHANNELS SET deleted = 1, deleted_at = DATETIME('now') WHERE server_id = ? AND deleted = 0;", [serverID], (err) => {
                                    if(err){
                                        console.log(err);
                                        res.status(500).json({error : err.message});
                                    } else {
                                        res.status(204).json({});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(403).json({error : "User is not server owner"});
            }
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });
    
}); 


// Update one
ServerRouter.put("/:serverID", async (req, res) => {
    let serverID = req.params.serverID;
    let serverName = req.body.serverName;
    let userID = req.body.userID;

    db.get("SELECT server_id, owner_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            if(row.owner_id == userID){
                db.run("UPDATE SERVERS SET server_name = ?, updated_at = DATETIME('now') WHERE server_id = ? AND owner_id = ? AND deleted = 0;", [serverName, serverID, userID], (err) => {
                    if(err){
                        console.log(err.message)
                        res.status(500).json({});
                    }else{
                        res.status(200).json();
                    }
                });
            } else {
                res.status(403).json({error : "User is not server owner"});
            }
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });

}); 

// Get one
ServerRouter.get("/:serverID", (req, res) => {
    let serverID = req.params.serverID;

    db.get("SELECT server_name, owner_id, created_at, updated_at FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });
});

// Get all
ServerRouter.get("/", (req, res) => {
    db.all("SELECT server_id, server_name, owner_id, created_at, updated_at FROM SERVERS WHERE deleted = 0;", (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json({error : err.message});
        } else {
            res.status(200).json(rows);
        }
    });
});

module.exports = ServerRouter;


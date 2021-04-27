const express = require("express")
const memberRouter = express.Router()

let db = require("../core/database");
const httpRequest = require("../core/httpRequest.js");

// Create one
memberRouter.post("/", (req, res) => {
    let serverID = req.body.serverID;
    let userID = req.body.userID;

    db.get("SELECT server_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            db.run("INSERT INTO MEMBERS(server_id, user_id, created_at) VALUES(?, ?, DATETIME('now'));",[serverID, userID], function(err) {
                if(err){
                    console.log(err);
                    res.status(500).json({error : err.message});
                } else {
                    res.status(201).json(null);
                }
            });
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });
    
});

// Remove one
memberRouter.delete("/", (req, res) => {
    let serverID = req.body.serverID;
    let userID = req.body.userID;

    db.get("SELECT server_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            db.run("DELETE FROM MEMBERS WHERE server_id = ? AND user_id = ?;", [serverID, userID], function(err) {
                if(err){
                    console.log(err)
                    res.status(500).json({});
                } else if(this.changes == 0) {
                    res.status(404).json({error : "User is not a member of this server"});
                } else {
                    res.status(204).json({});
                }
            });
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });
    
}); 


// Get members by server
memberRouter.get("/server/:serverID",async (req, res) => {
    let serverID = req.params.serverID;

    db.get("SELECT server_id FROM SERVERS where server_id = ? AND deleted = 0;", [serverID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            db.all("SELECT user_id, created_at FROM MEMBERS where server_id = ?;", [serverID], (err, rows) => {
                if(err){
                    console.log(err);
                    res.status(500).json({});
                } else {
                    res.status(200).json(rows);
                } 
            });
        } else {
            res.status(404).json({error : "Server doesn't exist"});
        }
    });

});

// Get servers by user
memberRouter.get("/user/:userID", async (req, res) => {
    let userID = req.params.userID;
    
    let userRes = await httpRequest.getUser(userID);
    if(userRes.status != 200){
        res.status(userRes.status).json(userRes.data);
        return;
    }

    db.all("SELECT server_id, created_at FROM MEMBERS where user_id = ?;", [userID], (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else {
            res.status(200).json(rows);
        }
    });
});


// Get all
memberRouter.get("/", (req, res) => {
    db.all("SELECT server_id, user_id, created_at FROM MEMBERS;", (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else {
            res.status(200).json(rows);
        }
    });
});

module.exports = memberRouter;
const express = require("express")
const memberRouter = express.Router()

const db = require("../core/database");

// Create one
memberRouter.post("/", (req, res) => {
    let groupID = req.body.groupID;
    let userID = req.body.userID;

    db.get("SELECT group_id FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            db.run("INSERT INTO MEMBERS(group_id, user_id, created_at) VALUES(?, ?, DATETIME('now'));", [groupID, userID], function(err) {
                if(err){
                    res.status(500).json({error : err.message});
                } else {
                    res.status(201).json({});
                }
            });
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });
}); 

// Remove one
memberRouter.delete("/", (req, res) => {
    let groupID = req.body.groupID;
    let userID = req.body.userID;

    db.get("SELECT group_id FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json(null);
        } else if(row) {
            db.run("DELETE FROM MEMBERS WHERE group_id = ? AND user_id = ?;", [groupID, userID], (err) => {
                if(err){
                    console.log(err)
                    res.status(500).json(null);
                } else {
                    res.status(204).json(null);
                }
            });
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });
});

// Get members of a group
memberRouter.get("/group/:groupID", (req, res) => {
    let groupID = req.params.groupID;

    db.get("SELECT group_id FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json(null);
        } else if(row) {
            db.all("SELECT group_id, user_id, created_at FROM MEMBERS where group_id = ?;", [groupID], (err, rows) => {
                if(err){
                    console.log(err);
                    res.status(500).json(null);
                } else {
                    res.status(200).json(rows);
                } 
            });
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });

});

// Get groups by user
memberRouter.get("/user/:userID", async (req, res) => {
    let userID = req.params.userID;

    db.all("SELECT group_id, user_id, created_at FROM MEMBERS where user_id = ?;", [userID], (err, rows) => {
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
    db.all("SELECT group_id, user_id, created_at FROM MEMBERS;", (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).json(null);
        } else {
            res.status(200).json(rows);
        } 
    });
});

module.exports = memberRouter;
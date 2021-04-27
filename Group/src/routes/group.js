const express = require("express")
const { v4: uuidV4 } = require('uuid');
const GroupRouter = express.Router()

const db = require("../core/database.js");
const httpRequest = require("../core/httpRequest.js");

let memberRouter = require("./member")

GroupRouter.use("/members", memberRouter);

GroupRouter.get('/status', (req, res) => {
    res.status(200).json({"service":"Group"});
});

// Create one
GroupRouter.post("/", async (req, res) => {
    let groupName = req.body.groupName;
    let ownerID = req.body.ownerID;

    let convRes = await httpRequest.createConv();
    if(convRes.status != 201){
        res.status(convRes.status).json(convRes.data);
        return;
    }

    let vocalID = uuidV4();
    let convID = convRes.data.convID;
    
	db.run("INSERT INTO GROUPS(group_name, owner_id, conv_id, vocal_id, created_at) VALUES(?, ?, ?, ?, DATETIME('now'));", [groupName, ownerID, convID, vocalID], function(err) {
        if(err){
			res.status(500).json({error : err.message});
		} else {
            let groupID = this.lastID;
            db.run("INSERT INTO MEMBERS(group_id, user_id, created_at) VALUES(?, ?, DATETIME('now'));",[groupID, ownerID], function(err) {
                if(err){
                    console.log(err);
                    res.status(500).json({error : err.message});
                } else {
                    res.status(201).json({
                        groupID : groupID
                    });
                }
            });
		}
    });
    
});

// Remove one
GroupRouter.delete("/:groupID", (req, res) => {
    let groupID = req.params.groupID;
    let userID = req.body.userID;
    
    db.get("SELECT group_id, owner_id FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            if(row.owner_id == userID){
                db.run("UPDATE GROUPS SET deleted = 1, deleted_at = DATETIME('now') WHERE group_id = ? AND owner_id = ? AND deleted = 0;", [groupID, userID], (err) => {
                    if(err){
                        console.log(err.message);
                        res.status(500).json({error : err.message});
                    } else {
                        db.run("DELETE FROM MEMBERS WHERE group_id = ?;", [groupID], (err) => {
                            if(err){
                                res.status(500).json({});
                            }else{
                                res.status(204).json({});
                            }
                        });
                    }
                });
            } else {
                res.status(500).json({error : "User is not group owner"});
            }
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });
}); 


// Update one
GroupRouter.put("/:groupID", (req, res) => {
    let groupID = req.params.groupID;
    let userID = req.body.userID;
    let groupName = req.body.groupName;

    db.get("SELECT group_id, owner_id FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            console.log(err);
            res.status(500).json({});
        } else if(row) {
            if(row.owner_id == userID){
                db.run("UPDATE GROUPS SET group_name = ?, updated_at = DATETIME('now') WHERE group_id = ?;", [groupName, groupID], (err) => {
                    if(err){
                        res.status(500).json({});
                    }else{
                        res.status(200).json(null);
                    }
                });
            } else {
                res.status(500).json({error : "User is not group owner"});
            }
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });
}); 

// Get one
GroupRouter.get("/:groupID", (req, res) => {
    let groupID = req.params.groupID;
    db.get("SELECT group_name, owner_id, conv_id, vocal_id, created_at, updated_at FROM GROUPS where group_id = ? AND deleted = 0;", [groupID], (err, row) => {
        if(err){
            res.status(500).json({});
        } else if(row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({error : "Group doesn't exist"});
        }
    });
});

// Get all
GroupRouter.get("/", (req, res) => {
    db.all("SELECT group_id, group_name, owner_id, conv_id, vocal_id, created_at, updated_at FROM GROUPS WHERE deleted = 0;", (err, rows) => {
        if(err){
            res.status(500).json({});
        } else {
            res.status(200).json(rows);
        } 
    });
});

module.exports = GroupRouter;


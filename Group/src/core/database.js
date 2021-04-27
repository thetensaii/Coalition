'use strict';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data/group.db');
db.serialize(function() {
	db.run("CREATE TABLE GROUPS\
				(group_id INTEGER PRIMARY KEY AUTOINCREMENT,\
				group_name VARCHAR(255),\
				owner_id VARCHAR(255),\
				conv_id INTEGER,\
				vocal_id VARCHAR(255),\
				deleted INTEGER DEFAULT 0,\
				created_at DATETIME,\
				updated_at DATETIME,\
				deleted_at DATETIME)",
		(err)=>{}
	);
	 
	db.run("CREATE TABLE MEMBERS\
				(group_id INTEGER,\
				user_id VARCHAR(255),\
				created_at DATETIME,\
				PRIMARY KEY (group_id, user_id))",
		(err)=>{}
	);

});
 
module.exports = db;
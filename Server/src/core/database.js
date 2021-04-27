'use strict';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data/server.db');
db.serialize(function() {
	db.run("CREATE TABLE SERVERS\
				(server_id INTEGER PRIMARY KEY AUTOINCREMENT,\
				server_name VARCHAR(255),\
				owner_id VARCHAR(255),\
				deleted INTEGER DEFAULT 0,\
				created_at DATETIME,\
				updated_at DATETIME,\
				deleted_at DATETIME)",
		(err)=>{}
	);
	 
	db.run("CREATE TABLE MEMBERS\
				(server_id INTEGER,\
				user_id VARCHAR(255),\
				created_at DATETIME,\
				PRIMARY KEY (server_id, user_id))",
		(err)=>{}
	);

	db.run("CREATE TABLE CHANNELS\
				(server_id INTEGER,\
				conv_id INTEGER,\
				channel_name VARCHAR(255),\
				deleted INTEGER DEFAULT 0,\
				created_at DATETIME,\
				updated_at DATETIME,\
				deleted_at DATETIME,\
				PRIMARY KEY (server_id, conv_id))",
		(err)=>{}
	);

});

module.exports = db;
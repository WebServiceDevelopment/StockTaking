/**
 
 MIT License
 Copyright 2020 Web Service Development Inc.  

 Permission is hereby granted, free of charge, to any person obtaining a copy  
 of this software and associated documentation files (the "Software"), to deal  
 in the Software without restriction, including without limitation the rights 
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is 
 furnished to do so, subject to the following conditions:  

 The above copyright notice and this permission notice shall be included in all 
 copies or substantial portions of the Software.  
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 SOFTWARE.
 
 Author: Benjamin Collins (collins.wsd.co.jp)

**/

"use strict";

/**
 *  Library Imports
 **/

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const serveIndex = require('serve-index');
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid').v1;
const sqlite3 = require('sqlite3').verbose();
const mimetype = require('mimetype');
const ws = require('ws');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const cookie = require('cookie');
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer');

/**
 * Create Connection Variables
 **/

let transporter;
let config_exists = fs.existsSync('config.json');
if(config_exists) {
	let file = fs.readFileSync('config.json');
	let conf = JSON.parse(file.toString());
	transporter = nodemailer.createTransport(conf.email);
}

/**
 * Create SQLite Connection
 **/

const TABLES = []

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_locations (
		location_uuid VARCHAR (36) NOT NULL,
		location_name VARCHAR (255) NOT NULL,
		location_places TEXT,
		location_types TEXT,
		location_variety TEXT,
		location_products TEXT,
		location_map MEDIUMTEXT,
		created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		removed_on TIMESTAMP NULL DEFAULT NULL,
		PRIMARY KEY(location_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_staff (
		staff_uuid VARCHAR(36) NOT NULL,
		staff_position VARCHAR(255),
		staff_name VARCHAR(255),
		staff_login VARCHAR(255) UNIQUE,
		staff_email VARCHAR(255),
		staff_password VARCHAR(255),
		staff_location TEXT,
		last_active TIMESTAMP NULL DEFAULT NULL,
		account_locked TINYINT NOT NULL DEFAULT 0,
		created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		removed_on TIMESTAMP NULL DEFAULT NULL,
		PRIMARY KEY(staff_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_status (
	  status_uuid VARCHAR (36) NOT NULL,
	  location_uuid VARCHAR(36) NOT NULL,
	  location_name VARCHAR(255) NOT NULL,
	  report_year VARCHAR (10) NOT NULL,
	  report_month VARCHAR (10) NOT NULL,
	  assign_to_name VARCHAR(255),
	  assign_to_uuid VARCHAR(36),
	  date_of_implementation DATE NULL DEFAULT NULL,
	  input_complete_time TIMESTAMP NULL DEFAULT NULL,
	  manager_uuid VARCHAR(36),
	  manager_approval_time TIMESTAMP NULL DEFAULT NULL,
	  director_uuid VARCHAR(36),
	  director_approval_time TIMESTAMP NULL DEFAULT NULL,
	  require_fix TINYINT NOT NULL DEFAULT 0,
	  fix_attn_uuid VARCHAR(36),
	  admin_uuid VARCHAR(36),
	  admin_approval_time TIMESTAMP NULL DEFAULT NULL,
	  group_1 VARCHAR(50),
	  group_2 VARCHAR(50),
	  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  CONSTRAINT unique_status UNIQUE (report_year,report_month,location_uuid),
	  PRIMARY KEY(status_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_report (
	  status_uuid VARCHAR (36) NOT NULL,
	  on_site_report TEXT,
	  on_site_stock TEXT,
	  on_site_update TIMESTAMP,
	  managers_report TEXT,
	  managers_stock TEXT,
	  manager_update TIMESTAMP,
	  finance_report TEXT,
	  finance_stock TEXT,
	  finance_update TIMESTAMP,
	  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  PRIMARY KEY(status_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_products (
	  product_uuid VARCHAR (36) NOT NULL,
	  product_type VARCHAR (255) NOT NULL,
	  product_variety VARCHAR (255) NOT NULL,
	  product_name VARCHAR (255) NOT NULL,
	  next_process VARCHAR (255) NOT NULL,
	  unit VARCHAR (255) NOT NULL,
	  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  removed_on TIMESTAMP NULL DEFAULT NULL,
	  PRIMARY KEY(product_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_aggregate (
		aggregate_uuid VARCHAR (36) NOT NULL,
		aggregate_group VARCHAR (255) NOT NULL,
		aggregate_name VARCHAR (255) NOT NULL,
		created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		removed_on TIMESTAMP NULL DEFAULT NULL,
		PRIMARY KEY(aggregate_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS dat_fixes (
	  status_uuid VARCHAR (36) NOT NULL,
	  fix_attn_uuid VARCHAR (36) NOT NULL,
	  admin_uuid VARCHAR (36) NOT NULL,
	  message TEXT,
	  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS log_batch (
		batch_uuid VARCHAR(36) NOT NULL,
		batch_year INT UNSIGNED NOT NULL,
		batch_month INT UNSIGNED NOT NULL,
		batch_message TEXT,
		batch_result TINY INT DEFAULT 0,
		created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (batch_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS log_sessions (
		session_uuid VARCHAR(36) NOT NULL,
		staff_uuid VARCHAR(36),
		staff_position VARCHAR(36),
		staff_name VARCHAR(36),
		staff_login VARCHAR(36),
		staff_email VARCHAR(36),
		source_ip VARCHAR(100),
		forward_ip VARCHAR(100),
		real_ip VARCHAR(100),
		user_agent VARCHAR(255),
		attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		attempt_result TINY INT NOT NULL,
		login_time TIMESTAMP NULL DEFAULT NULL,
		disconnect_time TIMESTAMP NULL DEFAULT NULL,
		logout_time TIMESTAMP NULL DEFAULT NULL,
		notes VARCHAR(255) NULL DEFAULT NULL,
		PRIMARY KEY (session_uuid)
	)
`);

TABLES.push(`
	CREATE TABLE IF NOT EXISTS log_reset (
		reset_uuid VARCHAR(36) NOT NULL,
		staff_uuid VARCHAR(36) NOT NULL,
		staff_login VARCHAR(255) NOT NULL,
		staff_email VARCHAR(255) NOT NULL,
		one_time_pass VARCHAR(36) NOT NULL,
		redeemed TINYINT NOT NULL DEFAULT 0,
		created_on TIMESTAMP NULL DEFAULT NULL,
		redeemed_on TIMESTAMP NULL DEFAULT NULL,
		valid_until TIMESTAMP NOT NULL,
		PRIMARY KEY (reset_uuid)
	)
`);

const conn = new sqlite3.Database('db.sqlite', function(err) {
	console.log('Connected to Sqlite Database');

	for(let i = 0; i < TABLES.length; i++) {
		conn.run(TABLES[i]);
	}

});

const db = {
	query : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.run(sql, args, function(err) {
				if(err) {
					return reject(err);
				}

				resolve();
			});

		});
	},
	selectOne : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.get(sql, args, function(err, row) {
				if(err) {
					return reject(err);
				}

				resolve(row);
			});

		});
	},
	selectAll : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.all(sql, args, function(err, rows) {
				if(err) {
					return reject(err);
				}

				resolve(rows);
			});

		});
	},
	hash : function(myPlaintextPassword) {

		return new Promise( function(resolve, reject) {

			let saltRounds = 10;
			bcrypt.genSalt(saltRounds, function(err, salt) {
				bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
					if(err) {
						throw err;
					}
					resolve(hash);
				});
			});

		});

	},
	compare : function(myPlaintextPassword, hash) {

		return new Promise( function(resolve, reject) {

			bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
				if(err) {
					return reject(err);
				}

				resolve(result);
			});

		});

	},
	readDir : function(path) {

		return new Promise( function(resolve, reject) {

			fs.readdir(path, function(err, files) {
				if(err) {
					return reject(err);
				}

				resolve(files);
			});

		});

	},
	getRevision : function(name) {

		return new Promise( function(resolve, reject) {
			
			let max = 0;
			let str = '';

			let path = `public/${name}`;
			
			if(name === 'lib') {
				return resolve(path);
			}

			fs.readdir(path, function(err, files) {
				if(err) {
					return reject(err);
				}

				for(let i = 0; i < files.length; i++) {
					let a = parseInt(files[i]);

					if(isNaN(a)) {
						continue;
					}
					if(a <= max) {
						continue;
					}
					max = a;
					str = files[i];
				}
				resolve(`public/${name}/${str}`);
			});

		});

	},
	saveRevision : function(year, month, session, stat_uuid, loc_uuid, inventory, stock) {

		month = month.toString();
		if(month.length < 2) {
			month = "0" + month;
		}

		let dbname = `monthly/${year}_${month}.sqlite`;
		let tmp = new sqlite3.Database(dbname);

		tmp.serialize(function() {
			
			tmp.run(`
				CREATE TABLE IF NOT EXISTS log_revisions (
					status_uuid VARCHAR(36) NOT NULL,
					location_uuid VARCHAR(36) NOT NULL,
					staff_uuid VARCHAR(36) NOT NULL,
					staff_name VARCHAR(255),
					staff_position VARCHAR(255),
					session_data TEXT,
					inventory_revision TEXT,
					stock_revision TEXT,
					created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				)
			`);
			
			let stmt = `
				INSERT INTO log_revisions (
					status_uuid,
					location_uuid,
					staff_uuid,
					staff_name,
					staff_position,
					session_data,
					inventory_revision,
					stock_revision
				) VALUES (
					?,
					?,
					?,
					?,
					?,
					?,
					?,
					?
				)
			`;

			let args = [
				stat_uuid,
				loc_uuid,
				session.staff_uuid,
				session.staff_name,
				session.staff_position,
				JSON.stringify(session),
				JSON.stringify(inventory),
				JSON.stringify(stock)
			];

			tmp.run(stmt, args);

		});

		tmp.close();

	},
	sendEmail : function(to, subject, text) {

		return new Promise( function(resolve, reject) {

			let mailOptions = {
				from : 'info@wsd.co.jp',
				to : to,
				subject : subject,
				text : text
			}

			transporter.sendMail(mailOptions, function(err, info){
				if(err) {
					return reject(err);
				}

				resolve(info);
			});

		});

	}
}

/**
 * Create Web Socket Server
 **/

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', function(socket, req) {
	
	const cookies = cookie.parse(req.headers.cookie);
	const sid = cookieParser.signedCookie(cookies["connect.sid"],secret);

	socket.on('message', function(message) {
		console.log(message)
	});

	socket.on('close', function() {
	
		store.get( sid, async function(err, sessionData){
			if(err || !sessionData) {
				return;
			}

			let sql = `
				UPDATE
					log_sessions
				SET
					disconnect_time = datetime('now')
				WHERE
					session_uuid = ?
			`;

			let args = [
				sessionData.data.session_id
			];

			let bool;
			try {
				bool = await db.query(sql, args);
			} catch(err) {
				throw err;
			}

		});

	});

});

/**
 * Init Application
 **/

const app = express();
const port = 4000;
const secret = 'keyboard-cat';
const store = new RedisStore({ client: redisClient });

app.use(bodyParser.json({limit: '20mb'}));
app.use(session({
	store : store,
	secret : secret,
	resave: false,
	saveUninitialized: false,
	rolling : true,
	cookie : {
		maxAge : 360000,
		sameSite : true
	}
}));

const server = app.listen(port, function() {
	console.log(`Example app listening at http://localhost:${port}`)
});

server.on('upgrade', (req, socket, head) => {
	
	const cookies = cookie.parse(req.headers.cookie);
	const sid = cookieParser.signedCookie(cookies["connect.sid"],secret);
	
	store.get( sid, async function(err, sessionData){
		if(err || !sessionData) {
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		let sql = `
			UPDATE
				log_sessions
			SET
				login_time = datetime('now')
			WHERE
				session_uuid = ?
			AND
				login_time IS NULL
		`;

		let args = [
			sessionData.data.session_id
		];

		let bool;
		try {
			bool = await db.query(sql, args);
		} catch(err) {
			throw err;
		}

		sql = `
			UPDATE
				log_sessions
			SET
				disconnect_time = NULL
			WHERE
				session_uuid = ?
		`;

		args = [
			sessionData.data.session_id
		];

		try {
			bool = await db.query(sql, args);
		} catch(err) {
			throw err;
		}
		
		wsServer.handleUpgrade(req, socket, head, socket => {
			wsServer.emit('connection', socket, req);
		});
	});

});

/**
 * Create Rules for Serving files
 **/

const config = { 'index': ['index.html', 'index.htm'] };
app.get("*", async function(req, res) {

	let parts  = req.url.split("/");
	let name = parts[1] || "";
	let leaf = '';
	let doCheck = null;

	switch(name) {
	case "admin":
		// Serve Admin
		leaf = req.url.replace('/admin', '');
		doCheck = ['財務'];
		break;
	case "supervisor":
		// Serve Supervisor
		leaf = req.url.replace('/supervisor', '');
		doCheck = ['部長', '課長'];
		break;
	case "client":
		// Serve Client
		name = 'client';
		leaf = req.url.replace('/client', '');
		doCheck = ['担当'];
		break;
	case "lib":
		leaf = req.url.replace('/lib', '');
		break;
	default:
		
		leaf = req.url;
		if(config_exists) {
			// Serve Login
			name = "login";
		} else {
			// Serve Setup Page
			name = "init";
		}

		break;
	}

	let path;
	try {
		path = await db.getRevision(name);
	} catch(err) {
		throw err;
	}

	if(leaf === '/') {
		leaf += 'index.html';
	}
	
	if(doCheck) {
		if(!req.session.data || doCheck.indexOf(req.session.data.staff_position) === -1) {
			if(leaf.indexOf('.html') !== -1) {
				res.redirect('/');
				return;
			} else {
				res.status(403);
				res.end('NOT AUTHORIZED');
				return;
			}
		}
	}

	let full_path = path + leaf;
	fs.readFile(full_path, function(err, buffer) {
		if(err) {
			return res.end('404: File not Found', 404);
		}

		let type = mimetype.lookup(leaf); 
		res.setHeader("Content-Type", type);
		res.writeHead(200);
		res.end(buffer);
	});

});

/**
 * Create Rules for initializing the application
 **/

app.post('/session/setup', async function(req, res) {

	if(config_exists) {
		return res.end({
			err : 1,
			msg : 'SETUP HAS ALREADY BEEN RUN'
		});
	}

	// First we get the email transport
	
	const email_config = {
		service : req.body.email.format,
		auth : {
			user : req.body.email.username,
			pass : req.body.email.password
		}
	}
	transporter = nodemailer.createTransport(email_config);

	// Finally we create the root admin

	let staff_uuid = uuidv1();

	let sql = `
		INSERT INTO dat_staff (
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_password,
			staff_location
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let staff_hash;

	try {
		staff_hash = await db.hash(req.body.admin.password);
	} catch(err) {
		throw err;
	}

	let args = [
		staff_uuid,
		'財務',
		req.body.admin.display,
		req.body.admin.login_id,
		req.body.admin.email,
		staff_hash,
		'[]'
	];

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	// Write the configuration

	config_exists = true;
	const conf = {
		email : email_config
	};
	fs.writeFileSync('config.json', JSON.stringify(conf, null, 4));

	res.json({
		err : 0,
		msg : '/'
	});

});

/**
 * Create Rules for Login and Logout
 **/

app.post('/session/login', async function(req, res) {

	const session_id = uuidv1();

	const session_sql = `
		INSERT INTO log_sessions (
			session_uuid,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			attempt_result,
			source_ip,
			forward_ip,
			real_ip,
			user_agent,
			notes
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let sql = `
		SELECT
			account_locked,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_password,
			staff_location
		FROM
			dat_staff
		WHERE
			staff_login = ?
		AND
			removed_on IS NULL
	`;

	let args = [
		req.body.username
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// Handle Error: Username not found

	if(!row) {

		args = [
			session_id,
			'',
			null,
			null,
			req.body.username,
			null,
			0,
			req.connection.remoteAddress,
			req.headers['x-forwarded-for'],
			req.headers['x-real-ip'],
			req.headers['user-agent'],
			'USERNAME NOT FOUND'
		]

		try {
			await db.query(session_sql, args);
		} catch(err) {
			throw err;
		}

		return res.json({
			err : 100,
			msg : "USERNAME NOT FOUND"
		});
	}

	// Handle Account locked

	if(parseInt(row.account_locked)) {

		args = [
			session_id,
			'',
			null,
			null,
			req.body.username,
			null,
			0,
			req.connection.remoteAddress,
			req.headers['x-forwarded-for'],
			req.headers['x-real-ip'],
			req.headers['user-agent'],
			'ACCOUNT IS LOCKED'
		]

		try {
			await db.query(session_sql, args);
		} catch(err) {
			throw err;
		}

		return res.json({
			err : 104,
			msg : "ACCOUNT IS LOCKED"
		});

	}

	let bool;
	try {
		bool = await db.compare(req.body.password, row.staff_password);
	} catch(err) {
		throw err;
	}

	// Handle Error: Password does not match

	if(!bool && false) {

		sql = `
			SELECT
				attempt_result
			FROM
				log_sessions
			WHERE
				staff_uuid = ?
			AND
				attempt_time >= datetime('now','-30 minutes');
			ORDER BY 
				rowid DESC
			LIMIT 10
		`;

		args = [
			row.staff_uuid
		];

		let rows;
		try {
			rows = await db.selectAll(sql, args);
		} catch(err) {
			throw err;
		}

		let count = 0;
		for(let i = 0; i < rows.length; i++) {
			if(parseInt(rows[i].attempt_result)) {
				break;
			}
			count++;
		}

		let doLock = (count === 10);
		let note = 'WRONG PASSWORD';
		if(doLock) {
			note = 'ACCOUNT HAS BEEN LOCKED';
		}
		
		args = [
			session_id,
			row.staff_uuid,
			row.staff_position,
			row.staff_name,
			row.staff_login,
			row.staff_email,
			0,
			req.connection.remoteAddress,
			req.headers['x-forwarded-for'],
			req.headers['x-real-ip'],
			req.headers['user-agent'],
			note
		];

		try {
			await db.query(session_sql, args);
		} catch(err) {
			throw err;
		}

		// Lock Account

		if(doLock) {

			sql = `
				UPDATE
					dat_staff
				SET
					account_locked = 1
				WHERE
					staff_uuid = ?
			`;

			args = [
				row.staff_uuid
			];

			try {
				bool = await db.query(sql, args);
			} catch(err) {
				throw err;
			}

			return res.json({
				err: 102,
				msg : "ACCOUNT HAS BEEN LOCKED"
			});

		} else {

			return res.json({
				err: 101,
				msg : "WRONG PASSWORD"
			});

		}

	}

	if(req.body.remember_me) {
		req.session.cookie.maxAge = null;
	}
	
	delete row.staff_password;
	row.session_id = session_id;
	row.remote_ip = req.connection.remoteAddress;
	row.forward_ip = req.headers['x-forwarded-for'];
	row.real_ip = req.headers['x-real-ip'];
	row.user_agent = req.headers['user-agent'];

	args = [
		session_id,
		row.staff_uuid,
		row.staff_position,
		row.staff_name,
		row.staff_login,
		row.staff_email,
		1,
		req.connection.remoteAddress,
		req.headers['x-forwarded-for'],
		req.headers['x-real-ip'],
		req.headers['user-agent'],
		'LOGGED IN'
	];

	try {
		await db.query(session_sql, args);
	} catch(err) {
		throw err;
	}

	switch(row.staff_position){
	case "課長":
	case "部長":
		req.session.data = row;
		req.session.cookie.path = '/supervisor';
		res.json({
			err : 0,
			msg : {
				href : "/supervisor/"
			}
		});
		break;
	case "財務":
		req.session.data = row;
		req.session.cookie.path = '/admin';
		res.json({
			err : 0,
			msg : {
				href  : "/admin/"
			}
		});
		break;
	case "担当":
		req.session.data = row;
		req.session.cookie.path = '/client';
		res.json({
			err : 0,
			msg : {
				href : "/client/"
			}
		});
		break;
	default:
		return res.json({
			err : 105,
			msg : ' UNKNOWN STAFF POSITION'
		});
		break;
	}

	// Log last active time

	sql = `
		UPDATE
			dat_staff
		SET
			last_active = datetime('now')
		WHERE
			staff_uuid = ?
	`;

	args = [
		row.staff_uuid
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

});

app.post('/session/getCode', async function(req, res) {

	// First we get the content of the user

	let sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_location
		FROM
			dat_staff
		WHERE
			staff_login = ?
		AND
			removed_on IS NULL
	`;

	let args = [
		req.body.username
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// If we don't find the user, then return

	if(!row) {
		return res.json({
			err : 100,
			msg : "USERNAME NOT FOUND"
		});
	}
	
	// Now we have two options

	if(row.staff_email) {
		
		// If email exists, then we send them an email with
		// a one-time-pass to verify before choosing a new password

		let digits = '0123456789';
		let OTP = '';
		for (let i = 0; i < 6; i++) {
			OTP += digits[Math.floor(Math.random() * 10)];
		}

		let bool;
		try {
			bool = await db.sendEmail(row.staff_email, 'Pass', OTP);
		} catch(err) {
			throw err;
		}

		sql = `
			INSERT INTO log_reset (
				reset_uuid,
				staff_uuid,
				staff_login,
				staff_email,
				one_time_pass,
				valid_until
			) VALUES (
				?,
				?,
				?,
				?,
				?,
				datetime('now', '+1 hour')
			)
		`;

		let reset_uuid = uuidv1();

		args = [
			reset_uuid,
			row.staff_uuid,
			row.staff_login,
			row.staff_email,
			OTP
		];

		try {
			bool = await db.query(sql, args);
		} catch(err) {
			throw err;
		}

		return res.json({
			err : 0,
			msg : reset_uuid
		});

	} else if(row.staff_location) { 
		
		// Otherwise we look for the user's location and advice them
		// on which admin is able to reset their password

		row.staff_location = JSON.parse(row.staff_location);
	
		return res.json({
			err : 1,
			msg : 'Please ask your supervisor to reset your password'
		});

	}
		
	// And if neither of these conditions is satisfied, then 
	// we give an ambiguous message to contact the admin
		
	res.json({
		err : 110,
		msg : 'ADMIN CONTACT REQUIRED'
	});


});

app.post('/session/confirmCode', async function(req, res) {

	// Select the Reset Code from Database

	let sql = `
		SELECT
			reset_uuid,
			staff_uuid,
			staff_login,
			staff_email,
			one_time_pass,
			redeemed,
			valid_until
		FROM
			log_reset
		WHERE
			reset_uuid = ?
		AND
			staff_login = ?
	`;

	let args = [
		req.body.reset_uuid,
		req.body.username
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// If we can't find the row, we return

	if(!row) {
		return res.json({
			err : 1,
			msg : 'COULD NOT FIND RESET UUID'
		});
	}
	
	// If the request has already been redeemed, return

	if(parseInt(row.redeemed) !== 0) {
		return res.json({
			err : 1,
			msg : 'CODE HAS BEEN REDEEMED'
		});
	}

	// If valid time is exceeded, then return

	let nao = new Date();
	let offset = nao.getTimezoneOffset() * 60 * 1000;
	let check_date = new Date(nao.getTime() + offset);
	let valid_until = new Date(row.valid_until);

	console.log("Current Time: %s", check_date.toISOString());
	console.log("Valid Until: %s", valid_until.toISOString());

	if(check_date.getTime() > valid_until.getTime()) {
		return res.json({
			err : 1,
			msg : 'TIME LIMIT HAS BEEN EXCEEDED'
		});
	}

	// If the code is incorrect, then return

	if(row.one_time_pass !== req.body.code) {
		return res.json({
			err : 1,
			msg : 'CODE DOES NOT MATCH'
		});
	}

	// Otherwise we confirm it's okay

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/session/updatePassword', async function(req, res) {

	/**
	 * Part 1, we confirm the code
	 **/

	// Select the Reset Code from Database

	let sql = `
		SELECT
			reset_uuid,
			staff_uuid,
			staff_login,
			staff_email,
			one_time_pass,
			redeemed,
			valid_until
		FROM
			log_reset
		WHERE
			reset_uuid = ?
		AND
			staff_login = ?
	`;

	let args = [
		req.body.reset_uuid,
		req.body.username
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// If we can't find the row, we return

	if(!row) {
		return res.json({
			err : 1,
			msg : 'COULD NOT FIND RESET UUID'
		});
	}
	
	// If the request has already been redeemed, return

	if(parseInt(row.redeemed) !== 0) {
		return res.json({
			err : 1,
			msg : 'CODE HAS BEEN REDEEMED'
		});
	}

	// If valid time is exceeded, then return

	let nao = new Date();
	let offset = nao.getTimezoneOffset() * 60 * 1000;
	let check_date = new Date(nao.getTime() + offset);
	let valid_until = new Date(row.valid_until);

	console.log("Current Time: %s", check_date.toISOString());
	console.log("Valid Until: %s", valid_until.toISOString());

	if(check_date.getTime() > valid_until.getTime()) {
		return res.json({
			err : 1,
			msg : 'TIME LIMIT HAS BEEN EXCEEDED'
		});
	}

	// If the code is incorrect, then return

	if(row.one_time_pass !== req.body.code) {
		return res.json({
			err : 1,
			msg : 'CODE DOES NOT MATCH'
		});
	}

	/**
	 * Part 2: We Actually update the password
	 **/

	let staff_hash;
	try {
		staff_hash = await db.hash(req.body.password);
	} catch(err) {
		throw err;
	}

	sql = `
		UPDATE
			dat_staff
		SET
			staff_password = ?,
			account_locked = 0
		WHERE
			staff_uuid = ?
	`;

	args = [
		staff_hash,
		row.staff_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	sql = `
		UPDATE
			log_reset
		SET
			redeemed = 1
		WHERE
			reset_uuid = ?
	`;

	args = [
		req.body.reset_uuid
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	/**
	 * Part 3: Replaicate Login
	 **/

	const session_id = uuidv1();

	const session_sql = `
		INSERT INTO log_sessions (
			session_uuid,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			attempt_result,
			source_ip,
			forward_ip,
			real_ip,
			user_agent,
			notes
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	sql = `
		SELECT
			account_locked,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_password,
			staff_location
		FROM
			dat_staff
		WHERE
			staff_uuid = ?
		AND
			removed_on IS NULL
	`;

	args = [
		row.staff_uuid
	];

	row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	bool;
	try {
		bool = await db.compare(req.body.password, row.staff_password);
	} catch(err) {
		throw err;
	}

	// Handle Error: Password does not match

	delete row.staff_password;
	row.session_id = session_id;
	row.remote_ip = req.connection.remoteAddress;
	row.forward_ip = req.headers['x-forwarded-for'];
	row.real_ip = req.headers['x-real-ip'];
	row.user_agent = req.headers['user-agent'];

	args = [
		session_id,
		row.staff_uuid,
		row.staff_position,
		row.staff_name,
		row.staff_login,
		row.staff_email,
		1,
		req.connection.remoteAddress,
		req.headers['x-forwarded-for'],
		req.headers['x-real-ip'],
		req.headers['user-agent'],
		'LOGGED IN'
	];

	try {
		await db.query(session_sql, args);
	} catch(err) {
		throw err;
	}

	switch(row.staff_position){
	case "課長":
	case "部長":
		req.session.data = row;
		req.session.cookie.path = '/supervisor';
		res.json({
			err : 0,
			msg : {
				href : "/supervisor/"
			}
		});
		break;
	case "財務":
		req.session.data = row;
		req.session.cookie.path = '/admin';
		res.json({
			err : 0,
			msg : {
				href  : "/admin/"
			}
		});
		break;
	case "担当":
		req.session.data = row;
		req.session.cookie.path = '/client';
		res.json({
			err : 0,
			msg : {
				href : "/client/"
			}
		});
		break;
	default:
		return res.json({
			err : 105,
			msg : ' UNKNOWN STAFF POSITION'
		});
		break;
	}

	// Log last active time

	sql = `
		UPDATE
			dat_staff
		SET
			last_active = datetime('now')
		WHERE
			staff_uuid = ?
	`;

	args = [
		row.staff_uuid
	];

});

/**
 * Client Callbacks
 **/

app.post('/client/*', function(req, res, next) {

	// Check to see if logged in at all

	if(!req.session.data) {
		return res.json({ err : 1, msg : 'NOT LOGGED IN' });
	}

	// Check for the propper staff position

	switch(req.session.data.staff_position) {
	case '担当':
		// This is okay
		break;
	default:
		return res.json({ err : 2, msg : 'INVALID STAFF POSITION' });
		break;
	}

	if(req.session.data.remote_ip !== req.connection.remoteAddress) {
		return res.json({ err : 3, msg : 'INVALID REMOTE IP' });
	}

	if(req.session.data.forward_ip !== req.headers['x-forwarded-for']) {
		return res.json({ err : 4, msg : 'INVALID FORWARD IP' });
	}

	if(req.session.data.real_ip !== req.headers['x-real-ip']) {
		return res.json({ err : 5, msg : 'INVALID REAL IP' });
	}

	if(req.session.data.user_agent !== req.headers['user-agent']) {
		return res.json({ err : 6, msg : 'INVALID USER AGENT' });
	}

	next();

});

app.post('/client/session/logout', async function(req, res) {

	let sql = `
		UPDATE
			log_sessions
		SET
			logout_time = datetime('now')
		WHERE
			session_uuid = ?
	`;

	let args = [
		req.session.data.session_id
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	req.session.destroy();
	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/client/session/getData', async function(req, res) {

	res.json({
		err : 0,
		msg : req.session.data
	});

});

app.post('/client/api/v1/updateInvReport', async function(req, res) {

	// First we update the latest version

	let sql = `
		UPDATE
			dat_report
		SET
			on_site_report = ?,
			on_site_stock = ?,
			on_site_update = datetime('now')
		WHERE
			status_uuid = ?
	`;

	let args = [
		JSON.stringify(req.body.inventory),
		JSON.stringify(req.body.stock),
		req.body.status_uuid
	];

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

	// Then we save a copy of the revision

	sql = `
		SELECT
			location_uuid,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;
	
	args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	let year = row.report_year;
	let month = row.report_month;
	let session = req.session.data;
	let inventory = req.body.inventory;
	let stock = req.body.stock;
	let loc_uuid = row.location_uuid;
	let stat_uuid = req.body.status_uuid;

	db.saveRevision(year, month, session, stat_uuid, loc_uuid, inventory, stock);

});


app.post('/client/api/v1/selectInvReport', async function(req, res) {

	let staff_location = JSON.parse(req.session.data.staff_location);

	let args = [
		req.session.data.staff_uuid
	];

	let q = [];

	staff_location.forEach( loc => {
		q.push('?');
		args.push(loc);
	});

	q = q.join(',');

	// First we select the status

	let sql = `
		SELECT
			status_uuid,
			report_year,
			report_month,
			assign_to_name,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			location_uuid
		FROM
			dat_status
		WHERE
			assign_to_uuid = ?
		AND
			location_uuid IN (${q})
		ORDER BY
			created_on DESC
		LIMIT 1
	`;

	let status;
	try {
		status = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	if(!status) {
		return res.json({
			err : 300,
			msg : "NO REPORTS"
		});
	}

	// Then we need to select the most recent support

	sql = `
		SELECT
			on_site_report,
			on_site_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	args = [
		status.status_uuid
	];

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}
	
	status.staff_name = req.session.data.staff_name;

	let row =  {}
	row.status = status;
	row.inventory = JSON.parse(report.on_site_report);
	row.stock = JSON.parse(report.on_site_stock);

	sql = `
		SELECT
			location_name,
			location_places,
			location_products,
			location_map
		FROM
			dat_locations
		WHERE
			location_uuid = ?
	`;

	args = [
		status.location_uuid
	];

	let loc;
	try {
		loc = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}
	
	loc.location_products = JSON.parse(loc.location_products);
	loc.location_places = JSON.parse(loc.location_places);
	row.location = loc;	

	sql = `
		SELECT
			staff_uuid,
			staff_name,
			staff_position
		FROM
			dat_staff
		WHERE
			staff_uuid IN (? , ?)
	`;

	args = [
		status.manager_uuid,
		status.director_uuid
	];

	let managers;
	try {
		managers = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	row.managers = managers;
	res.json({
		err: 0,
		msg : row
	});

});


app.post('/client/api/v1/selectReport', async function(req, res) {

	let staff_location = JSON.parse(req.session.data.staff_location);

	let args = [
		req.session.data.staff_uuid,
	];

	let q = [];

	staff_location.forEach( loc => {
		q.push('?');
		args.push(loc);
	});

	q = q.join(',');

	// First we select the status

	let sql = `
		SELECT
			status_uuid,
			report_year,
			report_month,
			assign_to_name,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			location_uuid
		FROM
			dat_status
		WHERE
			assign_to_uuid = ?
		AND
			location_uuid IN (${q})
		ORDER BY
			created_on DESC
		LIMIT 1
	`;

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	if(!row) {
		return res.json({
			err : 300,
			msg : "NO REPORTS"
		});
	}

	// Then we need to select the most recent support

	sql = `
		SELECT
			on_site_report,
			on_site_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	args = [
		row.status_uuid
	];

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	row.report = JSON.parse(report.on_site_report);
	row.stock = JSON.parse(report.on_site_stock);

	sql = `
		SELECT
			location_name,
			location_places,
			location_products,
			location_map
		FROM
			dat_locations
		WHERE
			location_uuid = ?
	`;

	args = [
		row.location_uuid
	];

	let loc;
	try {
		loc = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}
	
	loc.location_products = JSON.parse(loc.location_products);
	row.location = loc;	
	row.staff_name = req.session.data.staff_name;

	sql = `
		SELECT
			staff_uuid,
			staff_name,
			staff_position
		FROM
			dat_staff
		WHERE
			staff_uuid IN (? , ?)
	`;

	args = [
		row.manager_uuid,
		row.director_uuid
	];

	let managers;
	try {
		managers = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	row.managers = managers;

	res.json({
		err: 0,
		msg : row
	});

});

app.post('/client/api/v1/updateReport', async function(req, res) {

	// First we update the latest version

	let sql = `
		UPDATE
			dat_report
		SET
			on_site_report = ?,
			on_site_stock = ?,
			on_site_update = datetime('now')
		WHERE
			status_uuid = ?
	`;

	let inventory = JSON.stringify(req.body.on_site_report);
	let stock = JSON.stringify(req.body.on_site_stock);

	let args = [
		inventory,
		stock,
		req.body.status_uuid
	];

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

	// Then we save a copy of the revision

	sql = `
		SELECT
			location_uuid,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;
	
	args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	let year = row.report_year;
	let month = row.report_month;
	let session = req.session.data;
	let loc_uuid = row.location_uuid;
	let stat_uuid = req.body.status_uuid;

	db.saveRevision(year, month, session, stat_uuid, loc_uuid, inventory, stock);

});

app.post('/client/api/v1/updateStock', async function(req, res) {

	// First we update the latest version
	
	/* THIS HAS BEEN REMOVED !!!

	let sql = `
		UPDATE
			dat_report
		SET
			on_site_stock = ?,
			on_site_update = datetime('now')
		WHERE
			status_uuid = ?
	`;

	let args = [
		JSON.stringify(req.body.on_site_stock),
		req.body.status_uuid
	];

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

	// Then we save a copy of the revision
	*/

});

app.post('/client/api/v1/submitReport', async function(req, res) {

	// First we update the latest version

	let sql = `
		UPDATE
			dat_report
		SET
			on_site_report = ?,
			managers_report = ?,
			on_site_stock = ?,
			managers_stock = ?,
			on_site_update = datetime('now')
		WHERE
			status_uuid = ?
	`;

	let args = [
		JSON.stringify(req.body.on_site_report),
		JSON.stringify(req.body.on_site_report),
		JSON.stringify(req.body.on_site_stock),
		JSON.stringify(req.body.on_site_stock),
		req.body.status_uuid
	];

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	sql = `
		UPDATE
			dat_status
		SET
			date_of_implementation = date('now'),
			input_complete_time = datetime('now')
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.status_uuid
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}
	
	// First we select the manager and director uuid

	sql = `
		SELECT
			manager_uuid,
			director_uuid,
			location_name,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args)
	} catch(err) {
		throw err;
	}

	// Then we select information manager and director

	sql = `
		SELECT
			staff_position,
			staff_name,
			staff_login,
			staff_email
		FROM
			dat_staff
		WHERE
			staff_uuid IN (?, ?)
	`;

	args = [
		row.manager_uuid,
		row.director_uuid
	];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	// Send Reply

	res.json({
		err : 0,
		msg : 'okay'
	});
	
	// Send an email to each of the managers
	
	let y = row.report_year;
	let m = row.report_month;
	let n = row.location_name;

	let subject = `棚卸確認　${n} ${y}年${m}月`;
	for(let i = 0; i < rows.length; i++) {
		let staff = rows[i];
		if(!staff.staff_email) {
			continue;
		}
		
		let text = [
			`${staff.staff_name}様`,
			`${req.session.data.staff_name} has completed 棚卸 for the ${n} location`,
			`Please login into the 棚卸 to sign off on the report so that it can be`,
			`sent to 財務 to be included in this month's report`,
			`Thank you.`
		].join('\n');
		
		let bool;
		try {
			bool = await db.sendEmail(staff.staff_email, subject, text);
		} catch(err) {
			console.log(err);
		}

	}

});

/**
 * Supervisor Callbacks
 **/

app.post('/supervisor/*', function(req, res, next) {

	// Check to see if logged in at all

	if(!req.session.data) {
		return res.json({ err : 1, msg : 'NOT LOGGED IN' });
	}

	// Check for the propper staff position

	switch(req.session.data.staff_position) {
	case '部長':
	case '課長':
		// This is okay
		break;
	default:
		return res.json({ err : 2, msg : 'INVALID STAFF POSITION' });
		break;
	}

	if(req.session.data.remote_ip !== req.connection.remoteAddress) {
		return res.json({ err : 3, msg : 'INVALID REMOTE IP' });
	}

	if(req.session.data.forward_ip !== req.headers['x-forwarded-for']) {
		return res.json({ err : 4, msg : 'INVALID FORWARD IP' });
	}

	if(req.session.data.real_ip !== req.headers['x-real-ip']) {
		return res.json({ err : 5, msg : 'INVALID REAL IP' });
	}

	if(req.session.data.user_agent !== req.headers['user-agent']) {
		return res.json({ err : 6, msg : 'INVALID USER AGENT' });
	}

	next();

});

app.post('/supervisor/session/logout', async function(req, res) {

	let sql = `
		UPDATE
			log_sessions
		SET
			logout_time = datetime('now')
		WHERE
			session_uuid = ?
	`;

	let args = [
		req.session.data.session_id
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	req.session.destroy();
	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/supervisor/session/getData', async function(req, res) {

	res.json({
		err : 0,
		msg : req.session.data
	});

});

app.post('/supervisor/api/v1/getPanel', async function(req, res) {

	// Select locations

	let args;

	try {
		args = JSON.parse(req.session.data.staff_location);
	} catch(err) {
		return res.json({ err : 3, msg : 'COULD NOT PARSE LOCATIONS' });
	}

	// If there are no locations, end

	if(!args.length) {
		return res.json({ err : 4, msg : 'NO LOCATIONS SET' });
	}

	// Select all of the locations the manager is assigned to

	let q = [];
	args.forEach( uuid => {
		q.push('?');
	});
	q = q.join(',');
	let sql = `
		SELECT
			status_uuid,
			location_uuid,
			location_name,
			report_year,
			report_month,
			assign_to_name,
			assign_to_uuid,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			fix_attn_uuid,
			require_fix,
			created_on
		FROM
			dat_status
		WHERE
			location_uuid IN (${q})
		ORDER BY
			rowid DESC
		LIMIT 50
	`;

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : rows
	});

});

app.post('/supervisor/api/v1/getLocations', async function(req, res) {

	let args = JSON.parse(req.session.data.staff_location);

	let q = [];
	args.forEach( uuid => {
		q.push('?');
	});
	q = q.join(',');

	let sql = `
		SELECT
			location_uuid,
			location_name
		FROM
			dat_locations
		WHERE
			location_uuid IN (${q})
	`;

	let rows;

	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	return res.json({
		err : 0,
		msg : rows
	});

});

app.post('/supervisor/api/v1/getStaff', async function(req, res) {

	// Select locations

	let locations;

	try {
		locations = JSON.parse(req.session.data.staff_location);
	} catch(err) {
		return res.json({ err : 3, msg : 'COULD NOT PARSE LOCATIONS' });
	}

	let result = {};

	for(let i = 0; i < locations.length; i++) {

		// Not safe

		let uuid = locations[i];

		let sql = `
			SELECT
				account_locked,
				last_active,
				staff_uuid,
				staff_position,
				staff_name,
				staff_login,
				staff_email,
				last_active
			FROM
				dat_staff
			WHERE
				staff_location LIKE '%${uuid}%'
		`;

		let args = [];

		try {
			result[uuid] = await db.selectAll(sql, args);
		} catch(err) {
			throw err;
		}

	}

	res.json({
		err : 0,
		msg : result
	});

});

app.post('/supervisor/api/v1/selectStaff', async function(req, res) {

	// Get the locations for the manager

	let locs = JSON.parse(req.session.data.staff_location);
	let staff = {};

	for(let i = 0; i < locs.length; i++) {

		let sql = `
			SELECT
				account_locked,
				staff_uuid,
				staff_position,
				staff_name,
				staff_login,
				staff_email,
				staff_location
			FROM
				dat_staff
			WHERE
				removed_on IS NULL
			AND
				staff_position = '担当'
			AND
				staff_location LIKE '%${locs[i]}%'
		`;

		let args = [];

		let rows;

		try {
			rows = await db.selectAll(sql, args);
		} catch(err) {
			throw err;
		}

		rows.forEach(row => {
			staff[row.staff_uuid] = row;
		});

	}

	let rows = [];
	for(let key in staff) {
		staff[key].staff_location = JSON.parse(staff[key].staff_location);
		rows.push(staff[key]);
	}

	return res.json({
		err : 0,
		msg : rows
	});

});

app.post('/supervisor/api/v1/addStaff', async function(req, res) {

	let staff_uuid = uuidv1();

	let sql = `
		INSERT INTO dat_staff (
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_password,
			staff_location
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let staff_hash;

	try {
		staff_hash = await db.hash(req.body.staff_password);
	} catch(err) {
		throw err;
	}


	let args = [
		staff_uuid,
		req.body.staff_position,
		req.body.staff_name,
		req.body.staff_login,
		req.body.staff_email,
		staff_hash,
		JSON.stringify(req.body.staff_locations)
	];

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : staff_uuid
	});

});

app.post('/supervisor/api/v1/updateStaff', async function(req, res) {

	let sql, args;

	if(req.body.staff_password) {

		let staff_hash;
		try {
			staff_hash = await db.hash(req.body.staff_password);
		} catch(err) {
			throw err;
		}

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_password = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			staff_hash,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	} else {

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	}

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/supervisor/api/v1/getReport', async function(req, res) {

	let sql = `
		SELECT
			location_uuid,
			location_name,
			location_places,
			location_types,
			location_variety,
			location_products,
			location_map
		FROM
			dat_locations
		WHERE
			location_uuid = ?
	`;

	let args = [
		req.body.location_uuid
	]

	let loc;
	try {
		loc = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	sql = `
		SELECT
			on_site_report,
			managers_report,
			on_site_stock,
			managers_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.status_uuid
	];

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	report.on_site_report = JSON.parse(report.on_site_report);
	report.managers_report = JSON.parse(report.managers_report);
	report.on_site_stock = JSON.parse(report.on_site_stock);
	report.managers_stock = JSON.parse(report.managers_stock);

	sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name
		FROM
			dat_staff
		WHERE
			staff_uuid IN (?, ?, ?)
	`;

	args = req.body.staff

	let staff;
	try {
		staff = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : {
			me : req.session.data.staff_uuid,
			location : loc,
			report : report,
			staff : staff
		}
	});

});

app.post('/supervisor/api/v1/updateStatus', async function(req, res) {

	// Execute SQL

	let sql = `
		UPDATE
			dat_status
		SET
			assign_to_uuid = ?,
			manager_uuid = ?,
			director_uuid = ?
		WHERE
			status_uuid = ?
	`;

	let args = [
		req.body.assign_to_uuid,
		req.body.manager_uuid,
		req.body.director_uuid,
		req.body.status_uuid
	]

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/supervisor/api/v1/fixMessage', async function(req, res) {

	let sql = `
		SELECT
			status_uuid,
			fix_attn_uuid,
			admin_uuid,
			message
		FROM
			dat_fixes
		WHERE
			status_uuid = ?
		ORDER BY
			rowid DESC
		LIMIT 1
	`

	let args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : row
	});

});

app.post('/supervisor/api/v1/signReport', async function(req, res) {

	// Create SQL statement

	let field, role, sql, args, bool;
	
	 
	switch(req.body.role) {
	case 'manager':
		field = 'manager_approval_time';
		role = 'manager_uuid';
		break;
	case 'director':
		field = 'director_approval_time';
		role = 'director_uuid';
		break;
	}

	if(!field) {
		return res.json({
			err : 3,
			msg : "INVALID ROLE POSITION"
		});
	}

	sql = `
		UPDATE
			dat_status
		SET
			${field} = datetime('now'),
			require_fix = 0,
			fix_attn_uuid = NULL
		WHERE
			status_uuid = ?
		AND
			${role} = ?
	`;

	args = [
		req.body.status_uuid,
		req.session.data.staff_uuid
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

	// Get information from dat status

	sql = `
		SELECT
			location_name,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// Send email to 財務 for confirmation

	sql = `
		SELECT
			staff_name,
			staff_email
		FROM
			dat_staff
		WHERE
			staff_position = '財務'
		AND
			staff_email IS NOT NULL
	`;

	let admins;
	try {
		admins = await db.selectAll(sql);
	} catch(err) {
		throw err;
	}

	let y = row.report_year;
	let m = row.report_month;
	let n = row.location_name;
	let subject = `棚卸確認　${n} ${y}年${m}月`;

	for(let i = 0; i < admins.length; i++) {

		let name = admins[i].staff_name;
		let email = admins[i].staff_email;
		
		let text = [
			`${name}さん`,
			`${req.session.data.staff_name} has completed 棚卸 for the ${n} location`,
			`Please login into the 棚卸 to sign off on the report so that it can be`,
			`be included in this month's report`,
			`Thank you.`
		].join('\n');

		try {
			bool = await db.sendEmail(email, subject, text);
		} catch(err) {
			throw err;
		}

		console.log("Sent email to admin: %s", email);

	}

});

app.post('/supervisor/api/v1/updateReport', async function(req, res) {

	// First we update the latest version

	let sql = `
		UPDATE
			dat_report
		SET
			managers_report = ?,
			managers_stock = ?,
			manager_update = datetime('now')
		WHERE
			status_uuid = ?
	`;

	let args = [
		JSON.stringify(req.body.managers_report),
		JSON.stringify(req.body.managers_stock),
		req.body.status_uuid
	];

	let bool;

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

	// Then we save a copy of the revision

	sql = `
		SELECT
			location_uuid,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;
	
	args = [
		req.body.status_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	let year = row.report_year;
	let month = row.report_month;
	let session = req.session.data;
	let inventory = req.body.managers_report;
	let stock = req.body.managers_stock;
	let loc_uuid = row.location_uuid;
	let stat_uuid = req.body.status_uuid;

	db.saveRevision(year, month, session, stat_uuid, loc_uuid, inventory, stock);

});

app.post('/supervisor/api/v1/removeStaff', async function(req, res) {

	let sql = `
		UPDATE
			dat_staff
		SET
			removed_on = datetime('now')
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/supervisor/api/v1/lockAccount', async function(req, res) {

	let sql = `
		UPDATE
			dat_staff
		SET
			account_locked = 1
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/supervisor/api/v1/unlockAccount', async function(req, res) {

	// Unlock Account

	let sql = `
		UPDATE
			dat_staff
		SET
			account_locked = 0
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	// Select Staff Data

	sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email
		FROM
			dat_staff
		WHERE
			staff_uuid = ?
	`;

	args = [
		req.body.staff_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// Create Log Data

	sql = `
		INSERT INTO log_sessions (
			session_uuid,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			source_ip,
			forward_ip,
			real_ip,
			user_agent,
			attempt_result,
			notes
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			1,
			'UNLOCKED BY ADMIN'
		)
	`;

	args = [
		uuidv1(),
		row.staff_uuid,
		row.staff_position,
		row.staff_name,
		row.staff_login,
		row.staff_email,
		req.connection.remoteAddress,
		req.headers['x-forwarded-for'],
		req.headers['x-real-ip'],
		req.headers['user-agent']
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	// Return confirmation

	res.json({
		err : 0,
		msg : 'okay'
	});

});

/**
 * Admin Callbacks
 **/


app.post('/admin/*', function(req, res, next) {

	// Check to see if logged in at all

	if(!req.session.data) {
		return res.json({ err : 1, msg : 'NOT LOGGED IN' });
	}

	// Check for the propper staff position

	switch(req.session.data.staff_position) {
	case '財務':
		// This is okay
		break;
	default:
		return res.json({ err : 2, msg : 'INVALID STAFF POSITION' });
		break;
	}

	if(req.session.data.remote_ip !== req.connection.remoteAddress) {
		return res.json({ err : 3, msg : 'INVALID REMOTE IP' });
	}

	if(req.session.data.forward_ip !== req.headers['x-forwarded-for']) {
		return res.json({ err : 4, msg : 'INVALID FORWARD IP' });
	}

	if(req.session.data.real_ip !== req.headers['x-real-ip']) {
		return res.json({ err : 5, msg : 'INVALID REAL IP' });
	}

	if(req.session.data.user_agent !== req.headers['user-agent']) {
		return res.json({ err : 6, msg : 'INVALID USER AGENT' });
	}

	next();

});

app.post('/admin/session/logout', async function(req, res) {

	let sql = `
		UPDATE
			log_sessions
		SET
			logout_time = datetime('now')
		WHERE
			session_uuid = ?
	`;

	let args = [
		req.session.data.session_id
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	req.session.destroy();
	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/session/getData', async function(req, res) {

	res.json({
		err : 0,
		msg : req.session.data
	});

});

app.post('/admin/api/v1/selectProducts', async function(req, res) {


	let sql = `
		SELECT
			product_uuid,
			product_type,
			product_variety,
			product_name,
			next_process,
			unit
		FROM
			dat_products
		WHERE
			removed_on IS NULL
	`;

	let args = [];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : rows
	});

});

app.post('/admin/api/v1/getLocations', async function(req, res) {

	let sql = `
		SELECT
			location_uuid,
			location_name,
			location_places,
			location_types,
			location_variety,
			location_products,
			location_map
		FROM
			dat_locations
		WHERE
			removed_on IS NULL
	`;

	let args = []

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : result
	});

});

app.post('/admin/api/v1/selectStaff', async function(req, res) {

	let sql = `
		SELECT
			last_active,
			account_locked,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_location
		FROM
			dat_staff
		WHERE
			removed_on IS NULL
		AND
			staff_position != "財務"
	`;

	let args = []

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	let q = [];
	args = [];

	for(let i = 0; i < result.length; i++) {
		result[i].staff_location = JSON.parse(result[i].staff_location);
		if(!result[i].staff_location) {
			continue;
		}

		result[i].staff_location.forEach( uuid => {
			if(args.indexOf(uuid) !== -1) {
				return;
			}
			args.push(uuid);
			q.push('?');
		});
	}

	if(!args.length) {
		return res.json({
			err: 0,
			msg : {
				staff : result,
				locs : []
			}
		});
	}

	q = q.join(',');

	sql = `
		SELECT
			location_name,
			location_uuid
		FROM
			dat_locations
		WHERE
			location_uuid IN (${q})
	`;

	let locs;
	try {
		locs = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : {
			staff : result,
			locs : locs
		}
	});

});

app.post('/admin/api/v1/selectStatusRep', async function(req, res) {

	let sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_location
		FROM
			dat_staff
		WHERE
			removed_on IS NULL
	`;

	let args = []

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	for(let i = 0; i < result.length; i++) {
		result[i].staff_location = JSON.parse(result[i].staff_location);
	}

	res.json({
		err: 0,
		msg : result
	});

});

app.post('/admin/api/v1/selectHopper', async function(req, res) {

	// Get the most resent post

	let sql = `
		SELECT
			report_year,
			report_month
		FROM
			dat_status
		ORDER BY
			rowid DESC 
		LIMIT 1
	`;

	let row;
	try {
		row = await db.selectOne(sql);
	} catch(err) {
		throw err;
	}

	if(!row) {
		return res.json({
			err : 0,
			msg : []
		});
	}

	// Then we select all of the status 

	sql = `
		SELECT
			location_uuid,
			location_name,
			status_uuid,
			report_year,
			report_month,
			assign_to_uuid,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			require_fix
		FROM
			dat_status
		WHERE
			report_year = ?
		AND
			report_month = ?
	`;

	let args = [
		row.report_year,
		row.report_month
	];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	// Then we need to grab the staff names

	sql = `
		SELECT
			staff_uuid,
			staff_name,
			staff_position
		FROM
			dat_staff
		WHERE
			staff_uuid IN (?, ?, ?)
	`;

	console.log(rows.length);

	for(let i = 0; i < rows.length; i++) {
	
		console.log(i);

		args = [
			rows[i].assign_to_uuid,
			rows[i].manager_uuid,
			rows[i].director_uuid
		];

		let staff;
		try {
			staff = await db.selectAll(sql, args);
		} catch(err) {
			throw err;
		}

		rows[i].staff = {};
		staff.forEach(s => {
			rows[i].staff[s.staff_uuid] = s;
		});
		
	}

	res.json({
		err : 0,
		msg : rows
	});

});

app.post('/admin/api/v1/selectInvReport', async function(req, res) {

	let sql = `
		SELECT
			status_uuid,
			on_site_report,
			on_site_stock,
			managers_report,
			managers_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	let args = [
		req.body.status_uuid
	];

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	report.on_site_report = JSON.parse(report.on_site_report);
	report.on_site_stock = JSON.parse(report.on_site_stock);

	report.managers_report = JSON.parse(report.managers_report);
	report.managers_stock = JSON.parse(report.managers_stock);

	res.json({
		err : 0,
		msg :report
	});


});

app.post('/admin/api/v1/selectAdminReport', async function(req, res) {

	// First we select the status

	let sql = `
		SELECT
			location_uuid,
			location_name,
			status_uuid,
			report_year,
			report_month,
			assign_to_name,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			require_fix
		FROM
			dat_status
		WHERE
			admin_approval_time IS NULL
		ORDER BY
			created_on DESC
	`;

	let args = [ ]

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	if(rows.length === 0) {
		return res.json({
			err : 0,
			msg : null
		});
	}

	// Then we need to select the most recent support

	let q = [];
	args = []

	for(let i = 0; i < rows.length; i++) {
		q.push('?');
		args.push(rows[i].status_uuid);
	}

	q = q.join(',');

	sql = `
		SELECT
			status_uuid,
			on_site_report,
			on_site_stock,
			managers_report,
			managers_stock
		FROM
			dat_report
		WHERE
			status_uuid IN ( ${q} )
	`;

	let reports;
	try {
		reports = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	for(let i = 0; i < reports.length; i++) {

		reports[i].on_site_report = JSON.parse(reports[i].on_site_report);
		reports[i].on_site_stock = JSON.parse(reports[i].on_site_stock);

		reports[i].managers_report = JSON.parse(reports[i].managers_report);
		reports[i].managers_stock = JSON.parse(reports[i].managers_stock);
	}

	// Then we need to get the manager name from the staff list

	q = [];
	args = [];

	for(let i = 0; i < rows.length; i++) {

		if(args.indexOf(rows[i].manager_uuid) === -1) {
			q.push('?');
			args.push(rows[i].manager_uuid);
		}

		if(args.indexOf(rows[i].director_uuid) === -1) {
			q.push('?');
			args.push(rows[i].director_uuid);
		}

	}

	q = q.join(',');

	sql = `
		SELECT
			staff_uuid,
			staff_name,
			staff_position
		FROM
			dat_staff
		WHERE
			staff_uuid IN ( ${q} )
	`;

	let managers;
	try {
		managers = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : {
			status : rows,
			reports: reports,
			staff : managers
		}
	});

});

app.post('/admin/api/v1/selectCompleteReport', async function(req, res) {

	// First we select the status

	let sql = `
		SELECT
			location_uuid,
			location_name,
			status_uuid,
			report_year,
			report_month,
			assign_to_name,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			group_1,
			group_2
		FROM
			dat_status
		WHERE
			admin_approval_time IS NOT NULL
		ORDER BY
			created_on DESC
		LIMIT 50
	`;

	let args = [ ]

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	if(rows.length === 0) {
		return res.json({
			err : 0,
			msg : []
		});
	}

	// Then we need to select the most recent support

	let q = [];
	args = [];

	for(let i = 0; i < rows.length; i++) {

		if(args.indexOf(rows[i].assign_to_uuid) === -1) {
			q.push('?');
			args.push(rows[i].assign_to_uuid);
		}

		if(args.indexOf(rows[i].manager_uuid) === -1) {
			q.push('?');
			args.push(rows[i].manager_uuid);
		}

		if(args.indexOf(rows[i].director_uuid) === -1) {
			q.push('?');
			args.push(rows[i].director_uuid);
		}

	}

	q = q.join(',');

	sql = `
		SELECT
			staff_uuid,
			staff_name,
			staff_position
		FROM
			dat_staff
		WHERE
			staff_uuid IN ( ${q} )
	`;

	let managers;
	try {
		managers = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : {
			status : rows,
			staff : managers
		}
	});

});

app.post('/admin/api/v1/selectAggregate', async function(req, res) {

	let sql = `
		SELECT
			aggregate_uuid,
			aggregate_group,
			aggregate_name
		FROM
			dat_aggregate
		WHERE
			removed_on IS NULL
	`;

	let args = [];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : rows
	});

});

app.post('/admin/api/v1/removeAggregate', async function(req, res) {

	let sql = `
		UPDATE
			dat_aggregate
		SET
			removed_on = datetime('now')
		WHERE
			aggregate_uuid = ?
	`;

	let args = [
		req.body.aggregate_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/updateAggregate', async function(req, res) {

	let sql = `
		UPDATE
			dat_aggregate
		SET
			aggregate_group = ?,
			aggregate_name = ?
		WHERE
			aggregate_uuid = ?
	`;

	let args = [
		req.body.aggregate_group,
		req.body.aggregate_name,
		req.body.aggregate_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/createAggregate', async function(req, res) {

	let aggregate_uuid = uuidv1();

	let sql = `
		INSERT INTO dat_aggregate (
			aggregate_uuid,
			aggregate_group,
			aggregate_name
		) VALUES (
			?,
			?,
			?
		)
	`;

	let args = [
		aggregate_uuid,
		req.body.aggregate_group,
		req.body.aggregate_name
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	let row = {
		aggregate_uuid : aggregate_uuid,
		aggregate_group : req.body.aggregate_group,
		aggregate_name : req.body.aggregate_name
	};

	res.json({
		err : 0,
		msg : row
	});

});



app.post('/admin/api/v1/selectStaff', async function(req, res) {

	let sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_location
		FROM
			dat_staff
		WHERE
			removed_on IS NULL
	`;

	let args = []

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	let q = [];
	args = [];

	for(let i = 0; i < result.length; i++) {
		result[i].staff_location = JSON.parse(result[i].staff_location);
		if(!result[i].staff_location) {
			continue;
		}

		result[i].staff_location.forEach( uuid => {
			if(args.indexOf(uuid) !== -1) {
				return;
			}
			args.push(uuid);
			q.push('?');
		});
	}

	if(!args.length) {
		return res.json({
			err: 0,
			msg : {
				staff : result,
				locs : []
			}
		});
	}

	q = q.join(',');

	sql = `
		SELECT
			location_name,
			location_uuid
		FROM
			dat_locations
		WHERE
			location_uuid IN (${q})
	`;

	let locs;
	try {
		locs = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : {
			staff : result,
			locs : locs
		}
	});

});

app.post('/admin/api/v1/selectStatus', async function(req, res) {

	// First we get the lowest date

	let sql = `
		SELECT
			report_year,
			report_month
		FROM
			dat_status
		ORDER BY
			rowid DESC
		LIMIT 1
	`;
	
	let args = []

	let datetime;
	try {
		datetime = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	if(!datetime) {
		return res.json({
			err : 101,
			msg : "NO REPORTS IN DATABSE"
		});
	}

	sql = `
		SELECT
			status_uuid,
			location_uuid,
			location_name,
			report_year,
			report_month,
			assign_to_name,
			assign_to_uuid,
			date_of_implementation,
			input_complete_time,
			manager_uuid,
			manager_approval_time,
			director_uuid,
			director_approval_time,
			admin_uuid,
			admin_approval_time,
			group_1,
			group_2
		FROM
			dat_status
		WHERE
			report_year = ?
		AND
			report_month = ?
		ORDER BY
			rowid DESC
	`;

	args = [
		datetime.report_year,
		datetime.report_month
	];

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : result
	});

});

app.post('/admin/api/v1/acceptAdminReport', async function(req, res) {

	let sql = `
		SELECT
			managers_report,
			managers_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	let args = [
		req.body.status_uuid
	];

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}


	report.managers_report = JSON.parse(report.managers_report);
	report.managers_stock = JSON.parse(report.managers_stock);

	let w_order = [
		'fixed_weight',
		'director_weight',
		'manager_weight',
		'weight'
	];

	let c_order = [
		'fixed_count',
		'director_count',
		'manager_count',
		'count'
	];

	// Sanitize the inventory

	for(let i = 0; i < report.managers_report.length; i++) {
		let row = report.managers_report[i];

		let weight;
		for(let k = 0; k < w_order.length; k++) {
			let key = w_order[k];
			if(!row.hasOwnProperty(key)) {
				continue;
			}
			weight = row[key];
		}
		for(let k = 0; k < w_order.length; k++) {
			let key = w_order[k];
			delete row[key];
		}
		row.weight = weight;

		let count;
		for(let k = 0; k < c_order.length; k++) {
			let key = c_order[k];
			if(!row.hasOwnProperty(key)) {
				continue;
			}
			count = row[key];
		}
		for(let k = 0; k < c_order.length; k++) {
			let key = c_order[k];
			delete row[key];
		}
		row.count = weight;
	}

	// Sanitize the stock

	for(let i = 0; i < report.managers_stock.length; i++) {
		let row = report.managers_stock[i];

		let weight;
		for(let k = 0; k < w_order.length; k++) {
			let key = w_order[k];
			if(!row.hasOwnProperty(key)) {
				continue;
			}
			weight = row[key];
		}
		for(let k = 0; k < w_order.length; k++) {
			let key = w_order[k];
			delete row[key];
		}
		row.weight = weight;

		let count;
		for(let k = 0; k < c_order.length; k++) {
			let key = c_order[k];
			if(!row.hasOwnProperty(key)) {
				continue;
			}
			count = row[key];
		}
		for(let k = 0; k < c_order.length; k++) {
			let key = c_order[k];
			delete row[key];
		}
		row.count = weight;
	}

	sql = `
		UPDATE
			dat_status
		SET
			admin_uuid = ?,
			admin_approval_time = datetime('now')
		WHERE
			status_uuid = ?
	`;

	args = [
		req.session.data.user_uuid,
		req.body.status_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	sql = `
		UPDATE
			dat_report
		SET
			finance_report = ?,
			finance_stock = ?
		WHERE
			status_uuid = ?
	`;

	args = [
		JSON.stringify(report.managers_report),
		JSON.stringify(report.managers_stock),
		req.body.status_uuid
	];

	bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/downloadReport', async function(req, res) {

	let sql = `
		SELECT
			status_uuid,
			finance_report
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`;

	let args = [
		req.body.status_uuid
	]

	let report;
	try {
		report = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : JSON.parse(report.managers_report)
	});

});

app.post('/admin/api/v1/addLocation', async function(req, res) {

	let sql = `
		INSERT INTO dat_locations (
			location_uuid,
			location_name,
			location_places,
			location_types,
			location_variety,
			location_products,
			location_map
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let uuid = uuidv1();

	let args = [
		uuid,
		req.body.location_name,
		JSON.stringify(req.body.location_places),
		JSON.stringify(req.body.location_types),
		JSON.stringify(req.body.location_variety),
		JSON.stringify(req.body.location_products),
		req.body.location_map
	]

	let result;
	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : uuid,
	});

});

app.post('/admin/api/v1/removeLocation', async function(req, res) {

	let sql = `
		UPDATE
			dat_locations
		SET
			removed_on = datetime('now')
		WHERE
			location_uuid = ?
	`;

	let args = [
		req.body.location_uuid
	];

	let result;
	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/createProduct', async function(req, res) {

	let product_uuid = uuidv1();

	let sql = `
		INSERT INTO dat_products (
			product_uuid,
			product_type,
			product_variety,
			product_name,
			next_process,
			unit
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let args = [
		product_uuid,
		req.body.product_type,
		req.body.product_variety,
		req.body.product_name,
		req.body.next_process,
		req.body.unit
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	let row = {
		product_uuid : product_uuid,
		product_type : req.body.product_type,
		product_variety : req.body.product_variety,
		product_name : req.body.product_name,
		next_process : req.body.next_process,
		unit : req.body.unit
	};

	res.json({
		err : 0,
		msg : row
	});

});

app.post('/admin/api/v1/updateProduct', async function(req, res) {

	let product_uuid = uuidv1();

	let sql = `
		UPDATE
			dat_products
		SET
			product_type = ?,
			product_variety = ?,
			product_name = ?,
			next_process = ?,
			unit = ?
		WHERE
			product_uuid = ?
	`;

	let args = [
		req.body.product_type,
		req.body.product_variety,
		req.body.product_name,
		req.body.next_process,
		req.body.unit,
		req.body.product_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/removeProduct', async function(req, res) {

	let product_uuid = uuidv1();

	let sql = `
		UPDATE
			dat_products
		SET
			removed_on = datetime('now')
		WHERE
			product_uuid = ?
	`;

	let args = [
		req.body.product_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/rejectAdminReport', async function(req, res) {

	let field, sql, args, bool, row, staff;

	switch(req.body.role) {
	case 'manager':
		field = 'manager_approval_time';
		break;
	case 'director':
		field = 'director_approval_time';
		break;
	default:
		return res.json({
			err : 1,
			msg : 'ROLE NOT DEFINED'
		});
		break;
	}

	// First insert into fixes

	sql = `
		INSERT INTO dat_fixes (
			status_uuid,
			fix_attn_uuid,
			admin_uuid,
			message
		) VALUES (
			?,
			?,
			?,
			?
		)
	`;

	args = [
		req.body.status_uuid,
		req.body.fix_attn_uuid,
		req.session.data.staff_uuid,
		req.body.message
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}
	
	// Update Existing Status

	sql = `
		UPDATE
			dat_status
		SET
			require_fix = 1,
			fix_attn_uuid = ?,
			${field} = NULL
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.fix_attn_uuid,
		req.body.status_uuid
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

	// Send an email to the manager

	sql = `
		SELECT
			staff_name,
			staff_email
		FROM
			dat_staff
		WHERE
			staff_uuid = ?
	`;

	args = [
		req.body.fix_attn_uuid
	];

	try {
		staff = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	if(!staff) {
		return;
	}

	let name = staff.staff_name;
	let email = staff.staff_email;

	sql = `
		SELECT
			location_name,
			report_year,
			report_month
		FROM
			dat_status
		WHERE
			status_uuid = ?
	`;

	args = [
		req.body.status_uuid
	];

	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	let y = row.report_year;
	let m = row.report_month;
	let n = row.location_name;
	let subject = `棚卸修正　${n} ${y}年${m}月`;

	let text = [
		`${name}さん`,
		`財務 has flagged your 棚卸 for the ${n} location`,
		`Please login into the 棚卸 to adress the issues that have been`,
		`addressed as notes, and sign the document when complete`,
		`Thank you.`
	].join('\n');

	try {
		bool = await db.sendEmail(email, subject, text);
	} catch(err) {
		throw err;
	}

});

app.post('/admin/api/v1/removeStaff', async function(req, res) {

	let sql = `
		UPDATE
			dat_staff
		SET
			removed_on = datetime('now')
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let result;
	try {
		result = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/updateStaff', async function(req, res) {

	let sql, args;

	if(req.body.staff_password) {

		let staff_hash;
		try {
			staff_hash = await db.hash(req.body.staff_password);
		} catch(err) {
			throw err;
		}

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_password = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			staff_hash,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	} else {

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	}

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/updateStatusRep', async function(req, res) {

	let sql = `
		UPDATE
			dat_status
		SET
			assign_to_uuid = ?,
			assign_to_name = ?,
			manager_uuid = ?,
			director_uuid = ?,
			group_1 = ?,
			group_2 = ?
		WHERE
			status_uuid = ?
	`;

	let args = [
		req.body.assign_to_uuid,
		req.body.assign_to_name,
		req.body.manager_uuid,
		req.body.director_uuid,
		req.body.group_1,
		req.body.group_2,
		req.body.status_uuid
	];

	let bool;

	try {
		bool = db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/completeMonth', async function(req, res) {

	// Create the year and month

	const date_ob = new Date();
	const year = date_ob.getFullYear();
	const month = date_ob.getMonth() + 1;

	let sql, args;

	// Check the current month against the one being completed

	sql = `
		SELECT
			report_year,
			report_month
		FROM
			dat_status
		ORDER BY
			rowid DESC
		LIMIT 1
	`;

	let check;
	try {
		check = await db.selectOne(sql);
	} catch(err) {
		throw err;
	}

	if(check) {

		let ry = parseInt(check.report_year);
		let rm = parseInt(check.report_month);

		if(ry === year && rm === month) {
			return res.json({
				err : 1,
				msg : 'Must create next month'
			});
		}

	}

	sql = `
		SELECT
			status_uuid
		FROM
			dat_status
		WHERE
			admin_approval_time IS NULL
	`;

	args = [];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	// This can be slow, but we then need to create a sample 
	// finance_report + finance_stock for each report that
	// has not been completed before being force approved

	for(let i = 0; i < rows.length; i++) {

		let status_uuid = rows[i].status_uuid;

		sql = `
			SELECT
				on_site_report,
				on_site_stock,
				managers_report,
				managers_stock
			FROM
				dat_report
			WHERE
				status_uuid = ?
		`;

		args = [
			status_uuid
		];

		let report;
		try {
			report = await db.selectOne(sql, args);
		} catch(err) {
			throw err;
		}
		
		let inventory = report.on_site_report;
		let stock = report.on_site_stock;

		if(report.managers_report && report.managers_stock) {

			report.managers_report = JSON.parse(report.managers_report);
			report.managers_stock = JSON.parse(report.managers_stock);

			let w_order = [
				'fixed_weight',
				'director_weight',
				'manager_weight',
				'weight'
			];

			let c_order = [
				'fixed_count',
				'director_count',
				'manager_count',
				'count'
			];

			// Sanitize the inventory

			for(let i = 0; i < report.managers_report.length; i++) {
				let row = report.managers_report[i];

				let weight;
				for(let k = 0; k < w_order.length; k++) {
					let key = w_order[k];
					if(!row.hasOwnProperty(key)) {
						continue;
					}
					weight = row[key];
				}
				for(let k = 0; k < w_order.length; k++) {
					let key = w_order[k];
					delete row[key];
				}
				row.weight = weight;

				let count;
				for(let k = 0; k < c_order.length; k++) {
					let key = c_order[k];
					if(!row.hasOwnProperty(key)) {
						continue;
					}
					count = row[key];
				}
				for(let k = 0; k < c_order.length; k++) {
					let key = c_order[k];
					delete row[key];
				}
				row.count = weight;
			}

			// Sanitize the stock

			for(let i = 0; i < report.managers_stock.length; i++) {
				let row = report.managers_stock[i];

				let weight;
				for(let k = 0; k < w_order.length; k++) {
					let key = w_order[k];
					if(!row.hasOwnProperty(key)) {
						continue;
					}
					weight = row[key];
				}
				for(let k = 0; k < w_order.length; k++) {
					let key = w_order[k];
					delete row[key];
				}
				row.weight = weight;

				let count;
				for(let k = 0; k < c_order.length; k++) {
					let key = c_order[k];
					if(!row.hasOwnProperty(key)) {
						continue;
					}
					count = row[key];
				}
				for(let k = 0; k < c_order.length; k++) {
					let key = c_order[k];
					delete row[key];
				}
				row.count = weight;
			}

			inventory = JSON.stringify(report.managers_report);
			stock = JSON.stringify(report.managers_stock);

		}

		sql = `
			UPDATE
				dat_report
			SET
				finance_report = ?,
				finance_stock = ?
			WHERE
				status_uuid = ?
		`;

		args = [
			inventory,
			stock,
			status_uuid
		];

		let bool;
		try {
			bool = await db.query(sql, args);
		} catch(err) {
			throw err;
		}

		sql = `
			UPDATE
				dat_status
			SET
				admin_approval_time = datetime('now')
			WHERE
				status_uuid = ?
		`;

		args = [
			status_uuid
		];

		try {
			bool = await db.query(sql, args);
		} catch(err) {
			throw err;
		}

	}

	// Select all of the locations

	sql = `
		SELECT
			location_uuid,
			location_name
		FROM
			dat_locations
		WHERE
			removed_on IS NULL
	`;

	let locations;
	try {
		locations = await db.selectAll(sql);
	} catch(err) {
		throw err;
	}

	let q = [];
	args = [];
	locations.forEach( function(loc) {
		q.push('?');
		args.push(loc.location_uuid);
	});
	q = q.join(',');
	
	// Select locations with existing reports

	sql = `
		SELECT DISTINCT
			location_uuid,
			location_name
		FROM
			dat_status
		WHERE
			location_uuid IN (${q})
	`;

	let existing;
	try {
		existing = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	existing.forEach( function(loc) {
		let uuid = loc.location_uuid;
		for(let i = 0; i < locations.length; i++) {
			if(locations[i].location_uuid !== uuid) {
				continue;
			}
			locations.splice(i, 1);
			break;
		}
	});

	// Create default values for new locations
	
	let stat_sql = `
		INSERT INTO dat_status (
			status_uuid,
			location_uuid,
			location_name,
			report_year,
			report_month
		) VALUES (
			?,
			?,
			?,
			?,
			?
		)
	`;

	let report_sql = `
		INSERT INTO dat_report (
			status_uuid,
			on_site_report,
			on_site_stock
		) VALUES (
			?,
			?,
			?
		)
	`;

	const report_keys = [
		'pos',
		'type',
		'variety',
		'product',
		'weight',
		'unit',
		'count',
		'notes'
	];
	
	for(let i = 0; i < locations.length; i++) {
		
		let location = locations[i];
		let status_uuid = uuidv1();

		// Insert status

		let args = [
			status_uuid,
			location.location_uuid,
			location.location_name,
			year,
			month
		];

		let bool;
		try {
			bool = await db.query(stat_sql, args);
		} catch(err) {
			throw err;
		}

		// Create default values

		const inventory = [];
		const stock = [];
		
		for(let k = 0; k < 15; k++) {
			const a = {};
			const b = {};
			report_keys.forEach( key => {
				a[key] = '';
				b[key] = '';
			});
			inventory.push(a);
			stock.push(b);
		}
		
		// Insert Report

		args = [
			status_uuid,
			JSON.stringify(inventory),
			JSON.stringify(stock)
		]
		try {
			bool = await db.query(report_sql, args);
		} catch(err) {
			throw err;
		}

	}

	// Fetch previous values for existing locations

	stat_sql = `
		INSERT INTO dat_status (
			status_uuid,
			assign_to_uuid,
			manager_uuid,
			director_uuid,
			group_1,
			group_2,
			location_uuid,
			location_name,
			report_year,
			report_month
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let sel_sql = `
		SELECT
			status_uuid,
			assign_to_uuid,
			manager_uuid,
			director_uuid,
			group_1,
			group_2
		FROM
			dat_status
		WHERE
			location_uuid = ?
		ORDER BY
			rowid DESC
	`;

	let rep_sql = `
		SELECT
			finance_report,
			finance_stock
		FROM
			dat_report
		WHERE
			status_uuid = ?
	`

	for(let i = 0; i < existing.length; i++) {
		
		let location = existing[i];
		let status_uuid = uuidv1();

		// Select the previous status

		let args = [
			location.location_uuid
		]

		let prev;
		try {
			prev = await db.selectOne(sel_sql, args);
		} catch(err) {
			throw err;
		}
		
		// Select the previous report

		args = [
			prev.status_uuid
		];

		let report;
		try {
			report = await db.selectOne(rep_sql, args);
		} catch(err) {
			throw err;
		}

		if(!report.finance_report) {
			report.finance_report = '[]';
		}

		if(!report.finance_stock) {
			report.finance_stock = '[]';
		}

		// Insert the new status

		args = [
			status_uuid,
			prev.assign_to_uuid,
			prev.manager_uuid,
			prev.director_uuid,
			prev.group_1,
			prev.group_2,
			location.location_uuid,
			location.location_name,
			year,
			month
		];
		
		let bool;
		try {
			bool = await db.query(stat_sql, args);
		} catch(err) {
			throw err;
		}

		// Insert the report

		args = [
			status_uuid,
			report.finance_report,
			report.finance_stock
		]

		try {
			bool = await db.query(report_sql, args);
		} catch(err) {
			throw err;
		}

	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/countLogins', async function(req, res) {

	let sql = `
		SELECT
			COUNT(*) AS num
		FROM
			log_sessions
	`;

	let args = [];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err  : 0,
		msg : row['num']
	});

});

app.post('/admin/api/v1/selectLogins', async function(req, res) {

	let limit = parseInt(req.body.limit);
	let ofs = parseInt(req.body.page) * limit;

	let sql = `
		SELECT
			session_uuid,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			attempt_time,
			attempt_result,
			login_time,
			disconnect_time,
			logout_time,
			source_ip,
			forward_ip,
			real_ip,
			user_agent
		FROM
			log_sessions
		ORDER BY
			rowid DESC
		LIMIT ${limit} OFFSET ${ofs}
	`;

	let args = [];

	let rows;
	try {
		rows = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : rows
	});

});

app.post('/admin/api/v1/lockAccount', async function(req, res) {

	let sql = `
		UPDATE
			dat_staff
		SET
			account_locked = 1
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/unlockAccount', async function(req, res) {

	// Unlock Account

	let sql = `
		UPDATE
			dat_staff
		SET
			account_locked = 0
		WHERE
			staff_uuid = ?
	`;

	let args = [
		req.body.staff_uuid
	];

	let bool;
	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	// Select Staff Data

	sql = `
		SELECT
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email
		FROM
			dat_staff
		WHERE
			staff_uuid = ?
	`;

	args = [
		req.body.staff_uuid
	];

	let row;
	try {
		row = await db.selectOne(sql, args);
	} catch(err) {
		throw err;
	}

	// Create Log Data

	sql = `
		INSERT INTO log_sessions (
			session_uuid,
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			source_ip,
			forward_ip,
			real_ip,
			user_agent,
			attempt_result,
			notes
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			1,
			'UNLOCKED BY ADMIN'
		)
	`;

	args = [
		uuidv1(),
		row.staff_uuid,
		row.staff_position,
		row.staff_name,
		row.staff_login,
		row.staff_email,
		req.connection.remoteAddress,
		req.headers['x-forwarded-for'],
		req.headers['x-real-ip'],
		req.headers['user-agent']
	];

	try {
		bool = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	// Return confirmation

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/addStaff', async function(req, res) {

	let staff_uuid = uuidv1();

	let sql = `
		INSERT INTO dat_staff (
			staff_uuid,
			staff_position,
			staff_name,
			staff_login,
			staff_email,
			staff_password,
			staff_location
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	let staff_hash;

	try {
		staff_hash = await db.hash(req.body.staff_password);
	} catch(err) {
		throw err;
	}

	let args = [
		staff_uuid,
		req.body.staff_position,
		req.body.staff_name,
		req.body.staff_login,
		req.body.staff_email,
		staff_hash,
		JSON.stringify(req.body.staff_locations)
	];

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : staff_uuid
	});

});

app.post('/admin/api/v1/updateStaff', async function(req, res) {

	let sql, args;

	if(req.body.staff_password) {

		let staff_hash;
		try {
			staff_hash = await db.hash(req.body.staff_password);
		} catch(err) {
			throw err;
		}

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_password = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			staff_hash,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	} else {

		sql = `
			UPDATE
				dat_staff
			SET
				staff_position = ?,
				staff_name = ?,
				staff_email = ?,
				staff_location = ?
			WHERE
				staff_uuid = ?

		`;

		args = [
			req.body.staff_position,
			req.body.staff_name,
			req.body.staff_email,
			JSON.stringify(req.body.staff_locations),
			req.body.staff_uuid
		];

	}

	let result;

	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/refreshMonth', async function(req, res) {

	// Create the year and month

	const date_ob = new Date();
	let year = date_ob.getFullYear();
	let month = date_ob.getMonth() + 1;

	let sql, args;

	// Select most recent report

	sql = `
		SELECT
			report_year,
			report_month
		FROM
			dat_status
		ORDER BY
			rowid DESC
		LIMIT 1
	`;

	let recent;
	try {
		recent = await db.selectOne(sql);
	} catch(err) {
		throw err;
	}

	if(recent) {
		year = parseInt(recent.report_year);
		month = parseInt(recent.report_month);
	}

	// Select all of the locations

	sql = `
		SELECT
			location_uuid,
			location_name
		FROM
			dat_locations
		WHERE
			removed_on IS NULL
	`;

	let locations;
	try {
		locations = await db.selectAll(sql);
	} catch(err) {
		throw err;
	}

	let q = [];
	args = [];
	locations.forEach( function(loc) {
		q.push('?');
		args.push(loc.location_uuid);
	});
	q = q.join(',');
	
	// Select locations with existing reports

	sql = `
		SELECT DISTINCT
			location_uuid,
			location_name
		FROM
			dat_status
		WHERE
			location_uuid IN (${q})
	`;

	let existing;
	try {
		existing = await db.selectAll(sql, args);
	} catch(err) {
		throw err;
	}

	existing.forEach( function(loc) {
		let uuid = loc.location_uuid;
		for(let i = 0; i < locations.length; i++) {
			if(locations[i].location_uuid !== uuid) {
				continue;
			}
			locations.splice(i, 1);
			break;
		}
	});

	// Create default values for new locations
	
	let stat_sql = `
		INSERT INTO dat_status (
			status_uuid,
			location_uuid,
			location_name,
			report_year,
			report_month
		) VALUES (
			?,
			?,
			?,
			?,
			?
		)
	`;

	let report_sql = `
		INSERT INTO dat_report (
			status_uuid,
			on_site_report,
			on_site_stock
		) VALUES (
			?,
			?,
			?
		)
	`;

	const report_keys = [
		'pos',
		'type',
		'variety',
		'product',
		'weight',
		'unit',
		'count',
		'notes'
	];
	
	for(let i = 0; i < locations.length; i++) {
		
		let location = locations[i];
		let status_uuid = uuidv1();

		// Insert status

		let args = [
			status_uuid,
			location.location_uuid,
			location.location_name,
			year,
			month
		];

		let bool;
		try {
			bool = await db.query(stat_sql, args);
		} catch(err) {
			throw err;
		}

		// Create default values

		const inventory = [];
		const stock = [];
		
		for(let k = 0; k < 15; k++) {
			const a = {};
			const b = {};
			report_keys.forEach( key => {
				a[key] = '';
				b[key] = '';
			});
			inventory.push(a);
			stock.push(b);
		}
		
		// Insert Report

		args = [
			status_uuid,
			JSON.stringify(inventory),
			JSON.stringify(stock)
		]
		try {
			bool = await db.query(report_sql, args);
		} catch(err) {
			throw err;
		}

	}

	res.json({
		err : 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/updateLocation', async function(req, res) {

	let sql, args;

	if(req.body.location_map) {

		sql = `
			UPDATE
				dat_locations
			SET
				location_name = ?,
				location_places = ?,
				location_types = ?,
				location_variety = ?,
				location_products = ?,
				location_map = ?
			WHERE
				location_uuid = ?
		`;

		args = [
			req.body.location_name,
			JSON.stringify(req.body.location_places),
			JSON.stringify(req.body.location_types),
			JSON.stringify(req.body.location_variety),
			JSON.stringify(req.body.location_products),
			req.body.location_map,
			req.body.location_uuid
		]

	} else {

		sql = `
			UPDATE
				dat_locations
			SET
				location_name = ?,
				location_places = ?,
				location_types = ?,
				location_variety = ?,
				location_products = ?
			WHERE
				location_uuid = ?
		`;

		args = [
			req.body.location_name,
			JSON.stringify(req.body.location_places),
			JSON.stringify(req.body.location_types),
			JSON.stringify(req.body.location_variety),
			JSON.stringify(req.body.location_products),
			req.body.location_uuid
		]

	}

	let result;
	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});

app.post('/admin/api/v1/removeLocation', async function(req, res) {

	let sql = `
		UPDATE
			dat_locations
		SET
			removed_on = datetime('now')
		WHERE
			location_uuid = ?
	`;

	let args = [
		req.body.location_uuid
	];

	let result;
	try {
		result = await db.query(sql, args);
	} catch(err) {
		throw err;
	}

	res.json({
		err: 0,
		msg : 'okay'
	});

});



/**
 * End Application
 **/



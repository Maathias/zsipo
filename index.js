// configuration from .env
require('dotenv').config()

// dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const http = require('http');
const https = require('https');
const socket = require('socket.io');
const chalk = require('chalk');
const stylus = require('stylus');

const app = express();

const cert = {
	key: fs.readFileSync(process.env.CERT_KEY, 'utf8'),
	cert: fs.readFileSync(process.env.CERT_CRT, 'utf8'),
	ca: fs.readFileSync(process.env.CERT_CA, 'utf8')
};

app
	.set('view engine', 'ejs')

	.use(stylus.middleware({
	  src: path.join(__dirname, 'public/res/stylus'),
	  dest: __dirname + '/public',
	  force: true,
	}))

	.set('views', path.join(__dirname, 'views'))
	.use(bodyParser.json())
	.use(cookieParser())
	.use(express.static(path.join(__dirname, 'public')))

	.use(function(req, res, next){
		res.on("finish", function() {
			console.log({
				action: "req",
				type: req.method,
				response: res.statusCode,
				path: req.path,
				ip: req.ip
			})
		});
		next()
	});

// server setup
const httpServer = http.createServer(app);
const httpsServer = https.createServer(cert, app);

// socketio setup
const io = new socket()
	.attach(httpServer)
	.attach(httpsServer);

httpServer.listen(process.env.PORT_MAIN, function (){
	console.log(`Server listening on port ${process.env.PORT_MAIN}`)
});

httpsServer.listen(process.env.PORT_SSL, function (){
	console.log(`Server listening on port ${process.env.PORT_SSL}`)
});

io.on('connection', function(socket){
	console.log("socket connected")
})

app.get('/', function(req, res){

	res.render('pages/index');

});

app.get('/app', function(req, res){

	res.render('pages/app');

});

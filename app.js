/*-------------------- MODULES --------------------*/
var		express = require('express'),
	 bodyParser = require('body-parser')
	 		 fs = require('fs');

var app = express();


/*-------------------- SETUP --------------------*/
var app = express();
// .use is a middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('incoming request from ---> ' + ip);
    // Show the target URL that the user just hit
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);
    next();
});

app.use('/', express.static(__dirname + '/public'));


/*------------------- ROUTERS -------------------*/
app.post('/start', function(request, response) {

	var images = fs.readdirSync('public/img');
	console.log(images);
	
	response.json({
		images: images
	});
});


/*----------------- INIT SERVER -----------------*/
var PORT = 3333; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});
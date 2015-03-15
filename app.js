/*-------------------- MODULES --------------------*/
var		express = require('express'),
	 bodyParser = require('body-parser')
	 		 fs = require('fs');
          Parse = require('node-parse-api').Parse,
              _ = require('underscore');

var readData = fs.readFileSync('keys.txt');
readData = readData.toString(); // convert to string
keys = readData.split(',');

var options = {
    app_id: keys[0],
    api_key: keys[1] // master_key:'...' could be used too
};
var parse = new Parse(options);
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

/*----- PUBLIC -----*/
app.post('/start', function(req, res) {

	var images = fs.readdirSync('public/img');
	console.log(images);
	
	res.json({
		images: images
	});
});


/*----- ADMIN -----*/
var logged;

// Log in
app.post('/login', function(req, res) {
    console.log('request:');
    console.log(req.body);
    
    parse.find('users', {login: req.body.login}, function (err, response) {
      console.log('Database response:');
      console.log(response.results);
      
      // if(response.results.length > 0 && response.results[0].password == req.body.password){
        console.log('Logged in.');
        logged = true;

        loadProjects(res);

      // }else{
      //   var msg = 'User/login not found.';
      //   console.log(msg);
      //   res.json({
      //       error: msg
      //   });
      // }
    });    
});

var loadProjects = function(res){
    var projects;
    parse.find('projects', {}, function (err, response) {
        console.log(response);
        
        // Sorting the projects
        response.results = _.sortBy(response.results, function(obj){
            return obj.order;
        });
        console.log(response);
        res.json(response);
    }); 
}

app.post('/load-projects', function(req, res) {
    loadProjects(res);
});

app.post('/update-all', function(req, res) {
    console.log('request:');
    console.log(req.body);
    var projects = req.body['projects[]'];
    console.log(projects);
    console.log(projects.length);

    var error = false;

    projects.forEach(function(item, index, array){
        // console.log(item);
        item = JSON.parse(item);
        console.log(item.id + ',' + item.order + ', ' + item.publish);
        // console.log(typeof item.public);
        parse.update('projects', item.id, {
            order: parseInt(item.order),
            publish: item.publish
        }, function (err, response) {
            console.log(response);
        }); 
    });
});

app.post('/expand-project', function(req, res) {
    console.log('request:');
    console.log(req.body);
    console.log(req.body.id);

    parse.find('projects', req.body.id, function (err, response) {
        console.log(response);
        res.json(response);
    }); 
});

app.post('/create-project', function(req, res) {

    console.log('request:');
    console.log(req.body);
    var project = JSON.parse(req.body.data);
    console.log(project);

    var lastIndex = '';
    parse.findMany('projects', '', function (err, response) {

        lastIndex = response.results.length;

        parse.insert('projects', {
            title: project.title,
            content: project.content,
            images: project.images,
            order: lastIndex
        }, function (err, response) {
            console.log(response);
            res.json(response);
        });         
    });
});

app.post('/update-project', function(req, res) {
    console.log('request:');
    console.log(req.body);
    var project = JSON.parse(req.body.data);
    console.log(project);

    parse.update('projects', project.id, {
        title: project.title,
        content: project.content,
        images: project.images
    }, function (err, response) {
        console.log(response);
        res.json(response);
    }); 
});

app.post('/delete-project', function(req, res) {
    console.log('request:');
    console.log(req.body);
    console.log(req.body.id);

    parse.delete('projects', req.body.id, function (err, response) {
        console.log(response);
        res.json(response);
    }); 
});

// // Create a project
// app.post('/project', function(req, res) {
//     console.log(req.body);
//     // First we have to read a user's file and parse it in a proper array format
//     fs.readFile(PATH_TO_JSON_FILE + '/' + req.body.user, 'utf8', function(err, data) {
//         data = JSON.parse(data);
//         // Prepend a new json object into `data` array using `.unshift`
//         data.unshift({
//             id: new Date().getTime(),
//             title: req.body.p_title,
//             deadline: req.body.p_deadline,
//             done: false
//         });
//         // Re-write the file
//         fs.writeFile(PATH_TO_JSON_FILE + '/' + req.body.user, JSON.stringify(data), function(err) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log("The file was saved!");
//                 res.json({
//                     status: 'OK'
//                 });
//             }
//         });
//     });
// });


/*----------------- INIT SERVER -----------------*/
var PORT = 3333; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});
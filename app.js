/*-------------------- MODULES --------------------*/
var		express = require('express'),
	 bodyParser = require('body-parser')
	 		 fs = require('fs');
          Parse = require('node-parse-api').Parse,
              _ = require('underscore'),
       markdown = require('markdown').markdown;

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
app.post('/public-start', function(req, res) {
    
    parse.findMany('projects', '', function (err, response) {
        var projects = [];
        var images = [];

        response.results.forEach(function(item, index, array){
            
            // Filter by published projects
            if(item.publish){
                var project = {
                    title: item.title,
                    projectId: item.objectId
                }
                projects.push(project);
            }

            // Filter by images with homepage == true
            item.images.forEach(function(obj, i){
                if(obj.homepage){
                    var image = {
                        url: obj.url,
                        projectId: item.objectId
                    }
                    images.push(image);
                }
            });
        });
        console.log(projects);
        console.log(projects.length);        
        console.log(images);
        console.log(images.length);
        projects = JSON.stringify(projects);
        images = JSON.stringify(images);
        res.json({
            projects: projects,
            images: images
        });
    });
});

app.post('/public-load-project', function(req, res) {   
    console.log(req.body.projectId);
    parse.find('projects', req.body.projectId, function (err, response) {
        console.log(response);
        
        console.log(markdown.toHTML(response.content));

        res.json({
            project: {
                title: response.title,
                content: markdown.toHTML(response.content)
            }
        });
    });
});

/*----- ADMIN -----*/
// Log in
app.post('/admin-start', function(req, res) {
    login(req, res, function(req, res){
        loadProjects(res);
    });
});

var login = function(req, res, callback){
    console.log('request:');
    console.log(req.body);
    
    parse.find('users', {login: req.body.login}, function (err, response) {
      console.log('Database response:');
      console.log(response.results);
      
      if(response.results.length > 0 && response.results[0].password == req.body.password){
        console.log('Logged in.');
        callback(req, res);

      }else{
        var msg = 'User/login not found.';
        console.log(msg);
        res.json({
            error: msg
        });
      }
    });  
}

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

app.post('/admin-load-projects', function(req, res) {
    login(req, res, function(req, res){
        loadProjects(res);
    });
});

app.post('/admin-update-all', function(req, res) {
    login(req, res, function(req, res){
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
});

app.post('/admin-expand-project', function(req, res) {
    login(req, res, function(req, res){
        console.log('request:');
        console.log(req.body);
        console.log(req.body.id);

        parse.find('projects', req.body.id, function (err, response) {
            console.log(response);
            res.json(response);
        }); 
    });
});

app.post('/admin-create-project', function(req, res) {
    login(req, res, function(req, res){
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
});

app.post('/admin-update-project', function(req, res) {
    login(req, res, function(req, res){    
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
});

app.post('/admin-delete-project', function(req, res) {
    login(req, res, function(req, res){
        console.log('request:');
        console.log(req.body);
        console.log(req.body.id);

        parse.delete('projects', req.body.id, function (err, response) {
            console.log(response);
            res.json(response);
        }); 
    });
});


/*----------------- INIT SERVER -----------------*/
var PORT = 3333; //the port you want to use
app.listen(PORT, function() {
    console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});
/*-------------------- MODULES --------------------*/
var		express = require('express'),
	 bodyParser = require('body-parser'),
			 fs = require('fs'),
		  admin = require("firebase-admin"),
			  _ = require('underscore'),
		 marked = require('marked'),
	   jsonfile = require('jsonfile')
	;

// Markdown setup
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,  // Don't sanitize! Keep html entities as is.
  smartLists: true,
  smartypants: true // Typographic quotes
});

// Firebase setup
var serviceAccount = require("gianordoli-95c21-firebase-adminsdk-u34a5-e71b509fa6.json");

// Initialize the app with a custom auth variable, limiting the server's access
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gianordoli-95c21.firebaseio.com"
});

// The app only has access as defined in the Security Rules
var db = admin.database();
var projectsRef = db.ref("/projects");

// var queryRef = projectsRef.orderByChild("title").equalTo("Blindness");
// queryRef.on("value", function(snapshot) {
//     console.log("Loaded project");
//     // console.log(snapshot.val());
//     var results = snapshot.val();
//     for(var id in results){

//         projectsRef.child(id).update({
//             images: [{homepage: false, url: ""}]
//         });
//     }
// });

// var queryRef = projectsRef.orderByChild("full_name").equalTo("Gabriel Gianordoli");
// queryRef.on("value", function(snapshot) {
//     console.log("Loaded project");
//     console.log(snapshot.val());
// });

// var usersRef = ref.child("users");
// BULK SAVE
// usersRef.set({
//   alanisawesome: {
//     date_of_birth: "June 23, 1912",
//     full_name: "Alan Turing"
//   },
//   gracehop: {
//     date_of_birth: "December 9, 1906",
//     full_name: "Grace Hopper"
//   }
// });


// SAVE EACH
// usersRef.child("gabriel").set({
//   date_of_birth: "June 23, 1912",
//   full_name: "Alan Turing"
// });

// Callback
// usersRef.child("laura").set({
//   date_of_birth: "December 9, 1906",
//   full_name: "Grace Hopper"
// }, function(error){
//   if (error) {
//     console.log("Data could not be saved." + error);
//   } else {
//     console.log("Data saved successfully.");
//   }
// });

// UPDATE
// var hopperRef = usersRef.child("gracehop");
// hopperRef.update({
//   "nickname": "Amazing Grace"
// });


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

// /*----- PUBLIC -----*/
app.post('/public-start', function(req, res) {

	projectsRef.once("value", function(snapshot) {

		console.log("Connected to DB");
		console.log(snapshot.val());
		var results = snapshot.val();

		var projects = [];
		var images = [];

		for(var id in results){

			var item = results[id];
			// console.log(item);
			// console.log(item.title);
			// console.log(item.images);
			// console.log(typeof item.images);
			
			// Filter by published projects
			if(item.publish){
				var project = {
					title: item.title,
					projectUrl: item.url,
					order: item.order
				}
				projects.push(project);

				// Filter by images with homepage == true
				item.images.forEach(function(obj, i){
					if(obj.homepage){
						var image = {
							url: obj.url,
							projectUrl: item.url,
							order: item.order
						}
						images.push(image);
					}
				});                
			}
		}
		// console.log(projects);
		// console.log(projects.length);        
		// console.log(images);
		// console.log(images.length);

		projects = _.sortBy(projects, function(obj){
			return obj.order;
		});

		images = _.shuffle(images);

		// images = _.sortBy(images, function(obj){
		//     return obj.order;
		// });

		projects = JSON.stringify(projects);
		images = JSON.stringify(images);
		res.json({
			projects: projects,
			images: images
		});

	}, function(error){
		console.log("The read failed: " + errorObject.code);
	});
});

app.post('/public-load-project', function(req, res) {   
	// console.log(req.body.projectUrl);

	var queryRef = projectsRef.orderByChild("url").equalTo(req.body.projectUrl);
	
	queryRef.on("value", function(snapshot) {
		console.log("Loaded project");
		// console.log(snapshot.val());
		var results = snapshot.val();
		var title, content;
		for(var id in results){
			title = results[id]["title"];
			content = marked(results[id]["content"]);
		}
		res.json({
			project: {
				title: title,
				content: content
			}
		});		
	}, function(error){
		console.log("The read failed: " + errorObject.code);
	});    
	// parse.find('projects', req.body.projectUrl, function (err, response) {
	// 	if(!err){
	// 		// console.log(response.content);           // Markdown
	// 		// console.log(marked(response.content));   // Parsed

	// 		res.json({
	// 			project: {
	// 				title: response.title,
	// 				content: marked(response.content)
	// 			}
	// 		});
	// 	}
	// });
});

// /*----- ADMIN -----*/
// // Log in
// app.post('/admin-start', function(req, res) {
//     login(req, res, function(req, res){
//         loadProjects(res);
//     });
// });

// var login = function(req, res, callback){
//     // console.log('request:');
//     // console.log(req.body);
	
//     parse.find('users', {login: req.body.login}, function (err, response) {
//       // console.log('Database response:');
//       // console.log(response.results);
	  
//       if(response.results.length > 0 && response.results[0].password == req.body.password){
//         // console.log('Logged in.');
//         callback(req, res);

//       }else{
//         var msg = 'User/login not found.';
//         // console.log(msg);
//         res.json({
//             error: msg
//         });
//       }
//     });  
// }

// var loadProjects = function(res){
//     var projects;
//     parse.find('projects', {}, function (err, response) {
//         // console.log(response);
		
//         // Sorting the projects
//         response.results = _.sortBy(response.results, function(obj){
//             return obj.order;
//         });
//         // console.log(response);
//         res.json(response);
//     }); 
// }

// app.post('/admin-load-projects', function(req, res) {
//     login(req, res, function(req, res){
//         loadProjects(res);
//     });
// });

// app.post('/admin-update-all', function(req, res) {
//     login(req, res, function(req, res){
//         // console.log('request:');
//         // console.log(req.body);
//         var projects = req.body['projects[]'];
//         // console.log(projects);
//         // console.log(projects.length);

//         var error = false;

//         projects.forEach(function(item, index, array){
//             // console.log(item);
//             item = JSON.parse(item);
//             // console.log(item.id + ',' + item.order + ', ' + item.publish);
//             // console.log(typeof item.public);
//             parse.update('projects', item.id, {
//                 order: parseInt(item.order),
//                 publish: item.publish
//             }, function (err, response) {
//                 console.log(response);
//             }); 
//         });
//     });
// });

// app.post('/admin-expand-project', function(req, res) {
//     login(req, res, function(req, res){
//         // console.log('request:');
//         // console.log(req.body);
//         // console.log(req.body.id);

//         parse.find('projects', req.body.id, function (err, response) {
//             // console.log(response);
//             res.json(response);
//         }); 
//     });
// });

// app.post('/admin-create-project', function(req, res) {
//     login(req, res, function(req, res){
//         // console.log('request:');
//         // console.log(req.body);
//         var project = JSON.parse(req.body.data);
//         // console.log(project);

//         var lastIndex = '';
//         parse.findMany('projects', '', function (err, response) {

//             lastIndex = response.results.length;

//             parse.insert('projects', {
//                 title: project.title,
//                 content: project.content,
//                 images: project.images,
//                 order: lastIndex
//             }, function (err, response) {
//                 // console.log(response);
//                 res.json(response);
//             });         
//         });
//     });
// });

// app.post('/admin-update-project', function(req, res) {
//     login(req, res, function(req, res){    
//         // console.log('request:');
//         // console.log(req.body);
//         var project = JSON.parse(req.body.data);
//         // console.log(project);

//         parse.update('projects', project.id, {
//             title: project.title,
//             content: project.content,
//             images: project.images
//         }, function (err, response) {
//             // console.log(response);
//             res.json(response);
//         });
//     });
// });

// app.post('/admin-delete-project', function(req, res) {
//     login(req, res, function(req, res){
//         // console.log('request:');
//         // console.log(req.body);
//         // console.log(req.body.id);

//         parse.delete('projects', req.body.id, function (err, response) {
//             // console.log(response);
//             res.json(response);
//         }); 
//     });
// });


/*----------------- INIT SERVER -----------------*/
var PORT = 3000; //the port you want to use
app.listen(PORT, function() {
	console.log('Server running at port ' + PORT + '. Ctrl+C to terminate.');
});
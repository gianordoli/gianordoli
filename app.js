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
var usersRef = db.ref("/users");

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

	// console.log(req.body.projectUrl);
	var queryRef = projectsRef.orderByChild("publish").equalTo(true);
	
	queryRef.once("value", function(snapshot) {
		
		console.log("Loaded projects");
		var projects = [];
		var images = [];		

		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			// console.log(">>>>> DATA");
			// console.log(childData);
			projects.push(childData);
			if(childData.images !== undefined && childData.images.length > 0){
				childData.images.forEach(function(obj, i){
					if(obj.homepage){
						var image = {
							url: obj.url,
							projectUrl: childData.url,
							order: childData.order
						}
						images.push(image);
					}
				});
			}
		});

		// Sorting
		projects = _.sortBy(projects, function(obj){
			return obj.order;
		});
		images = _.shuffle(images);

		// Stringifying
		projects = JSON.stringify(projects);
		images = JSON.stringify(images);

		res.json({
			projects: projects,
			images: images
		});

	}, function(errorObject){
		console.log("The read failed: " + errorObject.code);
	});	
});

app.post('/public-load-project', function(req, res) {   
	
	// console.log(req.body.projectUrl);
	var queryRef = projectsRef.orderByChild("url").equalTo(req.body.projectUrl);
	
	queryRef.once("value", function(snapshot) {
		
		console.log("Loaded project");
		var title, content;

		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			// console.log(">>>>> DATA");
			// console.log(childData);
			title = childData["title"];
			content = marked(childData["content"]);
		});
		res.json({
			project: {
				title: title,
				content: content
			}
		});

	}, function(errorObject){
		console.log("The read failed: " + errorObject.code);
	});	
});

// /*----- ADMIN -----*/
// Log in
app.post('/admin-start', function(req, res) {
    login(req, res, function(req, res){
    	console.log("User logged in");
        loadProjects(res);
    });
});

app.post('/admin-load-projects', function(req, res) {
    login(req, res, function(req, res){
        loadProjects(res);
    });
});

function login(req, res, callback){
    // console.log('request:');
    // console.log(req.body);
	
	var queryRef = usersRef.orderByChild("login").equalTo(req.body.login);
	
	queryRef.once("value", function(snapshot) {
		
		console.log("Loaded user");
		// console.log(snapshot.val());
		var results = snapshot.val();
		var error = true;

		if(Object.keys(results).length > 0){
			for(var id in results){
				if(results[id]["password"] === req.body.password){
					error = false;
				}
			}
		}
		if(!error){
			callback(req, res);			
		}else{
			// console.log(msg);
			res.json({
			    error: "User or password invalid."
			});
		}
	}, function(errorObject){
		console.log("The read failed: " + errorObject.code);
	});
}

function loadProjects(res){
	console.log("Called loadProjects");
    
    var results = [];
	
	var queryRef = projectsRef.orderByChild("order");
	queryRef.once("value")
		.then(function(snapshot) {
			console.log("Loaded projects");
			snapshot.forEach(function(childSnapshot) {
				var key = childSnapshot.key;
				var childData = childSnapshot.val();
				// console.log(">>>>> KEY: " + key);
				// console.log(">>>>> DATA");
				// console.log(childData);

				var thisObj = childData;
				thisObj["projectId"] = key;
				results.push(thisObj);
			});
			// console.log("Finished loop");
			// console.log(results);
			res.json({results: results});
		});
}

app.post('/admin-update-all', function(req, res) {
    login(req, res, function(req, res){
        // console.log('request:');
        // console.log(req.body);
        var projects = req.body['projects[]'];
        // console.log(projects);
        // console.log(projects.length);

        var error = false;
        var msg;

        projects.forEach(function(item, index, array){
            // console.log(item);
            item = JSON.parse(item);
            // console.log(item.id + ',' + item.order + ', ' + item.publish);
            // console.log(typeof item.public);

			var queryRef = projectsRef.orderByKey().equalTo(item.id);
			
			queryRef.once("value", function(snapshot) {
				
				console.log("Loaded project");

				snapshot.forEach(function(childSnapshot) {
					var key = childSnapshot.key;
					// console.log(">>>>> KEY: " + key);

					projectsRef.child(key).update({
		                order: parseInt(item.order),
		                publish: item.publish
					}, function(errorObject){
						error = true;
						msg = "Could not update object.";
					});
				});

			}, function(errorObject){
				error = true;
				msg = "The read failed: " + errorObject.code;
			});
        });

        if(error){
			console.log(msg);
			res.json({msg: msg});
        }
    });
});

app.post('/admin-expand-project', function(req, res) {

	// console.log(req.body.projectId);
	var thisObj;
	var queryRef = projectsRef.orderByKey().equalTo(req.body.projectId);
	
	queryRef.once("value", function(snapshot) {
		
		console.log("Loaded project");

		snapshot.forEach(function(childSnapshot) {
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			// console.log(">>>>> KEY: " + key);
			// console.log(">>>>> DATA");
			// console.log(childData);

			thisObj = childData;
			thisObj["projectId"] = key;
		});
		// console.log(thisObj);
		res.json(thisObj);

	}, function(errorObject){
		console.log("The read failed: " + errorObject.code);
	});
});

app.post('/admin-create-project', function(req, res) {
    login(req, res, function(req, res){
        // console.log('request:');
        // console.log(req.body);
        var project = JSON.parse(req.body.data);
        // console.log(project);

        var error = false;
        var msg;

        var queryRef = projectsRef.orderByKey();
        queryRef.once("value", function(snapshot){
        	
        	var lastIndex = snapshot.numChildren();
        	var url = project["title"].toLowerCase();
    		while(url.indexOf(" ") > -1){ url = url.replace(" ", "-"); };
    		url = encodeURI(url);

        	projectsRef.push({
				title: project.title,
				content: project.content,
				images: project.images,
				order: lastIndex,
				url: url
            }, function(errorObject){
				if (errorObject) {
					msg = "Data could not be saved." + errorObject;
				} else {
					msg = "Data saved successfully.";
				}
            });
        }, function(errorObject){
        	msg = "The read failed: " + errorObject.code;
        });
    	console.log(msg);
    	res.json({msg: msg});
    });
});

app.post('/admin-update-project', function(req, res) {

    login(req, res, function(req, res){
        // console.log('request:');
        // console.log(req.body);
        var project = JSON.parse(req.body.data);
        // console.log(project);

        var error = false;
        var msg;

		var thisObj;
		var queryRef = projectsRef.orderByKey().equalTo(project.id);
		
		queryRef.once("value", function(snapshot) {
			
			console.log("Loaded project");

			snapshot.forEach(function(childSnapshot) {
				var key = childSnapshot.key;
				// console.log(">>>>> KEY: " + key);

				projectsRef.child(key).update({
		            title: project.title,
		            content: project.content,
		            images: project.images
				}, function(errorObject){
					error = true;
					msg = "Could not update object.";
				});
			});

		}, function(errorObject){
			error = true;
			msg = "The read failed: " + errorObject.code;
		});

		if(error){
			console.log(msg);
			res.json({msg: msg});			
		}
    });
});

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
/* Your code starts here */

define(function (require) {

	console.log('Loading common functions...');

	var projectsRef;

	function firebaseSetup() {
		console.log('firebaseSetup');
		var config = {
			apiKey: "AIzaSyCHwHRrXUPj2zWHjzFG8ClrsCTIo8xsens",
			authDomain: "gianordoli-95c21.firebaseapp.com",
			databaseURL: "https://gianordoli-95c21.firebaseio.com",
			projectId: "gianordoli-95c21",
			storageBucket: "gianordoli-95c21.appspot.com",
			messagingSenderId: "964608061102"
		};
		firebase.initializeApp(config);

		var database = firebase.database();
		projectsRef = database.ref("/projects");
	}

	function init(callback) {

		if (!projectsRef) {
			firebaseSetup();
			init(callback);

		} else {
			console.log('Initializing...');
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

				callback({
					projects: projects,
					images: images
				});

			}, function(errorObject){
				console.log("The read failed: " + errorObject.code);
			});
		}
	}

	function getProjectsRef() {
		if (!projectsRef) {
			firebaseSetup();
			getProjectsRef();
		} else {
			return projectsRef;
		}
	}

	return {

		init: init,

		getProjectsRef: getProjectsRef,

		appendSidebar: function(projects){
			console.log('Appending projects...');
			var title = $('<h1><a href="/">Gabriel Gianordoli</a></h1>');

			var projectsNavBar = $('<nav id="projects-nav-bar"></nav>');
				var projectsTitle = $('<h2>Projects</h2>');
				var projectsUl = $('<ul></ul>');
					projects.forEach(function(item, index, array){
						// console.log(item);
						var li = $('<li><a name="'+item.url+'" href="projects.html#'+item.url+'">'+item.title+'</li>');
						$(projectsUl).append(li);
					});
			$(projectsNavBar).append(projectsTitle)
						 	 .append(projectsUl);

			var infoNavBar = $('<div id="info-nav-bar"></div>');
				var infoTitle = $('<h2>Info</h2>');
				var infoUl = $('<ul></ul>');
					var about = $('<li><a href="about.html">About</a></li>');
					var cv = $('<li><a href="downloads/gabriel_gianordoli_cv.pdf" target="_blank">CV</a></li>');
					var contact = $('<li><a href="mailto:gianordoligabriel@gmail.com" target="_blank">Contact</a></li>');
				$(infoUl).append(about)
						 .append(cv)
						 .append(contact);
			$(infoNavBar).append(infoTitle)
						 .append(infoUl);

			$('#sidebar').append(title)
						 .append(projectsNavBar)
						 .append(infoNavBar);
		},

		appendFooter: function(){
			console.log('Appending footer.');

			var footer = $('<footer><hr/></footer>');
			var p = $('<p>© 2006 ~ 2017 Gabriel Gianordoli – All rights reserved.</p>');
			var aside = $('<aside>' +
						  '<a href="mailto:gianordoligabriel@gmail.com" target="_blank">Email</a>, ' +
						  '<a href="https://twitter.com/gianordoli" target="_blank">Twitter</a>, ' +
						  '<a href="https://www.linkedin.com/in/gianordoli" target="_blank">LinkedIn</a>, ' +
						  '<a href="https://www.behance.net/gianordoli" target="_blank">Behance</a>, ' +
						  '<a href="http://gabrielgianordoli.tumblr.com/" target="_blank">Tumblr</a>, ' +
						  '<a href="https://www.pinterest.com/gianordoli/" target="_blank">Pinterest</a>, ' +
						  '<a href="https://vimeo.com/gianordoli" target="_blank">Vimeo</a> & ' +
						  '<a href="https://github.com/gianordoli" target="_blank">Github</a>' +
						  '</aside>');

			$('body').append(footer);
			$('footer').append(p);
			$('footer').append(aside);
		},

		addImagesPath: function(content){
			// console.log('Called addImagesPath.')
			var path = 'assets/img/';
			var images = $(content).find('img');

			// Current page is...?
			var url = window.location.pathname;
			var filename = url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.'));
			if(filename == '/') filename = 'index';
			if(filename == 'index'){
				path += 'small/';
			}else{
				path += 'large/';
			}
			// console.log(path);
			$.each(images, function(index, item){
				var originalSrc = $(this).attr('src');
				$(this).attr('src', path + originalSrc);
			});
			return content;
		},

		addImagesAlt: function(content){
			// console.log('Called addImagesPath.')
			var path = '/assets/img/';
			var images = $(content).find('img');

			$.each(images, function(index, item){
				var newAlt = $(this).attr('alt') + ' - Gabriel Gianordoli';
				$(this).attr('alt', newAlt);
				$(this).attr('title', newAlt);
			});
			return content;
		}
	}
});

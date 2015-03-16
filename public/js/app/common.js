/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		init: function(callback){
			console.log('Initializing...');
			$.post('/public-start', {}, function(response) {
	            // console.log(response);
	            if(response.error){
	            	throw response.error	
	            }else{
					console.log(response);
					callback(response);
	            }
	        });		
		},

		appendSidebar: function(projects){
			console.log('Appending projects...');
			var title = $('<h1><a href="index.html">Gabriel Gianordoli</a></h1>');
			
			var projectsNavBar = $('<div id="projects-nav-bar"></div>');
				var projectsTitle = $('<h2>Projects</h2>');
				var projectsUl = $('<ul></ul>');
					projects.forEach(function(item, index, array){
						// console.log(item);
						var li = $('<li id="'+item.projectId+'"><a href="projects.html#'+item.projectId+'">'+item.title+'</li>');
						$(projectsUl).append(li);
					});
			$(projectsNavBar).append(projectsTitle)
						 	 .append(projectsUl);
			
			var infoNavBar = $('<div id="info-nav-bar"></div>');
				var infoTitle = $('<h2>Info</h2>');
				var infoUl = $('<ul></ul>');
					var bio = $('<li><a href="bio.html">Bio</a></li>');
					var contact = $('<li><a href="contact.html">Contact</a></li>');
				$(infoUl).append(bio)
						 .append(contact);
			$(infoNavBar).append(infoTitle)
						 .append(infoUl);						 

			$('#sidebar').append(title)
						 .append(projectsNavBar)
						 .append(infoNavBar);
		},

		addImagesPath: function(){
			var path = 'img/';
			var images = $('img');
			$.each(images, function(index, item){
				var originalSrc = $(this).attr('src');
				$(this).attr('src', path + originalSrc);
			});
		}
	} 
});
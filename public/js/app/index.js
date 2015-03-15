/* Your code starts here */

define(function (require) {
	
	console.log('Loaded index.js');
	
	/*------- VARS --------*/
	var $container;

	/*----- FUNCTIONS -----*/
	var loadImages = function(){
		console.log('Loading images...');
		$.post('/start', {}, function(response) {
            // console.log(response);
            if(response.error){
            	throw response.error	
            }else{
				console.log(response);
				var projects = JSON.parse(response.projects);
				var images = JSON.parse(response.images);
				console.log(projects);
				console.log(images);
				appendProjects(projects);
				appendImages(images);
            }
        });		
	}

	var appendProjects = function(projects){
		console.log('Appending projects...');
		var ul = $('<ul></ul>');
		projects.forEach(function(item, index, array){
			// console.log(item);
			var li = $('<li id="'+item.projectId+'">'+item.title+'</li>');
			$(ul).append(li);
		});
		$('#sidebar').append(ul);
	}

	var appendImages = function(images){
		console.log('Appending images...');
		images.forEach(function(item, index, array){
			// console.log(item);
			var img = $('<img src="img/'+item.url+'"" class="item" />');
			$('#container').append(img);
		});
		drawLayout();
	}

	var drawLayout = function(){
		$container = $('#container').masonry();
		// layout Masonry again after all images have loaded
		$container.imagesLoaded( function() {
		  $container.masonry({
  				// columnWidth: 50,
  				containerStyle: null,
  				itemSelector: '.item'
			});
		});
	}

	loadImages();
});
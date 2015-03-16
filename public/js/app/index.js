/* Your code starts here */

define(['./common'], function (common) {

	console.log('Loaded index.js');
	
	/*------- VARS --------*/
	var $container;

	/*----- FUNCTIONS -----*/

	var appendImages = function(images){
		console.log('Appending images...');
		images.forEach(function(item, index, array){
			console.log(item);
			var img = $('<div class="item"><a href="projects.html#'+item.projectId+'"><img src="img/'+item.url+'" /></a></div>');
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

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		console.log(JSON.parse(data.images));
		common.appendSidebar(JSON.parse(data.projects));
		appendImages(JSON.parse(data.images));
	});
});
/* Your code starts here */

define(function (require) {
	
	console.log('Loaded index.js');
	
	var $container;

	// $('#container').masonry({
	// 	// options
	// 	itemSelector : '.item',
	// 	columnWidth : 240
	// });

	// var $container = $('#container');
	// $container.imagesLoaded(function(){
	//   $container.masonry({
	//     itemSelector : '.item',
	//     columnWidth : 240
	//   });
	// });	

	// var $container = $('#container');
	// $container.imagesLoaded(function(){
	//   $container.masonry({
	//     itemSelector : '.item',
	//     columnWidth : 240
	//   });
	// });  


	var loadImages = function(){
		console.log('Loading images...');
		$.post('/start', {}, function(response) {
            // console.log(response);
            if(response.error){
            	throw response.error	
            }else{
				console.log(response.images);
				appendImages(response.images);
            }
        });		
	}

	var appendImages = function(images){
		console.log('Appending images...');
		images.forEach(function(item, index, array){
			// console.log(item);
			var img = $('<img src="img/'+item+'"" class="item" />');
			$('#container').append(img);
		});
		// drawLayout();
	}

	var drawLayout = function(){
		$container = $('#container').masonry();
		// layout Masonry again after all images have loaded
		$container.imagesLoaded( function() {
		  $container.masonry();
		});
	}

	// loadImages();
	drawLayout();
});

// var app = {};

// app.init = function() {
// 	console.log('Loading main1.js');
// 	var _ = require('underscore');
	
	


// };

// app.init();
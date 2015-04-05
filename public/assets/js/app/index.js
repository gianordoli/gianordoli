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
			var img = $('<div class="item"><a name="'+item.projectId+'" href="projects.html#'+item.projectId+'"><img src="'+item.url+'" /></a></div>');
			$('#container').append(img);
		});
		common.addImagesPath();
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
		  	attachEvents();
		});
	}

	function attachEvents(){
		$('a').off('mouseenter').on('mouseenter', function() {
			console.log($(this).attr('name'));
			var projectId = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectId+'"]');
			$.each(objectsWithSameName, function(index, item){
				if($(item).parent().is('.item')){
					$(item).children('img').css('border-color', '#fb81ac');	
				}else{
					$(item).css('color', '#fb81ac');	
				}			
			});
		});
		$('a').off('mouseleave').on('mouseleave', function() {
			console.log($(this).attr('name'));
			var projectId = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectId+'"]');
			$.each(objectsWithSameName, function(index, item){
				if($(item).parent().is('.item')){
					$(item).children('img').css('border-color', 'white');	
				}else{
					$(item).css('color', '#333');	
				}			
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
/* Your code starts here */

define(['./common'], function (common) {

	console.log('Loaded index.js');
	
	/*------- VARS --------*/
	var $container;

	/*----- FUNCTIONS -----*/

	var appendLoader = function(){
		var loaderContainer = $('<div id="loader-container"></div>')
		var loader = $('<span class="loader"></span>');

		$('body').append(loaderContainer);
		$(loaderContainer).append(loader);
	}

	var appendImages = function(images){
		console.log('Appending images...');
		images.forEach(function(item, index, array){
			// console.log(item);
			var img = $('<div class="item"><a name="'+item.projectId+'" href="projects.html#'+item.projectId+'"><img src="'+item.url+'" /></a></div>');
			$('#container').append(img);
		});
		common.addImagesPath();
		drawLayout();
	}

	var drawLayout = function(){
		$container = $('#container').masonry();
		$('.item').css('visibility', 'hidden');
		// layout Masonry again after all images have loaded
		$container.imagesLoaded( function() {
			$container.masonry({
				// columnWidth: 50,
				containerStyle: null,
				itemSelector: '.item'
			});
			$container.masonry('on', 'layoutComplete', function(items){
				$('#loader-container').remove();
				$('.item').css('visibility', 'visible');
			  	attachEvents();
	  			common.appendFooter();				
			});
		});
	}

	function attachEvents(){
		$('a').off('mouseenter').on('mouseenter', function() {
			// console.log($(this).attr('name'));
			var projectId = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectId+'"]');
			// console.log(objectsWithSameName.length);
			$.each(objectsWithSameName, function(index, item){	
				if($(item).has('img').length > 0){
					$(item).children().attr('class', 'selected');		
				}else{
					$(item).attr('class', 'selected');
				}
			});
		});
		$('a').off('mouseleave').on('mouseleave', function() {
			// console.log($(this).attr('name'));
			var projectId = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectId+'"]');
			$.each(objectsWithSameName, function(index, item){
				if($(item).has('img').length > 0){
					$(item).children().removeAttr('class');
				}else{
					$(item).removeAttr('class');
				}
			});
		});
	}

	common.init(function(data){
		// console.log(JSON.parse(data.projects));
		// console.log(JSON.parse(data.images));
		appendLoader();
		common.appendSidebar(JSON.parse(data.projects));
		appendImages(JSON.parse(data.images));
	});
});
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
		var container = $('#container');
		images.forEach(function(item, index, array){
			// console.log(item);
			var img = $('<div class="item"><a name="'+item.projectUrl+'" href="projects.html#'+item.projectUrl+'"><img src="'+item.url+'" /></a></div>');
			$(container).append(img);
		});
		container = common.addImagesPath(container); // Add images path
		drawLayout(container);
	}

	var drawLayout = function(parentDiv){
		$container = $(parentDiv).masonry();
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
			});
		});
	}

	function attachEvents(){
		$('a').off('mouseenter').on('mouseenter', function() {
			// console.log($(this).attr('name'));
			var projectUrl = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectUrl+'"]');
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
			var projectUrl = $(this).attr('name');
			var objectsWithSameName = $('[name="'+projectUrl+'"]');
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
		common.appendFooter();
	});
});

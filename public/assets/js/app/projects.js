/* Your code starts here */

define(['./common'], function (common) {

	console.log('Loaded projects.js');
	
	// A function where we detect the change of '#' on the browser address field
	var hashRouter = function() {
	    $(window).off('hashchange').on('hashchange', function() {
	        console.log('Current hash is ' + location.hash);
	        loadProject();
	    });
	};

	var linkMarker = function(projectId){
		$('#sidebar ul').find('a').removeAttr('class');
        // $('[name="'+projectId+'"]').css('color', '#fb81ac');
        $('[name="'+projectId+'"]').attr('class', 'selected');
	}

	var loadProject = function(){
		var projectId = location.hash.substring(1, location.hash.length);
		linkMarker(projectId);
		// console.log(projectId);
		$.post('/public-load-project', {
			projectId: projectId
		}, function(response) {
            // console.log(response);
            if(response.error){
            	throw response.error	
            }else{
				console.log(response);
				appendProject(response.project);
            }
        });			
	}

	var appendProject = function(project){

		// Insert content into project-container's html
		var projectContainer = $('<div class="project-container"></div>');
		$(projectContainer).html(project.content);
		
		// Add video div to iframe
		projectContainer = addVideoDiv(projectContainer);

		// Releasing the images form inside the paragraphs
		projectContainer = releaseImages(projectContainer);

		$('#container').html('')
					   .append(projectContainer);
		$('body').scrollTop(0);
		
		common.addImagesPath();
		common.appendFooter();
	}

	// Adding the div video tag and class to the iframes
	var addVideoDiv = function(content){
		var iframes = $(content).children('iframe');
		if(iframes.length > 0){
			$.each(iframes, function(index, item){
				var itemSrc = $(item).attr('src');
				var videoDiv = $('<div></div>');
				var divClass = 'js-video';
				if(itemSrc.indexOf('vimeo') > -1){
					divClass += ' vimeo widescreen';
				}
				$(videoDiv).attr('class', divClass)
			    $(item).wrap(videoDiv);
			});
		}
	    return content;
	}

	var releaseImages = function(content){
		var imgP = $(content).children('p').has('img');
		if(imgP.length > 0){
			$.each(imgP, function(index, item){
				$(item).replaceWith($(item).children());
			});
		}
	    return content;
	}

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
		hashRouter();
		loadProject();
	});
});
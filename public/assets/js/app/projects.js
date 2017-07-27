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

	var linkMarker = function(projectUrl){
		$('#sidebar ul').find('a').removeAttr('class');
        // $('[name="'+projectUrl+'"]').css('color', '#fb81ac');
        $('[name="'+projectUrl+'"]').attr('class', 'selected');
	}

	var loadProject = function(){
		var projectUrl = location.hash.substring(1, location.hash.length);
		linkMarker(projectUrl);
		// console.log(projectUrl);

		var projectsRef = common.getProjectsRef();
		var queryRef = projectsRef.orderByChild("url").equalTo(projectUrl);

		queryRef.once("value", function(snapshot) {

			console.log("Loaded project");
			var title, content;

			snapshot.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();
				console.log(">>>>> DATA");
				console.log(childData);
				title = childData["title"];
				content = marked(childData["content"]);
			});
			// res.json({
			// 	project: {
			// 		title: title,
			// 		content: content
			// 	}
			// });

		}, function(errorObject){
			console.log("The read failed: " + errorObject.code);
		});

		// $.post('/public-load-project', {
		// 	projectUrl: projectUrl
		// }, function(response) {
    //         // console.log(response);
    //         if(response.error){
    //         	throw response.error
    //         }else{
		// 		// console.log(response);
		// 		appendProject(response.project);
    //         }
    //     });
	}

	var appendProject = function(project){

		// Insert content into project-container's html
		var projectContainer = $('<div class="project-container"></div>');
		$(projectContainer).html(project.content);

		// The markdown content need some adjustments...
		projectContainer = addVideoDiv(projectContainer);			// Add video div to iframe
		projectContainer = releaseImages(projectContainer);			// Releasing the images form inside the paragraphs
		projectContainer = common.addImagesPath(projectContainer);	// Add images path
		projectContainer = common.addImagesAlt(projectContainer);	// Add images alt
		projectContainer = addTargetBlank(projectContainer);		// Adding target="_blank" to all links

		$('#container').html('')
					   .append(projectContainer);

		$('body').scrollTop(0);
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

	var addTargetBlank = function(content){
		var links = $(content).find('a');
		if(links.length > 0){
			$.each(links, function(index, item){
				$(item).attr('target', '_blank');
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
		// console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
		common.appendFooter();
		hashRouter();
		loadProject();
	});
});

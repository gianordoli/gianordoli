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
		$('#sidebar ul').find('a').css('color', '#333');
        $('[name="'+projectId+'"]').css('color', '#F2663F');
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
		// Parse the iFrame html (for Youtube and Vimeo videos)
		// project.content = parseIframe(project.content);

		var projectContainer = $('<div class="project-container"></div>')
		$(projectContainer).html(project.content);
		
		var iframe = $(projectContainer).children('iframe');
		var iframeSrc = $(iframe).attr('src');
		var videoDiv = $('<div></div>');
		var divClass = 'js-video';
		if(iframeSrc.indexOf('vimeo') > -1){
			divClass += ' vimeo widescreen';
		}
		$(videoDiv).attr('class', divClass)
	    $(iframe).wrap(videoDiv);

		// Releasing the images form inside the paragraphs
		var imgP = $(projectContainer).children('p').has('img');
		$.each(imgP, function(index, item){
			$(item).replaceWith($(item).children());
		});

		$('#container').html('')
					   .append(projectContainer);
		$('body').scrollTop(0);
		common.addImagesPath();
	}

	// The markdown parser is parsing HTML tags into HTML entities.
	// This is breaking the iframes used to embed videos.
	// This function parse the HTML entities back to HTML
	var parseIframe = function(content){
		var init = content.indexOf('&lt;iframe');
		var end = content.indexOf('iframe&gt;') + 10;
		
		if(init > -1 && end > -1){
			// Extracting the iFrame
			var stringIframe = content.substring(init, end);

			// Adding the responsive class
			var divClass = 'js-video';
			if(stringIframe.indexOf('vimeo') > -1){
				divClass += ' vimeo widescreen';
			}

			// Parsing the iFrame
			var parsedIframe = '<div class="'+divClass+'">' + decodeEntities(stringIframe) + '</div>';
			return content.replace('<p>'+stringIframe+'</p>', parsedIframe);
		}else{
			return content;
		}
	}

	var decodeEntities = (function() {
	  // this prevents any overhead from creating the object each time
	  var element = document.createElement('div');
	  function decodeHTMLEntities (str) {
	    if(str && typeof str === 'string') {
	      // strip script/html tags
	      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
	      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
	      element.innerHTML = str;
	      str = element.textContent;
	      element.textContent = '';
	    }
	    return str;
	  }
	  return decodeHTMLEntities;
	})();

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
		hashRouter();
		loadProject();
	});
});
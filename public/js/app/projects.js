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

		var projectContainer = $('<div class="project-container"></div>')
		$(projectContainer).html(project.content);
		$('#container').html('')
					   .append(projectContainer);
		$('body').scrollTop(0);
		common.addImagesPath();
	}

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
		hashRouter();
		loadProject();
	});
});
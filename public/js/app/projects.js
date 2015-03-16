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

	var loadProject = function(){
		var projectId = location.hash.substring(1, location.hash.length);
		// console.log(projectId);
		$.post('/public-load-project', {
			projectId: projectId
		}, function(response) {
            // console.log(response);
            if(response.error){
            	throw response.error	
            }else{
				console.log(response);
				appendProject(response);
            }
        });			
	}

	var appendProject = function(response){
		console.log(response.project);
		// $('#container').html();
	}

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
		hashRouter();
		loadProject();
	});
});
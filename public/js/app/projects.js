/* Your code starts here */

define(['./common'], function (common) {

	console.log('Loaded projects.js');
	
	var loadProject = function(){
			$.post('/load-project', {}, function(response) {
	            // console.log(response);
	            if(response.error){
	            	throw response.error	
	            }else{
					console.log(response);
					callback(response);
	            }
	        });			
	}

	common.init(function(data){
		console.log(JSON.parse(data.projects));
		common.appendSidebar(JSON.parse(data.projects));
	});
});
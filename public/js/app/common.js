/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		init: function(callback){
			console.log('Initializing...');
			$.post('/public-start', {}, function(response) {
	            // console.log(response);
	            if(response.error){
	            	throw response.error	
	            }else{
					console.log(response);
					callback(response);
	            }
	        });		
		},
		appendSidebar: function(projects){
			console.log('Appending projects...');
			var ul = $('<ul></ul>');
			projects.forEach(function(item, index, array){
				// console.log(item);
				var li = $('<li id="'+item.projectId+'"><a href="projects.html#'+item.projectId+'">'+item.title+'</li>');
				$(ul).append(li);
			});
			$('#sidebar').append(ul);
		}
	} 
});
// This page manages the js modules that each html page will load

//Load common code that includes config
require(['config'], function () {

	console.log('Loaded config file.');
	
	// All pages load jQuery
	require(['jquery'], function($){
		
		console.log('Loaded jquery.');

		// Current page is...?
		var url = window.location.pathname;
		var filename = url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.'));
		if(filename == '/') filename = 'index';
		
		console.log('Loading dependencies for '+filename);
		
		// ADMIN
		if(filename == 'admin'){
			require(['jquery-ui']);
			loadMainScript(filename);
		
		// PUBLIC
		}else{

			// INDEX
			if(filename == 'index'){

				// masonry
				require(['Masonry'], function(Masonry) {
					console.log('Loaded Masonry.');
				    // require jquery-bridget, it's included in masonry.pkgd.js
				    require(['jquery-bridget/jquery.bridget'], function() {
				    	console.log('Loaded jquery.bridget.');
						// make Masonry a jQuery plugin
						$.bridget( 'masonry', Masonry );
						// now you can use $().masonry()
						// Require imagesLoaded
						require(['imagesloaded']);
						console.log('Loaded imagesLoaded.');

						loadMainScript(filename);
				    });
				});
				
			// ALL
			}else{
				loadMainScript(filename);
			}
		}
	});

	function loadMainScript(filename){
		console.log('Loading script for ' + filename);
		require(['app/'+filename]);		
	}

});

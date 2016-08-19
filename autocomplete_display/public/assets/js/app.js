// This page manages the js modules that each html page will load

//Load common code that includes config
require(['config'], function () {

	console.log('Loaded config file.');
	
	// All pages load jQuery
	require(['jquery', 'underscore'], function($, _){
		
		console.log('Loaded jquery and underscore.');

		// Current page is...?
		var url = window.location.pathname;
		var filename = url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.html'));
		if(filename == '/') filename = 'index';
		
		console.log('Loading dependencies for '+filename);

		// INDEX
		if(filename == 'archive'){

			// Isotope
			require(['isotope'], function(Isotope) {
				
				console.log('Loaded Isotope.');
			    // require jquery-bridget to make Isotope work as a JQuery plugin
			    require(['jquery-bridget/jquery.bridget'], function() {

			    	console.log('Loaded jquery.bridget.');
					$.bridget( 'isotope', Isotope );

					// Require imagesLoaded
					require(['imagesloaded']);
					console.log('Loaded imagesLoaded.');

					loadMainScript(filename);
			    });
			});

		}else{
			loadMainScript(filename);
		}
	});

	function loadMainScript(filename){
		console.log('Loading script for ' + filename);
		require(['app/'+filename]);		
	}

});

/* Your code starts here */

define(function (require) {
	
	console.log('Loading common functions...')

	return {
		appendNavBar: function(isArchive, callback){

			console.log('Appending NavBar');
			var today = new Date();
			var monthNames = ["January", "February", "March", "April", "May", "June",
			  "July", "August", "September", "October", "November", "December"
			];

			var servicesUl = $('<ul id="services">' +
									'<li class="web selected"><div></div>Google.com</li>' +
									'<li class="images selected"><div></div>Google Images</li>' +
									'<li class="youtube selected"><div></div>Youtube</li>' +
								'</ul>');
			
			var infoUl = $('<ul id="info">' +			
								'<li><img src="/assets/img/stack.png" />Number of Languages</li>' +
								'<li class="data">Data: Feb 21 - May 30</li>' +
							'</ul>');
			var lettersUl = $('<ul id="letters"></ul>');
			for(var i = 65; i <= 90; i++){
				var letter = String.fromCharCode(i);
				$(lettersUl).append('<li><a class="letter-bt" href="#' + letter + '">' + letter  +'</a></li>');					
			}

			// Title
			$('nav#header').append('<h1><a href="/index.html"><span>Autocomplete</span> Archive</a></h1>');
			
			// Services
			if(isArchive){ $('nav#header').append(servicesUl).append(infoUl); }

			// Purple bar
			var bar = $('<div id="bar"></div>')
					    .append('<div class="left"></div>')
						.appendTo('nav#header');

			// Letters
			if(isArchive){
				$(bar).append(lettersUl)
			}
			
			var right = $('<div class="right"></div>').appendTo(bar);

			// back
			if(!isArchive){
				$(right).append('<p id="back-bt"><a href="/archive.html#A"><img src="/assets/img/back_bt.png"/></a></p>');
			}

			// About
			var about = $('<div id="about"><img src="/assets/img/hamburger.png"/><p>More Info</p>' +
							'<ul id="pages-links">' +
								'<li><a href="about.html">About</a></li>' +
								'<li><a href="faq.html">FAQ</a></li>' +
								'<li><a href="technology.html">Tech Info</a></li>' +
							'</ul>' +
						  '</div>')
						  .appendTo('nav#header');

			callback();

		},

		attachNavBarEvents: function(){

			console.log('Attaching events to NavBar');

		    var aboutRollover;
		    var toggleMenu = function(display){
		    	if(display){
		    		$('#pages-links').css('display', 'inline-block');
		    	}else{
					$('#pages-links').css('display', 'none');
		    	}
	    	}

			// About
		    $('#about').off('mouseenter').on('mouseenter', function() {
		    	clearTimeout(aboutRollover);
		        toggleMenu(true);
		    });
		    $('#about').off('mouseleave').on('mouseleave', function() {
		    	clearTimeout(aboutRollover);
		    	aboutRollover = setTimeout(function(){
		    		toggleMenu(false);
		    	}, 1000);
		    });

			// ABOUT links
		    $('#pages-links').off('mouseenter').on('mouseenter', function() {
		    	clearTimeout(aboutRollover);
		        toggleMenu(true);
		    });		
		    $('#pages-links').off('mouseleave').on('mouseleave', function() {
		    	clearTimeout(aboutRollover);
		    	aboutRollover = setTimeout(function(){
		    		toggleMenu(false);
		    	}, 2000);
		    });
		},

		appendLoader: function(container){
			var loaderContainer = $('<div id="loader-container"></div>')
			var loader = $('<span class="loader"></span>');

			$(container).append(loaderContainer);
			$(loaderContainer).append(loader);
			$(loaderContainer).append('<p><b>Loading<br/>Google Autocomplete<br/>suggestions</b></p>');
		},

		getParameterByName: function(name) {
			// console.log('Calling getParameterByName');
			var paramsString = window.location.href.substring(window.location.href.indexOf('?') + 1, window.location.href.length);
			// console.log(params);
			var paramsArray = paramsString.split('&');
			// console.log(paramsArray);
			var params = {};
			paramsArray.forEach(function(item, index, array){
				var key = item.substring(0, item.indexOf('='));
				var value = decodeURIComponent(item.substring(item.indexOf('=') + 1, item.length));
				params[key] = value;
			});
			// console.log(params);

			return (params[name] === undefined) ? (null) : (params[name]);
		},	

		// Some milliseconds are messed up!
		// This function set minutes, seconds and millis to zero
		refineDates: function(data){
			for(var i in data){
				data[i]['date'] = new Date(data[i]['date']);
				data[i]['date'].setMinutes(0);
				data[i]['date'].setSeconds(0);
				data[i]['date'].setMilliseconds(0);
				data[i]['date'] = data[i]['date'].getTime();
			}
			return data;
		},

		// Formats UTC date to MM/DD/YYYY
		formatDateMMDDYYY: function(date){
			var newDate = new Date(date);
			// console.log(newDate);
			var monthString = newDate.getMonth() + 1;
			if (monthString < 10) monthString = '0' + monthString;
			var dateString = newDate.getDate();
			var yearString = newDate.getFullYear();
			return monthString + '/' + dateString + '/' + yearString;
		}			
	} 
});
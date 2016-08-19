define(['./common', 'd3', 'twitter-widgets'], function (common) {

	/*-------------------- MAIN FUNCTIONS --------------------*/

	var loadData = function(letter){

		console.log('Calling loadData.');
		console.log('Requesting: letter ' + letter + '.');

    	// Don't make a new request until it gets a response from the server
    	disableNavigation();
    	removeSelectedLetter();
    	highlightSelectedLetter();
		$('#container').remove();
		var container = $('<div id="container"></div>');
		$('body').append(container);  	
		common.appendLoader(container);

		$.post('/letter', {
			letter: letter
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	// console.log(response);
	        	console.log('Got ' + response['results'].length + ' total objects.');

				enableNavigation();
				$(container).empty();
				appendResults(response['results'], container);
	        	// processData(response, container);
	        }
	    });
	}

	var appendResults = function(data, container){
		
		console.log('Appending results...');

		for(var index in data){
			
			/*---------- CONTAINER ----------*/
			var itemContainer = $('<div class="item"></div>')
								.appendTo(container);

			/*----- Content -----*/
			var itemContent = $('<div class="content" query="' + data[index]['query'] + '"></div>');

			// Youtube
			if(data[index]['service'] == 'youtube'){

				var core = $('<div class="core" detail="0" style="background-image: url(' + data[index]['thumbnail'] + ')" videoid="' + data[index]['videoId'] + '">' +
								// '<img src="/assets/img/play.png"/>' +
							'</div>')
							.appendTo(itemContent);
				
				createStack(data[index]['languages'].length, itemContent, data[index]['service']);

			// Google Images
			}else if(data[index]['service'] == 'images'){

				var core = $('<img class="core" src="' + data[index]['url'] + '" />')
							.appendTo(itemContent)
							.load({
								n: data[index]['languages'].length,
								container: itemContent,
								service: data[index]['service']
							}, function(response){
								// console.log('Loaded');
								// console.log(response.data);
								createStack(response.data.n, response.data.container, response.data.service);
							});

			// Google Web
			}else{

				var el = '<h1>' + data[index]['query'] + '</h1>';
				var core = $(el)
							.addClass('core')
							.appendTo(itemContent);

				createStack(data[index]['languages'].length, itemContent, data[index]['service'], el);
			}

			$(itemContent).addClass(data[index]['service'])
			$(itemContent).children().addClass(data[index]['service']);
			$(itemContent).appendTo(itemContainer);

			/*----- Description -----*/
			var itemDescription = $('<div class="description" style="display:none"></div>');

			// Query
			// if(data[index]['service'] != 'web'){
				$(itemDescription).append('<h2>' + data[index]['query'].toUpperCase() + '</h2>');
			// }

			// Service
			$(itemDescription).append('<h3>' + servicesAlias[data[index]['service']]['name'] + '</h3>')
							  .append('<hr/>');

			// Languages
			var languagesText = 'Searched in ';
			for(var i in data[index]['languages']){
				if(i > 0){
					if(data[index]['languages'].length > 2){
						languagesText += ', ';
					}
	    			if(i == data[index]['languages'].length - 1){
	    				if(data[index]['languages'].length == 2){
	    					languagesText += ' ';
	    				}
	    				languagesText += 'and ';
	    			}						
				}
    			languagesText += '<b>' + data[index]['languages'][i] + '</b>';
			}
			$(itemDescription).append('<p>' + languagesText + '</p>');

			// Dates
			var datesText = 'From <b>' +
								common.formatDateMMDDYYY(data[index]['dates'][0]) +
								'</b> to <b>' +
								common.formatDateMMDDYYY(data[index]['dates'][data[index]['dates'].length - 1])  + '</b>';
			$(itemDescription).append('<p>' + datesText + '</p>');

			// // More info
			// var newHref = 'archive.html#' + getHash() +'?query=' + encodeURIComponent(data[index]['query']) + '&service=' + data[index]['service'] + '&lightbox=true';
			// $(itemDescription).append('<p><a href="' + newHref + '">More Info</a></p>');
			
			$(itemDescription).addClass(data[index]['service'])
							  .appendTo(itemContainer);
		}

		drawLayout(container);		
		attachEvents();
	}

	var createStack = function(n, container, service, el){

		// console.log('Called createStack.');

		for(var i = 0; i < n; i++){

			var proto = $('<div class="' + service + '"></div>')
						.appendTo('body');
			// Firefox is returning border-color as empty, so...
			var color = ($(proto).css('border-color') != '') ? ($(proto).css('border-color')) : ($(proto).css('color'));
			color = rgbToHsl(color);
			$(proto).remove();
			
			var params = {
							top: - (i + 1) * 4,
							left: - (i + 1) * 4,
							'z-index': - i - 1,
							'border-color': parseHsl(color.h, color.s, (color.l + (90 - color.l)/n * (i+1)) )
						};

			if(service == 'web'){
				var stack = $(el)
							.addClass('stack')
							.addClass(service)
							.css(params);
			
			}else{

				if(service == 'images'){
					params.width = $(container).width();
					params.height = $(container).height();
				}

				var stack = $('<div class="stack ' + service + '"></div>')
						.css(params);
			}

			$(container).prepend(stack);
		}	
	}

	var drawLayout = function(parentDiv){
		console.log('Called drawLayout.');

		// init Isotope
		$grid = $(parentDiv).isotope();

		var isotopeIterator = 0;

		var fallback = setInterval(function(){
			console.log('Images took too long to load.');
			console.log('Calling Isotope anyway #' + (isotopeIterator + 1));
			
			layoutIsotope($grid);

			isotopeIterator ++;
			if(isotopeIterator > 5){
				clearInterval(fallback);
			}
		}, 5000);

		// layout Masonry again after all images have loaded
		$grid.imagesLoaded( function() {
			console.log('Finished loading images.');
			console.log('Calling Isotope again');
			
			clearInterval(fallback);
			layoutIsotope($grid);
		});
	}

	var layoutIsotope = function(obj){
		obj.isotope({
			itemSelector: '.item',
			// percentPosition: true,
			masonry: {
				containerStyle: null
			}
		});
	}

	/*-------------------- MORE INFO ---------------------*/

	var loadMoreInfo = function(query, service, callback){

		console.log('Calling loadMoreInfo.')
		console.log('Requesting: ' + query + ' at ' + service + '.');

		common.appendLoader('#lightbox');

		$.post('/query', {
			query: query,
			service: service
		}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);

	        	if(callback !== undefined){
	        		callback();
	        	}

	        	$('#lightbox').empty();
	        	$('#lightbox-detail').empty();
	        	// Only proceed if the lightbox is still active
	        	// (the user might have closed it before loading)
	        	if($('#lightbox').css('display') == 'block'){
	        		processMoreInfo(response);
	        	}
	        }
	    });
	}

	var processMoreInfo = function(data){

		console.log('Called processMoreInfo.')

		data['results'] = common.refineDates(data['results']);

		/*---------- Dates Tables ----------*/
		var groupedByDate = _.groupBy(data['results'], function(item, index, array){
			// console.log(item['date']);
			return item['date'];
		});
		// console.log(groupedByDate);

		var sortedByDate = _.sortBy(groupedByDate, function(value, key, collection){
			return key;
		});
		// console.log(sortedByDate);

		/*---------- D3 Chart ----------*/
		var groupedByLanguage = _.groupBy(data['results'], function(item, index, array){
			return item['language_name'];
		});
		// console.log(groupedByLanguage);

		// Let's make things easier for D3... Passing the min and max dates
		var dateRange = [sortedByDate[0][0]['date'], sortedByDate[sortedByDate.length - 1][0]['date']];
        // D3 needs an Array! You can't pass the languages as keys
        groupedByLanguage = _.toArray(groupedByLanguage);
        for(var i in groupedByLanguage){
        	groupedByLanguage[i] = _.sortBy(groupedByLanguage[i], function(item, index, array){
        		return item['date'];
        	});
        }
        appendDetail(data['main']);
		drawChart(data['main'], groupedByLanguage, dateRange);
	}

	var appendDetail = function(data){

		console.log('Called appendDetail');

		if(data['service'] != 'web'){
			$('#lightbox-detail').show();
		}

		if(data['service'] == 'youtube'){
			var itemContent = $('<div class="content">' +
									'<div detail="1" style="background-image: url(' + data['thumbnail'] + ')" videoid="' + data['videoId'] + '">' +
										'<img src="/assets/img/play.png"/>' +
									'</div>' +
								'</div>');

		}else if(data['service'] == 'images'){
			var itemContent = $('<div class="content">' +
									'<img src="' + data['url'] + '" />' +
								'</div>');
		
		}

		$(itemContent).addClass(data['service'])
		$(itemContent).children().addClass(data['service']);
		$(itemContent).appendTo('#lightbox-detail');

		attachEvents();
	}

	var drawChart = function(main, dataset, dateRange){

		console.log('Called drawChart');
		// console.log(dataset.length);
		var service = main['service'];
		var query = encodeURI(main['query']);

		// Header
		// $('#lightbox').addClass(main['service']);
		$('#lightbox').append('<div id="close-bt"><img src="/assets/img/close_bt.png" /></div>');
		var title = $('<h1>' + main['query'] + '</h1>').appendTo('#lightbox');
		if(dataset.length == 1 && dataset[0][0]['language_code'] != 'en'){
			$(title).append('<a href="https://translate.google.com/?ie=UTF-8&hl=en#' + dataset[0][0]['language_code'] + '/en/' + query + '" target="_blank">' +
								'<img src="/assets/img/google_translate.png"/></a>' +
							'</a>');
		}
		$('#lightbox').append('<h2>' + servicesAlias[main['service']]['name'] + '</h2>');

		/*----- LAYOUT -----*/
		var svgSize = {	width: 600, height: 300	};
		var margin = { top: 50, right: 70, bottom: 50, left: 100 };
		var width  = svgSize.width - margin.left - margin.right;
		var height = svgSize.height - margin.top - margin.bottom;
		
		var languagesPalette = [];
		for(var i in dataset){
			var hue = i * 360 / dataset.length;
			languagesPalette.push({
				language_name: dataset[i][0]['language_name'],
				language_code: dataset[i][0]['language_code'],
				color: parseHsla({h: hue, s: 100, l: 50, a: 0.5})	
			});
		}
		// console.log(languagesPalette);

		// Canvas
		var svg = d3.select('#lightbox')
					.append('svg')
					.attr('id', 'chart')
					.attr('width', width + margin.left + margin.right)
				    .attr('height', height + margin.top + margin.bottom);		

        // Now the whole chart will be inside a group
        var chart = svg.append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");				    

		var xScale = d3.time.scale()
						.domain(d3.extent(dateRange, function(d, i){
							return d;
						}))
						.range([0, width]);

		var yScale = d3.scale.linear()
					   .domain([1, 10])
					   .range([0, height]);

		var line = d3.svg.line()
					    .x(function(d, i) {
					    	return xScale(d['date']);
					    })
					    .y(function(d) {
					    	return yScale(d['ranking'] + 1);
					    });


		// X Scale
		var xAxis = d3.svg.axis()
							.ticks(4)
							.innerTickSize(20)
						    .scale(xScale)
						    .orient("bottom");

		// Y Scale
		var yAxis = d3.svg.axis()
						    .innerTickSize(20)
						    .scale(yScale)
						    .orient("left");

	  	// Lines
		var language = chart.selectAll(".line")
				      		.data(dataset)
						    .enter()
							.append("path")
							.attr("class", "line")
							// .attr('stroke', parseHsla(categoriesColors[parseInt(cat) - 1], 1))
							.attr('stroke', function(d, i){
								return languagesPalette[i]['color'];
							})
							.attr('d', function(d, i){
								// console.log(d);
								// Shrinking lines to 0
								var emptyHistory = [];
								for(var j in d){
									var emptyRecord = {
										ranking: 9,
										date: d[j]['date']
									};
									emptyHistory.push(emptyRecord);
								}
								return line(emptyHistory);
							})
							.transition()
							.duration(1000)
							.attr("d", function(d, i) {
								return line(d);
							});



		if(dataset.length == 1){
			if(dataset[0].length == 1){
			  	// Dots
			  	var languageDots = chart.selectAll("g")
						      		.data(dataset)
								    .enter()
									.append("g")
									.attr('name', function(d, i){
										return i;
									});

				languageDots.selectAll("circle")
				      		.data(function(d) { return d; })
						    .enter()
							.append("circle")
							.attr('fill', function(d, i){
								var j = d3.select(this.parentNode).attr('name');
								return languagesPalette[j]['color'];
							})
							.attr('r', 10)
		                    .attr("cx", function(d, i){
		                        return xScale(d['date']);
		                    })
		                    .attr("cy", function(d, i){
		                        return yScale(10);
		                    })                   
							.transition()
							.duration(1000)
		                    .attr("cy", function(d, i){
		                        return yScale(d['ranking'] + 1);
		                    });
			}
		}

        // Now appending the axes
        chart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .call(xAxis);

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text") // Label
            .attr("transform", "rotate(-90)")
            .attr("y", -55)
            .attr("x", 34)
            .attr("class", "label")
            .style("text-anchor", "end")
            // .text("Position on Autocomplete");
            .text("Most Searched For Order");

		var languagesList = $('<ul></ul>');
		for(var i in languagesPalette){
			$(languagesList).append('<li class="language-bt">' +
										'<div class="language-marker" style="background-color:' + languagesPalette[i]['color'] + '"></div>' +
										// '<a href="" query="' + encodeURI(main['query']) + '" service="' + main['service'] + '" language="' + languagesPalette[i]['language_code'] + '">' + languagesPalette[i]['language_name'] + '</a>' +
										'<a href="' + servicesAlias[service]['search_address'] + query + '&hl=' + language + '" target="_blank">' + languagesPalette[i]['language_name'] +'</a>' + 
									'</li>');
		}
		$('#lightbox').append(languagesList);

		setTimeout(addShareButtons, 1000);
		attachEvents();
	}	

	/*-------------------- AUX FUNCTIONS ---------------------*/

	var attachEvents = function(){

		// Filters
		$('#services').children('li').off('click').on('click', function(e){

			// Toggle selected
			if($(e.target).hasClass('selected')){
				$(e.target).removeClass('selected');
			}else{
				$(e.target).addClass('selected');
			}

			// Loop through all services to see which one should stay on
			var selectedServices = [];
			$(e.target).parent().children().each(function(index, item){
				if($(item).attr('class').indexOf('selected') > -1){
					selectedServices.push($(item).attr('class').replace(' selected', ''));
				}
			});
			console.log(selectedServices);
				
			var selectedClass = e.target.className;
			$grid.isotope({
				// filter element with numbers greater than 50
				filter: function() {
				// _this_ is the item element
				var child = $(this).children('.content');
				var childService = $(child).attr('class').replace('content ', '');
				// console.log(childService);

				// return true to show, false to hide
				return selectedServices.indexOf(childService) > -1;
				}
			});
		});

		// Lightbox
		$('#lightbox-shadow').off('click').on('click', function() {
			removeLightbox();
		});

		$('#close-bt').off('click').on('click', function() {
			removeLightbox();
		});

		// Play video
		$('.content.youtube').children('.youtube').off('click').on('click', function(){
			// console.log($(this).attr('videoid'));
			// console.log($(this).attr('detail'));
			$(this).html(embedYoutube($(this).attr('videoid'), $(this).attr('detail')));
		});

		// Hash router
	    $(window).off('hashchange').on('hashchange', function() {
	    	console.log('Hash router');
	    	var newHash = getHash();
	    	console.log('New hash: ' + newHash);
	    	console.log('Current hash: ' + currentHash);
	    	if(newHash != currentHash){
	    		loadData(newHash);
	    		currentHash = newHash;
	    		resetFilters();
	    	}else if(common.getParameterByName('lightbox') != null){
	    		createLightbox();
	    	}	        
	    });

		// Show description
		// ------------------------------------------------------
		$('.item').off('mouseenter').on('mouseenter', function(){
			$(this).css('z-index',  1000);

			$(this).children('.description').css({
				'display': 'block'
				// 'z-index': 1000
			});

			createHover($(this));
		});

		$('.item').off('mouseleave').on('mouseleave', function(){
			$(this).css('z-index',  'auto');
			$(this).children('.description').css({
				'display': 'none'
				// 'z-index': 'auto'
			});
			$(this).children('.hover').remove();
			$(this).children('.hover-icon').remove();
		});
		// ------------------------------------------------------

		// Adjust stacks' sizes on window resize
		// ------------------------------------------------------
		var debounce;
		$(window).resize(function() {
		    clearTimeout(debounce);
		    debounce = setTimeout(doneResizing, 500); 
		});
		
		function doneResizing(){
			console.log('Done resizing.');
			adjustStacks();
		}
		// ------------------------------------------------------	
	}

	var resetFilters = function(){
		$('#services').children('li').each(function(index, item){
			// console.log(item);
			if(!$(item).hasClass('selected')){
				$(item).addClass('selected')
			}
		});
	}

	var adjustStacks = function(){

		console.log('Called adjustStacks.');

		var imgStack = $('.stack.images');
		$.each(imgStack, function(index, item){
			$(item).css({
				width: $(item).parent().width(),
				height: $(item).parent().height()
			});
		});
	}	

	var addShareButtons = function(){

		$.post('/shorten', {
			url: window.location.href
		}, function(response) {
	        if(response.error){
	        	throw response.error

	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);

				// TWITTER
				$('#lightbox').append('<a id="twitter-share"></a>')
				twttr.widgets.createShareButton(
					response,
					document.getElementById('twitter-share'),
					{
						count: 'none',
						text: common.getParameterByName('query') + ' on #AutocompleteArchive http://autocompletearchive.com'
					})
					.then(function (el) {
						console.log("Twitter button created.")
					});

				// FACEBOOK
				$('<img id="fb-share" src="/assets/img/fb.png" />')
				.on('click', function(){
					var url = window.location.href.substring(0, window.location.href.indexOf('#')) +
							  window.location.href.substring(window.location.href.indexOf('#') + 2, window.location.href.length);
					console.log(url)
					FB.ui({
						method: 'share',
						// href: response
						href: url
					},
					// callback
					function(response) {
						if (response && !response.error_code) {
						  console.log('Posting completed.');
						} else {
						  console.log('Error while posting.');
						}
					});
				})
				.appendTo('#lightbox');
	        }
	    });			
	}

	var createHover = function(obj){
		// HOVER
		// console.log('Width: ' + hover.width + ', ' + 'Height: ' + hover.height);
		var hoverSize = {
			width: $(obj).children('.content').width(),
			height: $(obj).children('.content').height()
		};

		// console.log($(obj).children('.content').attr('class'));
		var service = $(obj).children('.content').attr('class').split(' ')[1];
		var query = $(obj).children('.content').attr('query');
		// console.log(service);
		
		var hoverDiv = $('<div></div>')
						.addClass('hover')
						.addClass(service)
						.css({
							width: hoverSize.width,
							height: hoverSize.height
						})
						.off('click').on('click', function(){
							window.location.href= 'archive.html#' + getHash() +'?query=' + encodeURIComponent(query) + '&service=' + service + '&lightbox=true';
						});

		var hoverIcon = $('<div class="hover-icon"><img src="/assets/img/chart_' + service + '.png"/></div>')
						.css({
							// top: (hoverSize.height/2 - 20),
							// left: (hoverSize.width/2 - 20)
							top: 7,
							left: (hoverSize.width - 47)
						})
						.off('click').on('click', function(){
							window.location.href= 'archive.html#' + getHash() +'?query=' + encodeURIComponent(query) + '&service=' + service + '&lightbox=true';
						});

		$(obj).append(hoverDiv)
			   .append(hoverIcon);
	}

	var createLightbox = function(callback){
		// console.log('query:' + common.getParameterByName('query'));
		// console.log('service:' + common.getParameterByName('service'));

		$('#lightbox-shadow').show();
		$('#lightbox').empty()
					  .removeClass()
					  .addClass(common.getParameterByName('service'))
					  .show();
		$('#lightbox-detail').empty()
							 .removeClass();

		loadMoreInfo(common.getParameterByName('query'), common.getParameterByName('service'), callback);
	}

	var removeLightbox = function(){
		clearParameters();
		$('#lightbox').empty()
					  .hide()
					  .removeClass();
		$('#lightbox-detail').empty()
							 .hide()
							 .removeClass();					  
		$('#lightbox-shadow').hide();
		// $('#twitter-widget-0').remove();
		// $('.fb-share-button.fb_iframe_widget').remove();
	}

	// var createTooltip = function(obj){

	// 	$('.language-tooltip').remove();

	// 	var linkColor = $(obj).children('.language-marker').css('background-color');
	// 	var linkPosition = $(obj).offset();
	// 	var linkSize = {
	// 		width: $(obj).width(),
	// 		height: $(obj).height()
	// 	}
	// 	var linkWidth = $(obj).width();
	// 	var query = $(obj).children('a').attr('query');
	// 	var service = $(obj).children('a').attr('service');
	// 	var language = $(obj).children('a').attr('language');
	// 	var translateLanguage = (language == 'pt-BR') ? ('pt') : (language);
	// 	// console.log(query + ', ' + service + ', ' + language);

	// 	$('<div class="language-tooltip">' +				
	// 		'<a href="' + servicesAlias[service]['search_address'] + query + '&hl=' + language + '" target="_blank">Search</a>' + 
	// 		'<br />' +
	// 		'<a href="https://translate.google.com/?ie=UTF-8&hl=en#' + translateLanguage + '/en/' + query + '" target="_blank">Translate</a>' +
	// 	  '</div>')
	// 	  .css({
	// 	  	'top': (linkPosition.top + linkSize.height) + 'px',
	// 	  	'left': (linkPosition.left) + 'px',
	// 	  	'min-width': linkWidth + 'px',
	// 	  	'border-color': linkColor
	// 	  })
	// 	  .appendTo('body');

	// 	  attachEvents();
	// }	

	var removeSelectedLetter = function(){
		console.log('Called removeSelectedLetter.');
		$('nav').find('a.letter-bt').removeClass('selected');
	}

	var highlightSelectedLetter = function(){
		console.log('Called highlightSelectedLetter.');
		$('nav').find('a.letter-bt').each(function(index, item){
			if(location.hash.substring(1, location.hash.length) == $(item).html()){
				$(item).addClass('selected');
			}
		});
	}

	var disableNavigation = function(){
		console.log('Called disableNavigation.');
		$('nav').find('a.letter-bt').addClass('not-active');
	}

	var enableNavigation = function(){
		console.log('Called enableNavigation.');
		$('nav').find('a.letter-bt').removeClass('not-active');
	}

	var embedYoutube = function(id, controls){
		// console.log(controls);
		if(controls > 0){
			var iframe = '<iframe src="https://www.youtube.com/embed/' +
						 id +		
						 '?autoplay=1&controls=' + controls + '" frameborder="0" allowfullscreen></iframe>';
			return iframe;			
		}
	}

	var parseHsla = function(color){
		var myHslaColor = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + color.a +')';
		return myHslaColor;
	}

	var getHash = function(){
		// console.log('Current hash is: ' + location.hash)
		return location.hash.substring(1, 2);
	}

	var fixHash = function(){
		if (location.hash.indexOf('#') < 0) {
			var letter = common.getParameterByName('query').substring(0, 1).toUpperCase();
			var newUrl = window.location.href.substring(0, window.location.href.indexOf('?')) +
						 '#' + letter +
						 window.location.href.substring(window.location.href.indexOf('?'), window.location.href.length);
			console.log('New url is: ' + newUrl);
			window.location.href = newUrl;
		};
	}

	var clearParameters = function(){
		console.log('Calling clearParameters');
		if(window.location.href.indexOf('?') > -1){
			var newUrl = window.location.href.substring(0, window.location.href.indexOf('?'));
			console.log('Cleaned up url parameters: ' + newUrl);
			window.location.href = newUrl;
			// location.hash = location.hash.substring(0, location.hash.indexOf('?'));
		}
	}

	var rgbToHsl = function(colorString){

		var components = colorString.substring(colorString.indexOf('(') + 1, colorString.indexOf(')')).split(',');
		var r = components[0];
		var g = components[1];
		var b = components[2];

	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {
	    	h: Math.floor(h * 360),
	    	s: Math.floor(s * 100),
	    	l: Math.floor(l * 100) 
	    };
	}

	var parseHsl = function(h, s, l){
		var myHslColor = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
		//console.log('called calculateAngle function');
		return myHslColor;
	}

	var preLoadIcons = function(){
		var icons = ['/assets/img/chart_web.png', '/assets/img/chart_images.png', '/assets/img/chart_youtube.png']
	    var img0 = new Image();
	    img0.src = icons[0];
	    var img1 = new Image();
	    img1.src = icons[1];
	    var img2 = new Image();
	    img2.src = icons[2];
	}

	/*-------------------- APP INIT ---------------------*/

	// GLOBAL VARS
	var servicesAlias = {
		web: {
			name: 'Google.com',
			search_address: 'https://www.google.com/#q='
		},
		images: {
			name: 'Google Images',
			search_address: 'https://www.google.com/search?site=imghp&tbm=isch&q='
		},
		youtube: {
			name: 'Youtube',
			search_address: 'https://www.youtube.com/results?search_query='
		}
	}

	// Init
	fixHash();
	preLoadIcons();
	common.appendNavBar(true, function(){
		common.attachNavBarEvents();
	});
	var currentHash = getHash();
	if(common.getParameterByName('lightbox') != null){
		createLightbox(function(){
			loadData(currentHash);				
		});
	}else{
		loadData(currentHash);		
	}
});

/*-------------------- DEPRECATED ---------------------*/

// Infinite scroll
// $(window).scroll(function()	{
//     if($(window).scrollTop() == $(document).height() - $(window).height()) {
//         loadData(location.hash.substring(1, location.hash.length));
//     }
// });
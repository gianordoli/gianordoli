/*** Global object that contains the app ***/
var app = app || {};

app.control = (function() {

	// GLOBALS
	var width, height, currDiv, isMoving;

	/*------------------ FUNCTIONS ------------------*/	

	// Show loading
	function callLoader(){
		$('#results-container').empty();
		var loaderContainer = $('<div id="loader-container"></div>')
		var loader = $('<span class="loader"></span>');
		$(loaderContainer).append(loader);
		$('body').append(loaderContainer)
	}

	// Loading the list of domais/countries and services from the server
	var loadData = function(callback){
		console.log('Called loadData.')
        $.post('/start', {}, function(response) {
            // console.log(response);
            if(response.error){
            	throw response.error	
            }else{
            	callback(response);
            }
        });		
	}

	var processData = function(data, callback){
		console.log('Called process data.')
		// remove HOW
		// var words = _.reject(data, function(value, index, list){
		// 	return value.word == 'how';
		// });
		var words = data;

		// group by word (WHY, HOW,...)
		words = _.groupBy(words, function(value, index, list){
			// console.log(value.word);
			return value.word;
		});

		// Sort by date
		_.each(words, function(item, index, list){
			// console.log(item);
			_.sortBy(item, function(it, i, list) {
				return it.date;
			})
			item.reverse();
		});

		// console.log(words);
		// printResults(words);
		// console.log(_.toArray(words));
		callback(_.toArray(words));
	}

	// Show search results
	function printResults(data, callback){
		console.log('Called printResults.')
		// console.log(data);
		$('#results-container').scrollTop(0).empty();
		$('#titles-container').scrollTop(0).empty();
		$('#loader-container').remove();

		_.each(data, function(item, index, list){
			// console.log(item.length);
			var wordDiv = $('<div id="'+index+'" class="word-container"></div>')
						   .scrollLeft(0)
						   .appendTo('#results-container');
			
			var word = $('<div class="word"><h1>'+item[0].word+'</h1></div>')
						.css('top', index*height)
						.appendTo('#titles-container');

			_.each(item, function(item, index, list){
				// console.log(index);
				var predictionsByDayDiv = $('<div class="predictions-container"></div>')
										   .appendTo(wordDiv);
			
				var predictionsUl = $('<ul></ul>')
									 .append('<li>'+convertDateToString(item.date)+'</li>')
									 .appendTo(predictionsByDayDiv);

				_.each(item.results, function(value, key, list){
					var query = 'https://google.com/#q='+replaceSpaces(value);					
					var li = $('<li><a href="'+query+'" target="_blank">'+value+'</a></li>')
							  .appendTo(predictionsUl);
				});
			});
		});
		callback(data);
	}

	// A function where we keep all user's interaction listener (buttons, etc)
	function attachEvents(data) {
		console.log('Called attachEvents.');

		$('#about-bt').off().on('click', function(){
			if($('#about-container').css('display') == 'none'){
				$('#about-container').show();
				$(this).html('<img src="img/close_bt.png">');
			}else{
				$('#about-container').hide();
				$(this).html('About');
			}
		});

		document.onkeydown = checkKey;

		$('#right, #left').off().on('click', function(){
			moveLeftRight($(this).attr('id'));
		});
		$('#up, #down').off().on('click', function(){
			checkUpDown($(this).attr('id'));
		});

		var debounce;
		$(window).resize(function() {
		    clearTimeout(debounce);
		    debounce = setTimeout(doneResizing, 500); 
		});
		
		function doneResizing(){
			// console.log(data);
			initGlobalVars();
			printResults(data, function(){
				attachEvents(data);
				showHideArrows();
			});
		}
	}

	var initGlobalVars = function(){
		width = window.innerWidth;
		height = window.innerHeight;		
		currDiv = 0;
		isMoving = false;
	}

	var showHideArrows = function(){
		console.log('Called showHideArrows.');

		// UP
		if($('.container').scrollTop() <= 0){
			$('#up').css('display', 'none');
		}		
		// DOWN
		else if($('.container').scrollTop() >= $('#results-container').height() - height){
			$('#down').css('display', 'none');
		}
		// MIDDLE
		else{
			$('#up').css('display', 'inline-block');
			$('#down').css('display', 'inline-block');
		}

		// LEFT/RIGHT
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		var maxScrollLeft = ($('#'+currDiv).children().length - 1) * width;
		
		// LEFT		
		if(currScrollLeft <= 0){
			$('#left').css('display', 'none');
			$('#right').css('display', 'inline-block');
		}
		// RIGHT
		else if(currScrollLeft >= maxScrollLeft){
			$('#left').css('display', 'inline-block');
			$('#right').css('display', 'none');
		}
		// CENTER
		else{
			$('#left').css('display', 'inline-block');
			$('#right').css('display', 'inline-block');
		}

	}

	function checkKey(e) {
		
		if(!isMoving){

		    e = e || window.event;
		    // up arrow
		    if (e.keyCode == '38') {
				checkUpDown('up');
			}

		    // down arrow
		    else if (e.keyCode == '40') {
				checkUpDown('down');
		    }

	        // left arrow
		    else if (e.keyCode == '37') {
      			checkLeftRight('left');
		    }

		    // right arrow
		    else if (e.keyCode == '39') {
		    	checkLeftRight('right');
		    }
		}		
	}	

	var checkUpDown = function(arrow){
		if(arrow == 'up'){
			if($('.container').scrollTop() > 0){
				currDiv --;
				moveUpDown();
			}			
		}else if(arrow == 'down'){
			if($('.container').scrollTop() < $('#results-container').height() - height){
				currDiv ++;
				moveUpDown();
			}
		}
	}

	var moveUpDown = function(){
		isMoving = true;
		// console.log('move');
        $('.container').animate({
			scrollTop: height*currDiv
		}, 500, function(){
			isMoving = false;
			showHideArrows();
		});		
	}

	var checkLeftRight = function(arrow){	
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		var maxScrollLeft = ($('#'+currDiv).children().length - 1) * width;
		if((arrow == 'left' && currScrollLeft > 0) ||
		   (arrow == 'right' && currScrollLeft < maxScrollLeft)){
			moveLeftRight(arrow);
		}
	}

	var moveLeftRight = function(arrow){
		var direction = (arrow == 'left') ? (-1) : (1);
		isMoving = true;
		var currScrollLeft = $('#'+currDiv).scrollLeft();
		$('#'+currDiv).animate({
			scrollLeft: currScrollLeft + (width * direction)
		}, 500, function(){
			isMoving = false;
			showHideArrows();
		});	 		
	}

	/*-------------------- AUXILIAR FUNCTIONS --------------------*/

	// Formats UTC date to MM/DD/YYYY
	function formatDateMMDDYYY(date){
		var newDate = new Date(date);
		var monthString = newDate.getMonth() + 1;
		if (monthString < 10) monthString = '0' + monthString;
		var dateString = newDate.getDate();
		var yearString = newDate.getFullYear();
		return monthString + '/' + dateString + '/' + yearString;
	}

	function convertDateToString(date){
		var newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);
		if(newDate >= yesterday){
			return 'Yesterday'
		}else{
			var monthNames = ["January", "February", "March", "April", "May", "June",
			  "July", "August", "September", "October", "November", "December"
			];

			var monthString = monthNames[newDate.getMonth()];
			var dateString = newDate.getDate();
			var yearString = newDate.getFullYear();
			return monthString + ' ' + dateString + ', ' + yearString;		
		}
	}

	var replaceSpaces = function(query){
		while(query.indexOf(' ') > -1){
			query = query.replace(' ', '+') 
		}
		return query;
	}

	var init = function() {
		callLoader();
		initGlobalVars();
		loadData(function(data){
			processData(data, function(processedData){
				printResults(processedData, function(finalData){
					attachEvents(finalData);
					showHideArrows();
				});
			});		
		});	
	}

	return{
		init: init
	}
})(window, document, jQuery, _);

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function(){
  app.control.init();  
});
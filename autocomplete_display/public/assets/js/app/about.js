define(['./common'], function (common) {

	/*-------------------- MAIN FUNCTIONS --------------------*/
	var loadData = function(){

		console.log('Calling loadData.');

		$.post('/about', {}, function(response) {
	        // console.log(response);
	        if(response.error){
	        	throw response.error

	        // Loaded results
	        }else{
	        	console.log('Got response from server.');
	        	console.log(response);
	        	processData(response)
	        }
	    });
	}

	var processData = function(data){

		console.log('Called processData.');

		var groupedbyService = _.groupBy(data['results'], function(item, index, list){
			return item['service'];
		});
		// console.log(groupedbyService);
		
		for(var key in groupedbyService){
			// console.log(key);
			// console.log(groupedbyService[key]);
			groupedbyService[key] = _.groupBy(groupedbyService[key], function(item, index, list){
				return item['letter'];
			});
			// console.log(groupedbyService[key]);

			for(var letter in groupedbyService[key]){
				groupedbyService[key][letter] = _.map(groupedbyService[key][letter], function(item, index, list){
					return item['query'];
				});
			}
			groupedbyService[key] = _.toArray(groupedbyService[key]);			
		}

		appendResults(groupedbyService);
	}

	var appendResults = function(data){

		console.log('Appending results...');

		showPredictions(data, 0);	
	}

	var showPredictions = function(data, i){
		for(var key in data){
			// Letter
			var letter = data[key][i][0].substring(0, 1);
			$('.animation#' + key + ' > .search-box').html(letter);
			
			// Predictions
			var predictions = data[key][i];
			$('.animation#' + key + ' > .predictions').empty();
			var predictionsList = $('<ul></ul>');
			for(var j in predictions){
				$(predictionsList).append('<li>' + predictions[j] + '</li>');
			}
			$('.animation#' + key + ' > .predictions').append(predictionsList);
		}
		
		$('.animation > .search-box').css('visibility', 'visible');
		$('.animation > .predictions').css('visibility', 'visible');
		
		// Net iteration
		i ++;
		if(i >= data['web'].length){
			i = 0;
		}

		setTimeout(function(){
			showPredictions(data, i);
		}, 2000);
	}

	/*-------------------- APP INIT ---------------------*/
	// GLOBAL VARS
	var servicesAlias = {
		web: 'Google.com',
		images: 'Google Images',
		youtube: 'Youtube'
	}
	
	common.appendNavBar(false, function(){
		common.attachNavBarEvents();
	});
	loadData();

});
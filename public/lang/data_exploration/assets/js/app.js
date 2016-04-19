var app = app || {};

app.main = (function(){

	/*------------------ CATEGORIES -------------------*/
	var loadPathsOfStudy = function(callback){

		console.log('loadPathsOfStudy');

		d3.json('assets/data/lang_paths_of_study_fall_2015.json', function(error, data) {			
			if (error) return console.warn(error);
			// console.log('Loaded categories:');
			// console.log(data);

			// 1. Converting to object
			var objData = [];
			for(var i = 0; i < data.length; i++){
				objData.push({
					path_of_study: data[i],
					count: 0
				})
			}

			// 2. Sorting alphabetically
			objData.sort(function(a, b){
			   return d3.ascending(a.path_of_study, b.path_of_study);
			});

			callback(objData);
		});
	};

	var loadCourses = function(pathsOfStudy, callback){
		
		console.log('loadCourses');

		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			var courses = _.sortBy(data, function(o){
				return o.path_of_study.length;
			}).reverse();

			for(var i = 0; i < pathsOfStudy.length; i++){
				for(var j = 0; j < courses.length; j++){
					if(courses[j].path_of_study.indexOf(pathsOfStudy[i].path_of_study) > 0){
						pathsOfStudy[i].count ++;
					}
				}
			}
			pathsOfStudy = _.sortBy(pathsOfStudy, function(o){
				return o.count;
			}).reverse();

			displayChart(pathsOfStudy, courses);
		});
	};	

	var displayChart = function(pathsOfStudy, courses){

		console.log('displayChart');
		console.log(pathsOfStudy);
		console.log(courses);
	    
        var margin = {top: 300, right: 300, bottom: 300, left: 300};
        var width  = window.innerWidth - margin.left - margin.right;
        var height = window.innerHeight*4 - margin.top - margin.bottom;

	    var xScale = d3.scale.ordinal()	    
	    	.rangeRoundBands([0, width], 0.5)
	    	.domain(pathsOfStudy.map(function(obj){
	    		return obj.path_of_study;
	    	}))	    	
	    	;

	    var yScale = d3.scale.ordinal()
	    	.rangeRoundBands([0, height], 0.5)
	    	.domain(courses.map(function(obj){
	    		return obj.title;
	    	}))
	    	;

        var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			;

        var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			;

		var svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight*4)
            ;

        var chart = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
				.selectAll("text")
			    .attr("y", 0)
			    .attr("x", 9)
			    .attr("dy", ".35em")
			    .attr("transform", "rotate(-90)")
			    .style("text-anchor", "end")
           ;

        chart.append("g")
			.attr("class", "x axis")
			.call(xAxis)
				.selectAll("text")
			    .attr("y", 0)
			    .attr("x", 9)
			    .attr("dy", ".35em")
			    .attr("transform", "rotate(-90)")
			    .style("text-anchor", "start")
           ;

        chart.append("g")
			.attr("class", "y axis")                
			.call(yAxis)
				.selectAll("text")
			    .append('tspan')
			    .attr('dx', 10)
			    // .text('yo!')
			    .text(function(d, i){
			    	return courses[i]['path_of_study'].length;
			    })
			;

		var course = chart.selectAll('.courses')
			.data(courses)
			.enter()
			.append('g')
			.classed('courses', true)
		    .attr("transform", function(d, i) {
		    	return "translate(0, "+yScale(d.title)+")";
		    })
			;

		var squares = course.selectAll('rect')
			.data(function(d){
				return d.path_of_study;
			})
			.enter()
			.append('rect')
			.attr('x', function(d, i){
				return xScale(d);
			})
			.attr("width", xScale.rangeBand())
			.attr('height', yScale.rangeBand())
			;


	}
	

	var init = function(){
		console.log('Called init');
		loadPathsOfStudy(function(data){
			loadCourses(data);
		});
		
	};

	return {
		init: init,
		// selected: selected,
		// updateGraph: updateGraph
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);
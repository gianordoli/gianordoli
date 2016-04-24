var app = app || {};

app.main = (function(){

    var width  = window.innerWidth;
    var height = window.innerHeight;
    var svg;		// SVG object
    var courses;	// Course data loaded async with subject data
    
    var prevFilter	= [];	// Will keep track of user selections
    
    var selected	= [];	// Paths of study selected by user
    var anchors		= [];	// Arc coordinates; used as 'anchors' on the network graph;
    					 	// Will compute after drawing them.

	var graph;				// Network graph with courses;
	var searchEngineIndex;

	/*------------------ CATEGORIES -------------------*/
	// Categories change from term to term. Think about how to handle arc updates
	var loadPathsOfStudy = function(){
		// d3.csv('assets/data/fall_2015_path_of_study.tsv', function(error, data) {
		d3.json('assets/data/lang_paths_of_study_fall_2015.json', function(error, data) {			
			if (error) return console.warn(error);
			// console.log('Loaded categories:');
			// console.log(data);

			// 1. Converting to object
			var objData = [];
			for(var i = 0; i < data.length; i++){
				objData.push({
					path_of_study: data[i]
				})
			}

			// 2. Sorting alphabetically
			objData.sort(function(a, b){
			   return d3.ascending(a.path_of_study, b.path_of_study);
			});			
			
			// 3. Checking number of lines
			for(var i = 0; i < objData.length; i++){
				objData[i] = checkLines(objData[i]);
			}

			// console.log(data);
			displayPathsOfStudy(objData);
		});

		var checkLines = function(_obj){
			var obj = _obj;
			if(obj['path_of_study'].indexOf(' ') > -1){
				obj['1stLine'] = obj['path_of_study'].substring(0, obj['path_of_study'].indexOf(" "));
				obj['2ndLine'] = obj['path_of_study'].substring(obj['path_of_study'].indexOf(" ") + 1, obj['path_of_study'].length);
			}else{
				obj['1stLine'] = obj['path_of_study'];
			}
			return obj;
		};		
	};

	var displayPathsOfStudy = function(dataset){

		// VARS
		var radius = 490/2;
		var arcWeight = (550 - 490)/2;

		// FUNCTIONS
		// D3's SVG shape helper function
		var arc = d3.svg.arc()
				    .outerRadius(radius)
				    .innerRadius(radius + arcWeight);

		// D3's data helper function
		var pie = d3.layout.pie()
				    .sort(null)
				    .value(function(d, i) { return 1; }); // Any value would do. We're just telling D3 that all arcs are equal
		// console.log(pie(dataset));

		svg = d3.select("body")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            ;

		var pathOfStudyChart = svg.append("g")
			.attr('id', 'path-of-study-chart')
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
			;
		
		// Each combo of arc and text will be inside this group
		var g = pathOfStudyChart.selectAll(".path-of-study")
			.data(pie(dataset))
			.enter()
			.append("g")
			.classed("path-of-study", true)
			;

		// Arcs
	  	var arcs = g.append("path")
			.attr("d", arc)
			.attr("id", function(d, i){
				return 'arc_' + i;
			})
			.on('click', function(d, i){

				// Toggle class and remove any added style
				d3.select(this).classed("selected", !d3.select(this).classed("selected"))
					.style('fill', null)
					.style('stroke', null)
					;

				// Add/remove from selected list
				var n = selected.indexOf(d.data.path_of_study);
				if(n < 0){
					selected.push(d.data.path_of_study);	
				}else{
					selected.splice(n, 1);
				}
				updateGraph();
			})
			;

		// Labels
		// <text>
		var text = g.append("text")
		
			// <textPath>
			var textPath = text.append("textPath")		
			    .attr("xlink:href",	function(d, i){
			    	return '#arc_' + i;
			    })
			    // .attr("startOffset", 35)
			    ;

				// <tspan> 1stLine
				textPath.append('tspan')
					.text(function(d, i){
							return d.data['1stLine'];
					})
					.attr("dy", function(d, i){
						if(!d.data.hasOwnProperty('2ndLine')){
							return - arcWeight + arcWeight/2;
						}else{
							return - arcWeight + arcWeight/3;
						}
					})
				// <tspan> 2ndLine
				.each(function(d){
					// console.log(d3.select(this));
					if(d.data.hasOwnProperty('2ndLine')){

						var parent = d3.select(this.parentNode);
						var firstLineWidth = this.parentNode.getComputedTextLength();

						parent
							.append('tspan')
							.text(function(d, i){
									return d.data['2ndLine'];
							})
							.each(function(d){
								var secondLineWidth = this.getComputedTextLength();
								d3.select(this)
									// .attr("dx", -(firstLineWidth + secondLineWidth)/1.7)	// CENTERED TEXT
									.attr("dx", -firstLineWidth)
									.attr("dy", arcWeight/3)
									;
							})
							;
					}
				})
				;

		function getAnchors(_arcs){

			console.log('getAnchors()');

			// Compute coords so we can draw the network later
			_arcs.each(function(d, i){
				var arcPosition = this.getPointAtLength(this.getTotalLength()*0.7);
				anchors.push({
					path_of_study: d.data.path_of_study,
					anchorX: arcPosition.x,
					anchorY: arcPosition.y,
					isAnchor: true
				});
			})
			;
			// console.log(anchors);
		}		

		// Just a debug function, not really using it now
		function drawAnchors(){

			console.log('drawAnchors()');

			pathOfStudyChart.selectAll("circle")
				.data(anchors)
				.enter()
				.append('circle')
				.attr('cx', function(d, i){
					console.log(d);
					return d.anchorX;
				})
				.attr('cy', function(d, i){
					return d.anchorY;
				})
				.attr('r', 20)
				.attr('fill', 'black')
			;
		}

		getAnchors(arcs);
		drawGraph();
	}

	/*-------------------- COURSES --------------------*/
	var loadCourses = function(){
		d3.json('assets/data/lang_courses_fall_2015.json', function(error, data) {
			if (error) return console.warn(error);
			// console.log('Loaded courses:');
			// console.log(data);
			courses = data;			// Won't change unless navigating to a different term
		});
	};

	function createSearchEngine(){
		searchEngineIndex = lunr(function(){
		    // boost increases the importance of words found in this field
		    this.field('title', {boost: 10});
		    // this.field('description', {boost: 2});
		    // the id
		    this.ref('course_number');
		});
	}

	function addSearchListener(){
		
		var searchBox = document.getElementById('search-box');
		searchBox.addEventListener('keyup', function(e){
			if(e.keyCode === 13){
				search();
			}
		});

		var searchButton = document.getElementById('search-button');
		searchButton.addEventListener('mouseup', function(){
			search();
		});

		function search(){
			var query = searchBox.value;
			// console.log(query);
			var results = searchEngineIndex.search(query);
			console.log(results);
			highlightResults(results);
		}
	}

	function highlightResults(results){
		// console.log('Called highlightResults');
		var opacityScale = d3.scale.linear()
			.domain([0, 1])
			.range([0, 0.5])
			;

		var ulCourses = d3.select('#courses-list');
		// Loop through each course on the list...
		ulCourses.selectAll('li')
			.each(function(d, i){
				var thisCourse = d3.select(this);
				// First, let's clean up any previous formatting
				thisCourse.style('background-color', null);

				// Now loop through each search result
				for(var j = 0; j < results.length; j++){
					// If course's and result's id matches...
					if(d['course_number'] === results[j]['ref']){
						// Highlight course based on its resulting score
						d3.select(this)
							.style('background-color', 'rgba(232, 46, 33, '+opacityScale(results[j]['score'])+')')
							;
					}
				}
			});
	}

	function updateSearchEngine(){
		for(var i = 0; i < prevFilter.length; i++){
		    searchEngineIndex.add({
		    	title: prevFilter[i]['title'],
		        course_number: prevFilter[i]['course_number']
		    });			
		}
		// console.log(searchEngineIndex);
	}

	function updateCoursesList(){
		
		// Paths of Study
		var ulPathsOfStudy = d3.select('#paths-of-study-list');
		
		var pathOfStudy = ulPathsOfStudy.selectAll('li')
			.data(selected)
			;

		var pathOfStudyEnter = pathOfStudy
			.enter()
			.append('li')
			.text(function(d, i){
				return d;
			})
			;

		var pathOfStudyExit = pathOfStudy
			.exit()
			.remove()
			;		

		// Search Box		
		d3.select('#search-container').classed("visible", prevFilter.length > 0);
		// console.log(prevFilter.length > 0);
		// console.log(d3.select('#search-box').classed());
		
		// Courses
		var ulCourses = d3.select('#courses-list');
		// console.log(prevFilter);
		
		var courseSelection = ulCourses.selectAll('li')
			.data(prevFilter)
			;

		var courseEnter = courseSelection
			.enter()
			.append('li')
			;

		var courseUpdate = courseSelection
			.attr('id', function(d, i){
				return 'course_' + d.course_number;
			})
			.text(function(d, i){
				return d.title;
			})
			;

		var courseExit = courseSelection
			.exit()
			.remove()
			;

	}

	// The donut 'communicates' with the graph through these 2 functions:
	// drawGraph and updateGraph
	// updateGraph also updates the list on the right side and the search
	function drawGraph(){

		console.log('drawGraph()');

		graph = new myGraph();
		graph.setup();

		// debugLinks();

		// Debugging, not really using this now
		function debugLinks(){
			var source = '[{"title":"Rvolution & Pop Media in Hist","path_of_study":["Global Studies"],"course_number":"910"},{"title":"Documentary Self","path_of_study":["The Arts","Culture & Media","Economics","Literary Studies","Journalism + Design","Religious Studies","Screen Studies"],"course_number":"920"},{"title":"The Spiritual Autobiography","path_of_study":["Global Studies","Anthropology","Contemporary Music","Journalism + Design","Psychology","Education Studies","The Arts","Liberal Arts","Literary Studies","Culture & Media","Economics","History","Sociology","Theater","Religious Studies","Interdisciplinary Science","Philosophy","Social Inquiry","Politics"],"course_number":"1000"},{"title":"Reading Poetry","path_of_study":["The Arts","Interdisciplinary Science"],"course_number":"1002"},{"title":"Fantastic Short Fiction","path_of_study":["Economics"],"course_number":"1003"},{"title":"Self and Social Structure","path_of_study":["Liberal Arts"],"course_number":"1008"},{"title":"Fundamentals of Western Music","path_of_study":["Contemporary Music","Screen Studies"],"course_number":"1010"}]';
			var sourceData = JSON.parse(source);
			console.log(sourceData);
			var i = 0;
			var test = setInterval(function(){
				// if(i < 3){
				if(i < sourceData.length){
					console.log('add node');
					graph.addNode(sourceData[i]);
					i++;
				}else{
					clearInterval(test);
				}
			}, 1000);
		}

		createSearchEngine();
		addSearchListener();
	}

	function updateGraph(){
		
		// This filter will loop through each course...
		var newFilter = _.filter(courses, function(o) {
			var nMatches = 0;
			// ..., loop through each selected path of study and...
			for(var i = 0; i < selected.length; i++){
				// ...for each match found within
				// selected[i] x o.path_of_study
				if(o.path_of_study.indexOf(selected[i]) > -1){
					// Add one to this counter.
					nMatches ++;
				}
			}
			// If by the end the course has as many matches as selected paths of study
			// AND there is something selected
			// THEN include it into our new filter
			return nMatches === selected.length && selected.length > 0;
		});
		// console.log('newFilter: ' + newFilter.length);
		// console.log(newFilter);
		// console.log('prevFilter: ' + prevFilter.length);
		// console.log(prevFilter);

		// Remove nodes
		if(prevFilter.length > newFilter.length){
			var diff = _.differenceBy(prevFilter, newFilter, 'course_number');
			if(diff.length > 0){
				for(var i = 0; i < diff.length; i++){
					graph.removeNode(diff[i]['id']);
				}
			}
		}

		// Add nodes
		else{	
			for(var i = 0; i < newFilter.length; i++){
				graph.addNode(newFilter[i]);
			}
		}

		prevFilter = newFilter;

		graph.update();			// update graph
		updateCoursesList();	// update courses list on the right-side panel
		updateSearchEngine();
	}

	// (list of courses, position of arcs, selected pathOfStudy)
	function myGraph(){

		var newGraph = {};
		
		console.log('myGraph()');
		// console.log(data);
		// console.log(anchors);
		// console.log(selected);

		var radius, linkDist;	// LAYOUT
		var nodes, links;		// DATA
		var force;				// D3 force-directed layout
		var coursesChart;		// SVG object


		/*---------- PRIVATE ---------*/
		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
		  	return d.title;
		  })
		  ;


        var addIdToNode = function(_obj){
        	var obj = _obj;
        	obj.id = obj.isAnchor ? obj.path_of_study : obj.course_number;
        	return obj;
        };

		var addRadiusToNode = function(_obj){
			var obj = _obj;
			obj['radius'] = obj.isAnchor ? 1 : radius;
			return obj;
		};

		var addLinkCountToNode = function(_obj){
			var obj = _obj;
			obj['link_count'] = 0;
			return obj;
		};

		var fixAnchor = function(_obj){
			var obj = _obj;
			// console.log(nodes[i]);
			obj.fixed = true;
			obj.x = obj.anchorX + width/2;
			obj.y = obj.anchorY + height/2;
			// console.log(nodes[i]);
			return obj;
		};

        var findNodeIndexById = function (id) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return i;
                }
            }
        };

		var addLinks = function(obj){
			// Check for connections and add links for each new node
			if(!obj.isAnchor){
				// Loop through anchors
				for(var i = 0; i < anchors.length; i++){
					
					if(obj['path_of_study'].indexOf(anchors[i]['path_of_study']) > -1){
						
						var sourceIndex = findNodeIndexById(obj['course_number']);			// Course
						var targetIndex = findNodeIndexById(anchors[i]['path_of_study']);	// Anchor
						// console.log(sourceIndex);
						var newLink = { source: sourceIndex,
										target: targetIndex,
										value: 	1
									};
						links.push(newLink);
						
						// Increase link count on node
						nodes[targetIndex]['link_count'] ++;
						// console.log(targetIndex + ': ' + nodes[targetIndex]['link_count']);
						d3.select('#arc_' + targetIndex).classed("linked", true)
							.style('fill', null)
							.style('stroke', null)
							;
					}					
				}
			}
		};

		/*---------- PUBLIC ----------*/
        newGraph.addNode = function(obj) {
        	obj = addIdToNode(obj);		// Anchor id: path_of_study; Course id: course_number
        	obj = addRadiusToNode(obj);
        	obj = addLinkCountToNode(obj);

        	// Before really updating the graph, let's check if this add haven't been yet added
        	if(findNodeIndexById(obj.id) === undefined){
	            nodes.push(obj);

	        	if (obj.isAnchor) {			// We need to make anchors fixed
	        		obj = fixAnchor(obj)
	        	}else{						// And add links to courses
					addLinks(obj);
					// console.log(links);
	        	}

	            newGraph.update();
        	}
        };

        newGraph.removeNode = function(id){
            var i = 0;
            var nodeIndex = findNodeIndexById(id);
            // Remove links; gotta use a while loop, because the size of the array will change
            while (i < links.length) {
                if ((links[i]['source']['index'] === nodeIndex) || (links[i]['target']['index'] === nodeIndex)) {
                    
                    // Decrease link count on node
                    var targetIndex = links[i]['target']['index'];
                    nodes[targetIndex]['link_count'] --;
                    if(nodes[targetIndex]['link_count'] === 0){
                    	d3.select('#arc_' + targetIndex).classed('linked', false)
                    		.style('fill', null)
							.style('stroke', null)
							;
                    }

					// Remove link
                    links.splice(i, 1);
                }
                else i++;
            }
            nodes.splice(findNodeIndexById(id), 1);
            newGraph.update();
        }

		/*---------- PUBLIC: setup and update ----------*/
		newGraph.setup = function(){

			console.log('myGraph.setup()');
			
			radius = 12;
			linkDist = width/10;
			nodes = [];
			links = [];
			force = d3.layout.force()
				.nodes(nodes)
				.links(links)
				;
			coursesChart = svg.append("g")
				.attr('id', 'courses-chart')		
				;

			svg.call(tip);

			// Adding anchors to nodes
			for(var i = 0; i < anchors.length; i++){
				newGraph.addNode(anchors[i]);
			}
			// newGraph.updateLinks();

			newGraph.update();
		}        		

		newGraph.update = function(){
			
			// console.log('myGraph.update()');

			// Links
			var linkSelection = coursesChart.selectAll('line')
	      		.data(links)
	      		;

	      	var linkEnter = linkSelection.enter()
	    		.append("line")
	    		;

	    	var linkUpdate = linkSelection
	      		.style("stroke-width", function(d) { return Math.sqrt(d.value); })
	      		;

	      	var linkExit = linkSelection
	      		.exit()
	      		.remove()
	      		;

	      	// Nodes
			var nodeSelection = coursesChart.selectAll("circle")
				.data(nodes);

			var nodeEnter = nodeSelection.enter()
				.append("circle")
				;

			var nodeUpdate = nodeSelection
			    .attr("r", radius)
			    .attr("id", function(d, i){
			    	return d.title;
			    })
			    .attr('class', function(d, i){
			    	// return 'course';
			    	// Anchors won't be visible
					return d.isAnchor ? 'anchor' : 'course';
			    })
			    .on('click', function(d, i){
			    	// console.log(d.path_of_study.length);
			    	// console.log(d.path_of_study);
			    	// newGraph.removeNode(d.id);
			    	console.log(d);
			    })
				.on('mouseover', function(d, i){
					tip.show(d);
					d3.select('#course-description')
						// .text(d.description)
						.text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non bibendum sem, sit amet blandit justo. Quisque volutpat viverra nulla, sed vehicula purus auctor a. Nulla auctor luctus euismod. Proin sem arcu, molestie id sapien vitae, mollis consectetur lorem. Donec vulputate lacinia vulputate. Sed rhoncus lectus at sem accumsan, a vulputate metus mattis. Aenean vitae dictum nisl. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean ut lacus a elit lacinia gravida non nec nisl. In vel nisl nec enim imperdiet pretium dictum non elit. Proin scelerisque a lectus a hendrerit. Curabitur sit amet tempus turpis, vel malesuada augue. Maecenas dapibus arcu id est interdum, posuere fringilla augue sodales.");
						;

					// Highlight course name on right-side list
					d3.select('li#course_'+d.course_number)
						.classed('mouseover', true)
						;
				})
				.on('mouseout', function(d, i){
					tip.hide();
					d3.select('#course-description')
						.text('')
						;
					d3.select('li#course_'+d.course_number)
						.classed('mouseover', false)
						;						
				})			    
	      		// .each(function(d, i){	
	      		// 	if(!d.isAnchor){
	      		// 		// Let's make nodes show up somewhere inside the donut
	      		// 		// Otherwise they might get stuck outside
	      		// 		var iniX = width/2 + Math.round(Math.random()*200) * (Math.random() < 0.5 ? -1 : 1);
	      		// 		var iniY = height/2 + Math.round(Math.random()*200) * (Math.random() < 0.5 ? -1 : 1);
		      	// 		d.x = iniX;
		      	// 		d.y = iniY;
		      	// 		d.px = iniX;
		      	// 		d.py = iniY;
	      		// 	}
	      		// })
			    ;

			var nodeExit = nodeSelection
				.exit()
				.remove()
				;

			force.on("tick", function(e) {
				var q = d3.geom.quadtree(nodes),
					i = 0,
					n = nodes.length;

				while (++i < n) q.visit(collide(nodes[i]));

                nodeSelection.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });

				linkSelection.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
			});

			force.size([width, height])
			    .gravity(0.08)			// force towards center
			    .linkDistance(linkDist)	// standard link length
			    .linkStrength(0.1)		// how flexible the links are
			    ;

			force.start();


			// Anytime we update the graph, we need to:

			// 1. check links to the selected anchor and make them invisible
	      	linkSelection.each(function(d, i){
	      		d3.select(this).classed("from-selected", function(d){
					// After the force starts running, our { source: 0, target: 2 } link array changes
					// Instead of pointing to a index, target and source point to the actual objects	      		
	      			return selected.indexOf(d['target']['path_of_study']) > -1;
	      		})	      		
	      	});

	      	// 2. Update the arcs color based on the link count
            var linkCountScale = d3.scale.linear()
                           .domain([                            // INPUT
                                0,
                                d3.max(nodes, function(d, i){
                                    return d.link_count;
                                })
                            ])
                           .range([100, 50]);                  // OUTPUT

			nodeSelection.each(function(d, i){
				
				var arc = d3.select('#arc_' + i);

				// If we have something selected...
				if(selected.length > 0){

					// Check if this node is an anchor
					if(d.isAnchor){

						// Check if it isn't part of the selection
						if(!arc.classed('selected') && arc.classed('linked')){
							var color = 'hsl(0, 0%, '+linkCountScale(d.link_count)+'%)';
							arc.style('fill', color);						
						}
					}
				}		
			});
		}

		function collide(node) {
		  var r = node.radius + 16,
		      nx1 = node.x - r,
		      nx2 = node.x + r,
		      ny1 = node.y - r,
		      ny2 = node.y + r;
		  return function(quad, x1, y1, x2, y2) {
		    if (quad.point && (quad.point !== node)) {
		      var x = node.x - quad.point.x,
		          y = node.y - quad.point.y,
		          l = Math.sqrt(x * x + y * y),
		          r = node.radius + quad.point.radius;
		      if (l < r) {
		        l = (l - r) / l * .5;
		        node.x -= x *= l;
		        node.y -= y *= l;
		        quad.point.x += x;
		        quad.point.y += y;
		      }
		    }
		    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		  };
		}

		return newGraph;
	};	

	var init = function(){
		console.log('Called init');
		loadPathsOfStudy();
		loadCourses();
	};

	return {
		init: init,
		// selected: selected,
		// updateGraph: updateGraph
	};
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);
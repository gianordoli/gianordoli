/* Your code starts here */

define(function (require) {
	
	console.log('Loaded admin.js');

	var loadProjects = function(results){
		console.log(results);

		var ui = $('<ul class="sortable"></ul>');
		$(ui).sortable({ update: function(event, ui){
				updateProjectsOrder(ui);
			}
		});
    	$(ui).disableSelection();

		results.forEach(function(item, index, array){
			console.log(item);
			
			var li = $('<li class="project-li" id="'+item.objectId+'"></li>');
			
			var checkbox = $('<input class="publish-input" type="checkbox">');
			$(checkbox).prop('checked', item.publish);
			var order = $('<input class="order-input" type="text" disabled>');
			$(order).val(item.order);
			var title = $('<span>'+item.title+'</span>');
			var edit = $('<button class="edit-bt">Edit</button>');
			var del = $('<button class="del-bt">Delete</button>');
			
			$(li).append(checkbox)
				 .append(order)
				 .append(title)
				 .append(edit)
				 .append(del);

			$(ui).append(li);
		});

		var update = $('<button id="update-bt">Update</button>');

		$('#projects-list').append(ui)
						   .append(update);

		attachEvents();
	}

	var updateProjectsOrder = function(ui){
		var parent = $(ui.item).parent();
		var list = $(parent).children();
		$.each(list, function(index, value){
			// console.log(index);
			$(value).children('.order-input').val(index);
		});
	}

	var login = function(){
        // Ajax call
        $.post('/login', {
            login: $('#login').val(),
            password: $('#password').val()
        }, function(response) {
            console.log(response);
            if(response.error != undefined){
            	console.log(response.error);
            }else{
            	console.log('Loading projects.');
            	loadProjects(response.results);
            }
        });		
	}

	var updateAllProjects = function(){
		console.log('Updating projects.');
		var projects = [];
		var lis = $('.project-li');
		$.each(lis, function(index, value){
			console.log(value);
			var project = {
				id: $(value).attr('id'),
				publish: $(value).children('.publish-input').prop('checked'),
				order: $(value).children('.order-input').val()
			};
			/*----- IMPORTANT! -----*/
			// You can't send JSON objects through AJAX calls!
			// Gotta stringify first, toherwise they'll get on the server
			// like a string [object Object]
			projects.push(JSON.stringify(project));
		});
		console.log(projects);

        // Ajax call
        $.post('/updateall', {
        	'projects[]': projects
        }, function(response) {
            console.log(response.error);
            // if(response.error != undefined){
            // 	console.log(response.error);
            // }else{
            // 	console.log('Loading projects.');
            // 	loadProjects(response.results);
            // }
        });			
	}
	
	var attachEvents = function() {
	    console.log('Attaching Events');

	    // register page
	    $('#btn-login').off('click').on('click', function() {
	    	login();
	    });

	    /*----- PROJECTS -----*/
	    $('#update-bt').off('click').on('click', function() {
	    	updateAllProjects();
	    });
	    $('.edit-bt').off('click').on('click', function() {
	    });
	    $('.del-bt').off('click').on('click', function() {
	    });
	};	

	attachEvents();
});
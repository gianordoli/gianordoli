/* Your code starts here */

define(function (require) {
	
	console.log('Loaded admin.js');

	var loadProjects = function(results){
		console.log(results);

		var projectsList = $('<div id="projects-list" class="container"></div>');
		
		var divTitle = $('<h1>Projects</h1>');

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

		var update = $('<button class="update-bt">Update</button>');

		$(projectsList).append(divTitle)
				  	   .append(ui)
				  	   .append(update);

		$('body').append(projectsList);

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
        $.post('/update-all', {
        	'projects[]': projects
        }, function(response) {
            console.log(response);
        });			
	}

	var expandProject = function(projectId){
		console.log(projectId);
        // Ajax call
        $.post('/expand-project', {
        	id: projectId
        }, function(response) {
            console.log(response);
            var projectContainer = $('<div id="'+response.objectId+'" class="container project"></div>');
            
            var title = $('<input type="text" class="title-input">');
            $(title).val(response.title);
            var desc = $('<textarea rows="20" cols="50" class="content-textarea">'+response.content+'</textarea>');
            var imagesUl = $('<ul></ul>');

            response.images.forEach(function(item, index, array){
            	var li = $('<li class="images-li"></li>');
            	var checkbox = $('<input type="checkbox" class="homepage-input">');
            	console.log(item.homepage);
            	$(checkbox).prop('checked', item.homepage);
            	var span = $('<span>'+item.url+'</span>');
            	
            	$(li).append(checkbox)
            			   .append(span);

            	$(imagesUl).append(li);
            });
			// var add = $('<button id="add-images-bt">Add Images</button>');
			var cancel = $('<button class="cancel-bt">Cancel</button>');
			var update = $('<button class="update-bt">Update</button>');

            $(projectContainer).append(title)
            				   .append('<br>')
            				   .append(desc)
            				   .append('<br>')
            				   .append(imagesUl)
            				   // .append(addImages)
            				   // .append('<br>')
            				   .append(cancel)
            				   .append(update);

            $('body').append(projectContainer);

            attachEvents();
        });
	}

	var updateProject = function(parent){
		// console.log(parent);
		var id = $(parent).attr('id');
		var title = $(parent).children('.title-input').val();
		var content = $(parent).children('.content-textarea').val();
		var imagesList = $(parent).find('.images-li');
		// console.log(imagesList);
		var images = [];
		$.each(imagesList, function(index, item){
			console.log(item);
			var image = {
				url: $(item).children('span').html(),
				homepage: $(item).children('input.homepage-input').prop('checked')
			}
			images.push(image);
		});
		console.log(images);
		var obj = {
			id: id,
			title: title,
			content: content,
			images: images
		}
		console.log(obj);
		obj = JSON.stringify(obj);

        // Ajax call
        $.post('/update-project', {
        	data: obj
        }, function(response) {
            console.log(response);
            // remove this container
            $(parent).remove();
            // update project list at the top of the page
            $('#projects-list').find('li#'+id).children('span').html(title);
        });	
	}

	var collapseProject = function(parent){
		$(parent.remove());
	}	
	
	var attachEvents = function() {
	    console.log('Attaching Events');

	    // register page
	    $('#btn-login').off('click').on('click', function() {
	    	login();
	    });

	    /*----- PROJECTS LIST -----*/
	    $('#projects-list .update-bt').off('click').on('click', function() {
	    	updateAllProjects();
	    });
	    $('#projects-list .edit-bt').off('click').on('click', function() {
	    	// console.log($(this).parent());
	    	expandProject($(this).parent().attr('id'));
	    });
	    $('#projects-list .del-bt').off('click').on('click', function() {
	    });

	    /*----- PROJECTS DETAIL -----*/
	    $('.project .update-bt').off('click').on('click', function() {
	    	// console.log($(this).parent().attr('id'));
	    	updateProject($(this).parent());
	    });	    
	    $('.project .cancel-bt').off('click').on('click', function() {
	    	collapseProject($(this).parent());
	    });		    
	};	

	attachEvents();
});
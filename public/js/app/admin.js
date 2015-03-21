/* Your code starts here */

define(function (require) {
	
	console.log('Loaded admin.js');

	var login = function(){
    	
    	localStorage['usr'] = $('#login-input').val();
    	localStorage['pwd'] = $('#password-input').val();

        // Ajax call
        $.post('/admin-start', {
            login: localStorage['usr'],
            password: localStorage['pwd']
        }, function(response) {
            console.log(response);
            if(response.error != undefined){
            	console.log(response.error);
            }else{
            	console.log('Loading projects.');
            	appendProjects(response.results);
            }
        });		
	}


	/*------------------- PARSE -------------------*/

	var updateProjectsOrderAndPublishParse = function(){
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
        $.post('/admin-update-all', {
        	'projects[]': projects,
            login: localStorage['usr'],
            password: localStorage['pwd']        	
        }, function(response) {
            console.log(response);
        });			
	}

	var loadProjectsParse = function(){
        $.post('/admin-load-projects', {
            login: localStorage['usr'],
            password: localStorage['pwd']        	
        }, function(response) {
            console.log(response);
            appendProjects(response.results);
        });	
	}	

	var createOrUpdateParse = function(parent, create){
		// console.log(parent);
		if(!create) var id = $(parent).attr('id');
		var title = $(parent).children('.title-input').val();
		var content = $(parent).children('.content-textarea').val();
		var imagesList = $(parent).find('.images-li');
		// console.log(imagesList);
		var images = [];
		$.each(imagesList, function(index, item){
			console.log(item);
			var image = {
				url: $(item).children('input.url-input').val(),
				homepage: $(item).children('input.homepage-input').prop('checked')
			}
			images.push(image);
		});
		console.log(images);
		var obj = {
			title: title,
			content: content,
			images: images
		}
		if(!create) obj.id = id;
		console.log(obj);
		obj = JSON.stringify(obj);

        // Ajax call
        var route = (create) ? ('/admin-create-project') : ('/admin-update-project');
        $.post(route, {
        	data: obj,
            login: localStorage['usr'],
            password: localStorage['pwd']        	
        }, function(response) {
            console.log(response);
            // remove this container
            $(parent).remove();
            // update project list at the top of the page
            loadProjectsParse();
        });	
	}

	var deleteProjectParse = function(projectId){
		console.log(projectId);

        // Ajax call
        $.post('/admin-delete-project', {
        	id: projectId,
            login: localStorage['usr'],
            password: localStorage['pwd']        	
        }, function(response) {
        	console.log(response);
        	$('#projects-list').find('li#'+projectId).remove();
			updateProjectsOrder($('#projects-list').children('ul'));
        	updateProjectsOrderAndPublishParse();
		});
	}

	var expandProjectParse = function(projectId){
		console.log(projectId);
        // Ajax call
        $.post('/admin-expand-project', {
        	id: projectId,
            login: localStorage['usr'],
            password: localStorage['pwd']           	
        }, function(response) {
            console.log(response);
            expandProject(response);
        });
	}	
	/*---------------------------------------------*/


	/*-------------------- DOM --------------------*/
	var appendProjects = function(results){
		console.log(results);
		
		$('#projects-list').remove();

		var projectsList = $('<div id="projects-list" class="container"></div>');
		
		var divTitle = $('<h1>Projects</h1>');

		var ui = $('<ul class="sortable"></ul>');
		$(ui).sortable({ update: function(event, ui){				
				var parent = $(ui.item).parent();
				updateProjectsOrder(parent);
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

		var addProject = $('<button class="add-project-bt">Add</button>');
		var update = $('<button class="update-bt">Update</button>');

		$(projectsList).append(divTitle)
				  	   .append(ui)
				  	   .append(addProject)
				  	   .append(update);

		$('body').append(projectsList);

		attachEvents();
	}

	var updateProjectsOrder = function(parent){
		var list = $(parent).children();
		$.each(list, function(index, value){
			// console.log(index);
			$(value).children('.order-input').val(index);
		});
	}

	var expandProject = function(response){
        var projectContainer = $('<div id="'+response.objectId+'" class="container project"></div>');
        
        var title = $('<input type="text" class="title-input">');
        $(title).val(response.title);
        var desc = $('<textarea rows="20" cols="50" class="content-textarea">'+response.content+'</textarea>');
        var imagesUl = $('<ul></ul>');

        response.images.forEach(function(item, index, array){
        	var li = createImageInput(item);
        	$(imagesUl).append(li);
        });
		var addImage = $('<button class="add-image-bt">Add Images</button>');
		var cancel = $('<button class="cancel-bt">Cancel</button>');
		var update = $('<button class="update-bt">Update</button>');

        $(projectContainer).append(title)
        				   .append('<br>')
        				   .append(desc)
        				   .append('<br>')
        				   .append(imagesUl)
        				   .append(addImage)
        				   .append(cancel)
        				   .append(update);

        $('body').append(projectContainer);

        attachEvents();
	}

	var createProject = function(){

		var projectContainer = $('<div class="container project"></div>');
            
        var title = $('<input type="text" class="title-input">');
        var desc = $('<textarea rows="20" cols="50" class="content-textarea"></textarea>');
        var imagesUl = $('<ul></ul>');
		var addImage = $('<button class="add-image-bt">Add Images</button>');
		var cancel = $('<button class="cancel-bt">Cancel</button>');
		var create = $('<button class="create-bt">Create</button>');

        $(projectContainer).append(title)
        				   .append('<br>')
        				   .append(desc)
        				   .append('<br>')
        				   .append(imagesUl)
        				   .append(addImage)
        				   .append(cancel)
        				   .append(create);

        $('body').append(projectContainer);

        attachEvents();
	}

	var createImageInput = function(item){
		var li = $('<li class="images-li"></li>');

        	var checkbox = $('<input type="checkbox" class="homepage-input">');
        	console.log(item.homepage);
        	$(checkbox).prop('checked', item.homepage);
        	var url = $('<input type="text" class="url-input">').val(item.url);
        	var del = $('<button class="del-bt">Delete</button>');

        	$(li).append(checkbox)
        	     .append(url)
        	     .append(del);

        return li;		
	}

	var collapseProject = function(parent){
		$(parent.remove());
	}
	/*---------------------------------------------*/

	var attachEvents = function() {
	    console.log('Attaching Events');

	    // Log off
		window.onbeforeunload = function() {
			// Clean up login and password
			localStorage.removeItem('usr');
			localStorage.removeItem('pwd');
			return '';
		};	    

	    // register page
	    $('#btn-login').off('click').on('click', function() {
	    	login();
	    });

	    /*----- PROJECTS LIST -----*/
	    $('#projects-list .update-bt').off('click').on('click', function() {
	    	updateProjectsOrderAndPublishParse();
	    });

	    $('#projects-list .del-bt').off('click').on('click', function() {
	    	deleteProjectParse($(this).parent().attr('id'));
	    });

	    $('#projects-list .edit-bt').off('click').on('click', function() {
	    	// console.log($(this).parent());
	    	expandProjectParse($(this).parent().attr('id'));
	    });

	    $('#projects-list .add-project-bt').off('click').on('click', function() {
	    	// console.log('add project');
	    	createProject();
	    });

	    /*----- PROJECTS DETAIL -----*/
	    $('.project .update-bt').off('click').on('click', function() {
	    	// console.log($(this).parent().attr('id'));
	    	createOrUpdateParse($(this).parent(), false);
	    });	    
	    
	    $('.project .cancel-bt').off('click').on('click', function() {
	    	collapseProject($(this).parent());
	    });
	    
	    $('.project .create-bt').off('click').on('click', function() {
	    	// console.log($(this).parent().attr('id'));
	    	createOrUpdateParse($(this).parent(), true);
	    });	

	    $('.project .add-image-bt').off('click').on('click', function() {
	    	// console.log($(this).parent().children('ul'));
	    	var li = createImageInput({url: '', homepage: false});
	    	$(this).parent().children('ul').append(li);
	    });	    

	    // Images
	    $('.project li .del-bt').off('click').on('click', function() {
	    	$(this).parent().remove();
	    });	    
	};	

	attachEvents();
});
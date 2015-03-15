/* Your code starts here */

define(function (require) {
	
	console.log('Loaded admin.js');

	var loadProjects = function(results){
		console.log(results);
		results.forEach(function(item, index, array){
			var p = $('<p>'+item.title+'</p>');
			$('body').append(p);
		});
	}
	
	var attachEvents = function() {
	    console.log('Attaching Events');

	    // register page
	    $('#btn-login').off('click').on('click', function() {
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
	            // localStorage['user'] = result.email;
	            // alert('Registered');
	            // // Assuming the email has been through the registeration process
	            // // and return to the user
	            // // the user may now proceed to the next page
	            // location.hash = '#projects';
	        });
	    });

	    // // create button
	    // $('#btnCreate').off('click').on('click', function() {
	    //     location.hash = '#create';
	    // });
	    // // submit button
	    // $('#btnSubmit').off('click').on('click', function() {
	    //     $.post('/project', {
	    //         user: localStorage['user'],
	    //         p_title: $('#iptProjectTitle').val(),
	    //         p_deadline: $('#iptProjectDeadline').val()
	    //     }, function(result) {
	    //         console.log(result);
	    //         location.hash = '#projects';
	    //     });
	    // });
	    // // delete button
	    // $('.btnDelete').off('click').on('click', function() {
	    //     var that = this;
	    //     // delete item in database
	    //     $.ajax({
	    //         url: '/project',
	    //         type: 'DELETE',
	    //         data: {
	    //             user: localStorage['user'],
	    //             id: $(this).siblings().attr('data-id')
	    //         },
	    //         success: function(result) {
	    //             // delete item in view
	    //             $(that).parent().slideUp(function() {
	    //                 location.reload();
	    //             });
	    //         }
	    //     });
	    // });
	    // // Log out --> localStorage.clear()
	    // $('#btnLogout').on('click', function() {
	    //     localStorage.clear();
	    //     location.hash = '#register';
	    // });
	};	

	attachEvents();
});
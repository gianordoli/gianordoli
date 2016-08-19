define(['./common'], function (common) {

	console.log('Loaded index');

	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// var random = Math.floor(Math.random()*14);
	var random = getRandomInt(0, 13);
	console.log(random);
	$('#bg').css('background-image', 'url("/assets/img/home_' + random + '.jpg")');
	// $('#bg').css('background-image', 'url("/assets/img/home_13.jpg")');

});
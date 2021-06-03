var canvas = document.getElementById('myCanvas');

//Check if the browser supports canvas
if(canvas.getContext){
	/*---------- VARIABLES ----------*/
	//Getting canvas context
	var ctx = canvas.getContext('2d');

	//Canvas position
	var canvasPosition;

	//Canvas size adjustment for Chrome and Firefox
	var ratio;

	//Particles
	var dust;			//Array of particles
	var mouseRadius;	//Size of the mouze
	var isPressed;
	var mouseX = 0;
	var mouseY = 0;
	var myLoop;	

	/*---------- FUNCTIONS ----------*/							

	//Resizing the canvas to the full window size
	function canvasResize(){
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;

		canvasPosition = canvas.getBoundingClientRect(); // Gets the canvas position
		canvas.width = screenWidth;
		canvas.height = screenHeight;
	}


	//Adjusting the size to work with Firefox and Chrome at retina resolutions 
	function canvasAdjustment(){
    // finally query the various pixel ratios
    var devicePixelRatio  = window.devicePixelRatio || 1;
    //console.log(devicePixelRatio);
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio ||
                            ctx.msBackingStorePixelRatio ||
                            ctx.oBackingStorePixelRatio ||
                            ctx.backingStorePixelRatio || 1;

    ratio = devicePixelRatio / backingStoreRatio;
    //console.log(ratio);
    
    // upscale the canvas if the two ratios don't match
	    if (devicePixelRatio !== backingStoreRatio) {

	        var oldWidth = canvas.width;
	        var oldHeight = canvas.height;

	        canvas.width = oldWidth * ratio;
	        canvas.height = oldHeight * ratio;

	        canvas.style.width = oldWidth + 'px';
	        canvas.style.height = oldHeight + 'px';

			ctx.scale(ratio, ratio);				        
	    }
  	}

	function setup(){
		dust = new Array(40000);
		mouseRadius = 20;
		isPressed = false;
		mouseX = 0;
		mouseY = 0;	

		for(var i = 0; i < dust.length; i ++){
			var particle = new Object;
			particle.posX = Math.round(Math.random()*canvas.width/ratio);
			particle.posY = Math.round(Math.random()*canvas.height/ratio);
			//.toFixed adjust to a specific number of decimals
			particle.opacity = (Math.random() + 0.3).toFixed(1);
			dust[i] = particle;

			//console.log("x: " + dust[i].posX + ", y: " + dust[i].posY + ", alpha: " + dust[i].opacity);
			//console.log("x: " + dust[i].posX);

		}
		
		//myLoop = setInterval(draw, 60);
		draw();
	}						

	// var n = 0;
	function draw(){
		// n ++;
		// console.log('called draw function' + n);
		//Clears the background
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width/ratio, canvas.height/ratio);
		

		//Draws the squares
		for(var i = 0; i < dust.length; i ++){

			//console.log('yes');

			if(isPressed){
				
				//Calculating the angle							
				var angle = calculateAngle(dust[i].posX, dust[i].posY);

				//Calculating the distance							
				var dist;

				if( (mouseY - dust[i].posY) == 0 ){
					dist = (mouseX - dust[i].posX) / Math.cos( angle );
				}else{
					dist = (mouseY - dust[i].posY) / Math.sin( angle );
				}
			
				//Detecting collision
				if(dist < mouseRadius){
					//console.log('yay');
	                dust[i].posX = mouseX - Math.cos(angle) * mouseRadius;
	                dust[i].posY = mouseY - Math.sin(angle) * mouseRadius;
				}
			}

			ctx.fillStyle = 'rgba(200, 165, 140,'+ dust[i].opacity + ')';
			ctx.fillRect(dust[i].posX, dust[i].posY, 2, 2);
		}
	}

	/*---------- AUXILIAR FUNCTIONS ----------*/
	function calculateAngle(x, y){
		var angle = Math.atan2(mouseY - y, mouseX - x);
		//console.log('called calculateAngle function');
		return angle;
	}

	function getMousePos(evt){
		mouseX = evt.clientX - canvasPosition.left;
		mouseY = evt.clientY - canvasPosition.top;
		//You have to use clientX! .x doesn't work with Firefox!
	}

	/*---------- LISTENERS ----------*/
	canvas.addEventListener('mousemove', function(evt){
		// console.log(e.x);
		// console.log(e.y);
		getMousePos(evt);
		draw();
	}, false);

	canvas.addEventListener('mousedown', function(evt){
		isPressed = true;	// Set my "isPressed" variable to true
		getMousePos(evt);
		draw();
	}, false);

	canvas.addEventListener('mouseup', function(evt){
		isPressed = false;	// Set my "isPressed" variable to false
		getMousePos(evt);
	}, false);						

	//Resizing the canvas
	canvasResize();

	//Adjusting for retina
	//canvasAdjustment();
	ratio = 1;

	//Calling the setup function
	setup();		


//If the browser doesn't support canvas
}else{
	alert('Your browser doesn\'t support canvas');
}
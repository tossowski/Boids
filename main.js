let width = 1000;
let height = 1000;
let depth = 1000;

// Useful Constants
let MIN_SPEED = 0.01;
let MAX_SPEED = 1;

// Central Tendency
let MIN_CENTERING_FACTOR = 0.0001;
let CENTERING_FACTOR = 0.05;
let MAX_CENTERING_FACTOR = 0.08;

// Avoid Factor
let MIN_AVOID_FACTOR = 0.01;
let AVOID_FACTOR = 0.05;
let MAX_AVOID_FACTOR = 0.2;

// Max Velocity
let MIN_SLIDER_VELOCITY = 10;
let MAX_VELOCITY = 15;
let MAX_SLIDER_VELOCITY = 50;

let NUM_BOIDS = 100;

let ANIMATION_SPEED = 0.1;
let DEFAULT_CAMERA_DISTANCE = 5;
let DEFAULT_CAMERA_POS = new THREE.Vector3(width / 2, height / 2, -depth / 2);
const VISUAL_RANGE = 80;
//let DEFAULT_CAMERA_POS = new THREE.Vector3(2.5, 2.5, 2.5);

let renderqueue = [];
let CUBE_DIM = 3;
let animating = false;

// Scene setup
let boids = []
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 9000 );
const renderer = new THREE.WebGLRenderer({"antialiasing":true});

const clock = new THREE.Clock();
// Controls
let controls = new THREE.PointerLockControls(camera, document.body);
instructions.addEventListener( 'click', function () {

	controls.lock();

} );
// controls.movementSpeed = 100;
// controls.rollSpeed = 1;
// controls.movementSpeed = 1;
// controls.domElement = renderer.domElement;
// controls.rollSpeed = Math.PI / 24;
// controls.autoForward = false;
// controls.dragToLook = true;

// Lighting
const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				dirLight.position.set( 0, 100, 0 );
				dirLight.position.multiplyScalar( 30 );
scene.add( dirLight );
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 1000;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

// const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
// scene.add( dirLightHelper );
// const helper = new THREE.CameraHelper( dirLight.shadow.camera );
// scene.add( helper );


// Background
const textureLoader = new THREE.TextureLoader();

const groundGeo = new THREE.PlaneGeometry( 100000, 100000 );
let groundTexture = textureLoader.load('./Textures/floor.png');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set( 100, 100 );
const groundMat = new THREE.MeshBasicMaterial({
	map: groundTexture});
//groundMat.color.setHSL( 0.095, 1, 0.75 );

const ground = new THREE.Mesh( groundGeo, groundMat );
ground.position.y = -200;
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add( ground );



renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyBoxTexture = cubeTextureLoader.load([
    './Textures/underwater/front.jpg',
    './Textures/underwater/back.jpg',
    './Textures/underwater/up.jpg',
    './Textures/underwater/down.jpg',
    './Textures/underwater/right.jpg',
    './Textures/underwater/left.jpg',
  ]);
scene.background = skyBoxTexture;
// scene.background = new THREE.Color( 0x808080 );
document.body.appendChild( renderer.domElement );

// Model loader
const loader = new THREE.GLTFLoader();


const resetCamera = function() {
	//console.log(controls.distance);
	//controls.distance = DEFAULT_CAMERA_DISTANCE;
	camera.position.x = DEFAULT_CAMERA_POS.x;
	camera.position.y = DEFAULT_CAMERA_POS.y;
	camera.position.z = DEFAULT_CAMERA_POS.z;
	camera.lookAt(width/2,height/2,0);
	//controls.target = new THREE.Vector3(DEFAULT_CAMERA_POS.x, DEFAULT_CAMERA_POS.y, 0);

}


function reset_simulation() {
	boids.map(x => scene.remove(x));
	boids = [];
	init_positions();
	// resetCamera();

}

resetCamera();

function init_positions() {
	for (let i = 0; i < NUM_BOIDS; i++) {

		loader.load('./models/fish.glb', function ( gltf ) {

			const mesh = gltf.scene.children[ 0 ];
			const s = 25;
			mesh.scale.set( s, s, s );
						

			let randomX = (100 * (Math.random() - 0.5));
			let randomY = (100 * (Math.random() - 0.5));
			let randomZ = (100 * (Math.random() - 0.5));
			mesh.position.set(randomX, randomY, randomZ);
			//mesh.updateMatrixWorld();
			randomX = (10 * (Math.random() - 0.5));
			randomY = (10 * (Math.random() - 0.5));
			randomZ = (10 * (Math.random() - 0.5));
			mesh.velocity = new THREE.Vector3(randomX, randomY, randomZ);
			scene.add(mesh);
			boids.push(mesh);
		});
	}
}

let moveForward = null;
let moveLeft = null;
let moveUp = null;

document.body.onkeydown = function(e) {

	if (controls.isLocked) {
		if (e.keyCode == 87) {        // w keycode 
			moveForward = 10;
		} else if (e.keyCode == 83) { // s
			moveForward = -10;
		} else if (e.keyCode == 65) { // a
			moveLeft = -10;
		} else if (e.keyCode == 68) { // d
			moveLeft = 10;
		} else if (e.keyCode == 16) {
			moveUp = -10;
		} else if (e.keyCode == 32) {
			moveUp = 10;
		} 
	}
	
	
	if (e.keyCode == 82) { // e keycode 
		reset_simulation();
	}
}

document.body.onkeyup = function(e) {
	if (controls.isLocked) {
		if (e.keyCode == 87) {        // w keycode 
			moveForward = null;
		} else if (e.keyCode == 83) { // s
			moveForward = null;
		} else if (e.keyCode == 65) { // a
			moveLeft = null;
		} else if (e.keyCode == 68) { // d
			moveLeft = null;
		} else if (e.keyCode == 16) {
			moveUp = null;
		} else if (e.keyCode == 32) {
			moveUp = null;
		} 
	}
	
}



function getVectorPos(obj) {
	return new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
}

function getVectorVelocity(obj) {
	return new THREE.Vector3(obj.velocity.x, obj.velocity.y, obj.velocity.z);
}

function distance(boid1, boid2) {
	return getVectorPos(boid1).distanceTo(getVectorPos(boid2));
  }
  

function keepWithinBounds(boid) {
	const margin = 1;
	const turnFactor = 1;
  
	if (boid.position.x < margin) {
	  boid.velocity.x += turnFactor;
	}
	if (boid.position.x > width - margin) {
	  boid.velocity.x -= turnFactor
	}
	if (boid.position.y < margin) {
	  boid.velocity.y += turnFactor;
	}
	if (boid.position.y > height - margin) {
	  boid.velocity.y -= turnFactor;
	}
	if (boid.position.z < margin) {
		boid.velocity.z += turnFactor;
	}
	if (boid.position.z > depth - margin) {
		boid.velocity.z -= turnFactor;
	}
}

function flyTowardsCenter(boid) {

	let centerX = 0;
	let centerY = 0;
	let centerZ = 0;
	let numNeighbors = 0;

	for (let otherBoid of boids) {
		if (distance(boid, otherBoid) < VISUAL_RANGE) {
			centerX += otherBoid.position.x;
			centerY += otherBoid.position.y;
			centerZ += otherBoid.position.z;
			numNeighbors += 1;
		}
	}

	if (numNeighbors) {
		centerX = centerX / numNeighbors;
		centerY = centerY / numNeighbors;
		centerZ = centerZ / numNeighbors;

		boid.velocity.x += (centerX - boid.position.x) * CENTERING_FACTOR;
		boid.velocity.y += (centerY - boid.position.y) * CENTERING_FACTOR;
		boid.velocity.z += (centerZ - boid.position.z) * CENTERING_FACTOR;

	}
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
	const minDistance = 40; // The distance to stay away from other boids
	let moveX = 0;
	let moveY = 0;
	let moveZ = 0;
	for (let otherBoid of boids) {
	  if (otherBoid !== boid) {
		if (distance(boid, otherBoid) < minDistance) {
		  moveX += boid.position.x - otherBoid.position.x;
		  moveY += boid.position.y - otherBoid.position.y;
		  moveZ += boid.position.z - otherBoid.position.z;
		}
	  }
	}
  
	boid.velocity.x += moveX * AVOID_FACTOR;
	boid.velocity.y += moveY * AVOID_FACTOR;
	boid.velocity.z += moveZ * AVOID_FACTOR;
  }
  
  // Find the average velocity (speed and direction) of the other boids and
  // adjust velocity slightly to match.
  function matchVelocity(boid) {
	const matchingFactor = 0.05; // Adjust by this % of average velocity
  
	let avgDX = 0;
	let avgDY = 0;
	let avgDZ = 0;
	let numNeighbors = 0;
  
	for (let otherBoid of boids) {
	  if (distance(boid, otherBoid) < VISUAL_RANGE) {
		avgDX += otherBoid.velocity.x;
		avgDY += otherBoid.velocity.y;
		avgDZ += otherBoid.velocity.z;
		numNeighbors += 1;
	  }
	}
  
	if (numNeighbors) {
	  avgDX = avgDX / numNeighbors;
	  avgDY = avgDY / numNeighbors;
	  avgDZ = avgDZ / numNeighbors;
  
	  boid.velocity.x += (avgDX - boid.velocity.x) * matchingFactor;
	  boid.velocity.y += (avgDY - boid.velocity.y) * matchingFactor;
	  boid.velocity.z += (avgDZ - boid.velocity.z) * matchingFactor;
	}
  }
  
  // Speed will naturally vary in flocking behavior, but real animals can't go
  // arbitrarily fast.
  function limitSpeed(boid) {

	const speed = Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.y * boid.velocity.y + boid.velocity.z * boid.velocity.z);
	if (speed > MAX_VELOCITY) {
	  boid.velocity.x = (boid.velocity.x / speed) * MAX_VELOCITY;
	  boid.velocity.y = (boid.velocity.y / speed) * MAX_VELOCITY;
	  boid.velocity.z = (boid.velocity.z / speed) * MAX_VELOCITY;
	}
  }

  var quaternion = new THREE.Quaternion(); // create one and reuse it

  
function tick() {
	for (let boid of boids) {

		// Update the velocities according to each rule
		flyTowardsCenter(boid);
		avoidOthers(boid);
		matchVelocity(boid);
		limitSpeed(boid);
		keepWithinBounds(boid);
		const angle = Math.atan2(boid.velocity.z, boid.velocity.x);
		boid.rotation.y = -angle;
		// boid.rotation.x = -angle;
		// boid.rotation.z = -angle;
		const angle2 = Math.atan2(boid.velocity.y, Math.sqrt(boid.velocity.x * boid.velocity.x + boid.velocity.z * boid.velocity.z))

		
		boid.rotation.z = angle2;


		// Update the position based on the current velocity
		boid.position.x +=  boid.velocity.x;
		boid.position.y +=  boid.velocity.y;
		boid.position.z +=  boid.velocity.z;
	}
}

init_positions();
//tick();



function animate() {

	requestAnimationFrame( animate );

	//const delta = clock.getDelta();
	// required if controls.enableDamping or controls.autoRotate are set to true
	// console.log(controls.rotationVector);
	//controls.update(delta);

	
	tick();

	
	if (controls.isLocked) {
		if (moveForward) {
			controls.moveForward(moveForward);
		}
		if (moveLeft) {
			controls.moveRight(moveLeft);
		}
		if (moveUp) {
			camera.position.y += moveUp;
			camera.position.y = Math.max(camera.position.y, -100);
		}
	}

	renderer.render( scene, camera );

}

animate();



// Bind EventListeners
// let buttonToHandler = {"scramble": scramble, "solve": solve, "reset": reset, "resetCamera": resetCamera};
// var buttons = document.getElementsByTagName("button");
// for (let i = 0; i < buttons.length; i++) {
// 	buttons[i].addEventListener("click", buttonToHandler[buttons[i].id], false);
// };

const updateSlider = function(slider) {
	let percentage =  (slider.value - 1) / (99) * 100
    slider.style = 'background: linear-gradient(to right, #50299c, #7a00ff ' + percentage + '%, #d3edff ' + percentage + '%, #dee1e2 100%)'
}

function minMaxNorm(slider, MAX_VALUE, MIN_VALUE) {
	
	updateSlider(slider);
	return (slider.value - 1) / (99) * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
}



window.onload = function() {
	
	let centralTendencySlider = document.getElementById("centeringFactor");
	let avoidFactorSlider = document.getElementById("avoidFactor");
	let maxVelocitySlider = document.getElementById("maxVelocity");

	updateSlider(centralTendencySlider);
	updateSlider(avoidFactorSlider);
	updateSlider(maxVelocitySlider);

	//Update the current slider value (each time you drag the slider handle)
	centralTendencySlider.oninput = function() {CENTERING_FACTOR = minMaxNorm(centralTendencySlider, MAX_CENTERING_FACTOR, MIN_CENTERING_FACTOR)};
	avoidFactorSlider.oninput = function() {AVOID_FACTOR = minMaxNorm(avoidFactorSlider, MAX_AVOID_FACTOR, MIN_AVOID_FACTOR)};
	maxVelocitySlider.oninput = function() {MAX_VELOCITY = minMaxNorm(maxVelocitySlider, MAX_SLIDER_VELOCITY, MIN_SLIDER_VELOCITY)};
}


function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.render(scene, camera);
}
  
window.addEventListener('resize', onResize);
//Set Up Variables
let scene;
let camera;
let container;
let raycaster;
let renderer;
let controls;
//
let personPoint;
let personPoints = [];
// init related var
// Wider Version of the Sculpture
// let maxHeight = 2000;
// let maxRadius = 2000;
// Narrower Version with segmented Random Number
let maxHeight = 2000;
let maxRadius = 500;
let ranges = [[100, 200], [200, 400]];
// Center Line
let centerLine;

//Main Loop------------------------------------------------------
init();
animate();

//Scene Related Function-------------------------------------------------------------------------------------------------------
function reset_scene(){
    console.log("Reset the Scene");
    for( let i = scene.children.length - 1; i >= 0; i--) {
        let obj = scene.children[i];
        scene.remove(obj);
    }
}

function init() {
    // ---------------------Env Set Up
    raycaster = new THREE.Raycaster();
    container = document.getElementById( 'container' );
    // camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 4000 );
    // camera.position.z = 500;
    // camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 32808;
    camera.far = 1000000;
    camera.updateProjectionMatrix();
    // geometry
    controls = new THREE.OrbitControls( camera, container );
    controls.addEventListener( 'change', render );
    scene = new THREE.Scene();
    scene.background =  new THREE.Color( 0xffffff);
    // scene.background =  new THREE.Color( 0x000000);
    renderer = new THREE.WebGLRenderer( { antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    //
    let start = new THREE.Vector3(0, 52000, 0);
    let end = new THREE.Vector3(0, 0, 0);
    centerLine = new Line(start, end, 2, 2000);
    scene.add(centerLine.line);

    // light
    getLight();
    //model
    loadModel();
    // addPoints();
}

function enter() {
    document.getElementById("welcome-page").style.display = 'none';
}

function addOnePoint(){
    let initPosition = new THREE.Vector3(-10000, 0, 0);
    let randomHeight = Math.random()*maxHeight;
    let randomRadius = Math.random()*maxRadius;
    personPoint = new PersonPoint(randomRadius, randomHeight, initPosition);
    scene.add(personPoint.point);
    scene.add(personPoint.trailLine);
    personPoints.push(personPoint);
}

function addPoints(){
    let initPosition = new THREE.Vector3(-10000, 0, 0);
    let heightGap = maxHeight/500;
    let maxPulseNumber = 60;
    let currentPulseNumber = 30 + Math.floor(Math.random()*maxPulseNumber);
    let currentLowNumber = currentPulseNumber/2 + 10 + Math.floor(Math.random()*(currentPulseNumber/2 - 10));
    let pulseCounter = 0;
    for (let i=0; i<500; i++) {
        // let randomHeight = Math.random()*maxHeight;
        let randomHeight = i*heightGap;
        // Wide
        // let randomRadius = Math.random()*maxRadius;
        // Segmented
        let randomRadius = 0;
        let currentRange;
        if (pulseCounter < currentLowNumber){
            currentRange = ranges[0];
        }
        else{
            currentRange = ranges[1];
        }
        randomRadius = currentRange[0] + Math.random()*(currentRange[1]-currentRange[0]);
        if (pulseCounter > currentPulseNumber){
            currentPulseNumber = Math.floor(Math.random()*30);
            currentLowNumber = Math.floor(Math.random()*currentPulseNumber);
            pulseCounter = 0;
        }
        // let randomRadius = currentRange[0] + Math.random()*(currentRange[1]-currentRange[0]);
        personPoint = new PersonPoint(randomRadius, randomHeight, initPosition);
        scene.add(personPoint.point);
        scene.add(personPoint.trailLine);
        personPoints.push(personPoint);
        pulseCounter += 1;
    }
}

function loadModel() {
    var loader = new THREE.OBJLoader();
    loader.load('/models/building2.obj', function(object) {
        scene.add(object);
        object.position.x = -45000;
        object.position.y = -33800;
        object.position.z = 8000;
        object.scale.x *= 2000;
        object.scale.y *= 2000;
        object.scale.z *= 2000;
    });
}

function getLight() {
    let light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(1, 1, 1);

    let ambientLight = new THREE.AmbientLight(0x111111, 1);
    ambientLight.position.set(100, 100, 0);
    scene.add(ambientLight);

    let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30%, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;

    let fillLight = new THREE.DirectionalLight(0x111111, 0.8, 0.2);
    fillLight.position.set(100, 0, -100);

    let backLight = new THREE.DirectionalLight(0xffffff, 1.0);

    backLight.position.set(100, 0, 50).normalize();
    keyLight.position.set(-100, 1, 100);

    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 100;

    scene.add(fillLight);
    scene.add(backLight);
}

function moveCamera(target, tweenTime, finishFunction){
    let deepTripPosition = new TWEEN.Tween( camera.position )
        .to( {
            x: target.x,
            y: target.y,
            z: target.z
        }, tweenTime)
        .easing( TWEEN.Easing.Cubic.InOut ).onUpdate( function () {
        }).onComplete(() => finishFunction())
        .start();
}

function moveToTop(){
    let topTarget = new THREE.Vector3(0, 2000, 0);
    let tweenTime = 3000;
    moveCamera(topTarget, tweenTime, ()=>console.log("ff"));

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    // console.log(controls.object.position);
    for (let i=0; i<personPoints.length; i++){
        personPoints[i].update();
    }
    TWEEN.update();
    controls.update();
    requestAnimationFrame( animate );
    render();
}

function render() {
    renderer.render( scene, camera );
}

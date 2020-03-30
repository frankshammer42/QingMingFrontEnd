//TODO: Wait For Emboddie
//Set Up Variables
let scene;
let sceneCSS;
let camera;
let container;
let containerCSS;
let raycaster;
let renderer;
let rendererCSS;
let controls;
//
let personPoint;
let personPoints = [];
//
let billBoards = [];

// init related var
// Wider Version of the Sculpture
// let maxHeight = 2000;
// let maxRadius = 2000;
// Narrower Version with segmented Random Number
let maxHeight = 1000;
let maxRadius = 500;
let ranges = [
  [700,  800],
  [900, 1200]
];
// Center Line
let centerLine;
let plane;
let model;
// Move Around Model
let moveAroundOffset = new THREE.Vector3(-1277, 0, -4586);
let initModelPos = new THREE.Vector3(-45000, -33800, 8000);
let initMapPos = new THREE.Vector3(2883, -370, -6822);
let currentModelPos = initModelPos;
let currentMapPos = initMapPos;
let hemiLight;
let dirLight;
let fillLight;
let backLight;
let ambientLight;
//for mouse
let mouse;

//Main Loop------------------------------------------------------
init();
animate();

//Scene Related Function-------------------------------------------------------------------------------------------------------
function reset_scene() {
  console.log("Reset the Scene");
  for (let i = scene.children.length - 1; i >= 0; i--) {
    let obj = scene.children[i];
    scene.remove(obj);
  }
}

function init() {
  raycaster = new THREE.Raycaster();
  container = document.getElementById('container');
  // camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  //
  //   -7965.668730586435
  //   y: 514.8100231721643
  //   z: -532.0642015762531
  camera.position.x = -7965.66;
  camera.position.y = 514.81;
  camera.position.z = -532.06;
  camera.far = 1000000;
  camera.updateProjectionMatrix();

  //WebGL
  scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.domElement.style.top = 0;
  renderer.domElement.style.zIndex = "1"; // required
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);

  //Create CSS container for billboarding
  sceneCSS = new THREE.Scene();
  containerCSS = document.getElementById("containerCSS");
  rendererCSS = new THREE.CSS3DRenderer();
  rendererCSS.setSize( window.innerWidth, window.innerHeight );
  rendererCSS.domElement.style.position = 'absolute';
  rendererCSS.domElement.style.top = 0;
  containerCSS.appendChild(rendererCSS.domElement);

  //Orbit Controls
  controls = new THREE.OrbitControls(camera, container);
  controls.minDistance = 50;
  controls.maxDistance = 8000;
  controls.maxPolarAngle = Math.PI/2;

    // Center Line
  // let start = new THREE.Vector3(0, 52000, 0);
  // let end = new THREE.Vector3(0, 0, 0);
  // centerLine = new Line(start, end, 2, 2000);
  // scene.add(centerLine.line);
  // Light and Model Set Up
  getLight();
  addSkybox();
  //model
  loadModel();
  loadMap();
  //Add Control Panel
  addControl();
  // addPoints();
  addBillboards();
  document.addEventListener("mousemove", mouseMove);
}

function mouseMove(event){
    mouse = new THREE.Vector3();
    mouse.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
}


function addBillboards(){
    let content = "洪山礼堂";
    let position = new THREE.Vector3(0, 500, -1000);
    let billBoard = new Billboard(position, content, camera);
    billBoards.push(billBoard);
    sceneCSS.add(billBoard.container);
}

function loadModel() {
  let loader = new THREE.OBJLoader();
  loader.load('/models/building2.obj', function(object) {
    scene.add(object);
    object.position.x = -45000 + moveAroundOffset.x;
    object.position.y = -33800;
    object.position.z = 8000 + moveAroundOffset.z;
    object.scale.x *= 2000;
    object.scale.y *= 2000;
    object.scale.z *= 2000;
    model = object;
  });
}

function enter() {
  document.getElementById("welcome-page").style.display = 'none';
  let vector = new THREE.Vector3( mouse.x, mouse.y, -1 ).unproject( camera );
  // vector.z = -400;
  addPoints(vector);
  initCamMove();
}

function showInfoCard() {
  document.getElementById("info-card-backdrop").style.display = 'flex';
}

function closeInfoCard() {
  document.getElementById('info-card-backdrop').style.display = 'none';
}

function preventEvent(event) {
  event.stopPropagation();
}

function addOnePoint() {
  let initPosition = new THREE.Vector3(-10000, 0, 0);
  let randomHeight = Math.random() * maxHeight;
  let randomRadius = Math.random() * maxRadius;
  personPoint = new PersonPoint(randomRadius, randomHeight, initPosition);
  scene.add(personPoint.point);
  scene.add(personPoint.trailLine);
  personPoints.push(personPoint);
}

function convertIndexToRowCol(index, widthNum){
    let row = Math.floor(index / widthNum );
    let col  = index % widthNum;
    return  [row, col];
}

function addPoints(initPos){
    // let initPosition = new THREE.Vector3(-10000, 0, 0);
    let initPosition = initPos;
    let numberOfPoints = 500;
    let heightGap = maxHeight/numberOfPoints;
    let maxPulseNumber = 60;
    let pulseOffset = maxPulseNumber/2;
    let currentPulseNumber = pulseOffset + Math.floor(Math.random()*(maxPulseNumber-pulseOffset));
    let currentLowNumber = currentPulseNumber/2 + Math.floor(Math.random()*(currentPulseNumber/2))*Math.random();
    let pulseCounter = 0;
    //For Initial Rectangles
    let recWidthGap =  0.1;
    let recHeightGap = 0.1;
    let colNumber = 25;
    let rowNumber = numberOfPoints/colNumber;
    let width = colNumber * recWidthGap;
    let height = rowNumber * recHeightGap;
    let halfWidth = width/2;
    let halfHeight = height/2;

    for (let i=0; i<numberOfPoints; i++) {
        // let recIndexes = convertIndexToRowCol(i, colNumber);
        // let rowIndex = recIndexes[0];
        // let colIndex = recIndexes[1];
        // let initX = -halfWidth + colIndex*recWidthGap;
        // let initY = halfHeight - rowIndex*recHeightGap;
        // initPosition = new THREE.Vector3(initX, initY, 6000);
        // let randomHeight = Math.random()*maxHeight;
        let randomHeight = i * heightGap;
        // Wide
        // let randomRadius = Math.random()*maxRadius;
        // Segmented
        let randomRadius = 0;
        let currentRange;
        if (pulseCounter < currentLowNumber) {
            currentRange = ranges[0];
        } else {
            currentRange = ranges[1];
        }
        randomRadius = currentRange[0] + Math.random() * (currentRange[1] - currentRange[0]);
        if (pulseCounter > currentPulseNumber) {
            currentPulseNumber = pulseOffset + Math.floor(Math.random() * (maxPulseNumber - pulseOffset));
            currentLowNumber = currentPulseNumber / 2 + Math.floor(Math.random() * (currentPulseNumber / 2)) * Math.random();
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

function loadMap() {
  let geometry = new THREE.PlaneGeometry(90000 * 1.7, 90000 * 1.4, 32);
  let texture = new THREE.TextureLoader().load('textures/map.png');
  let material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff
    //  side: THREE.DoubleSide
  });
  plane = new THREE.Mesh(geometry, material);
  plane.position.set(2883 + moveAroundOffset.x, -370, -6822 + moveAroundOffset.z);
  plane.rotation.x = Math.PI + Math.PI / 2;
  scene.add(plane)
}

function getLight() {
  dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(848, -3955, -1749);
  dirLight.position.multiplyScalar(50);
  scene.add(dirLight);
  dirLight.castShadow = true;
  dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024 * 2;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.000001;
  dirLight.shadowDarkness = 0.35;
  scene.add(dirLight);

  //tyis is the amibient light
  ambientLight = new THREE.AmbientLight(0x111111, 5.5);
  ambientLight.position.set(2100, 20000, 6000);
  scene.add(ambientLight);

  //this is the fill light
  fillLight = new THREE.DirectionalLight(0x111111, 1.2);
  fillLight.position.set(100, 0, -9900);

  //this is the back light
  backLight = new THREE.DirectionalLight(0xffffff, 1.5);
  backLight.position.set(-3072, 4868, 2000).normalize();

  // light.castShadow = true;
  // light.shadow.camera.near = 0.1;
  // light.shadow.camera.far = 500;

  scene.add(fillLight);
  scene.add(backLight);
  scene.add(ambientLight);

  //this is the fog
  scene.fog = new THREE.Fog(0xdedede, 100, 80000);
  renderer.setClearColor(scene.fog.color, 1);

}

function addSkybox() {
  let vertexShader = document.getElementById('vertexShader').textContent;
  let fragmentShader = document.getElementById('fragmentShader').textContent;
  let uniforms = {
    topColor: {
      type: "c",
      value: new THREE.Color(0xcad4db)
    },
    bottomColor: {
      type: "c",
      value: new THREE.Color(0xf0f4f7)
    },
    offset: {
      type: "f",
      value: 33
    },
    exponent: {
      type: "f",
      value: 0.6
    }
  };
  //uniforms.topColor.value.copy( hemiLight.color );

  //scene.fog.color.copy( uniforms.bottomColor.value );

  let skyGeo = new THREE.SphereGeometry(80000 * 1.2, 640 * 1.2, 300 * 1.2);
  let skyMat = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    side: THREE.BackSide
  });

  let sky = new THREE.Mesh(skyGeo, skyMat);
  //  sky.position.z-=10000;
  //  console.log(sky.position.y)
  scene.add(sky);

}

function moveCamera(target, tweenTime, finishFunction, easingFunction) {
  let deepTripPosition = new TWEEN.Tween(controls.object.position)
    .to({
      x: target.x,
      y: target.y,
      z: target.z
    }, tweenTime)
    .easing(easingFunction).onUpdate(function() {}).onComplete(() => finishFunction())
    .start();
}

function initCamMove(){
    let topTarget = new THREE.Vector3(0, 0, 7500);
    let tweenTime = 5000;
    moveCamera(topTarget, tweenTime, ()=>{
        console.log("ff");
    }, TWEEN.Easing.Linear.None);
}

function moveToTop(){
    let topTarget = new THREE.Vector3(0, 3000, 3000);
    let tweenTime = 2000;
    moveCamera(topTarget, tweenTime, ()=>{
        topTarget = new THREE.Vector3(0, 3000, 0);
        tweenTime = 3000;
        moveCamera(topTarget, tweenTime, ()=>{"whatever"}, TWEEN.Easing.Cubic.InOut);
    }, TWEEN.Easing.Linear.None);
}

function moveAuto(){
    controls.autoRotate = !controls.autoRotate;
}

function moveToFreeView(){
    let freeViewTarget = new THREE.Vector3(-336, 1695, 5785);
    let tweenTime = 4000;
    moveCamera(freeViewTarget, tweenTime, ()=>console.log("ff"), TWEEN.Easing.Cubic.InOut);
}

function moveModelMap(){
    model.position.x = moveAroundOffset.x + initModelPos.x;
    model.position.y = moveAroundOffset.y + initModelPos.y;
    model.position.z = moveAroundOffset.z + initModelPos.z;
    plane.position.x = moveAroundOffset.x + initMapPos.x;
    plane.position.y = moveAroundOffset.y + initMapPos.y;
    plane.position.z = moveAroundOffset.z + initMapPos.z;
}

function resetModelMap(){
    console.log("reset");
    model.position = initModelPos;
    plane.position = initMapPos;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addControl(){
    let options = {
        Top: moveToTop,
        Around: moveToFreeView,
        Auto: moveAuto,
        Move: moveModelMap,
        Reset: resetModelMap
    };
    let gui = new dat.GUI();
    let position = gui.addFolder('Position');
    position.add(plane.position,'x',-10000,10000).name('PositionX').listen();
    position.add(plane.position,'y',-1000,1000).name('PositionY').listen();
    position.add(plane.position,'z',-10000,10000).name('PositionZ').listen();
    let rotation= gui.addFolder('Rotation');
    position.add(plane.rotation,'x',0,Math.PI).name('rotateX').listen();
    position.add(plane.rotation,'y',0,Math.PI).name('rotateY').listen();
    position.add(plane.rotation,'z',0,Math.PI).name('rotateZ').listen();
    let scale= gui.addFolder('Scale');
    scale.add(plane.scale,'x',0,3).name('ScaleX').listen();
    scale.add(plane.scale,'y',0,3).name('Scaley').listen();
    let move = gui.addFolder('MoveAround');
    move.add(moveAroundOffset, 'x', -30000, 30000).name('MoveAroundX').listen();
    move.add(moveAroundOffset, 'y', -30000, 30000).name('MoveAroundY').listen();
    move.add(moveAroundOffset, 'z', -30000, 30000).name('MoveAroundZ').listen();
    position.open();
    rotation.open();
    scale.open();
    move.open();
    //Create View Options
    gui.add(options, 'Top');
    gui.add(options, 'Around');
    gui.add(options, 'Auto');
    gui.add(options, 'Move');
    gui.add(options, 'Reset');
}

function animate() {
    console.log(controls.object.position);
    for (let i=0; i<personPoints.length; i++){
        personPoints[i].update();
    }
    for (let i=0; i<billBoards.length; i++){
        billBoards[i].update();
    }
    TWEEN.update();
    controls.update();
    requestAnimationFrame( animate );
    render();
}

function render() {
  renderer.render(scene, camera);
  rendererCSS.render(sceneCSS, camera);
}

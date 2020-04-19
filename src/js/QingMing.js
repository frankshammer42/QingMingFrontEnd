// TODO:
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
// Point Cloud
let personPoint;
let personPoints = [];
// Building Names
let billBoards = [];
// Input Field
let inputField = null;
// init related var
// Wider Version of the Sculpture
// let maxHeight = 2000;
// let maxRadius = 2000;
// Narrower Version with segmented Random Number
let maxHeight = 5000 * 0.8;
let maxRadius = 1000 * 0.8;
let ranges = [
    [200, 400],
    [1800, 2000]
];
// Center Line
let centerLine;
// Move Around Model
let moveAroundOffset = new THREE.Vector3(-1277, 0, -4586);
let initModelPos = new THREE.Vector3(-45000, -33800, 8000);
let initMapPos = new THREE.Vector3(2883, -370, -6822);
let currentModelPos = initModelPos;
let currentMapPos = initMapPos;
// Model Textures
let plane;
let model;
// Load Manager
let loadManager = new THREE.LoadingManager();
let loadProgress = 0;
let displayLoadProgress = 0;
// Light
let hemiLight;
let dirLight;
let fillLight;
let backLight;
let ambientLight;
//for mouse
let mouse;
// for visitor
let visitorCount = 0;
// for intro progress check
let fullyLoaded = false;
// For Optimization
let maxNumberOfPoints = 500;
let defaultPoint = 300;
// For Audio
let bg = new Audio('/assets/sound/bg.mp3');
let clickSound = new Audio('/assets/sound/click.mp3');
// let iphoneX button offset
let xOffset = -16.8;
let yOffset = -16;
// For growth animation rendering
let useAnimationRendering = true;
let userNumber = 0;
let userNames = [];
let enterTimes = [];
let animationPointsRadius = [];
let animationPointsHeight = [];
let animationShuffleIndex = [];
let currentAnimationProgressIndex = 0;
let currentNumberOfWalker = 0;






function initVisitor() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let resObj = JSON.parse(this.responseText);
            console.log('Visitor count is ' + resObj.count);
            visitorCount = resObj.count;
            document.getElementById('visitor-count-bar').innerText =
                pageLang === 'zh'
                    ? visitorCount + '人正在逆时针行走'
                    : visitorCount + ' people are walking counterclockwise';
        }
    };
    req.open('GET', '/monument-api/visitor', true);
    req.send();
}

function resetSize() {
    document.getElementById('frame').style.height = window.innerHeight + 'px';
}

window.addEventListener('resize', resetSize);
resetSize();

//Main Loop------------------------------------------------------
initVisitor();
init();
animate();

function reset_scene() {
    console.log('Reset the Scene');
    for (let i = scene.children.length - 1; i >= 0; i--) {
        let obj = scene.children[i];
        scene.remove(obj);
    }
}

function init() {
    if(useAnimationRendering){
        getNamesAndTime();
        userNumber = userNames.length;
        generateAnimationVariables(new THREE.Vector3(0,0,0), userNumber);
    }
    raycaster = new THREE.Raycaster();
    container = document.getElementById('container');
    // camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.x = -7965.66;
    camera.position.y = 514.81;
    camera.position.z = -532.06;
    // camera.position.x = 0;
    // camera.position.y = 0;
    // camera.position.z = 1000;
    // camera.position.x = 461;
    // camera.position.y = 7400;
    // camera.position.z = 8620;

    camera.far = 1000000;
    camera.updateProjectionMatrix();

    //WebGL
    scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.domElement.style.top = 0;
    renderer.domElement.style.zIndex = '1'; // required
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    //Create CSS container for billboarding
    sceneCSS = new THREE.Scene();
    containerCSS = document.getElementById('containerCSS');
    rendererCSS = new THREE.CSS3DRenderer();
    rendererCSS.setSize(window.innerWidth, window.innerHeight);
    rendererCSS.domElement.style.position = 'absolute';
    rendererCSS.domElement.style.top = 0;
    containerCSS.appendChild(rendererCSS.domElement);

    //Orbit Controls
    controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = 50;
    controls.maxDistance = 8000;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, maxHeight * 0.25, 0);

    getLight();
    addSkybox();
    //model
    initLoadManager();
    loadModelAndMap();
    // addPoints();
    addBillboards();
    // addNameInput();
    document.addEventListener('mousemove', mouseMove);
}

function addNameInput(offset, buttonOffset) {
    inputField = new InputField(
        new THREE.Vector3(0, 0, 50000),
        pageLang === 'zh' ? '加入祭奠' : 'JOIN',
        camera
    );
    inputField.screenOffset.x = offset.x;
    inputField.buttonOffset.x = buttonOffset.x;
    inputField.buttonOffset.y = buttonOffset.y;
    inputField.clickSound = new Audio('/assets/sound/click-short.mp3');
    sceneCSS.add(inputField.hintContainer);
    sceneCSS.add(inputField.inputContainer);
    sceneCSS.add(inputField.submitButtonContainer);
    scene.add(inputField.trailGroup);
}

function initLoadManager() {
    loadManager.onStart = function (url, itemsLoaded, itemsTotal) {
        // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    loadManager.onLoad = function () {
        loadProgress = 100;
        // console.log('Loading complete!');
    };
    loadManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    loadManager.onError = function (url) {
        console.log('There was an error loading ' + url);
    };
}

function mouseMove(event) {
    mouse = new THREE.Vector3();
    mouse.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
    );
}

function addBillboards() {
    let roadY = -450;
    addBillboard(0, 200, -15000, '洪山礼堂');
    addBillboard(0, roadY, -8200, '洪山路');
    addBillboard(-13000, roadY, 0, '东三路');
    addBillboard(8300, roadY, 2000, '东四路');
    addBillboard(-6300, 300, 8200, '武汉市公安局警务');
    addBillboard(-6550, 50, 8200, '综合服务站');
    addBillboard(11000, 1500, 1500, '双湖派出所');
    addBillboard(12000, 500, 11000, '湖北省科学技术');
    addBillboard(12000, 250, 11000, '厅政务服务大厅');
    addBillboard(185000, 300, -14000, '中国共产党湖');
    addBillboard(185000, 50, -14000, '北省纪检委');
}

function addBillboard(p0, p1, p2, name) {
    let billboard = new Billboard(new THREE.Vector3(p0, p1, p2), name, camera);
    billboard.container.scale.x = 4;
    billboard.container.scale.y = 4;
    billboard.container.scale.z = 4;
    billBoards.push(billboard);
    sceneCSS.add(billboard.container);
}

function loadMap() {
    let geometry = new THREE.PlaneGeometry(90000 * 1.7, 90000 * 1.4, 32);
    // let texture = new THREE.TextureLoader(loadManager).load('/assets/textures/map.png');
    let texture = new THREE.TextureLoader(loadManager).load(
        '/assets/textures/map5.png'
    );
    let material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff
        //  side: THREE.DoubleSide
    });
    plane = new THREE.Mesh(geometry, material);
    plane.position.set(
        2883 + moveAroundOffset.x,
        -370,
        -6822 + moveAroundOffset.z
    );
    plane.rotation.x = Math.PI + Math.PI / 2;
    scene.add(plane);
    //Add Control Panel
    // addControl();
}

function loadModelAndMap() {
    let loader = new THREE.OBJLoader(loadManager);
    loader.load(
        '/assets/models/building2.obj',
        function (object) {
            scene.add(object);
            object.position.x = -45000 + moveAroundOffset.x;
            object.position.y = -33800;
            object.position.z = 8000 + moveAroundOffset.z;
            object.scale.x *= 2000;
            object.scale.y *= 2000;
            object.scale.z *= 2000;
            model = object;
            loadMap();
        },
        function (xhr) {
            loadProgress = Math.floor((xhr.loaded / xhr.total) * 0.5 * 100);
            document.getElementById('loading').innerHTML = loadProgress.toString();
            // console.log((xhr.loaded / xhr.total * 100) + '% model loaded');
        }
    );
}

function enter() {
    //fade out welcome page
    var op = 1; // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.01) {
            clearInterval(timer);
            document.getElementById('welcome-page').style.display = 'none';
        }
        op -= op * 0.1;
        document.getElementById('card-backdrop').style.opacity = op;
    }, 30);

    //play sound
    if (typeof bg.loop == 'boolean') {
        bg.loop = true;
    } else {
        bg.addEventListener(
            'ended',
            function () {
                this.currentTime = 0;
                this.play();
            },
            false
        );
    }
    bg.play();
    clickSound.play();
    // let vector = new THREE.Vector3( mouse.x, mouse.y, -1).unproject( camera );
    let numberOfPoints = 0;
    if (visitorCount !== null && visitorCount !== 0) {
        numberOfPoints = visitorCount;
    } else {
        console.log('Use Default');
        numberOfPoints = defaultPoint;
    }
    if(!useAnimationRendering){
        addPoints(new THREE.Vector3(0, 0, 0), numberOfPoints);
        let offset = new THREE.Vector3(0, 0, 0);
        let buttonOffset = new THREE.Vector3(0, 0, 0);
        if (window.innerWidth < 1400) {
            offset.x = 150;
            if (window.innerWidth < 380) {
                buttonOffset.x = xOffset;
                buttonOffset.y = yOffset;
            }
        }
        addNameInput(offset, buttonOffset);
    }
    else{
        setInterval(generateAnimationPoint, 800);
    }
    initCamMove();
}

function showInfoCard() {
    document.getElementById('info-card-backdrop').style.display = 'flex';
}

function closeInfoCard() {
    document.getElementById('info-card-backdrop').style.display = 'none';
}

function closeQrCard() {
    document.getElementById('qr-card-backdrop').style.display = 'none';
}

function toggleShareControls() {
    let elem = document.getElementById('share-controls');
    elem.style.display = elem.style.display === 'flex' ? 'none' : 'flex';
}

function shareTo(website) {
    console.log('Sharing to ' + website);
    switch (website) {
        case 'WEIBO':
            const url1 =
                'http://service.weibo.com/share/share.php?url=' +
                encodeURIComponent(window.location.href) +
                '&sharesource=weibo&title=' +
                encodedText();
            window.open(url1, '_blank');
            break;
        case 'WECHAT':
            document.getElementById('qr-card-backdrop').style.display = 'flex';
            break;
        case 'FACEBOOK':
            let url3 =
                'https://www.facebook.com/sharer/sharer.php?u=' +
                encodeURIComponent(window.location.href);
            window.open(url3, '_blank');
            break;
        case 'TWITTER':
            let url4 =
                'https://twitter.com/intent/tweet?url=' +
                encodeURIComponent(window.location.href) +
                '&text=' +
                encodedText();
            window.open(url4, '_blank');
            break;
        default:
            window.alert('unknown website ' + website);
    }
}

function encodedText() {
    return encodeURIComponent(
        pageLang === 'zh'
            ? '#清明# 我正在和' + visitorCount + '人一同逆时针行走纪念逝者'
            : '#qingming# #清明# an online counterclockwise walk to commemorate COVID-19 victims'
    );
}

function preventEvent(event) {
    event.stopPropagation();
}

function addOnePoint(randomRadius, randomHeight, initPosition, name) {
    personPoint = new PersonPoint(randomRadius, randomHeight, initPosition);
    if (name !== "—") {
        console.log(name);
        personPoint.createBillboard(name, camera);
        personPoint.userInputBoard.container.scale.x = 0.6;
        personPoint.userInputBoard.container.scale.y = 0.6;
        personPoint.userInputBoard.container.scale.z = 0.6;
        personPoint.userInputBoard.detailsElement.style.fontWeight = 900;
        sceneCSS.add(personPoint.userInputBoard.container);
    }
    scene.add(personPoint.point);
    scene.add(personPoint.trailLine);
    personPoint.tweenTime = 500 + 300*Math.random();
    personPoints.push(personPoint);
}

function addPoints(initPos, numberOfPoints) {
    let pointsNumber = 0;
    let remainNumber = 0;
    if (numberOfPoints > maxNumberOfPoints) {
        pointsNumber = maxNumberOfPoints;
        remainNumber = numberOfPoints - maxNumberOfPoints;
    } else {
        pointsNumber = numberOfPoints;
    }
    let initPosition = initPos;
    initPosition = new THREE.Vector3(0, 0, 0);
    let heightGap = maxHeight / pointsNumber;
    let pulseCounter = 0;

    let heightNumber = 3;
    let currentSinRange =
        Math.floor(Math.random() * 100) + Math.floor(pointsNumber / heightNumber);
    let sinCounter = 0;

    for (let i = 0; i < pointsNumber; i++) {
        if (sinCounter > currentSinRange) {
            sinCounter = 0;
            currentSinRange =
                Math.floor(Math.random() * 100) +
                Math.floor(pointsNumber / heightNumber);
        }
        let sinIndex = Math.PI * (sinCounter / currentSinRange);
        let randomRadius = 0;
        randomRadius =
            (Math.abs(Math.sin(sinIndex)) * maxRadius + 500) * Math.random() + 50;
        let pointHeight = i * heightGap;
        personPoint = new PersonPoint(randomRadius, pointHeight, initPosition);
        scene.add(personPoint.point);
        scene.add(personPoint.trailLine);
        personPoints.push(personPoint);
        pulseCounter += 1;
        sinCounter += 1;
    }

    currentSinRange = Math.floor(Math.random() * 100) + Math.floor(remainNumber / heightNumber);
    sinCounter = 0;
    heightGap = maxHeight / remainNumber;
    for (let i = 0; i < remainNumber; i++) {
        if (sinCounter > currentSinRange) {
            sinCounter = 0;
            currentSinRange = Math.floor(Math.random() * 100) + Math.floor(pointsNumber / heightNumber);
        }
        let sinIndex = Math.PI * (sinCounter / currentSinRange);
        let randomRadius = 0;
        randomRadius = (Math.abs(Math.sin(sinIndex)) * maxRadius + 500) * Math.random() + 50;
        let pointHeight = i * heightGap;
        let center = [0, pointHeight, 0];
        let xRot = Math.random() * 0.5 - 0.25;
        let zRot = Math.random() * 0.5 - 0.25;
        let materialColor = Math.floor(Math.random() * 255).toString();
        let color = new THREE.Color("rgb(" + materialColor + "," + materialColor + "," + materialColor + ")");
        let lineWidth = Math.random();
        let circleTrail = new CircleTrail(center, randomRadius, xRot, zRot, color, lineWidth);
        scene.add(circleTrail.circleTrailGroup);
        sinCounter += 1;
    }

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
    // scene.fog = new THREE.Fog(0xdedede, 100, 80000);
    // renderer.setClearColor(scene.fog.color, 1);
}

function addSkybox() {
    let vertexShader = document.getElementById('vertexShader').textContent;
    let fragmentShader = document.getElementById('fragmentShader').textContent;
    let uniforms = {
        topColor: {
            type: 'c',
            value: new THREE.Color(0xcad4db)
        },
        bottomColor: {
            type: 'c',
            value: new THREE.Color(0xf0f4f7)
        },
        offset: {
            type: 'f',
            value: 33
        },
        exponent: {
            type: 'f',
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
        .to(
            {
                x: target.x,
                y: target.y,
                z: target.z
            },
            tweenTime
        )
        .easing(easingFunction)
        .onUpdate(function () {
        })
        .onComplete(() => finishFunction())
        .start();
}

function initCamMove() {
    let topTarget = new THREE.Vector3(0, 2000, 3500);
    let tweenTime = 8000;
    moveCamera(topTarget, tweenTime, () => {
    }, TWEEN.Easing.Linear.None);
}

function moveToTop() {
    if (controls.autoRotate) {
        controls.autoRotate = false;
        let button = document.getElementsByClassName('view-angle3-button')[0];
        button.innerHTML = pageLang === 'zh' ? '环视' : 'Orbit';
    }
    let topTarget = new THREE.Vector3(0, 3000, 3000);
    let tweenTime = 2000;
    moveCamera(
        topTarget,
        tweenTime,
        () => {
            topTarget = new THREE.Vector3(0, 6000, 0);
            tweenTime = 3000;
            moveCamera(
                topTarget,
                tweenTime,
                () => {
                    'whatever';
                },
                TWEEN.Easing.Cubic.InOut
            );
        },
        TWEEN.Easing.Linear.None
    );
}

function moveAuto() {
    if (controls.autoRotate) {
        controls.autoRotate = false;
        let button = document.getElementsByClassName('view-angle3-button')[0];
        button.innerHTML = pageLang === 'zh' ? '环视' : 'Orbit';
    } else {
        let freeViewTarget = new THREE.Vector3(0, 3000, 5000);
        let tweenTime = 4000;
        moveCamera(
            freeViewTarget,
            tweenTime,
            () => {
                controls.autoRotate = !controls.autoRotate;
                let button = document.getElementsByClassName('view-angle3-button')[0];
                button.innerHTML = pageLang === 'zh' ? '停止' : 'Stop';
            },
            TWEEN.Easing.Cubic.InOut
        );
    }
}

function moveToFreeView() {
    if (controls.autoRotate) {
        controls.autoRotate = false;
        let button = document.getElementsByClassName('view-angle3-button')[0];
        button.innerHTML = pageLang === 'zh' ? '环视' : 'Orbit';
    }
    let freeViewTarget = new THREE.Vector3(0, 3000, 5000);
    let tweenTime = 4000;
    moveCamera(
        freeViewTarget,
        tweenTime,
        () => console.log('ff'),
        TWEEN.Easing.Cubic.InOut
    );
}

function moveModelMap() {
    model.position.x = moveAroundOffset.x + initModelPos.x;
    model.position.y = moveAroundOffset.y + initModelPos.y;
    model.position.z = moveAroundOffset.z + initModelPos.z;
    plane.position.x = moveAroundOffset.x + initMapPos.x;
    plane.position.y = moveAroundOffset.y + initMapPos.y;
    plane.position.z = moveAroundOffset.z + initMapPos.z;
}

function resetModelMap() {
    console.log('reset');
    model.position = initModelPos;
    plane.position = initMapPos;
}

function onWindowResize() {
    if (window.innerWidth < 1400) {
        if (inputField !== null) {
            inputField.screenOffset.x = 130;
            if (window.innerWidth < 380) {
                inputField.buttonOffset.x = xOffset;
                inputField.buttonOffset.y = yOffset;
            }
        }
    } else {
        if (inputField !== null) {
            inputField.screenOffset.x = 0;
        }
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererCSS.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    TWEEN.update();
    //---------Input
    if (inputField !== null) {
        if (inputField.generateNewPoint) {
            console.log('Get a new point');
            let newPoint = new PersonPoint(
                1000,
                maxHeight / 2,
                inputField.trailGroup.position
            );
            newPoint.trailLine.material.color = new THREE.Color('#ff0000');
            newPoint.point.material.color = new THREE.Color('#ff0000');
            newPoint.createBillboard(inputField.userInputContent, camera);
            newPoint.tweenTime = 6000 + Math.random() * 2000;
            newPoint.trailLine.material.linewidth = 3;
            scene.add(newPoint.point);
            scene.add(newPoint.trailLine);
            sceneCSS.add(newPoint.userInputBoard.container);
            personPoints.push(newPoint);
            inputField.newGeneratedPoint = newPoint;
            inputField.generateNewPoint = false;
        }
    }
    //---------Progress
    if (displayLoadProgress < loadProgress && displayLoadProgress < 100) {
        displayLoadProgress += Math.random() * 5;
        if (displayLoadProgress > 100) {
            displayLoadProgress = 100;
        }
        let result = displayLoadProgress.toFixed(0);
        let progress = document.getElementById('loading');
        progress.innerHTML = result + '%';
        if (!fullyLoaded) {
            if (result === '100') {
                fullyLoaded = true;
                let arry = document.getElementsByClassName('hidden');
                arry = [].slice.call(arry);
                for (let i = 0; i < arry.length; i++) {
                    if (arry[i].tagName !== 'BUTTON') {
                        arry[i].className = 'intro visible fade-in';
                    } else {
                        arry[i].className = 'fade-in visible';
                    }
                }
                document.getElementById('loading').className = 'loaded';
                // document.getElementById("main-title").className="title-loaded"
            }
        }
    }
    //---------Cloud
    let numberOfWalking = 0;
    for (let i = 0; i < personPoints.length; i++) {
        personPoints[i].update();
        if (personPoints[i].startRotate){
            numberOfWalking += 1;
        }
    }
    if (currentNumberOfWalker !== numberOfWalking){
        currentNumberOfWalker = numberOfWalking;
        document.getElementById('visitor-count-bar').innerText =
            pageLang === 'zh'
                ? (currentNumberOfWalker+1) + '人正在逆时针行走'
                : (currentNumberOfWalker+1) + ' people are walking counterclockwise';
    }
    //---------Billboards
    for (let i = 0; i < billBoards.length; i++) {
        billBoards[i].update();
    }
    controls.update();
    if (inputField !== null) {
        inputField.update();
    }
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
    rendererCSS.render(sceneCSS, camera);
}

//-------------------------For Debug Panel
function addControl() {
    let options = {
        Top: moveToTop,
        Around: moveToFreeView,
        Auto: moveAuto,
        Move: moveModelMap,
        Reset: resetModelMap
    };
    let gui = new dat.GUI();
    let position = gui.addFolder('Position');
    position
        .add(plane.position, 'x', -10000, 10000)
        .name('PositionX')
        .listen();
    position
        .add(plane.position, 'y', -1000, 1000)
        .name('PositionY')
        .listen();
    position
        .add(plane.position, 'z', -10000, 10000)
        .name('PositionZ')
        .listen();
    let rotation = gui.addFolder('Rotation');
    position
        .add(plane.rotation, 'x', 0, Math.PI)
        .name('rotateX')
        .listen();
    position
        .add(plane.rotation, 'y', 0, Math.PI)
        .name('rotateY')
        .listen();
    position
        .add(plane.rotation, 'z', 0, Math.PI)
        .name('rotateZ')
        .listen();
    let scale = gui.addFolder('Scale');
    scale
        .add(plane.scale, 'x', 0, 3)
        .name('ScaleX')
        .listen();
    scale
        .add(plane.scale, 'y', 0, 3)
        .name('Scaley')
        .listen();
    let move = gui.addFolder('MoveAround');
    move
        .add(moveAroundOffset, 'x', -30000, 30000)
        .name('MoveAroundX')
        .listen();
    move
        .add(moveAroundOffset, 'y', -30000, 30000)
        .name('MoveAroundY')
        .listen();
    move
        .add(moveAroundOffset, 'z', -30000, 30000)
        .name('MoveAroundZ')
        .listen();
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

//-------------------------For Animation Rendering
function getNamesAndTime(){
    let overallArray = nameData.split(" ,");
    for (let i=0; i<overallArray.length; i++){
        if (i%2 === 0){
            enterTimes.push(overallArray[i]);
        }
        else{
            userNames.push(overallArray[i]);
        }
    }
}

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function generateAnimationVariables(initPos, numberOfPoints){
    console.log("Generate " + numberOfPoints.toString() + " points");
    let pointsNumber = numberOfPoints;
    let heightGap = maxHeight / pointsNumber;
    let heightNumber = 3;
    let currentSinRange =
        Math.floor(Math.random() * 100) + Math.floor(pointsNumber / heightNumber);
    let sinCounter = 0;
    let pulseCounter = 0;
    for (let i = 0; i < pointsNumber; i++) {
        if (sinCounter > currentSinRange) {
            sinCounter = 0;
            currentSinRange =
                Math.floor(Math.random() * 100) +
                Math.floor(pointsNumber / heightNumber);
        }
        let sinIndex = Math.PI * (sinCounter / currentSinRange);
        let randomRadius = 0;
        randomRadius =
            (Math.abs(Math.sin(sinIndex)) * maxRadius + 500) * Math.random() + 50;
        let pointHeight = i * heightGap;
        animationPointsRadius.push(randomRadius);
        animationPointsHeight.push(pointHeight);
        pulseCounter += 1;
        sinCounter += 1;
        animationShuffleIndex.push(i);
    }
    animationShuffleIndex = shuffle(animationShuffleIndex);
}

function generateAnimationPoint(){
    let randomX = Math.random()*2000 - 1000;
    let randomZ = Math.random()*2000 - 1000;
    if (randomX < 0){
        randomX -= 1000;
    }
    else{
        randomX += 1000;
    }
    if (randomZ < 0){
        randomZ -= 1000;
    }
    else{
        randomZ += 1000;
    }
    let randomY = Math.random()*1000;
    let initPositin = new THREE.Vector3(randomX, randomY, randomZ);
    currentAnimationProgressIndex += 1;
    if (currentAnimationProgressIndex < userNames.length){
        let spatialIndex = animationShuffleIndex[currentAnimationProgressIndex];
        let currentRadius = animationPointsRadius[spatialIndex];
        let currentHeight = animationPointsHeight[spatialIndex];
        let name = userNames[currentAnimationProgressIndex];
        addOnePoint(currentRadius, currentHeight, initPositin, name);
        //TODO: Change Visitor Text
        console.log("Generated One Animation Point");
    }
}




















/**
 * Created by jane01.xiong on 2016/12/12.
 */
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var ASPECT_RATIO = WIDTH / HEIGHT;
var windowHalfX = WIDTH / 2;
var windowHalfY = HEIGHT / 2;
var INV_MAX_FPS = 1 / 100;

var paradeCfg = {
    playGroundHeight : 1000,
    playGroundWidth : 1000,
    playGroundDepth : 1000,
    bridgeLength : 300,
    backStageRadius: 1200,
    stageHeight: 80,
    stageColor:0xffffff,
    carWidth: 200,
    carColor: 0xff00ff,
    startStep: 3
};
var renderer;
var scene;
var camera;
var splineCamera;
var cameraHelper;
var cameraEye;
var lookAtEye;
var container;
var resManager = {};
var cameraControls;
var mixer, morphs = [];
var clock = new THREE.Clock();
var frameDelta = 0;
var startSceneBgm;
var objects = [];
var textEight;
var chooseEightCount = 0;
var maxChooseEightTimes = 3;
var isGameStart = false;
var startSceneGroup;
var isStartSceneFadeOut = false;
var startSceneFadeOutSpeed = 100;

var isIslandFirstLoaded = false;
var isIslandSecondLoaded = false;

var isIslandFirstCreated = false;
var isIslandSecondCreated = false;
var firstIsland;
var secondIsland;
var car;
var isEnableControlGui = true;
var firstIslandSize ={};
var secondIslandSize={};
var paradeStarted = false;

var isDragDropEnable = false;
var raycaster = new THREE.Raycaster();
var plane = new THREE.Plane();
var dragControls;
var pathTube;
var secondIslandTube;
var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();

var control;
var stats;

var pointLight;
var spotLight;
var hemisphereLight;
var ambientLight;
var directionalLight;
var controlLight = false;
var controlCamera = true;


var projector ;
var frontStage;
var backStage;
var bridge;

// background stuff
var clock;
var canvas;

var mouseX = 0;
var mouseY = 0;
var scrollStartX = 0 ;
var scrollStartY = 0;

var scrollDownStatus = true;
var ball;

var platform;
var activeCamera;


var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var velocity = new THREE.Vector3();
var prevTime = performance.now();
var bridge;
var platform2;
var showBridge = false;
var last = false;
var finished = false;

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
    intersection = new THREE.Vector3(),
    INTERSECTED, SELECTED;



var textGroup;
var font;

var COLORS = ['blue', 'green', 'red', 'pink'];

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.domElement.style.position = "relative";
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    // container.appendChild(renderer.domElement);

    // createStartScene();
    showLoadingProgress();
    asynloadIslandOneResources();
    asynLoadIslandTwoResource();

    // setup the control object for the control gui
    // initControls();

    // render();
    // addStatsObject();
    // initEvents();
}

function initControls(){
    if (!isEnableControlGui){
        return;
    }
    if (!ambientLight){
        return;
    }
    control = new function () {
        this.point = 0.001;
        if (controlLight){
            this.ambientLightEnable = true;
            this.ambientLightColor = ambientLight.color.getHex();
            this.ambientLightIntensity = ambientLight.intensity;
            this.directionLightEnable = true;
            this.directionalLightColor = directionalLight.color.getHex();
            this.directionalLightIntensity = directionalLight.intensity;
            this.pointLightEnable = true;
            this.pointLightColor = pointLight.color.getHex();
            this.pointLightIntensity = pointLight.intensity;
            this.hemiLightEnable = true;
            this.hemiLightColor = hemisphereLight.color.getHex();
            this.hemiLightGroundColor = hemisphereLight.groundColor.getHex();
            this.hemiLightIntensity = hemisphereLight.intensity;
            this.spotLightEnable = true;
            this.spotLightColor = spotLight.color.getHex();
            this.spotLightIntensity = spotLight.intensity;
        }
        if (controlCamera){
            if (camera){
                this.cameraX = camera.position.x;
                this.cameraY = camera.position.y;
                this.cameraZ = camera.position.z;
                this.cameraRotationX = camera.rotation.x;
                this.cameraRotationY = camera.rotation.y;
                this.cameraRotationZ = camera.rotation.z;
                this.cameraFov = camera.fov;
                this.cameraNear = camera.near;
                this.cameraFar = camera.far;
            }
        }
    };

    // add extras
    addControlGui(control);
}

function addControlGui(controlObject) {
    var gui = new dat.GUI();
    if (controlLight){
        var minLight = -1;
        var maxLight = 1;
        gui.addColor(controlObject, 'ambientLightColor');
        gui.add(controlObject, 'ambientLightIntensity', minLight, maxLight);
        gui.addColor(controlObject, 'directionalLightColor');
        gui.add(controlObject, 'directionalLightIntensity', minLight, maxLight);
        gui.addColor(controlObject, 'pointLightColor');
        gui.add(controlObject, 'pointLightIntensity', minLight, maxLight);
        gui.addColor(controlObject,'hemiLightGroundColor');
        gui.addColor(controlObject, 'hemiLightColor');
        gui.add(controlObject, 'hemiLightIntensity', minLight, maxLight);
        gui.addColor(controlObject, 'spotLightColor', minLight, maxLight);
        gui.add(controlObject, 'spotLightIntensity', minLight, maxLight);
    }

    if (controlCamera) {
        var min = -500, max = 500;
        gui.add(controlObject, 'cameraX', min, max);
        gui.add(controlObject, 'cameraY', min, max);
        gui.add(controlObject, 'cameraZ', 700, 1200);
        gui.add(controlObject, 'cameraRotationX', -0.5 * Math.PI, 0.5 * Math.PI);
        gui.add(controlObject, 'cameraRotationY', -0.5 * Math.PI, 0.5 * Math.PI);
        gui.add(controlObject, 'cameraRotationZ', -0.5 * Math.PI, 0.5 * Math.PI);
        gui.add(controlObject, 'cameraFov', 40, 120);
        gui.add(controlObject, 'cameraNear', 500, 2000);
    }
}

function asynloadIslandOneResources(){
    var floatingIsland = 'assets/models/max/floating_island1.obj';
    var floatingIslandMtl = 'assets/models/max/floating_island1.mtl';
    var jeepUrl = 'assets/models/assimp/jeep/jeep.assimp.json';
    var total = 3;
    var count = 0;
    LoaderUtils.loadMtl(floatingIslandMtl)
        .then(function (result) {
            resManager.floatingIsland1Mtl = result;
            count++;
            return LoaderUtils.loadObj(result, floatingIsland);
        })
        .then(function (result) {
            resManager.floatingIsland1Obj = result;
            count++;
            return LoaderUtils.loadAssimpJson(jeepUrl);
        })
        .then(function (result) {
            resManager.jeep = result;
            count++;
            isIslandFirstLoaded = true;
            //TODO to jane by jane
            // startGame();
            // paradeStarted = true;
            console.log("All done with sequence")
            $("#message").attr("style", "display:none;");
            $("#progressbar").attr("style", "display:none;");
        })
        .catch(function (error) {
            console.log("Error occured in sequence:", error);
        })
        .progress(function (e) {
            console.log("Progress event received:", e);
            var bar = 250,
                currentLoaded = e.loaded / e.total;
            var loaded = (count + currentLoaded) / total;
            bar = Math.floor(bar * loaded);
            $("#bar").width(bar);
        });

}

function asynLoadIslandTwoResource(){
    var floatingIsland = 'assets/models/max/floating_island2.obj';
    var floatingIslandMtl = 'assets/models/max/floating_island2.mtl';
    var total = 3;
    var count = 0;
    LoaderUtils.loadMtl(floatingIslandMtl)
        .then(function (result) {
            resManager.floatingIsland2Mtl = result;
            count++;
            return LoaderUtils.loadObj(result, floatingIsland);
        })
        .then(function (result) {
            resManager.floatingIsland2Obj = result;
            count++;
            isIslandSecondLoaded = true;
            // var secondIslandObj= resManager.floatingIsland2Obj;
            // secondIslandObj.position.y = -1100;
            // // secondIslandObj.position.z = -1000;
            // secondIslandObj.scale.multiplyScalar(8);
            // secondIsland = new THREE.Object3D();
            // secondIsland.add( secondIslandObj );
            // scene.add(secondIsland);
            console.log("All done with sequence")
            $("#message").attr("style", "display:none;");
            $("#progressbar").attr("style", "display:none;");
        })
        .catch(function (error) {
            console.log("Error occured in sequence:", error);
        })
        .progress(function (e) {
            console.log("Progress event received:", e);
            var bar = 250,
                currentLoaded = e.loaded / e.total;
            var loaded = (count + currentLoaded) / total;
            bar = Math.floor(bar * loaded);
            $("#bar").width(bar);
        });
}


function asynLoadResources() {
    var floatingIsland = 'assets/models/max/floating_island.obj';
    var floatingIslandMtl = 'assets/models/max/floating_island.mtl';
    var total = 3;
    var count = 0;
    LoaderUtils.loadMtl(floatingIslandMtl)
        .then(function (result) {
            resManager.floatingIslandMtl = floatingIslandMtl;
            count++;
            return LoaderUtils.loadObj(result, floatingIsland);
        })
        .then(function (result) {
            resManager.floatingIslandObj = result;
            count++;
            return LoaderUtils.loadMtl(floatingIslandMtl);
        })
        .then(function () {
            console.log("All done with sequence")
            $("#message").attr("style", "display:none;");
            $("#progressbar").attr("style", "display:none;");
        })
        .catch(function (error) {
            console.log("Error occured in sequence:", error);
        })
        .progress(function (e) {
            console.log("Progress event received:", e);
            var bar = 250,
                currentLoaded = e.loaded / e.total;
            var loaded = (count + currentLoaded) / total;
            bar = Math.floor(bar * loaded);
            $("#bar").width(bar);
        });
}

function showLoadingProgress(){
    $("#progress").attr("style", "display:block;");
}

function getRandomColor() {
    var index = Math.floor(Math.random() * COLORS.length);
    return COLORS[index];
}

function createStartScene() {
    var near = 1;
    var far = 5000;
    var FLOOR = -300;
    var startScene = new THREE.Scene();
    scene = startScene;
    scene.fog = new THREE.Fog(0xf0a8de, 2000, far);
    var fov = 45;
    var startSceneCamera = new THREE.PerspectiveCamera(fov, ASPECT_RATIO, near, far);
    camera = startSceneCamera;
    camera.position.set(450, 270, 600);
    scene.add(camera);

    renderer.setClearColor( scene.fog.color );

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement );
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.25;
    cameraControls.enableZoom = false;

    pointLight = new THREE.PointLight(0x98377f, 0.2);
    pointLight.position.set(-1000,500,0);
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight(0xad3ec8,0.5);
    directionalLight.position.set(20, 400, 200);
    scene.add(directionalLight);

    spotLight = new THREE.SpotLight( 0xffffff,0.2);
    spotLight.position.set( 200, 1000, 200 );
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = WIDTH;
    spotLight.shadow.mapSize.height = HEIGHT;

    spotLight.shadow.camera.near = near;
    spotLight.shadow.camera.far = far;
    spotLight.shadow.camera.fov = fov;
    // scene.add( spotLight );

    hemisphereLight = new THREE.HemisphereLight(0xb17da4, 0x575555,0.5);
    scene.add(hemisphereLight);

    ambientLight = new THREE.AmbientLight(0xe35dc5, 0.5);
    scene.add(ambientLight);

    var geometry = new THREE.PlaneBufferGeometry(100, 100);
    var groundMaterial = new THREE.MeshPhongMaterial({
        color: 0xf07ad2,
        emissive: 0x635430
    });

    var ground = new THREE.Mesh(geometry, groundMaterial);
    ground.position.set(0, FLOOR, 0);
    ground.rotation.x = -Math.PI / 2;
    ground.scale.set(100, 100, 100);
    ground.castShadow = false;
    ground.receiveShadow = true;
    scene.add(ground);

    startSceneGroup = new THREE.Group();
    startSceneGroup.castShadow= true;
    scene.add(startSceneGroup);
    startSceneGroup.position.set(-400, FLOOR, -500);

    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xd88f19
       });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(1800, 220, 150), planeMaterial);
    mesh.position.y = -50;
    mesh.position.z = 20;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    startSceneGroup.add(mesh);

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2000, 170, 250), planeMaterial);
    mesh.position.y = -50;
    mesh.position.z = 20;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    startSceneGroup.add(mesh);

    var loader = new THREE.FontLoader();
    var fontUrl = 'assets/fonts/fzstk.typeface.json';
    var text1 = '8';
    var text2 = '的';
    var text3 = '游';
    var text4 = '行';
    loader.load(fontUrl, function (response) {
        resManager.font = response;
        var parameters = {
            font: resManager.font,
            size: 500,
            height: 50,
            curveSegments: 12,
            bevelThickness: 2,
            bevelSize: 5,
            bevelEnabled: true
        };
        var textMaterial = new THREE.MeshPhongMaterial({color: 0xee0e8c, specular: 0xffffff});
        var text1Geo = new THREE.TextGeometry(text1, parameters);
        textEight = new THREE.Mesh(text1Geo, textMaterial);
        textEight.position.x = -400;
        textEight.position.y = 65;
        textEight.position.z = 0;
        textEight.castShadow= true;
        textEight.name = 'textEight';
        startSceneGroup.add(textEight);
        objects.push(textEight);
        parameters = {
            font: resManager.font,
            size: 250,
            height: 50,
            curveSegments: 12,
            bevelThickness: 4,
            bevelSize: 5,
            bevelEnabled: true
        };
        var text2Geo = new THREE.TextGeometry(text2, parameters);
        var text2Mesh = new THREE.Mesh(text2Geo, textMaterial);
        text2Mesh.position.set(-70, 250, 0);
        startSceneGroup.add(text2Mesh);

        var text2tGeoMaterial = new THREE.MeshPhongMaterial({color: 0x1930d8, specular: 0xffffff, wireframe:true});
        var text2GeoDown = new THREE.OctahedronBufferGeometry(95, 1);
        var text2DownMesh = new THREE.Mesh(text2GeoDown, text2tGeoMaterial);
        text2DownMesh.position.set(95, 160, 70);
        startSceneGroup.add(text2DownMesh);

        var text3Geo = new THREE.TextGeometry(text3, parameters);
        var text3Mesh = new THREE.Mesh(text3Geo, textMaterial);
        text3Mesh.position.set(250, 250, 0);
        startSceneGroup.add(text3Mesh);

        var text3tGeoMaterial = new THREE.MeshPhongMaterial({color: 0x3914af, specular: 0xffffff, wireframe:true});
        var text3GeoDown = new THREE.BoxBufferGeometry(155, 155, 155);
        var text3DownMesh = new THREE.Mesh(text3GeoDown, text3tGeoMaterial);
        text3DownMesh.position.set(400, 145, 20);
        startSceneGroup.add(text3DownMesh);

        var text4Geo = new THREE.TextGeometry(text4, parameters);
        var text4Mesh = new THREE.Mesh(text4Geo, textMaterial);
        text4Mesh.position.set(550, 250, 0);
        startSceneGroup.add(text4Mesh);

        var tex4tGeoMaterial = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0xffffff, wireframe:true});
        var text4GeoDown = new THREE.TetrahedronBufferGeometry(100, 1);
        var text4DownMesh = new THREE.Mesh(text4GeoDown, tex4tGeoMaterial);
        text4DownMesh.position.set(700, 160, 60);
        startSceneGroup.add(text4DownMesh);
    });
    mixer = new THREE.AnimationMixer(scene);
    var loader = new THREE.JSONLoader();
    loader.load("assets/models/animated/horse.js", function (geometry) {
        var xRange = 300;
        var duration = 1;
        var horseY = -5;
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, 200, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, 300, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, 450, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, 520, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, -150, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, -250, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, -350, true);
        addMorph(geometry, 550, duration, -Math.random() * xRange, horseY, -500, true);
    });
    loader.load("assets/models/animated/flamingo.js", function (geometry) {
        addMorph(geometry, 500, 1, 500 - Math.random() * 500,  350, 300);
    });

    loader.load("assets/models/animated/stork.js", function (geometry) {
        addMorph(geometry, 350, 1, 500 - Math.random() * 500,  350, 440);
    });
    loader.load("assets/models/animated/parrot.js", function (geometry) {
        addMorph(geometry, 450, 0.5, 500 - Math.random() * 500,  300, 500);
    });

    var loadingBgm = "assets/audio/loading_bgm.ogg";
    var audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    var oceanAmbientSound = new THREE.Audio(audioListener);
    scene.add(oceanAmbientSound);
    startSceneBgm = oceanAmbientSound;
    var loader = new THREE.AudioLoader();
    loader.load(
        loadingBgm,
        // Function when resource is loaded
        function (audioBuffer) {
            // set the audio object buffer to the loaded object
            oceanAmbientSound.setBuffer(audioBuffer);
            // play the audio
            oceanAmbientSound.setVolume(0.3);
            oceanAmbientSound.setLoop(true);
            oceanAmbientSound.play();
        },
        // Function called when download progresses
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function (xhr) {
            console.log('An error happened');
        }
    );
    camera.lookAt(startSceneGroup);
}

function addMorph(geometry, speed, duration, x, y, z, fudgeColor) {
    var material = new THREE.MeshLambertMaterial({
        color: 0xffaa55,
        morphTargets: true,
        vertexColors: THREE.FaceColors
    });

    if (fudgeColor) {
        material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
    }

    var mesh = new THREE.Mesh(geometry, material);
    mesh.speed = speed;
    var clip = geometry.animations[0];

    mixer.clipAction(clip, mesh).setDuration(duration).// to shift the playback out of phase:
    startAt(-duration * Math.random()).play();

    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.PI / 2;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    startSceneGroup.add(mesh);
    morphs.push(mesh);
}

function createGameTitle(){
    var loader = new THREE.FontLoader();
    var fontUrl = 'assets/fonts/wcl.typeface.json';
    loader.load(fontUrl, function (response) {
        resManager.font = response;
        // var words = ['8', '的', '游', '行'];
        var words = ['8', '的'];
        var wordOffset = 50;
        var wordWidth = 50;
        var xoffset = -(words.length-1) * (wordOffset + wordWidth) / 2;
        for(var i= 0;i < words.length;i++){
            var textGroup = new THREE.Group();
            textGroup.position.y = 0;
            textGroup.position.x = (i+1)* wordOffset + xoffset;
            textGroup.rotation.x = -0.2;
            scene.add(textGroup);
            createText(words[i],  resManager.font,textGroup, wordWidth, 3);
        }
    });
}

function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {
    var textures = [];
    for ( var i = 0; i < tilesNum; i ++ ) {
        textures[ i ] = new THREE.Texture();
    }
    var imageObj = new Image();
    imageObj.onload = function() {
        var canvas, context;
        var tileWidth = imageObj.height;
        for ( var i = 0; i < textures.length; i ++ ) {
            canvas = document.createElement( 'canvas' );
            context = canvas.getContext( '2d' );
            canvas.height = tileWidth;
            canvas.width = tileWidth;
            context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
            textures[ i ].image = canvas
            textures[ i ].needsUpdate = true;
        }
    };
    imageObj.src = atlasImgUrl;
    return textures;
}

function loadAudio(url,volume){
    var audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    var oceanAmbientSound = new THREE.Audio(audioListener);
    scene.add(oceanAmbientSound);
    var loader = new THREE.AudioLoader();
    loader.load(
        url,
        // Function when resource is loaded
        function (audioBuffer) {
            // set the audio object buffer to the loaded object
            oceanAmbientSound.setBuffer(audioBuffer);
            // play the audio
            oceanAmbientSound.setVolume(volume || 0.3);
            oceanAmbientSound.setLoop(true);
            oceanAmbientSound.play();
        },
        // Function called when download progresses
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function (xhr) {
            console.log('An error happened');
        }
    );
}

function showFireWorks(){

}
function showText() {
    var text = "8的游行";
    textGroup = new THREE.Group();
    textGroup.position.y = 100;

    scene.add( textGroup );
    loadFont(text);
}

function loadFont(text) {

    var loader = new THREE.FontLoader();
    loader.load( 'assets/fonts/wcl.typeface.json' , function ( response ) {

        font = response;

        createText(text, font);

    } );

}


function createText(text, font, parent,parameters) {
    var textGeo = new THREE.TextGeometry(text, parameters);
    var material = new THREE.MeshPhongMaterial( { color: 'red', shading: THREE.FlatShading } );
    textGeo.computeBoundingBox();
    var mesh = new THREE.Mesh( textGeo, textMaterial );
    var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    textMesh1 = new THREE.Mesh( textGeo, material );
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = 30;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    parent.add( textMesh1 );

}

function initBgm() {
    var listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    var sound = new THREE.Audio(listener);

    var audioLoader = new THREE.AudioLoader();

    //Load a sound and set it as the Audio object's buffer
    audioLoader.load('assets/audio/taylor/style.ogg', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
}

function initBackground(){
    var path = "assets/textures/cube/skybox/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    // scene.background = textureCube;
}
var dragEnable = true;
function initEvents() {
    $(container).bind("swipe", onTouchSwipe);
    $(window).bind("resize orientationchange", handleResize);
    // $(container).bind("scrollstart", onScrollStart);
    // $(container).bind("scrollstop", onScrollStop);
    // $(container).bind("tap", onTap);
    // $(container).bind("taphold", onTap);
    // $(container).bind("click", onClick);
    // $(container).bind("vclick", onVclick);
    $(container).bind("taphold", onTaphold);
    $(container).bind("vmousemove", vmousemove);
    $(container).bind("vmousedown",vmousedown);
    $(container).bind("vmouseup", vmouseup);
}
var initMouse = false;
function vmousedown(event){
    console.log("vmousedown");
    event.preventDefault();
    invokePlayBgm();
    if (!initMouse){
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    if (!camera){
        return;
    }

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects, true);
    if ( intersects.length > 0 ) {
        // controls.enabled = false;
        SELECTED = intersects[ 0 ].object;
        if (isDragDropEnable){
            if (!initMouse){
                // plane.setFromNormalAndCoplanarPoint(
                //     camera.getWorldDirection( plane.normal ),
                //     SELECTED.position );
                initMouse = true;
            }
            if ( raycaster.ray.intersectPlane(plane, intersection ) ) {
                offset.copy( intersection ).sub( SELECTED.position );
            }
            container.style.cursor = 'move';
        }
        if (!isGameStart) {
            if (isObjectSelected(SELECTED, 'textEight')){
                chooseEight();
            }
        }else{
            if (isObjectSelected(SELECTED,'car')){
                if (!paradeStarted){
                    startParade();
                }
            }
        }
    }
}

function isObjectSelected(selected, objectName){
    if (!selected){
        return false;
    }
    if (selected.name === objectName){
        return true;
    }
    var parent = selected.userData.parent;
    if (parent && parent.name === objectName){
        return true;
    }
    return false;
}
function startParade(){
    paradeStarted = true;
    // removeCatchObject('car');
    isDragDropEnable = true;
    // cameraControls.enabled = false;

    console.log("car position" + car.position.x +',' + car.position.y + ',' + car.position.z);
    camera.position.set(car.position.x -295,car.position.y + 100, car.position.z + 5);
    camera.far = 1000;
    camera.rotation.set(0, -Math.PI / 2, 0);
    camera.updateProjectionMatrix();
    // initControls();
}

function addCatchObject(object){
    objects.push(object);
}

function removeCatchObject(objectName){
    var index = -1;
    for (var i = 0; i < objects.length; i++) {
        var item = objects[i];
        if (item.name ===objectName){
            index = i;
            break;
        }
    }
    if (index > -1) {
        objects.splice(index, 1);
    }
}

function chooseEight(){
    var step = 50;
    textEight.position.y += step ;
    chooseEightCount++;
    if (chooseEightCount >= maxChooseEightTimes){
        console.log("you are the chosen one");
        startGame();
    }
}


function startGame(){
    isGameStart = true;
}
function sceneSwitch(){
    if (!isGameStart){
        return;
    }
    if (startSceneGroup){
        if(!isStartSceneFadeOut){
            startSceneGroup.position.x += startSceneFadeOutSpeed;
            if (startSceneGroup.position.x > 2000) {
                isStartSceneFadeOut = true;
                clearStartSceneResource();
                createGameWorld();
            }
        }
    }else{
        if (!isIslandFirstCreated){
            createGameWorld();
        }
    }
}

function clearStartSceneResource(){
    startSceneBgm.setLoop(false);
    startSceneBgm.stop();
    startSceneBgm = undefined;
    objects = [];
}
var parent;

function createGameWorld(){
    isIslandFirstCreated = true;
    scene = new THREE.Scene();
    var fieldOfView, nearPlane, farPlane;
    fieldOfView = 50;
    nearPlane = 0.1;
    farPlane = 15000;
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(fieldOfView, ASPECT_RATIO, nearPlane, farPlane);
    camera.position.z = 6000;
    // scene.add(camera);
    //
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement );
    cameraControls.enableDamping = false;
    cameraControls.enableZoom = true;
    cameraControls.enableRotate = true;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000000);

    pointLight = new THREE.PointLight(0x9b3c82, 0.3);
    pointLight.position.set(-850,0,0);
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight(0x7b1194, 0.5);
    directionalLight.position.x = 1;
    directionalLight.position.y = 400;
    scene.add(directionalLight);

    spotLight = new THREE.SpotLight( 0xffffff,1);
    spotLight.position.set( 100, 2000, 100 );
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 5000;
    spotLight.shadow.mapSize.height = 3000;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = fieldOfView;
    // scene.add( spotLight );


    hemisphereLight = new THREE.HemisphereLight(0xb17da4, 0x575555,0.5);
    // scene.add(hemisphereLight);

    ambientLight = new THREE.AmbientLight(0xca5bb1, 0.5);
    scene.add(ambientLight);

    var firstIslandYoffset = -1500;
    var firstIslandObj= resManager.floatingIsland1Obj;
    firstIslandObj.position.y = firstIslandYoffset;
    firstIslandObj.scale.multiplyScalar(10);
    firstIsland = new THREE.Object3D();
    firstIsland.add( firstIslandObj );
    scene.add(firstIsland);
    var bbox = new THREE.Box3().setFromObject(firstIslandObj);
    firstIslandSize.depth = bbox.max.z - bbox.min.z;
    firstIslandSize.height = bbox.max.y - bbox.min.y;
    firstIslandSize.width = bbox.max.x - bbox.min.x;;
    firstIslandSize.surfaceY = firstIslandYoffset + firstIslandSize.height/2 - 170;
    console.log('first Island size: ');
    console.log('depth:' + firstIslandSize.depth);
    console.log('height:' + firstIslandSize.height);
    console.log('width:' + firstIslandSize.width);
    // initPlaygroundAround();

    parent = new THREE.Object3D();
    scene.add( parent );

    car = resManager.jeep;
    car.position.set(0, firstIslandSize.surfaceY, firstIslandSize.depth/2 - 120);
    // car.rotation.y = -Math.PI / 2;
    car.scale.multiplyScalar(10);
    car.name = 'car';
    car.children.forEach(function (child) {
        child.userData.parent = car;
    });

    addCatchObject(car);

    dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
    dragControls.addEventListener( 'dragstart', function ( event ) { cameraControls.enabled = false; } );
    dragControls.addEventListener( 'dragend', function ( event ) { cameraControls.enabled = true; } );

    asynLoadIslandTwoResource();
    var pathY = firstIslandSize.surfaceY+5;
    // var pathY = 200;
    parent.add(car);

    splineCamera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.01, 2000 );
    parent.add( splineCamera );
    cameraHelper = new THREE.CameraHelper(splineCamera );
    cameraHelper.visible = true;
    scene.add( cameraHelper );
    var pathArray = [car.position.clone(),
        new THREE.Vector3(388, pathY, 900),
        new THREE.Vector3(764, pathY, 707),
        new THREE.Vector3(971, pathY, 87),
        new THREE.Vector3(955, pathY, -140),
        new THREE.Vector3(663, pathY, -604),
        new THREE.Vector3(400, pathY, -680),
        new THREE.Vector3(293, pathY, -670),
         new THREE.Vector3(150, pathY, -690),
        new THREE.Vector3(50, pathY, -560),
        new THREE.Vector3(-10, pathY, -200),
        new THREE.Vector3(-100, pathY, 0),
        new THREE.Vector3(-200, pathY, 100),
        new THREE.Vector3(-836, pathY, -169)];

    var pipeSpline = new THREE.CatmullRomCurve3(pathArray);
    pathTube = new THREE.TubeBufferGeometry(pipeSpline, 20, 1, 5, false);
    var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(pathTube, [
        new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            // transparent: true
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.3,
            wireframe: true,
            transparent: true
        })]);
    parent.add(tubeMesh);

    var pathY = 0;

    cameraEye = new THREE.Mesh( new THREE.SphereGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
    parent.add( cameraEye );

    lookAtEye = new THREE.Mesh( new THREE.SphereGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 'red' } ) );
    parent.add( lookAtEye );
    // tubeMesh.position.y = 100;
    // var scale = 6;
    // tubeMesh.scale.set( scale, scale, scale );
    // initControls();
    var loader = new THREE.FontLoader();
    loader.load( 'assets/fonts/gentilis_regular.typeface.json', function ( font ) {
        pathArray.forEach(function(pointPosition){
            addLabel(Math.floor(pointPosition.x)  + '-' + Math.floor(pointPosition.z), pointPosition.clone().add(new THREE.Vector3(0, 100,0)), font);
        });
    } );

}

function showIslandTwo(){
    var secondIslandYoffset = -1500;
    var secondIslandObj = resManager.floatingIsland2Obj;
    secondIslandObj.position.y = secondIslandYoffset;
    secondIslandObj.position.x = -1700;
    secondIslandObj.position.z = 100;
    secondIslandObj.scale.multiplyScalar(10);
    secondIsland = new THREE.Object3D();
    secondIsland.add(secondIslandObj);
    parent.add(secondIsland);
    var bbox = new THREE.Box3().setFromObject(secondIslandObj);
    secondIslandSize.depth = bbox.max.z - bbox.min.z;
    secondIslandSize.height = bbox.max.y - bbox.min.y;
    secondIslandSize.width = bbox.max.x - bbox.min.x;
    secondIslandSize.surfaceY = secondIslandYoffset + secondIslandSize.height / 2  + 100;
    console.log('first Island size: ');
    console.log('depth:' + firstIslandSize.depth);
    console.log('height:' + firstIslandSize.height);
    console.log('width:' + firstIslandSize.width);

    var pathY = secondIslandSize.surfaceY + 5;
    var pathArray = [car.position.clone(),
        new THREE.Vector3(-836, firstIslandSize.surfaceY, -169),
        new THREE.Vector3(-1194, -269, -812),
        new THREE.Vector3(-1367, pathY, -1093),
        new THREE.Vector3(-1131, pathY, -1299),
        new THREE.Vector3(-1148, pathY, -1320),
        new THREE.Vector3(-883, pathY, -1478),
        new THREE.Vector3(-654, pathY, -1628),
        new THREE.Vector3(-500, pathY, -2372),
        new THREE.Vector3(-670, pathY, -2706),
        new THREE.Vector3(-1230, pathY, -2756),
        new THREE.Vector3(-1394, pathY, -2630),
        new THREE.Vector3(-1534, pathY, -2581),
        new THREE.Vector3(-1711, pathY, -2259),
        new THREE.Vector3(-2266, pathY, -1843)];

    var pipeSpline = new THREE.CatmullRomCurve3(pathArray);
    secondIslandTube = new THREE.TubeBufferGeometry(pipeSpline, 20, 1, 5, false);
    var tubeMesh = THREE.SceneUtils.createMultiMaterialObject(secondIslandTube, [
        new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            // transparent: true
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.3,
            wireframe: true,
            transparent: true
        })]);
    parent.add(tubeMesh);

    var loader = new THREE.FontLoader();
    loader.load('assets/fonts/gentilis_regular.typeface.json', function (font) {
        pathArray.forEach(function (pointPosition) {
            addLabel(Math.floor(pointPosition.x) + '-' + Math.floor(pointPosition.z), pointPosition.clone().add(new THREE.Vector3(0, 100, 0)), font);
        });
    });

}

function addLabel( name, location, font ) {
    var textGeo = new THREE.TextGeometry( name, {
        font: font,
        size: 50,
        height: 50,
        curveSegments: 1
    });

    var textMaterial = new THREE.MeshBasicMaterial( { color: 'yellow' } );
    var textMesh = new THREE.Mesh( textGeo, textMaterial );
    textMesh.position.copy( location );
    textMesh.rotation.x =- Math.PI/ 2;
    scene.add( textMesh );

}

function initThreejs() {
    // create a scene, that will hold all our elements such as objects, cameras and lights
    // var oldContainer = document.getElementById("container");
    // document.removeChild(oldContainer);
    //
    // container = document.createElement('div');
    // container.setAttribute("id", "container");
    // document.body.appendChild(container);
    // scene = new THREE.Scene();
    var fieldOfView, nearPlane, farPlane;
    fieldOfView = 50;
    nearPlane = 0.1;
    farPlane = 8000;
    // create a camera, which defines where we're looking at.
    var gameCamera = new THREE.PerspectiveCamera(fieldOfView, ASPECT_RATIO, nearPlane, farPlane);
    // camera.position.z = 6000;
    gameCamera.position.z = 400;
    camera.copy(gameCamera);

    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;

    // now add some better lighting
    ambientLight = new THREE.AmbientLight(0xedad6b, 1.4);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position =new THREE.Vector3(-300, 500, -500);
    directionalLight.name = 'directional';
    scene.add(directionalLight);

    projector = new THREE.Projector();
}

function vmousemove(event){
    console.log("vmousemove");
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    initMouse = true;
    if (!camera){
        return;
    }
    if (true){
        return;
    }

    if (isDragDropEnable) {
        raycaster.setFromCamera(mouse, camera);
        if (SELECTED) {
            if (raycaster.ray.intersectPlane(plane, intersection)) {
                SELECTED.position.copy(intersection.sub(offset));
            }
            return;
        }
        var intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                INTERSECTED = intersects[0].object;
                // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                plane.setFromNormalAndCoplanarPoint(
                    camera.getWorldDirection(plane.normal),
                    INTERSECTED.position);
            }
            container.style.cursor = 'pointer';
        }
        else {
            // if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = null;
            container.style.cursor = 'auto';
        }
    }
}

function vmouseup(event){
    // alert("vmouseup");
    console.log("vmouseup");
    event.preventDefault();


    // if ( INTERSECTED ) {
        SELECTED = null;
    // }
    initMouse = false;

    container.style.cursor = 'auto';
}
function onTaphold(){
    // alert("taphold");
    console.log("tabhold");
}
function onVclick(){
    // alert("vclick");
    console.log("vclick");
}

function initStages(){
    createFrontStage2();
    // createEmptyFrontStage();

    createCar();

    // bridge =new THREE.Mesh(new THREE.BoxGeometry(60,80, 200), new THREE.MeshLambertMaterial({color: 'blue'}));
    // bridge.name =bridge;
    // bridge.position.y = -200;
    // bridge.position.z = -600;
    // scene.add(bridge);
    // bridge.visible = false;
    //
    // platform2 = new THREE.Mesh(new THREE.CylinderBufferGeometry(800, 800, 80, 32), new THREE.MeshLambertMaterial({color: 0x8b8181}));
    // platform2.name='platform2';
    // platform2.position.y = -200;
    // platform2.position.z = -1500;
    // platform2.visible = false;
    // scene.add(platform2);
}

function createCar() {
    car = new THREE.Object3D();
    // var carWidth = paradeCfg.carWidth;
    // var carHeightStep = 30;
    // var carWidthStep = 50;
    // var cylinderGeo = new THREE.CylinderGeometry(carWidth, carWidth , carHeightStep, 100, 100);
    // var cylinder =new THREE.Mesh(cylinderGeo, new THREE.MeshPhongMaterial({color: paradeCfg.carColor}));
    // car.add(cylinder);
    //
    // var cylinder2Geo = new THREE.CylinderGeometry(carWidth - carWidthStep, carWidth - carWidthStep, carHeightStep, 100, 100);
    // var cylinder2 = new THREE.Mesh(cylinder2Geo, new THREE.MeshPhongMaterial({color: 0x00ff00}));
    // cylinder2.position.y = cylinder.position.y + carHeightStep/2;
    // car.add(cylinder2);
    //
    // var cylinder3Geo = new THREE.CylinderGeometry(carWidth - carWidthStep*2, carWidth - carWidthStep*2, carHeightStep, 100, 100);
    // var cylinder3 = new THREE.Mesh(cylinder3Geo, new THREE.MeshPhongMaterial({color: 0xff0000}));
    // cylinder3.position.y = cylinder2.position.y + carHeightStep/2;
    // car.add(cylinder3);
    //
    // car.position.y = frontStage.position.y + paradeCfg.stageHeight /2;
    // car.position.x = 0;
    // car.position.z = paradeCfg.frontStageRadius - paradeCfg.carWidth - 10;
    // car.visible = true;
    // scene.add( car )
}

function loadPlayGround() {
    var onError = function ( xhr ) { };
    var onProgress = function ( xhr ) { };
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'assets/models/max/' );
    mtlLoader.load( 'floating_island.mtl', function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'assets/models/max/' );
        objLoader.load( 'floating_island.obj', function ( object ) {
            object.position.y = -1100;
            object.scale.multiplyScalar(8);
            frontStage = new THREE.Object3D();
            frontStage.add( object );
            scene.add(frontStage);

            var bbox = new THREE.Box3().setFromObject(object);
            paradeCfg.playGroundDepth = bbox.max.z - bbox.min.z;
            paradeCfg.playGroundHeight = bbox.max.y - bbox.min.y;
            paradeCfg.playGroundWidth = bbox.max.x - bbox.min.x;
            console.log("minx:" + bbox.min.x + "maxx:" + bbox.max.x + ",width:" + (bbox.max.x - bbox.min.x));
            console.log("miny:" + bbox.min.y + "maxy:" + bbox.max.y + ",height:" + (bbox.max.y - bbox.min.y));
            console.log("minz:" + bbox.min.z + "maxz:" + bbox.max.z + ", depth: "+ (bbox.max.z - bbox.min.z));
            initPlaygroundAround();
        }, onProgress, onError );

    });

}

function initPlaygroundAround(){
    var aroundColor = 0xdd9b44;
    var depth = paradeCfg.playGroundDepth;
    var width = paradeCfg.playGroundWidth;
    var height = paradeCfg.playGroundHeight;
    var dodGeo1 =  new THREE.DodecahedronGeometry(50,0 );
    var dod1 = new THREE.Mesh(dodGeo1, new THREE.MeshLambertMaterial({color: aroundColor}));
    dod1.position.x = -width + 1500;
    dod1.position.y = -height + 100 ;
    dod1.position.z = depth - 700;
    dod1.rotation.x = 30;
    frontStage.add(dod1);

    var dodGeo2 =  new THREE.DodecahedronGeometry(70,0 );
    var dod2 = new THREE.Mesh(dodGeo2, new THREE.MeshLambertMaterial({color: aroundColor}));
    dod2.position.x = -width + 1700;
    dod2.position.y = -height ;
    dod2.position.z = depth - 600;
    dod2.rotation.x = 45;
    frontStage.add(dod2);

    var dodGeo =  new THREE.DodecahedronGeometry(100,0 );
    var dod = new THREE.Mesh(dodGeo, new THREE.MeshLambertMaterial({color: aroundColor}));
    dod.position.x = -width + 1000;
    dod.position.y = -height + 200 ;
    dod.position.z = depth - 700;
    frontStage.add(dod);

    var dod2 = new THREE.Mesh(dodGeo, new THREE.MeshLambertMaterial({color: aroundColor}));
    dod2.position.x = width - 1200;
    dod2.position.y = -height + 100 ;
    dod2.position.z = depth - 800;
    frontStage.add(dod2);

    var octGeo =  new THREE.OctahedronGeometry(70,0 );
    var oct = new THREE.Mesh(octGeo, new THREE.MeshLambertMaterial({color: aroundColor}));
    oct.position.x = -width + 1000;
    oct.position.y = -height + 600 ;
    oct.position.z = depth - 200;
    frontStage.add(oct);
    frontStage.position.y = -120;
    scene.add(frontStage);
}

function createFrontStage(){
    loadPlayGround();
}

var path = [new THREE.Vector3(-100,0,0), new THREE.Vector3(100, 100, -200), new THREE.Vector3(150, -100, 0),
    new THREE.Vector3(200, 150, 50)];
var index = 0;
var source;
var target;

var ball;
var finished = false;
var direction;
function createFrontStage2(){
    frontStage = new THREE.Object3D();
    var i = 0;
    path.forEach(function(item){
        var sphereGeo = new THREE.SphereGeometry(30, 12, 12);
        var sphere = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color: 0xffffff}));
        sphere.position.x = item.x;
        sphere.position.y = item.y;
        sphere.position.z = item.z;
        sphere.name = i + "ball" ;
        frontStage.add( sphere );
        objects.push(sphere);
        i++;
    });
    var sphereGeo = new THREE.SphereGeometry(15, 12, 12);
    ball = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color: 'red'}));
    scene.add(ball);
    ball.position.x = path[0].x;
    ball.position.y = path[0].y;
    ball.position.z = path[0].z;
    frontStage.visible = false;
    ball.visible = false;
    scene.add(frontStage);
    direction = getDirection(path[1],path[0]);
}

function ballAnimation(){
    var speed = 0.5;
    if (finished){
        return;
    }
    var reached = isBallReachedNext();
    if (reached){
        index++;
        if (index + 1>= path.length){
            finished = true;
            return
        }
        ball.position.x = path[index].x;
        ball.position.y = path[index].y;
        ball.position.z = path[index].z;
        direction = getDirection(path[index+1], path[index]);
    }else{
        ball.position.x += direction.x * speed;
        ball.position.y += direction.y * speed;
        ball.position.z += direction.z * speed;
    }
}

function isBallReachedNext(){
    var pos = ball.position;
    if (index >= path.length -1){
        return true;
    }
    var distance = pos.distanceTo(path[index+1]);
    if (distance < 10){
        return true;
    }
    return false;
}

function getDirection(target, src){
    var targetClone = target.clone();
    var direction = targetClone.sub(src);
    return direction.normalize();
}
function createFrontStage1(){
    frontStage = new THREE.Object3D();
    var frontStageRadius = 500;
    var cylinder = new THREE.CylinderGeometry(frontStageRadius, frontStageRadius - 50, paradeCfg.stageHeight, 100, 100 );
    frontStage.add(new THREE.Mesh(cylinder, new THREE.MeshPhongMaterial({color: paradeCfg.stageColor})));

    var sphereGeo = new THREE.SphereGeometry(frontStageRadius - 500, 12, 12);
    var sphere = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color: 0xffffff, wireframe: true}));
    sphere.position.y = -((frontStageRadius - 200) / 2 +  paradeCfg.stageHeight/2);
    frontStage.add( sphere );

    var dodGeo =  new THREE.DodecahedronGeometry(50,0 );
    var dod = new THREE.Mesh(dodGeo, new THREE.MeshLambertMaterial({color: 0xffffff}));
    dod.position.x = -frontStageRadius + 500;
    dod.position.y = -frontStageRadius + 300 ;
    dod.position.z = frontStageRadius - 600;
    frontStage.add(dod);

    var dod2 = new THREE.Mesh(dodGeo, new THREE.MeshLambertMaterial({color: 0xffffff}));
    dod2.position.x = frontStageRadius - 400;
    dod2.position.y = -frontStageRadius + 500 ;
    dod2.position.z = frontStageRadius - 500;
    frontStage.add(dod2);


    var octGeo =  new THREE.OctahedronGeometry(50,0 );
    var oct = new THREE.Mesh(octGeo, new THREE.MeshLambertMaterial({color: 0xffffff}));
    oct.position.x = -frontStageRadius + 400;
    oct.position.y = -frontStageRadius + 600 ;
    oct.position.z = frontStageRadius - 600;
    frontStage.add(oct);
    frontStage.position.y = -120;
    scene.add(frontStage);
}

function createPlatformGeon(){
    var platformGeom = new THREE.Object3D();
    var cylinder = new THREE.CylinderGeometry(500, 500, 50, 20, 50 );
    platformGeom.add(new THREE.Mesh(cylinder, new THREE.MeshLambertMaterial({color: 0xffffff})));


    var g1 =  new THREE.BoxGeometry( 300, 500, 300 );
    var mesh1 = new THREE.Mesh(g1, new THREE.MeshLambertMaterial({color: 0xffffff}));
    mesh1.position.y = - 150;
    platformGeom.add(mesh1);
    

    var g1 =  new THREE.BoxGeometry( 300, 500, 300 );
    var mesh1 = new THREE.Mesh(g1, new THREE.MeshLambertMaterial({color: 0xffffff}));
    mesh1.position.y = - 150;
    platformGeom.add(mesh1);

    var g2 =  new THREE.DodecahedronGeometry( 200,0 );
    var mesh2 = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({color: 0xffffff}));
    mesh2.position.y = - 200;
    mesh2.position.x = -200;
    mesh2.rotation.x = -250;
    mesh2.rotation.y = -100;
    platformGeom.add(mesh2);

    var g3 =  new THREE.DodecahedronGeometry( 200,0 );
    var mesh3 = new THREE.Mesh(g3, new THREE.MeshLambertMaterial({color: 0xffffff}));
    mesh3.position.y = - 200;
    mesh3.position.x = 200;
    mesh3.rotation.x = -250;
    mesh3.rotation.y = -100;
    platformGeom.add(mesh3);

    // var g2 =  new THREE.DodecahedronGeometry( 100,0 );
    // var mesh2 = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({color: 0xffffff}));
    // mesh2.position.y = - 150;
    // mesh2.position.x = -300;
    // mesh2.position.z = -200;
    // platformGeom.add(mesh2);

    return platformGeom;
}

function createBox(left, right, top, down){
    var vertices = [
        new THREE.Vector3(-left, top, -right),
        new THREE.Vector3(left, top, -right),
        new THREE.Vector3(left, top, right),
        new THREE.Vector3(-left, top, right),

        new THREE.Vector3(-left, down, -right),
        new THREE.Vector3(left, down, -right),
        new THREE.Vector3(left, down, right),
        new THREE.Vector3(-left,down, right),
    ];

    var faces = [
        new THREE.Face3(0, 3, 1),
        new THREE.Face3(3, 2, 1),

        new THREE.Face3(3, 7, 2),
        new THREE.Face3(7, 6, 2),

        new THREE.Face3(1, 2, 6),
        new THREE.Face3(6, 5, 1),

        new THREE.Face3(0, 4, 5),
        new THREE.Face3(5, 1, 0),

        new THREE.Face3(4, 0, 3),
        new THREE.Face3(3, 7, 4),

        new THREE.Face3(4, 5, 6),
        new THREE.Face3(6, 7, 4),
    ];
    var material = new THREE.MeshLambertMaterial({color: 0xffffff});
    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();

    return geometry;
}


function onTap() {
    console.log("tap");
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight ) * 2 + 1;
    // alert("tap");
}
var ballChoosed = false;
function onClick(event) {
    console.log("click");
    // alert("click");
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( [car] );

    if (intersects.length > 0){
        console.log("ball selected");
        ballChoosed = true;

        // cameraControl = new THREE.PointerLockControls( parade.camera );
        // scene.add(cameraControl.getObject());

        // parade.camera.position.x = -200;
        // parade.camera.position.y = 150;
        // parade.camera.position.z = 200;
        // ball.position.y = 0;
        // ball.position.x = 0;
        // ball.position.z = 500;
        camera.position.x = control.cameraX;
        camera.position.y = control.cameraY;
        camera.position.z = control.cameraZ;

        camera.rotation.x = control.cameraRotationX;
        camera.rotation.y = control.cameraRotationY;
        camera.rotation.z = control.cameraRotationZ;


        // parade.camera.position.x = ball.position.x;
        // parade.camera.position.z = ball.position.z + 200;
        // parade.camera.position.y = ball.position.y;
        // parade.camera.rotation.y = -0.5 * Math.PI;
        camera.updateProjectionMatrix();

        // console.log(ball.position);
        // console.log(platform.positon);
        // console.log(parade.camera.position);

    }
}


function onScrollStop(event) {
    // alert("scroll stop");
    console.log("scroll stop");
    var scrollDown = isScrollDown(event);
    //向下滑动
    if (scrollDown) {
        if (scrollDownStatus){
            camera.zoom += 1;
        }
        moveForward = false;
        if (camera.zoom > paradeCfg.startStep) {
            scrollDownStatus = false;
            camera.position.y = 300;
            camera.position.z = 2300;
            camera.position.x = 700;
            camera.zoom = 1;
            car.visible = true;
        }
    }
    // event.preventDefault();
    // event.stopPropagation();
}

function isScrollDown(event){
    if (!event.originalEvent.touches) {
        return;
    }
    var pageY = event.originalEvent.touches[0].clientY;

    //向下滑动
    var diffY = pageY - scrollStartY;
    if (diffY >= 80) {
        return true;
    }
    return false;
}

function onScrollStart(event) {
    // alert("scroll start");
    console.log("scroll start");
    if (!event.originalEvent.touches) {
        return;
    }
    moveForward = true;
    scrollStartX = event.originalEvent.touches[0].clientX;
    scrollStartY = event.originalEvent.touches[0].clientY;
    // event.preventDefault();
    // event.stopPropagation();
    mouse.x = (scrollStartX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( scrollStartY / window.innerHeight ) * 2 + 1;
}

function addStatsObject() {
    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
}

function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) * 4;
    mouseY = ( event.clientY - windowHalfY ) * 4;
}


function onTouchSwipe(event) {
    alert("swipe");
    var touchX = event.swipestop.coords[0];
    var touchY = event.swipestop.coords[1];
    mouseX = ( touchX - windowHalfX ) * 4;
    mouseY = ( touchY - windowHalfY ) * 4;


}

function invokePlayBgm() {
    if (startSceneBgm && startSceneBgm) {
        if (!startSceneBgm.isPlaying) {
            startSceneBgm.play();
        }
    }
}


/**
 * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
 * for future renders
 */
function render(){
    // render using requestAnimationFrame
    requestAnimationFrame(render);
    frameDelta += clock.getDelta();
    // console.log(frameDelta);
    while (frameDelta >= INV_MAX_FPS) {
        startSceneAnimalsAnimation(INV_MAX_FPS);
        // updateCamera();
        animateCar(frameDelta);

        frameDelta -= INV_MAX_FPS;
    }

    sceneSwitch();
    // and render the scene, renderer shouldn't autoclear, we let the composer steps do that themselves
    // rendering is now done through the composer, which executes the render steps
    if (cameraControls) {
        cameraControls.update();
    }
    // console.log(camera.position);
    // control.update();
    if (car){
        console.log('car position,' + car.position.x + ','+car.position.y + ',' + car.position.z);
    }

    if (isEnableControlGui){
      updateLightByControl();
    }


    if (scene && camera) {
        renderer.render(scene, paradeStarted ? splineCamera : camera);
        // renderer.render(scene, camera);
    }
}
var forward = new THREE.Vector3();
var firstIslandCarParadeProgress = 0;
var stepSpeed = 0.01;
var isFirstIslandEnded = false;
var secondIslandCarParadeProgress = 0;
var isSecondIsLandEnded = false;
function animateCar(frameDelta){
    if (!paradeStarted || !car){
        return;
    }

    // Try Animate Camera Along Spline
    // var time = Date.now();
    // var looptime = 20 * 1000;
    var t = firstIslandCarParadeProgress;
    if (t>0.999){
        console.log("first island ended");
        if (!isFirstIslandEnded){
           isFirstIslandEnded = true;
            showIslandTwo(frameDelta);
            // camera.lookAt(secondIsland);
        }
        secondIslandCarAnimation(frameDelta);
        return;
    }
    var prePosition = car.position.clone();
    var scale = 1;
    console.log("t="+ t);
    var pos = pathTube.parameters.path.getPointAt( t );
    console.log('');
    pos.multiplyScalar(scale );
    // pos.add(new THREE.Vector3(20, 70,0));

    // interpolation
    var segments = pathTube.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor( pickt );
    var pickNext = ( pick + 1 ) % segments;

    binormal.subVectors( pathTube.binormals[ pickNext ], pathTube.binormals[ pick ] );
    binormal.multiplyScalar( pickt - pick ).add( pathTube.binormals[ pick ] );

    var dir = pathTube.parameters.path.getTangentAt( t );

    var offset = 15;

    normal.copy( binormal ).cross( dir );

    // We move on a offset on its binormal
    pos.add( normal.clone().multiplyScalar( offset ) );
    car.position.copy(pos);
    splineCamera.position.copy( car.position.clone().add(new THREE.Vector3(0, 200,300)) );

    forward.subVectors(car.position, prePosition).normalize();
    var angle = Math.atan2(forward.x, forward.z) + Math.PI;
    car.rotation.y = angle;

    splineCamera.lookAt(car);
    cameraHelper.visible =true;
    cameraHelper.update();

    firstIslandCarParadeProgress += frameDelta * stepSpeed;
}

function secondIslandCarAnimation(frameDelta){
    var t = secondIslandCarParadeProgress;
    if (t>0.999){
        if (!isSecondIsLandEnded){
            isSecondIsLandEnded = true;
        }
        return;
    }
    var prePosition = car.position.clone();
    var scale = 1;
    console.log("t="+ t);
    var pos = secondIslandTube.parameters.path.getPointAt( t );
    console.log('');
    pos.multiplyScalar(scale );
    // pos.add(new THREE.Vector3(20, 70,0));

    // interpolation
    var segments = secondIslandTube.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor( pickt );
    var pickNext = ( pick + 1 ) % segments;

    binormal.subVectors( secondIslandTube.binormals[ pickNext ], secondIslandTube.binormals[ pick ] );
    binormal.multiplyScalar( pickt - pick ).add( secondIslandTube.binormals[ pick ] );

    var dir = secondIslandTube.parameters.path.getTangentAt( t );

    var offset = 15;

    normal.copy( binormal ).cross( dir );

    // We move on a offset on its binormal
    pos.add( normal.clone().multiplyScalar( offset ) );
    car.position.copy(pos);
    splineCamera.position.copy( car.position.clone().add(new THREE.Vector3(0, 200,300)) );

    forward.subVectors(car.position, prePosition).normalize();
    var angle = Math.atan2(forward.x, forward.z) + Math.PI;
    car.rotation.y = angle;

    splineCamera.lookAt(car);
    cameraHelper.visible =true;
    cameraHelper.update();

    secondIslandCarParadeProgress += frameDelta * stepSpeed;
}

function updateCamera(){
    if (!paradeStarted){
        return;
    }
    if (camera && control) {
        camera.fov = control.cameraFov;
        camera.near = control.cameraNear;
        camera.far = control.cameraFar;
        camera.position.set(control.cameraX, control.cameraY, control.cameraZ);
        camera.rotation.set(control.cameraRotationX, control.cameraRotationY, control.cameraRotationZ);
        // console.log("rotation:" + control.cameraRotationX +','+control.cameraRotationY + ',' + control.cameraRotationZ);
    }
}

function updateLightByControl(){
    if (!controlLight){
        return;
    }
    if (!pointLight || !control){
        return;
    }
    var pLight = new THREE.PointLight(control.pointLightColor,control.pointLightIntensity);
    pointLight.copy(pLight);

    var dRight = new THREE.DirectionalLight(control.directionalLightColor,control.directionalLightIntensity);
    directionalLight.copy(dRight);

    var sLight = new THREE.SpotLight( control.spotLightColor,control.spotLightIntensity);
    spotLight.copy(sLight);

    var hLight = new THREE.HemisphereLight(control.hemiLightColor, control.hemiLightGroundColor,0.5);
    hemisphereLight.copy(hLight);

    var aLight = new THREE.AmbientLight(control.ambientLightColor, control.ambientLightIntensity);
    ambientLight.copy(aLight);
}

function startSceneAnimalsAnimation(delta) {
    if (!morphs || morphs.length < 1) {
        return;
    }
    if (isStartSceneFadeOut){
        return;
    }
    // var delta = clock.getDelta();
    mixer.update(delta);
    for (var i = 0; i < morphs.length; i++) {
        morph = morphs[i];
        morph.position.x += morph.speed * delta;
        if (morph.position.x > 2000) {
            morph.position.x = -1000 - Math.random() * 500;
        }
    }
}

function render1() {

    // update stats
    // stats.update();
    ambientLight.color = control.ambientLightColor;
    directionalLight.color = control.directionalLightColor;

    var timer = -0.0002 * Date.now();

    if (!ballChoosed){
        camera.position.x += ( mouseX - camera.position.x ) * .01;
    }
    var target = car.position;

    if (ballChoosed) {

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        // if ( moveForward ) velocity.z -= 400.0 * delta;

        // cameraControl.getObject().translateX( velocity.x * delta );
        // cameraControl.getObject().translateY( velocity.y * delta );
        // cameraControl.getObject().translateZ( velocity.z * delta );


        var x = car.position.x;
        var z = car.position.z;
        var cx = camera.position.x;
        var cz = camera.position.z;

        var rotSpeed = 0.1;
        // console.log(ball.position);
        if(car.position.z >= -445){
            car.position.x =  x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
            car.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
            camera.position.x =  cx * Math.cos(rotSpeed) + cz * Math.sin(rotSpeed);
            camera.position.z = cz * Math.cos(rotSpeed) - cx * Math.sin(rotSpeed);
        }else{
            bridge.visible= true;
            platform2.visible = true;
            if (!showBridge){
                showBridge = true;
                camera.rotation.y = 0;
                camera.position.z += 250;
            }
        }
        if (showBridge){
            var walkSpped = 2;
            if (car.position.z >= -700){
                car.position.z -= walkSpped;
                camera.position.z -= walkSpped;
                control.cameraRotationX = camera.rotation.x;
                control.cameraRotationY = camera.rotation.y;
                control.cameraRotationZ = camera.rotation.z;
                control.cameraX = camera.position.x;
                control.cameraY = camera.position.y;
                control.cameraZ = camera.position.z;
            }else{
                if (!last){
                    last = true;
                    camera.position.x = -90;
                    camera.position.z += 50;
                    camera.rotation.y = -0.5;
                }
                cx = camera.position.x;
                cz = camera.position.z;
                if (last){
                    rotSpeed = 0.01;
                    if (car.position.z > -2280){
                        car.position.x =  x  * Math.cos(rotSpeed) + (z + 1500)* Math.sin(rotSpeed);
                        car.position.z = -x  * Math.sin(rotSpeed) + (z + 1500)* Math.cos(rotSpeed) - 1500;
                        camera.position.x =  cx  * Math.cos(rotSpeed) + (cz + 1500)* Math.sin(rotSpeed);
                        camera.position.z = -cx  * Math.sin(rotSpeed) + (cz + 1500)* Math.cos(rotSpeed) - 1500;
                    }else{
                        camera.position.y += 0.1;
                        target = scene.position;
                    }

                    // parade.camera.position.x = control.cameraX;
                    // parade.camera.position.y = control.cameraY;
                    // parade.camera.position.z = control.cameraZ;
                    // parade.camera.fov= control.cameraFov;
                    // parade.camera.far = control.cameraFar;
                    // parade.camera.near= control.cameraNear;
                    // parade.camera.rotation.x = control.cameraRotationX;
                    // parade.camera.rotation.y = control.cameraRotationY;
                    // parade.camera.rotation.z = control.cameraRotationZ;


                }
            }
        }



        // parade.camera.position.x = control.cameraX;
        // parade.camera.position.y = control.cameraY;
        // parade.camera.position.z = control.cameraZ;
        // parade.camera.fov= control.cameraFov;
        // parade.camera.far = control.cameraFar;
        // parade.camera.near= control.cameraNear;

        // control.cameraX = parade.camera.position.x;
        // control.cameraZ = parade.camera.position.z;

        // parade.camera.rotation.x = control.cameraRotationX;
        // parade.camera.rotation.y = control.cameraRotationY;
        // parade.camera.rotation.z = control.cameraRotationZ;
        camera.lookAt(target);
        prevTime = time;

    } else {
        camera.lookAt(scene.position);
    }
    ballAnimation();
    camera.updateProjectionMatrix();

    // update light colors
    scene.getObjectByName('ambient').color = new THREE.Color(control.ambientLightColor);
    scene.getObjectByName('directional').color = new THREE.Color(control.directionalLightColor);

    // and render the scene, renderer shouldn't autoclear, we let the composer steps do that themselves
    // rendering is now done through the composer, which executes the render steps

    renderer.render(scene, camera);

    // render using requestAnimationFrame
    requestAnimationFrame(render);
}


/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    ASPECT_RATIO = WIDTH / HEIGHT;
    windowHalfX = WIDTH/ 2;
    windowHalfY = HEIGHT / 2;
    camera.aspect = ASPECT_RATIO;
    camera.updateProjectionMatrix();

    renderer.setSize(WIDTH, HEIGHT);
}


// calls the init function when the window is done loading.
window.onload = init;
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false);


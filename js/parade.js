(function ($) {
    var debug = false;
    $(window).bind("resize orientationchange", handleResize);
    asynLoadResources();

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var ASPECT_RATIO = WIDTH / HEIGHT;
    var windowHalfX = WIDTH / 2;
    var windowHalfY = HEIGHT / 2;
    var INV_MAX_FPS = 1 / 100;

    var resManager = {};
    var clock = new THREE.Clock();
    var container, renderer, camera, scene, splineCamera;
    var pointLight, spotLight, hemisphereLight, ambientLight, directionalLight;
    var keyLight, fillLight, backLight, fillLight2, backLight2;
    var pointLight1, pointLight2, pointLight3;
    var pointLight1Pos, pointLight2Pos, pointLight3Pos;
    var keyLightPos, fillLightPos, backLightPos, fillLightPos2, backLightPos2;
    var shiningLights1 = [], shiningLights2 =[];
    var firstIsland, secondIsland, car, pivotPoint;
    var pathTube;
    var dragControls, cameraControls, cameraHelper;
    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var binormal = new THREE.Vector3(), normal = new THREE.Vector3(), forward = new THREE.Vector3();
    var carSpeed =  0.01, carProgress = 0, cameraUpSpeed = 500, elfJumpSpeed = 10, elfJumpTimesCount = 0;
    var radio1, analyser,audioListener;
    var gameLevel = 1;
    var MAX_GAME_LEVEL = 2;
    var selectedObj;
    var frameDelta = 0;
    var leavingElfs = [];
    var objects = [];
    var catchedElfs = [];
    var isParading = false, isParadeEnded = false, isGameOver = false, isGameStarted = false, isSecondCreated = false;
    var elfAnimationRad = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 3, Math.PI / 4, Math.PI / 6, 0];
    var DRIVER = "duck";
    var bgmSound;
    var controlsParam = {
        enable: false,
        controlCamera: false,
        controlSplieCamera: false,
        controlLight: false,
        showPathPoint: false,
        paradeStop: false,
        controlSecondIsland: false,
        controlPivot: false,
        controlElf: false,
        controlSelected: false
    };
    var ELF_PATH = "assets/models/elf/";

    var firstIslandElfs = ["bat", "bear", "bee",
        "chicken", "dog",
        "changjing", "chicken", "dog", "dog2",
        "woniu",
        "haibao",
        "luotuo",
        "panda"
    ];

    var secondIslandElfs = [
        "woniu", "pangxie", "qingwa",
        "dog2", "haibao", "panda", "bear"
    ];
    var firstIslandRotationsY = [0, -1.4, 0.5, -1.9, 2.6, 2.9, 1.8];
    var secondIslandRotationY = [-2.6, 2, 2.2, 1.6];

    var shiningLightPosition1 = [
        new THREE.Vector3(-277, 58.4, -1459.3),
        new THREE.Vector3(-129.7, 128.9, -1450.5),
        new THREE.Vector3(32.5, 84.9, -1436),
        new THREE.Vector3(136, -47, -1424),
        new THREE.Vector3(135.5, -208.1, -1418.5),
        new THREE.Vector3(-343.7, -79, -1471),
        new THREE.Vector3(-319.6, -250.5, -1467)
    ];

    var shiningLightPosition2 = [
        new THREE.Vector3(161.5, -256.1, -1406),
        new THREE.Vector3(138.6, -312.9, -1408.6),
        new THREE.Vector3(88.5, -345.4, -1395.6),
        new THREE.Vector3(31.1, -371.8, -1394),
        new THREE.Vector3(-27.9, -372.4, -1407.9),
        new THREE.Vector3(-85.9, -382.4, -1413),
        new THREE.Vector3(-143.5, -370.8, -1416),
        new THREE.Vector3(-206, -342, -1421.4),
        new THREE.Vector3(-258.3, -368.5, -1425.2),
        new THREE.Vector3(-319.9, -394, -1427.9)
    ];

    var firstIslandElfPositions = [
        [
            new THREE.Vector3(102, -635, -1477),
            new THREE.Vector3(236, -638, -1498),
            new THREE.Vector3(392, -638, -1544)
        ],
        [
            new THREE.Vector3(1038, -656, -1010),
            new THREE.Vector3(1159, -646, -1204),
        ],
        [
            new THREE.Vector3(217, -649, -3474),
            new THREE.Vector3(327, -660, -3474),
            new THREE.Vector3(189, -646, -3292),
            new THREE.Vector3(575, -649, -3435)
        ],
        [
            new THREE.Vector3(-778, -645, -1682)
        ],
        [
            new THREE.Vector3(-955, -642, -1758)
        ],
        [
            new THREE.Vector3(-1118, -639, -1765)
        ],
        [
            new THREE.Vector3(-1238, -671, -2006)
        ]];
        var secondIslandElfPositions = [
        [
            new THREE.Vector3(-2423, -558, -2734)
        ],
        [
            new THREE.Vector3(-2622, -628, -2868)
        ],
        [
            new THREE.Vector3(-2410, -575, -2720)
        ],
        [
            new THREE.Vector3(-4201, -588, -3876),
            new THREE.Vector3(-4082, -586, -4175),
            new THREE.Vector3(-4173, -596, -4058),
            new THREE.Vector3(-4340, -581, -3925)
        ]];

        var elfPositons = [
        new THREE.Vector3(209, -665, -1504),
        new THREE.Vector3(1002, -641, -1890),
        new THREE.Vector3(236, -659, -3451),
        new THREE.Vector3(392, -653, -2539),
        new THREE.Vector3(-1200, -672, -1855),

        new THREE.Vector3(-2515, -547, -3518),
        new THREE.Vector3(-2613, -564, -4646),
        new THREE.Vector3(-4189, -573, -4028)
        ];

    var carX1 = -30, carX2 = 30, carZ1 = 35, carZ2 = 8, carZ3 = -15, carZ4 = -35;
    var carElfPositon = [
        new THREE.Vector3(carX1, -110, carZ1),
        new THREE.Vector3(carX2, -115, carZ1),
        new THREE.Vector3(carX1, -120, carZ2),
        new THREE.Vector3(carX2, -110, carZ2),

        new THREE.Vector3(carX1, -117, carZ3),
        new THREE.Vector3(carX2, -118, carZ3),
        new THREE.Vector3(carX1, -110, carZ4),
        new THREE.Vector3(carX2, -113, carZ4)
    ];
    var qie;
    var control;

    var cameraStartPosition = new THREE.Vector3(-5300, -40, 700);
    var cameraEndPosition = new THREE.Vector3(-1500, -160, 2400);
    var cameraStartRotation = new THREE.Euler(0, -0.5153, 0);
    var cameraEndRotation = new THREE.Euler(-0.039, -0.5493, 0);

    function getElfCarPosition() {
        var index = Math.floor(Math.random() * carElfPositon.length);
        if (index == -1) {
            index = 3;
        }
        log("index" + index);
        var position = carElfPositon[index];
        var randomX = Math.floor(Math.random()) * 5;
        var randomY = Math.floor(Math.random()) * 5;
        var randomZ = Math.floor(Math.random()) * 5;
         return position;
    }

    function getElfScenePositon(index){
        if (index> elfPositons.length){
            return undefined;
        }
        return elfPositons[index];
    }

    function startGame(){
        container = document.getElementById("container");

        initThreeJs();

        container.appendChild(renderer.domElement);

        render();

        initEvents();

        gameLevel = 1;
        createGameScene(gameLevel);

        if (debug){
            initControls();
        }
        startBgm();
    }

    function startBgm() {
        audioListener = new THREE.AudioListener();
        camera.add(audioListener);

        bgmSound = new THREE.Audio(audioListener);
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load('assets/audio/bgm.ogg', function (buffer) {
            bgmSound.setBuffer(buffer);
            bgmSound.setLoop(true);
            bgmSound.setVolume(0.5);
            bgmSound.play();
        });

        analyser = new THREE.AudioAnalyser( bgmSound, 32 );
        // analyser.smoothingTimeConstant = 0.4;
    }

    function initControls(){
        if (!controlsParam.enable){
            return;
        }
        control = new function () {
            this.paradeStop = controlsParam.paradeStop;
            if (controlsParam.controlLight){
                this.ambientLightEnable = false;
                this.ambientLightColor = ambientLight.color.getHex();
                this.ambientLightIntensity = ambientLight.intensity;

                this.directionLightEnable = false;
                this.directionalLightColor = directionalLight.color.getHex();
                this.directionalLightIntensity = directionalLight.intensity;

                this.pointLightEnable = false;
                this.pointLightColor = pointLight.color.getHex();
                this.pointLightIntensity = pointLight.intensity;

                this.hemiLightEnable = false;
                this.hemiLightColor = hemisphereLight.color.getHex();
                this.hemiLightGroundColor = hemisphereLight.groundColor.getHex();
                this.hemiLightIntensity = hemisphereLight.intensity;

                this.spotLightEnable = false;
                this.spotLightColor = spotLight.color.getHex();
                this.spotLightIntensity = spotLight.intensity;

                this.keyLightColor = keyLight.color.getHex();
                this.keyLightIntensity = keyLight.intensity;
                this.keyLightPositionX = keyLight.position.x;
                this.keyLightPositionY = keyLight.position.y;
                this.keyLightPositionZ = keyLight.position.z;
                this.enableKeyLight = true;

                this.fillLightColor = fillLight.color.getHex();
                this.fillLightIntensity = fillLight.intensity;
                this.fillLightPositionX = fillLight.position.x;
                this.fillLightPositionY = fillLight.position.y;
                this.fillLightPositionZ = fillLight.position.z;
                this.enableFillLight = true;

                this.backLightColor  = backLight.color.getHex();
                this.backLightIntensity = backLight.intensity;
                this.backLightPositionX = backLight.position.x;
                this.backLightPositionY = backLight.position.y;
                this.backLightPositionZ = backLight.position.z;
                this.enableBackLight = true;

                this.fillLight2Color = fillLight2.color.getHex();
                this.fillLight2Intensity = fillLight2.intensity;
                this.fillLight2PositionX = fillLight2.position.x;
                this.fillLight2PositionY = fillLight2.position.y;
                this.fillLight2PositionZ = fillLight2.position.z;
                this.enableFillLight2 = false;

                this.backLight2Color  = backLight2.color.getHex();
                this.backLight2Intensity = backLight2.intensity;
                this.backLight2PositionX = backLight2.position.x;
                this.backLight2PositionY = backLight2.position.y;
                this.backLight2PositionZ = backLight2.position.z;
                this.enableBackLight2 = false;

                this.pointLight1Color = pointLight1.color.getHex();
                this.pointLight1Intensity = pointLight1.intensity;
                this.enablePointLight1 = true;

                this.pointLight2Color = pointLight2.color.getHex();
                this.pointLight2Intensity = pointLight2.intensity;
                this.enablePointLight2 = true;

                this.pointLight3Color = pointLight3.color.getHex();
                this.pointLight3Intensity = pointLight3.intensity;
                this.enablePointLight3 = true;

            } else if (controlsParam.controlCamera) {
                if (camera) {
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
            } else if (controlsParam.controlSplieCamera) {
                if (splineCamera) {
                    this.splineCameraX = splineCamera.position.x;
                    this.splineCameraY = splineCamera.position.y;
                    this.splineCameraZ = splineCamera.position.z;
                    this.splineCameraRotaionX = splineCamera.rotation.x;
                    this.splineCameraRotaionY = splineCamera.rotation.y;
                    this.splineCameraRotaionZ = splineCamera.rotation.z;
                    this.splineCameraFov =- splineCamera.fov;
                    this.splineCameraNear = splineCamera.near;
                    this.splineCameraFar = splineCamera.far;
                }
            }else if (controlsParam.controlSecondIsland){
                if (secondIsland){
                    this.secondIslandX = secondIsland.position.x;
                    this.secondIslandY = secondIsland.position.y;
                    this.secondIslandZ = secondIsland.position.z;
                    this.secondIslandRotationX = secondIsland.rotation.x;
                    this.secondIslandRotationY = secondIsland.rotation.y;
                    this.secondIslandRotationZ = secondIsland.rotation.z;
                    this.secondIslandScale = secondIsland.scale.x;
                }
            }else if (controlsParam.controlPivot){
                if (pivotPoint){
                    this.pivotRotationX = pivotPoint.rotation.x;
                    this.pivotRotationY = pivotPoint.rotation.y;
                    this.pivotRotationZ = pivotPoint.rotation.z;
                    this.pivotPositionX = pivotPoint.position.x;
                    this.pivotPositionY = pivotPoint.position.y;
                    this.pivotPositionZ = pivotPoint.position.z;
                }
            }else if (controlsParam.controlElf){
                if (qie){
                    this.qiePositionX = qie.position.x;
                    this.qiePositionY = qie.position.y;
                    this.qiePositionZ = qie.position.z;
                }
            }
            if (controlsParam.controlSelected){
                this.selectedX = selectedObj != undefined ? selectedObj.position.x : -1;
                this.selectedY = selectedObj != undefined ? selectedObj.position.y : -1;
                this.selectedZ = selectedObj != undefined ? selectedObj.position.z : -1;
                this.selectedRX = selectedObj != undefined ? selectedObj.rotation.x : 0;
                this.selectedRY = selectedObj != undefined ? selectedObj.rotation.y : 0;
                this.selectedRZ = selectedObj != undefined ? selectedObj.rotation.z : 0;
            }

            this.onChange = function () {
                var enableAL = control.ambientLightEnable;
                if (!enableAL) {
                    scene.remove(ambientLight);
                } else {
                    scene.add(ambientLight);
                }
                if (control.directionLightEnable){
                    scene.add(directionalLight);
                }else{
                    scene.remove(directionalLight);
                }
                if (control.pointLightEnable){
                    scene.add(pointLight);
                }else {
                    scene.remove(pointLight);
                }
                if (control.spotLightEnable){
                    scene.add(spotLight);
                }else{
                    scene.remove(spotLight);
                }
                if (control.hemiLightEnable){
                    scene.add(hemisphereLight);
                }else{
                    scene.remove(hemisphereLight);
                }
                if (control.enableKeyLight){
                    scene.add(keyLight);
                    scene.add(keyLightPos);
                }else{
                    scene.remove(keyLight)
                    scene.remove(keyLightPos);
                }
                if (control.enableFillLight){
                    scene.add(fillLight);
                    scene.add(fillLightPos);
                }else{
                    scene.remove(fillLight);
                    scene.remove(fillLightPos);
                }
                if (control.enableBackLight){
                    scene.add(backLight);
                    scene.add(backLightPos);
                }else{
                    scene.remove(backLight);
                    scene.remove(backLightPos);
                }
                if (control.enableFillLight2){
                    scene.add(fillLight2);
                    scene.add(fillLightPos2);
                }else{
                    scene.remove(fillLight2);
                    scene.remove(fillLightPos2);
                }
                if (control.enableBackLight2){
                    scene.add(backLight2);
                    scene.add(backLightPos2);
                }else{
                    scene.remove(backLight2);
                    scene.remove(backLightPos2);
                }

                if (control.enablePointLight1) {
                    scene.add(pointLight1);
                    scene.add(pointLight1Pos);
                } else {
                    scene.remove(pointLight1);
                    scene.remove(pointLight1Pos);
                }
                if (control.enablePointLight2) {
                    scene.add(pointLight2);
                    scene.add(pointLight2Pos);
                } else {
                    scene.remove(pointLight2);
                    scene.remove(pointLight2Pos);
                }

                if (control.enablePointLight3) {
                    scene.add(pointLight3);
                    scene.add(pointLight3Pos);
                } else {
                    scene.remove(pointLight3);
                    scene.remove(pointLight3Pos);
                }
            }
        };

    }

    function addControlGui(controlObject) {
        var gui = new dat.GUI();
        gui.add(controlObject, 'paradeStop');
        if (controlsParam.controlLight) {
            var minLight = -1;
            var maxLight = 1;
            var lightFolder = gui.addFolder("light");
            lightFolder.add(controlObject, 'ambientLightEnable').onChange(control.onChange);
            lightFolder.addColor(controlObject, 'ambientLightColor');
            lightFolder.add(controlObject, 'ambientLightIntensity', minLight, maxLight);

            lightFolder.add(controlObject, 'directionLightEnable').onChange(control.onChange);
            lightFolder.addColor(controlObject, 'directionalLightColor');
            lightFolder.add(controlObject, 'directionalLightIntensity', minLight, maxLight);

            lightFolder.add(controlObject, 'pointLightEnable').onChange(control.onChange);
            lightFolder.addColor(controlObject, 'pointLightColor');
            lightFolder.add(controlObject, 'pointLightIntensity', minLight, maxLight);


            lightFolder.add(controlObject, 'hemiLightEnable').onChange(control.onChange);
            lightFolder.addColor(controlObject, 'hemiLightGroundColor');
            lightFolder.addColor(controlObject, 'hemiLightColor');
            lightFolder.add(controlObject, 'hemiLightIntensity', minLight, maxLight);

            lightFolder.add(controlObject, 'spotLightEnable').onChange(control.onChange);
            lightFolder.addColor(controlObject, 'spotLightColor', minLight, maxLight);
            lightFolder.add(controlObject, 'spotLightIntensity', minLight, maxLight);

            var threePointLight = gui.addFolder("threePointlight");
            var min = -7000, max = 5000;
            var intensityMax = 5;
            var intensityMin = -5;
            threePointLight.add(controlObject, 'enableKeyLight').onChange(control.onChange);
            threePointLight.addColor(controlObject, 'keyLightColor');
            threePointLight.add(controlObject, 'keyLightIntensity', intensityMin,intensityMax);
            threePointLight.add(controlObject, 'keyLightPositionX', min, max);
            threePointLight.add(controlObject, 'keyLightPositionY', min, max);
            threePointLight.add(controlObject, 'keyLightPositionZ', min, max);

            threePointLight.add(controlObject, 'enableFillLight').onChange(control.onChange);
            threePointLight.addColor(controlObject, 'fillLightColor');
            threePointLight.add(controlObject, 'fillLightIntensity', intensityMin,intensityMax);
            threePointLight.add(controlObject, 'fillLightPositionX', min, max);
            threePointLight.add(controlObject, 'fillLightPositionY', min, max);
            threePointLight.add(controlObject, 'fillLightPositionZ', min, max);

            threePointLight.add(controlObject, 'enableBackLight').onChange(control.onChange);
            threePointLight.addColor(controlObject, 'backLightColor');
            threePointLight.add(controlObject, 'backLightIntensity', intensityMin,intensityMax);
            threePointLight.add(controlObject, 'backLightPositionX', min, max);
            threePointLight.add(controlObject, 'backLightPositionY', min, max);
            threePointLight.add(controlObject, 'backLightPositionZ', min, max);

            var threePointLight2 = gui.addFolder("threePointlight2");

            threePointLight2.add(controlObject, 'enableFillLight2').onChange(control.onChange);
            threePointLight2.addColor(controlObject, 'fillLight2Color');
            threePointLight2.add(controlObject, 'fillLight2Intensity', intensityMin,intensityMax);
            threePointLight2.add(controlObject, 'fillLight2PositionX', min, max);
            threePointLight2.add(controlObject, 'fillLight2PositionY', min, max);
            threePointLight2.add(controlObject, 'fillLight2PositionZ', min, max);

            threePointLight2.add(controlObject, 'enableBackLight2').onChange(control.onChange);
            threePointLight2.addColor(controlObject, 'backLight2Color');
            threePointLight2.add(controlObject, 'backLight2Intensity', intensityMin,intensityMax);
            threePointLight2.add(controlObject, 'backLight2PositionX', min, max);
            threePointLight2.add(controlObject, 'backLight2PositionY', min, max);
            threePointLight2.add(controlObject, 'backLight2PositionZ', min, max);


            var pointLight = gui.addFolder("pointLight");
            pointLight.add(controlObject, 'enablePointLight1').onChange(control.onChange);
            pointLight.addColor(controlObject, 'pointLight1Color');
            pointLight.add(controlObject, 'pointLight1Intensity', intensityMin, intensityMax);

            pointLight.add(controlObject, 'enablePointLight2').onChange(control.onChange);
            pointLight.addColor(controlObject, 'pointLight2Color');
            pointLight.add(controlObject, 'pointLight2Intensity', intensityMin, intensityMax);

            pointLight.add(controlObject, 'enablePointLight3').onChange(control.onChange);
            pointLight.addColor(controlObject, 'pointLight3Color');
            pointLight.add(controlObject, 'pointLight3Intensity', intensityMin, intensityMax);
        } else if (controlsParam.controlCamera) {
            var min = -6000, max = 10000;
            gui.add(controlObject, 'cameraX', min, max);
            gui.add(controlObject, 'cameraY', min, max);
            gui.add(controlObject, 'cameraZ', 700, max);
            gui.add(controlObject, 'cameraRotationX', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'cameraRotationY', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'cameraRotationZ', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'cameraFov', 40, 120);
            gui.add(controlObject, 'cameraNear', 500, 2000);
        }else if (controlsParam.controlSplieCamera){
            var min = -100, max = 100;
            gui.add(controlObject, 'splineCameraX', min, max);
            gui.add(controlObject, 'splineCameraY', min, max);
            gui.add(controlObject, 'splineCameraZ', min, max);
            gui.add(controlObject, 'splineCameraRotaionX', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'splineCameraRotaionY', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'splineCameraRotaionZ', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'splineCameraFov', 40, 120);
            gui.add(controlObject, 'splineCameraNear', 500, 2000);
            gui.add(controlObject, 'splineCameraFar', 1000, 5000);
        }else if (controlsParam.controlSecondIsland){
            var min = -1000, max = 1000;
            gui.add(controlObject, 'secondIslandX', min, max);
            gui.add(controlObject, 'secondIslandY', -2000 ,-1800 );
            gui.add(controlObject, 'secondIslandZ', min, max);
            gui.add(controlObject, 'secondIslandRotationX', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'secondIslandRotationY', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'secondIslandRotationZ', -0.5 * Math.PI, 0.5 * Math.PI);
            gui.add(controlObject, 'secondIslandScale', 5, 20);
        }else if (controlsParam.controlPivot){
            var minRad = - Math.PI, maxRad = Math.PI;
            gui.add(controlObject, 'pivotRotationX',  minRad, maxRad);
            gui.add(controlObject, 'pivotRotationY',  minRad, maxRad);
            gui.add(controlObject, 'pivotRotationZ',  minRad, maxRad);

            var min = -1000, max = 1000;
            gui.add(controlObject, 'pivotPositionX', min, max);
            gui.add(controlObject, 'pivotPositionY', min, max);
            gui.add(controlObject, 'pivotPositionZ', min, max);
        }else if (controlsParam.controlElf){
            var min = -500, max = 500;
            gui.add(controlObject, 'qiePositionX', min, max);
            gui.add(controlObject, 'qiePositionY', min, max);
            gui.add(controlObject, 'qiePositionZ', min, max);
        }
        if (controlsParam.controlSelected) {
            var min = -5000, max = 5000;
            var minRad = -Math.PI, maxRad = Math.PI;
            var selected = gui.addFolder("selected");
            gui.add(controlObject, 'selectedX', min, max);
            gui.add(controlObject, 'selectedY', min, max);
            gui.add(controlObject, 'selectedZ', min, max);

            gui.add(controlObject, 'selectedRX', minRad, maxRad);
            gui.add(controlObject, 'selectedRY', minRad, maxRad);
            gui.add(controlObject, 'selectedRZ', minRad, maxRad);
        }
    }


    function addCatchObject(object){
        objects.push(object);
    }

    function removeCatchObjectByname(objectName){
        var index = -1;
        if (!objectName || objectName == ""){
            log("empty name object");
            return;
        }
        for (var i = 0; i< objects.length;i++){
            var item = objects[i];
            var itemName = getObjectName(item);
            if (objectName == itemName){
                index = i;
                break;
            }
        }
        if (index > -1) {
            objects.splice(index, 1);
            log("remove object success :" + objectName);
        }
    }
    function removeCatchObject(object){
        var objectName = getObjectName(object);
        removeCatchObjectByname(objectName);
    }

    function render(){
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        frameDelta += clock.getDelta();
        while (frameDelta >= INV_MAX_FPS) {
            renderCar(frameDelta);
            endParadeAnimation(frameDelta);
            animateElfs(frameDelta);
            // animateShiningLights();
            frameDelta -= INV_MAX_FPS;
        }
        animateRadio();

        if (controlsParam.enable){
            updateByControls();
        }
        if (debug && car){
            // console.log('car position,' + car.position.x + ','+car.position.y + ',' + car.position.z);
        }
        if (scene && camera) {
            renderer.render(scene, getCamera());
            // renderer.render(scene, camera);
        }
        if (selectedObj) {
            log("selected Object position: x =" + selectedObj.position.x + ", y =" + selectedObj.position.y + ",z =" + selectedObj.position.z);
        }
    }

    function animateRadio() {
        if (analyser){
            var average = analyser.getAverageFrequency();
            var value = average / 15.0;
            if (value >0){
                radio1.scale.y = value;
            }
        }
    }

    // function animateShiningLights(){
    //     shiningLights1.forEach(function(item){
    //        item.visible = !item.visible;
    //     });
    //     shiningLights2.forEach(function(item){
    //        item.visible = !item.visible;
    //     });
    // }

    function animateElfs(delta) {
        if (!isParading){
            return;
        }
        var offset = elfJumpTimesCount % elfJumpSpeed;
        elfJumpTimesCount++;
        if (offset != 0) {
            return;
        }
        if (elfJumpTimesCount > 10000) {
            elfJumpTimesCount = 1;
        }
        for (var i = 0; i < leavingElfs.length; i++) {
            var elf = leavingElfs[i];
            var elfObject = elf.object;
            if (elfObject.userData.catched){
                continue;
            }
            if (!elf.originalY) {
                elf.originalY = elfObject.position.y;
            }
            var deltaY = elf.jumpMaxHeight * Math.sin(elfAnimationRad[elf.jumpIndex]);

            elfObject.position.y = elf.originalY + deltaY;
            elf.jumpIndex = (elf.jumpIndex + 1) % elfAnimationRad.length;
        }
    }

    function endParadeAnimation(delta){
        if (isParadeEnded){
            if (isGameOver){
                return;
            }
            if (bgmSound && bgmSound.isPlaying) {
                bgmSound.pause();
            }
            var camera = getCamera();
            var dir = cameraEndPosition.clone().sub(cameraStartPosition).normalize();
            camera.position.y += delta * cameraUpSpeed * dir.y;
            camera.position.z += delta * cameraUpSpeed * dir.z;
            camera.position.x += delta * cameraUpSpeed * dir.x;
            logPosition(camera,"camera position");
            logRotation(camera,"camera rotation");
            // camera.rotation.x -= 0.00001;
            if (camera.position.z > cameraEndPosition.z){
                camera.position.copy(cameraEndPosition);
                camera.rotation.set(cameraEndRotation.x, cameraEndRotation.y, cameraEndRotation.z);

                isGameOver = true;
                if (!debug){
                    showGameOver();
                }
            }
        }
    }

    function showGameOver(){
        setTimeout(" $('#gameover').show(); window.location.reload();", 3000)
    }


    function getCamera(){
        return isParading ? splineCamera : camera;
    }

    function updateByControls(){
        if (!control){
            return;
        }
        if (controlsParam.controlLight){
            updateLightByControl();
        }else if (controlsParam.controlCamera){
            updateCamera();
        }else if (controlsParam.controlSplieCamera){
            updateSplieCamera();
        }else if (controlsParam.controlSecondIsland){
            updateSecondIsland();
        }else if (controlsParam.controlPivot){
            updatePivot();
        }else if (controlsParam.controlElf){
            updateElf();
        }
        if (controlsParam.controlSelected){
            if (selectedObj){
                updateSelected();
            }
        }
    }

    function updateSelected() {
        if (selectedObj.name){
            if (selectedObj.name == 'car'){
                return;
            }
        }
        // selectedObj.position.set(new THREE.Vector3(control.selectedX, control.selectedY, control.selectedZ));
        logPosition(selectedObj, "name is " + (selectedObj.name ? selectedObj.name: ""));
        // selectedObj.rotation.set(control.selectedRX, control.selectedRY, control.selectedRZ);
    }

    function updateElf(){
        if (qie){
            // qie.position.copy(new THREE.Vector3(control.qiePositionX,control.qiePositionY, control.qiePositionZ));

        }
        if(resManager.elfs["bear"]){
            resManager.elfs["bear"].position.copy(new THREE.Vector3(control.qiePositionX,control.qiePositionY, control.qiePositionZ));
        }

    }
    function updatePivot(){
        if (!pivotPoint){
            return;
        }
        pivotPoint.position.copy(new THREE.Vector3(control.pivotPositionX,control.pivotPositionY, control.pivotPositionZ));
        pivotPoint.rotation.copy(new THREE.Euler(control.pivotRotationX, control.pivotRotationY, control.pivotRotationZ));
        // splineCamera.rotation.copy(new THREE.Euler(control.pivotRotationX, control.pivotRotationY, control.pivotRotationZ));
        console.log("pivot rotation:" + control.pivotRotationX + ',' + control.pivotRotationY + ',' + control.pivotRotationZ);
    }

    function updateSecondIsland(){
        if (!secondIsland){
            return;
        }
        secondIsland.position.copy(new THREE.Vector3(control.secondIslandX,control.secondIslandY, control.secondIslandZ));
        secondIsland.rotation.copy(new THREE.Vector3(control.secondIslandRotationX, control.secondIslandRotationY, control.secondIslandRotationZ));
        secondIsland.scale.multiplyScalar(control.secondIslandScale);
        console.log("second island rotation:" + control.secondIslandRotationX + ',' + control.secondIslandRotationY + ',' + control.secondIslandRotationZ);
    }

    function updateThreePointLight(){
        if (keyLight){
            var kLight = new THREE.DirectionalLight(control.keyLightColor,control.keyLightIntensity);
            keyLight.copy(kLight);
            // keyLight.position.copy(new THREE.Vector3(control.keyLightPositionX,control.keyLightPositionY,control.keyLightPositionZ));
            if (keyLightPos){
                // keyLightPos.position.copy(keyLight.position);
                keyLight.position.copy(keyLightPos.position);
            }
        }
        if (fillLight){
            var fLight = new THREE.DirectionalLight(control.fillLightColor,control.fillLightIntensity);
            fillLight.copy(fLight);
            // fillLight.position.copy(new THREE.Vector3(control.fillLightPositionX,control.fillLightPositionY,control.fillLightPositionZ));
            if (fillLightPos){
                // fillLightPos.position.copy(fillLight.position);
                fillLight.position.copy(fillLightPos.position);
            }
        }
        if (backLight){
            var bLight = new THREE.DirectionalLight(control.backLightColor, control.backLightIntensity);
            backLight.copy(bLight);
            // backLight.position.copy(new THREE.Vector3(control.backLightPositionX, control.backLightPositionY, control.backLightPositionZ));
            if (backLightPos) {
                // backLightPos.position.copy(backLight.position);
                backLight.position.copy(backLightPos.position);
            }
        }

        if (fillLight2){
            var fLight = new THREE.DirectionalLight(control.fillLight2Color,control.fillLight2Intensity);
            fillLight2.copy(fLight);
            // fillLight2.position.copy(new THREE.Vector3(control.fillLight2PositionX,control.fillLight2PositionY,control.fillLight2PositionZ));
            if (fillLightPos2){
                // fillLightPos2.position.copy(fillLight2.position);
                fillLight2.position.copy(fillLightPos2.position);
            }
        }
        if (backLight2){
            var bLight = new THREE.DirectionalLight(control.backLight2Color, control.backLight2Intensity);
            backLight2.copy(bLight);
            // backLight2.position.copy(new THREE.Vector3(control.backLight2PositionX, control.backLight2PositionY, control.backLight2PositionZ));
            if (backLightPos2) {
                // backLightPos2.position.copy(backLight2.position);
                backLight2.position.copy(backLightPos2.position);
            }
        }
    }

    function updateSplieCamera(){
        if (!splineCamera){
            return;
        }
        splineCamera.fov = control.splineCameraFov;
        splineCamera.near = control.splineCameraNear;
        splineCamera.far = control.splineCameraFar;
        splineCamera.position.set(control.splineCameraX, control.splineCameraY, control.splineCameraZ);
        splineCamera.rotation.set(control.splineCameraRotaionX, control.splineCameraRotaionY, control.splineCameraRotaionZ);
        console.log("splice camera rotation:" + control.splineCameraRotaionX + ',' + control.splineCameraRotaionY + ',' + control.splineCameraRotaionZ);
    }

    function updateCamera(){
        if (!camera){
            return;
        }
        if (!isParadeEnded){
            return;
        }
        camera.fov = control.cameraFov;
        camera.near = control.cameraNear;
        camera.far = control.cameraFar;
        camera.position.set(control.cameraX, control.cameraY, control.cameraZ);
        camera.rotation.set(control.cameraRotationX, control.cameraRotationY, control.cameraRotationZ);
        console.log("rotation:" + control.cameraRotationX +','+control.cameraRotationY + ',' + control.cameraRotationZ);
    }

    function updateLightByControl(){
        if (pointLight){
            var pLight = new THREE.PointLight(control.pointLightColor,control.pointLightIntensity);
            pointLight.copy(pLight);
        }

        if (directionalLight){
            var dRight = new THREE.DirectionalLight(control.directionalLightColor,control.directionalLightIntensity);
            directionalLight.copy(dRight);
        }
        if (spotLight){
            var sLight = new THREE.SpotLight( control.spotLightColor,control.spotLightIntensity);
            spotLight.copy(sLight);
        }

        if (hemisphereLight) {
            var hLight = new THREE.HemisphereLight(control.hemiLightColor, control.hemiLightGroundColor, 0.5);
            hemisphereLight.copy(hLight);
        }

        if (ambientLight) {
            var aLight = new THREE.AmbientLight(control.ambientLightColor, control.ambientLightIntensity);
            ambientLight.copy(aLight);
        }

        updateThreePointLight();

        updatePointLight();

        if (debug) {
            // logPosition(keyLightPos, "key light position");
            // logPosition(fillLightPos, "fillLight position");
            // logPosition(backLightPos, "back light position");
            // logPosition(fillLight2, "fill light 2 position");
            // logPosition(backLightPos2, "backLight 2, position");
            // logPosition(pointLight1Pos, "point light 2 position");
            // logPosition(pointLight2Pos, "point light 3 position");
            // logPosition(pointLight3Pos, "point light 4 position");
        }
    }

    function updatePointLight(){
        if (pointLight1){
            var pLight = new THREE.PointLight(control.pointLight1Color,control.pointLight1Intensity);
            pointLight1.copy(pLight);
            if (pointLight1Pos){
                pointLight1.position.copy(pointLight1Pos.position);
            }
        }
        if (pointLight2){
            var pLight = new THREE.PointLight(control.pointLight2Color,control.pointLight2Intensity);
            pointLight2.copy(pLight);
            if (pointLight2Pos){
                pointLight2.position.copy(pointLight2Pos.position);
            }
        }
        if (pointLight3){
            var pLight = new THREE.PointLight(control.pointLight3Color,control.pointLight3Intensity);
            pointLight3.copy(pLight);
            if (pointLight3Pos){
                pointLight3.position.copy(pointLight3Pos.position);
            }
        }

    }

    function logPosition(object, msg) {
        if (debug && object.position){
            log(msg);
            log("x:" + object.position.x + ",y:" + object.position.y + ",z :" + object.position.z);
        }
    }

    function logRotation(object, msg) {
        if (debug && object.rotation){
            log(msg);
            log("x:" + object.rotation.x + ",y:" + object.rotation.y + ",z :" + object.rotation.z);
        }
    }

    function renderCar(frameDelta) {
        if (carProgress >=1) {
            levelUp();
            return;
        }
        if (gameLevel > 1 && !isSecondCreated) {
            return;
        }
        animateCar(pathTube, frameDelta);
    }


    function levelUp(){
        if (gameLevel >=MAX_GAME_LEVEL) {
            if (!isParadeEnded){
                isParadeEnded  = true;
                isParading = false;
                camera.position.copy(cameraStartPosition);
                camera.rotation.copy(cameraStartRotation);
                camera.lookAt(car);
            }
            return;
        }
        console.log("game level is ended, " + gameLevel + "first island ended");
        gameLevel++;
        carProgress = 0;

        createGameScene(gameLevel);
    }


    function animateCar(pathTube,frameDelta){
        if (!car || !isParading){
            return;
        }
        var prePosition = car.position.clone();
        log("car Progress:" + carProgress);
        var pos = pathTube.parameters.path.getPointAt(carProgress);

        // interpolation
        var segments = pathTube.tangents.length;
        var pickt = carProgress * segments;
        var pick = Math.floor( pickt );
        var pickNext = ( pick + 1 ) % segments;

        binormal.subVectors( pathTube.binormals[ pickNext ], pathTube.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( pathTube.binormals[ pick ] );

        var dir = pathTube.parameters.path.getTangentAt( carProgress );


        var offset = 15;
        normal.copy( binormal ).cross( dir );

        // We move on a offset on its binormal
        pos.add( normal.clone().multiplyScalar( offset ) );
        car.position.copy(pos);

        forward.subVectors(car.position, prePosition).normalize();
        var angle = Math.atan2(forward.x, forward.z) + Math.PI;

        car.rotation.y = angle + Math.PI;

        if (cameraHelper){
            cameraHelper.update();
        }
        carProgress += frameDelta * carSpeed;
    }

    function getMaxScale(elf) {
        var max = elf.width > elf.height ? elf.width : elf.height;
        if (max > 200) {
            return 0.8;
        }
        return 1;
    }

    function createFirstIslandScene(){
        firstIsland = new THREE.Object3D();
        scene.add(firstIsland);

        var firstIslandObj = resManager.firstIsland;
        firstIslandObj.scale.multiplyScalar(10);
        firstIslandObj.receiveShadow = true;
        firstIslandObj.name = "firstIsland";
        firstIslandObj.castShadow = true;

        logObjectSize(firstIslandObj);

        var firstIslandYoffset = -1800;
        firstIslandObj.position.y = firstIslandYoffset;
        firstIsland.add( firstIslandObj );

        car = resManager.car;
        car.castShadow = true;
        car.receiveShadow = true;
        car.scale.multiplyScalar(1.2);
        car.position.set(-571, -330, -982);
        car.rotation.y = 1.84;
        car.name = "car";
        car.castShadow = true;
        car.children.forEach(function (child) {
            child.userData.parent = car;
        });
        addCatchObject(car);
        firstIsland.add(car);
        logObjectSize(car);

        LoaderUtils.loadMtl(ELF_PATH + DRIVER + ".mtl").then(function (result) {
            return LoaderUtils.loadObj(result, ELF_PATH + DRIVER + ".zip");
        }).then(function (result) {
            result.name ="driver";
            result.userData.parent = car;
            result.children.forEach(function (child) {
                child.userData.parent = car;
            });
            result.scale.multiplyScalar(0.6);
            logObjectSize(result);

            result.position.set(-30, -170, 180);
            car.add(result);
        });
        var textureLoader = new THREE.TextureLoader();
        var radioTexture = textureLoader.load("assets/textures/particles/particle2.png");

        var radioMaterials = new THREE.PointsMaterial({
            map: radioTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            size: 10.0
        });
        var cubeGeometry = new THREE.BoxGeometry(35,10, 35, 15, 12, 15);
        radio1 = new THREE.Points(cubeGeometry, radioMaterials);
        radio1.position.set(30, -100, 280);
        car.add(radio1);

        if (debug){
            var geometry = new THREE.SphereBufferGeometry(20, 32, 32);
            var material = new THREE.MeshBasicMaterial({color: 'green'});
            qie = new THREE.Mesh(geometry, material);
            qie.position.copy(car.position);
            qie.children.forEach(function (child) {
                child.userData.parent = qie;
            });
            logObjectSize(qie);
            addCatchObject(qie);
            scene.add(qie);
        }
        var count = leavingElfs.length;
        for (var i = 0; i < firstIslandElfPositions.length; i++) {
            var groupPositions = firstIslandElfPositions[i];
            for (var j = 0; j < groupPositions.length; j++) {
                var position = groupPositions[j];
                var rotationY = firstIslandRotationsY[i] != undefined ? firstIslandRotationsY[i] : 0;
                asynLoadElf(position, rotationY, firstIslandElfs[count]);
                count++;
            }
        }

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.set(-3, 14,-176);
        pivotPoint.rotation.x = 0.26;
        pivotPoint.rotation.y = -Math.PI;
        car.add(pivotPoint);

        if (debug){
            // dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
            // dragControls.addEventListener( 'dragstart', function ( event ) { cameraControls.enabled = false; } );
            // dragControls.addEventListener( 'dragend', function ( event ) { cameraControls.enabled = true; } );
        }

        splineCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 2000 );
        pivotPoint.add( splineCamera );
        splineCamera.lookAt(car);

        if (debug){
            cameraHelper = new THREE.CameraHelper(splineCamera );
            cameraHelper.visible = true;
            scene.add( cameraHelper );
        }

        var pathArray = [car.position.clone(),
            new THREE.Vector3(434, -325, -1225),
            new THREE.Vector3(1047, -308, -1547),
            new THREE.Vector3(1301, -308, -2072),
            new THREE.Vector3(1301, -316, -2584),
            new THREE.Vector3(987, -308, -2992),
            new THREE.Vector3(634, -308, -3101),

            new THREE.Vector3(-98, -313, -2391),
            new THREE.Vector3(-465, -311, -2199),
            new THREE.Vector3(-678, -312, -2156),
            new THREE.Vector3(-857, -312, -2427)
        ];
        var pipeSpline = new THREE.CatmullRomCurve3(pathArray);
        pathTube = new THREE.TubeBufferGeometry(pipeSpline, 20, 1, 5, false);
        var tubeMesh = new THREE.Mesh(pathTube, new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity:0
        }));
        firstIsland.add(tubeMesh);

        if (controlsParam.showPathPoint && debug){
            pathArray.forEach(function (pointPosition) {
                var geometry = new THREE.SphereBufferGeometry(20, 32, 32);
                var material = new THREE.MeshBasicMaterial({color: 'green'});
                var point = new THREE.Mesh(geometry, material);
                point.position.copy(pointPosition);
                scene.add(point);
                addCatchObject(point);
            });
        }

        createShiningLights();
    }

    function createShiningLights() {
        var sphere = new THREE.SphereGeometry(20, 16, 8);
        var m1 = new THREE.MeshBasicMaterial({color: 0xffffff});
        var m2 = new THREE.MeshBasicMaterial({color: 0xffffff});
        for (var i = 0; i < shiningLightPosition1.length; i++) {
            var lightBody = new THREE.Mesh(sphere, m1);
            var light = new THREE.PointLight(0xffffff, 0.5, 50);
            light.add(lightBody);
            light.position.copy(shiningLightPosition1[i]);
            scene.add(light);
            // lightBody.position.copy(shiningLightPosition1[i]);
            // scene.add(lightBody);
            // addCatchObject(lightBody)
            shiningLights1.push(light);
        }

        for (var i = 0; i < shiningLightPosition2.length; i++) {
            var lightBody = new THREE.Mesh(sphere, m2);
            var light = new THREE.PointLight(0xffffff, 0.5, 50);
            light.add(lightBody);
            // light.position.copy(shiningLightPosition2[i]);
            // scene.add(light);
            lightBody.position.copy(shiningLightPosition2[i]);
            scene.add(lightBody);
            addCatchObject(lightBody)
            shiningLights2.push(light);
        }
    }

    function asynLoadElf(position, rotationY, elfName) {
        LoaderUtils.loadMtl(ELF_PATH + elfName + ".mtl").then(function (result) {
            return LoaderUtils.loadObj(result, ELF_PATH + elfName + ".zip");
        }).then(function (result) {
            var elf = {};
            elf.name = elfName;
            result.name = elfName;
            result.castShadow = true;
            result.receiveShadow = true;
            result.userData.elf = true;
            var objectAround = new THREE.Box3().setFromObject(result);
            elf.depth = objectAround.max.z - objectAround.min.z;
            elf.height = objectAround.max.y - objectAround.min.y;
            elf.width = objectAround.max.x - objectAround.min.x;
            elf.object = result;
            result.scale.multiplyScalar(getMaxScale(elf))
            objectAround = new THREE.Box3().setFromObject(result);
            elf.depth = objectAround.max.z - objectAround.min.z;
            elf.height = objectAround.max.y - objectAround.min.y;
            elf.width = objectAround.max.x - objectAround.min.x;
            if (debug) {
                logObjectSize(result);
            }
            elf.jumpMaxHeight = 0.2 * elf.height;
            elf.jumpIndex = Math.floor(Math.random() * (elfAnimationRad.length));
            result.children.forEach(function (child) {
                child.userData.parent = result;
            });

            result.rotation.y = rotationY;
            result.position.copy(position.clone());
            scene.add(result);
            addCatchObject(result);

            leavingElfs.push(elf);
        });
    }


    function loadElf2(elfName){
        var elfName = elfName;
        LoaderUtils.loadMtl(ELF_PATH + elfName + ".mtl").then(function (result) {
            return LoaderUtils.loadObj(result, ELF_PATH + elfName + ".zip");
        }).then(function (result) {
            var elf = {};
            elf.name = elfName;
            result.name = elfName;
            var objectAround = new THREE.Box3().setFromObject(result);
            elf.depth = objectAround.max.z - objectAround.min.z;
            elf.height = objectAround.max.y - objectAround.min.y;
            elf.width = objectAround.max.x - objectAround.min.x;
            elf.object = result;
            result.scale.multiplyScalar(getMaxScale(elf))

            objectAround = new THREE.Box3().setFromObject(result);
            elf.depth = objectAround.max.z - objectAround.min.z;
            elf.height = objectAround.max.y - objectAround.min.y;
            elf.width = objectAround.max.x - objectAround.min.x;
            if (debug) {
                logObjectSize(result);
            }
            elf.jumpMaxHeight = 0.1 * elf.height;
            elf.jumpIndex = Math.floor(Math.random() * (elfAnimationRad.length));
            result.children.forEach(function (child) {
                child.userData.parent = result;
            });
            resManager.elfs.push(elf);

        });
    }

    function getElf(index) {
        var elfSize = resManager.elfs.length;
        var i = index % elfSize;
        var elf = resManager.elfs[i];
        var returnResult = {};
        returnResult.depth = elf.depth;
        returnResult.height = elf.height;
        returnResult.width = elf.width;
        returnResult.jumpMaxHeight = elf.jumpMaxHeight;
        returnResult.jumpIndex = elf.jumpIndex;
        returnResult.object = elf.object;
        return returnResult;
    }

    function logObjectSize(object){
        if(!debug){
            return;
        }
        log("object size, name:" + object.name);
        var objectAround = new THREE.Box3().setFromObject(object);
        var depth = objectAround.max.z - objectAround.min.z;
        var height = objectAround.max.y - objectAround.min.y;
        var width = objectAround.max.x - objectAround.min.x;;
        log("depth:" + depth);
        log("height:" +height);
        log("width:" + width);
    }

    function createGameScene(gameLevel) {
        if (gameLevel === 1) {
            createFirstIslandScene();
        } else if (gameLevel === 2) {
            createSecondLevelScene();
        } else {
            log("no more game level:" + gameLevel);
        }
    }

    function createSecondLevelScene(){
        secondIsland = new THREE.Object3D();
        scene.add(secondIsland);

        var secondIslandObj = resManager.secondIsland;
        secondIslandObj.scale.multiplyScalar(10);
        secondIsland.add(secondIslandObj);
        var secondIslandYoffset = -1800;
        secondIsland.position.y = secondIslandYoffset;
        secondIsland.position.x = 84;
        secondIsland.position.z = -350
        secondIsland.castShadow = true;

        log(secondIslandObj);

        var count = 0;
        for (var i = 0; i < secondIslandElfPositions.length; i++) {
            var groupPositions = secondIslandElfPositions[i];
            for (var j = 0; j < groupPositions.length; j++) {
                var position = groupPositions[j];
                var rotationY = secondIslandRotationY[i] != undefined ? secondIslandRotationY[i] : 0;
                asynLoadElf(position, rotationY, secondIslandElfs[count]);
                count++;
            }
        }

        var height = -280;
        var pathArray = [ new THREE.Vector3(-874, -332, -2584),
            new THREE.Vector3(-1246, -183, -2701),
            new THREE.Vector3(-1665, 26, -2842),
            // new THREE.Vector3(-1764, 10, -2890),
            new THREE.Vector3(-2160, -265, -2952),

            new THREE.Vector3(-2255, height, -3298),
            new THREE.Vector3(-2298, height, -3740),
            new THREE.Vector3(-2545, height, -4239),
            new THREE.Vector3(-2826, height, -4481),
            new THREE.Vector3(-3623, height, -4449),
            new THREE.Vector3(-3964, height, -4173),

            new THREE.Vector3(-3750, height, -3939),
            new THREE.Vector3(-3600, height, -3709),
            new THREE.Vector3(-3556, height, -3519),

            new THREE.Vector3(-3392, height, -2851),
            new THREE.Vector3(-3542, height+50, -2635)
        ];

        var pipeSpline = new THREE.CatmullRomCurve3(pathArray);
        pathTube = new THREE.TubeBufferGeometry(pipeSpline, 20, 1, 5, false);
        var tubeMesh = new THREE.Mesh(pathTube, new THREE.MeshLambertMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity:0
        }));
        secondIsland.add(tubeMesh);
        tubeMesh.position.y = 1800;
        tubeMesh.position.x = -84;
        tubeMesh.position.z = 350;

        if (controlsParam.showPathPoint && debug){
            pathArray.forEach(function (pointPosition) {
                var geometry = new THREE.SphereBufferGeometry(20, 32, 32);
                var material = new THREE.MeshBasicMaterial({color: 'yellow'});
                var point = new THREE.Mesh(geometry, material);
                point.position.copy(pointPosition);
                scene.add(point);
                addCatchObject(point);
            });
        }

        if (debug){
            initControls();
            addControlGui(control);
        }
        isSecondCreated = true;
    }

    var initMouse = false;
    function initEvents() {
        // $(container).bind("swipe", onTouchSwipe);
        $(window).bind("resize orientationchange", handleResize);
        // $(container).bind("scrollstart", onScrollStart);
        // $(container).bind("scrollstop", onScrollStop);
        // $(container).bind("tap", onTap);c
        // $(container).bind("taphold", onTap);
        // $(container).bind("click", onClick);
        // $(container).bind("vclick", onVclick);
        // $(container).bind("taphold", onTaphold);
        $(container).bind("vmousemove", vmousemove);
        $(container).bind("vmousedown",vmousedown);
        $(container).bind("vmouseup", vmouseup);
        // $(container).bind("click", onClick);
    }

    function vmousedown(event){
        event.preventDefault();
        log("vmousedown");
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, getCamera() );
        var intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            // controls.enabled = false;
            selectedObj = intersects[0].object;
            if (selectedObj.userData.parent) {
                selectedObj = selectedObj.userData.parent;
            }
            if (isObjectSelected(selectedObj, 'car')) {
                startParade();
            }else{
                //choose elf
                if (isParading){
                    catchElf(selectedObj);
                }
            }
        }
        // if (selectedObj){
        //     control.selectedRX = selectedObj.rotation.x;
        //     control.selectedRY = selectedObj.rotation.y;
        //     control.selectedRZ = selectedObj.rotation.z;
        // }
    }

    function catchElf(selectedObj){
        var parent = selectedObj.userData.parent;
        if(selectedObj.userData.elf || (parent && parent.userData.elf)){
            var object = parent? parent: selectedObj;
            if (object.userData.catched){
                return;
            }
            var position = getElfCarPosition();
            if (!position){
                log("error, no elf postion");
                return;
            }
            THREE.SceneUtils.detach(object, object.parent,scene);
            object.scale.multiplyScalar(0.3);
            object.position.copy(position);
            object.rotation.y = Math.random() * Math.PI;
            car.add(object);
            object.userData.catched = true;
            catchedElfs.push(object);
            removeCatchObject(object);
        }
    }


    function startParade(){
        log("car position" + car.position.x +',' + car.position.y + ',' + car.position.z);
        removeCatchObject(car);
        cameraControls.enabled = false;
        isParading = true;
    }

    function vmousemove(event) {
        log("vmousemove");
        event.preventDefault();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        initMouse = true;
        if (!camera) {
            return;
        }
        if (true) {
            return;
        }
    }

    function vmouseup(event){
        log("vmouseup");
        event.preventDefault();


        // if ( INTERSECTED ) {
            selectedObj = null;
        // }
        initMouse = false;

        container.style.cursor = 'auto';
    }

    function isObjectSelected(selected, objectName){
        if (!selected){
            return false;
        }
        var selectedObjectName = getObjectName(selected);
        if (selectedObjectName === objectName){
            return true;
        }
        return false;
    }

    function getObjectName(object){
        var parent = object.userData.parent;
        if (parent && parent.name != "") {
            return parent.name;
        }
        return object.name;
    }

    function handleResize() {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        ASPECT_RATIO = WIDTH / HEIGHT;
        windowHalfX = WIDTH/ 2;
        windowHalfY = HEIGHT / 2;
        if (camera){
            camera.aspect = ASPECT_RATIO;
            camera.updateProjectionMatrix();
        }

        if (renderer){
            renderer.setSize(WIDTH, HEIGHT);
        }
    }

    function addLabel( name, location, font ) {
        var textGeo = new THREE.TextGeometry( name, {
            font: font,
            size: 100,
            height: 50,
            curveSegments: 1
        });

        var textMaterial = new THREE.MeshBasicMaterial( { color: 'red' } );
        var textMesh = new THREE.Mesh( textGeo, textMaterial );
        textMesh.position.copy( location );
        textMesh.rotation.x =- Math.PI/ 2;

        // var geometry = new THREE.SphereBufferGeometry(50, 32, 32 );
        // var material = new THREE.MeshBasicMaterial( {color: 'red'} );
        // var sphere = new THREE.Mesh( geometry, material );
        // scene.add( sphere );
        // sphere.position.copy(location);
        scene.add( textMesh );

    }

    function initThreeJs(){
        scene = new THREE.Scene();

        if (debug){
            var axisHelper = new THREE.AxisHelper( 2000 );
            scene.add( axisHelper );
        }

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor(0xfec3d3);
        renderer.domElement.style.position = "relative";
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;

        var fieldOfView, nearPlane, farPlane;
        fieldOfView = 50;
        nearPlane = 0.1;
        farPlane = 15000;
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(fieldOfView, ASPECT_RATIO, nearPlane, farPlane);
        // camera.position.z = 10000;
        camera.position.z = 3370;
        camera.position.x = -457;
        camera.position.y = -168;

        // var cameraHelper1 = new THREE.CameraHelper(camera );
        // cameraHelper1.visible = true;
        // scene.add( cameraHelper1 );

        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
        cameraControls.enableZoom = true;
        cameraControls.enableDamping = debug;
        cameraControls.enableRotate = debug;
        cameraControls.minDistance = 888;
        cameraControls.maxDistance = camera.position.z;

        if (debug){
            pointLight = new THREE.PointLight(0x9b3c82, 0.3);
            pointLight.position.set(-850,0,0);
            // scene.add(pointLight);

            directionalLight = new THREE.DirectionalLight(0x7b1194, 0.5);
            directionalLight.position.x = 1;
            directionalLight.position.y = 400;
            // scene.add(directionalLight);

            spotLight = new THREE.SpotLight( 0xffffff,1);
            spotLight.position.set( 100, 2000, 100 );

            spotLight.shadow.mapSize.width = 5000;
            spotLight.shadow.mapSize.height = 3000;

            spotLight.shadow.camera.near = 500;
            spotLight.shadow.camera.far = 4000;
            spotLight.shadow.camera.fov = fieldOfView;
            // scene.add( spotLight );

            hemisphereLight = new THREE.HemisphereLight(0xb17da4, 0x575555,0.5);
            // scene.add(hemisphereLight);

            ambientLight = new THREE.AmbientLight(0xca5bb1, 0.5);
            // scene.add(ambientLight);
        }

        keyLight = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.85);
        keyLight.position.set(-99, 1523, 2652);

        fillLight = new THREE.DirectionalLight(new THREE.Color(0xd2acd7), 0.75);
        fillLight.position.set(4170, 1694, -2692);

        backLight = new THREE.DirectionalLight(0xf1e6f5, 0.62);
        backLight.position.set(-2259, 3132, -5709);

        if(debug){
            var geometry = new THREE.SphereBufferGeometry( 50, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 'red'} );
            keyLightPos = new THREE.Mesh( geometry, material );
            keyLightPos.position.copy(keyLight.position);
            scene.add( keyLightPos );

            fillLightPos = new THREE.Mesh( geometry, material );
            fillLightPos.position.copy(fillLight.position);
            scene.add( fillLightPos );

            backLightPos = new THREE.Mesh( geometry, material );
            backLightPos.position.copy(backLight.position);
            scene.add( backLightPos);
            if (debug){
                addCatchObject(keyLightPos);
                addCatchObject(fillLightPos);
                addCatchObject(backLightPos);
            }
        }

        scene.add(keyLight);
        scene.add(fillLight);
        scene.add(backLight);

        if(debug){
            fillLight2 = new THREE.DirectionalLight(new THREE.Color(0x717fff), 0.1);
            fillLight2.position.set(-3824, 808, -7000);

            backLight2 = new THREE.DirectionalLight(0xe1b7b7, 0,8);
            backLight2.position.set(-7000, 2264, -5147);
            var geometry = new THREE.SphereBufferGeometry( 50, 32, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 'red'} );

            fillLightPos2 = new THREE.Mesh( geometry, material );
            fillLightPos2.position.copy(fillLight2.position);


            backLightPos2 = new THREE.Mesh( geometry, material );
            backLightPos2.position.copy(backLight2.position);


            if (debug){
                addCatchObject(fillLightPos2);
                addCatchObject(backLightPos2);
            }
            // scene.add(fillLight2);
            // scene.add(backLight2);
            // scene.add( fillLightPos2 );
            // scene.add( backLightPos2 );
        }

        pointLight1 = new THREE.PointLight(0xe8e6e6, 0.15);
        pointLight1.position.set(-737, 270, -3605);

        pointLight2 = new THREE.PointLight(0xe8e6e6, 0.15);
        pointLight2.position.set(-3912, 1842, -6367);

        pointLight3 = new THREE.PointLight(0xe8e6e6, 0.18);
        pointLight3.position.set(-4868, 136, -1503);
        scene.add(pointLight1);
        scene.add(pointLight2);
        scene.add( pointLight3 );

        if (debug) {
            var geometry = new THREE.SphereBufferGeometry(50, 32, 32);
            var material = new THREE.MeshBasicMaterial({color: 'blue'});
            pointLight1Pos = new THREE.Mesh(geometry, material);
            pointLight1Pos.position.copy(pointLight1.position);

            pointLight2Pos = new THREE.Mesh(geometry, material);
            pointLight2Pos.position.copy(pointLight2.position);

            pointLight3Pos = new THREE.Mesh(geometry, material);
            pointLight3Pos.position.copy(pointLight3.position);

            addCatchObject(pointLight1Pos);
            addCatchObject(pointLight2Pos);
            addCatchObject(pointLight3Pos);
        }
    }

    function asynLoadResources(){
        showLoadingProgress();
        var elfPath = "assets/models/elf/";
        var resourceUrl = {
            firstIsland: "assets/models/max/floating_island1.zip",
            firstIslandMtl: "assets/models/max/floating_island1.mtl",
            secondIsland: "assets/models/max/floating_island2.zip",
            secondIslandMtl: "assets/models/max/floating_island2.mtl",
            carMtl: "assets/models/max/car.mtl",
            car: "assets/models/max/car.zip",
            qieMtl: elfPath + "qie.mtl",
            qie: elfPath + "qie.obj",
            elf:elfPath + "elf.zip",
            bgPath:"assets/textures/cube/parade/"
        }

        var bgFileNames = ['posx.png', 'negx.png', 'posy.png', 'negy.png', 'posz.png', 'negz.png' ];
        var total = 7;
        var count = 0;

        LoaderUtils.loadCubeTexture(resourceUrl.bgPath, bgFileNames)
            .then(function (result) {
                resManager.bg = result;
                count++;
                return LoaderUtils.loadMtl(resourceUrl.firstIslandMtl)
            })
            .then(function (result) {
                count++;
                return LoaderUtils.loadObj(result, resourceUrl.firstIsland);
            })
            .then(function (result) {
                resManager.firstIsland = result;
                count++;
                return LoaderUtils.loadMtl(resourceUrl.secondIslandMtl);
            })
            .then(function (result) {
                count++;
                return LoaderUtils.loadObj(result, resourceUrl.secondIsland);
            })
            .then(function (result) {
                resManager.secondIsland = result;
                count++;
                return LoaderUtils.loadMtl(resourceUrl.carMtl);
            })
            .then(function (result) {
                count++;
                return LoaderUtils.loadObj(result, resourceUrl.car);
            })
            .then(function (result){
                count++;
                resManager.car = result;
                resManager.elfs = [];
                if (debug){
                    loadQie(elfPath);
                }
                hideLoadingProgress();
                log("All done with sequence");
                $("#startButton").on("vclick", function(){
                    // $("#startscreen").slideUp(2000);
                    $("#startscreen").fadeOut(2000,"linear");
                    if (!isGameStarted){
                        stopLoadingBgm();
                        startGame();
                        isGameStarted = true;
                    }
                });
                return deferred.promise;
            })
            .catch(function (error) {
                log("Error occured in sequence:" ,error);
            })
            .progress(function (e) {
                log("Progress event received:" + e);
                var bar = 250,
                    currentLoaded = e.loaded / e.total;
                var loaded = (count + currentLoaded) / total;
                bar = Math.floor(bar * loaded);
                $("#bar").width(bar);
            });
    }

    function stopLoadingBgm(){
        $("#startBgm")[0].pause();
    }

    function loadQie(elfPath){
        var elfName = "qie";
        LoaderUtils.loadMtl(elfPath + elfName + ".mtl")
            .then(function (result) {
                return LoaderUtils.loadObj(result, elfPath + elfName + ".obj")
            })
            .then(function (obj) {
                obj.name = elfName;
                obj.userData.elf = true;
                if (debug) {
                    logObjectSize(obj);
                }
                obj.children.forEach(function (child) {
                    child.userData.parent = obj;
                });
                resManager.qie = obj;
            });
    }

    function loadElf1(elfPath, elfName){
        LoaderUtils.loadMtl(elfPath + elfName + ".mtl")
            .then(function (result) {
                return LoaderUtils.loadObj(result, elfPath + elfName + ".obj")
            })
            .then(function (obj) {
                obj.name = elfName;
                obj.userData.elf = true;
                if (debug) {
                    logObjectSize(obj);
                }
                obj.children.forEach(function (child) {
                    child.userData.parent = obj;
                });
                resManager.elfs[elfName] = obj;
            });
    }

    function hideLoadingProgress(){
        $("#message").attr("style", "display:none;");
        $("#progressbar").attr("style", "display:none;");
    }

    function showLoadingProgress(){
        $("#progress").attr("style", "display:block;");
    }

    function log(msg, error) {
        if (!debug) {
            return;
        }
        if (error){
            console.log(msg, error);
        }else{
            console.log(msg);
        }

    }

})(jQuery);
if (parade === undefined) {
    var parade = {};
}
/**
 * Created by jane01.xiong on 2016/12/12.
 */

parade.createScene = function () {
    scene = new THREE.Scene();
    parade.scene = scene;
    return scene;
};

parade.createCamera = function () {
    var fieldOfView, nearPlane, farPlane;
    fieldOfView = 50;
    nearPlane = 0.1;
    farPlane = 5000;
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(fieldOfView, ASPECT_RATIO, nearPlane, farPlane);
    parade.camera = camera;
    return camera;
};

parade.createAmbientLight = function (lightColor, intensity) {
    // now add some better lighting
    var ambientLight = new THREE.AmbientLight(lightColor, intensity);
    parade.ambientLight = ambientLight;
    ambientLight.name = 'ambient';
    parade.scene.add(ambientLight);
    return ambientLight;
};

parade.createDirectionLight = function (lightColor, intensity, position) {
    // add sunlight (light
    var directionalLight = new THREE.DirectionalLight(lightColor, intensity);
    directionalLight.position = position;
    directionalLight.name = 'directional';
    parade.scene.add(directionalLight);
    parade.directionalLight = directionalLight;
    return directionalLight;
};

parade.createCameraControls = function (enablePan, enableRotate) {
    // add controls
    var cameraControl = new THREE.OrbitControls(parade.camera);
    cameraControl.enablePan = enablePan;
    cameraControl.enableRotate = enableRotate;
    parade.cameraControl = cameraControl;
    return cameraControl;
};

parade.createRenderer = function (clearColor) {
    // create a render, sets the background color and the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(clearColor, 1.0);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMapEnabled = true;
    parade.renderer = renderer;
    return renderer;
};

parade.createClouds = function (num) {
    if (num == undefined || num <= 0) {
        return;
    }
    var loader = new THREE.JSONLoader();
    parade.clouds = new Array();
    loader.load("assets/models/max/cloud.js",
        function (model) {
            for (var i = 0; i < num; i++) {
                var material = new THREE.MeshLambertMaterial();
                cloud = new THREE.Mesh(model, material);
                cloud.rotation.y = 0.74;
                cloud.rotation.z = 0.65;
                cloud.rotation.x = -1;
                cloud.scale = new THREE.Vector3(50, 20, 10);
                cloud.position.x = Math.random() * (-5);
                cloud.position.y = Math.random() * 10;
                cloud.position.z = Math.random() * (-5);
                parade.clouds.push(cloud);
                parade.scene.add(cloud);
            }
        });
};
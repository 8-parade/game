/**
 * Created by jane01.xiong on 2016/12/12.
 */
if (parade === undefined) {
    var parade = {};
}
parade.clouds = [];

parade.loadCloudModel = function (callback) {
    parade.createCloud = function () {
        var loader = new THREE.JSONLoader();
        loader.load("assets/models/max/cloud.js",callback);}
}

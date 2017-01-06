/**
 * Created by Administrator on 2016/12/25.
 */
LoaderUtils = {
    loadTexure: function (url) {
        var deferred = Q.defer();
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, function (loaded) {
            console.log("Loaded texure: ", url);
            deferred.resolve(loaded)
        }, function (progress) {
            deferred.notify(progress)
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    },
    loadMtl: function (url) {
        var deferred = Q.defer();
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load(url, function (loaded) {
                console.log("Loaded model: ", url);
                deferred.resolve(loaded)
            }, function (progress) {
                deferred.notify(progress)
            }, function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    },
    loadObj: function (materials, url) {
        var deferred = Q.defer();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(url, function (loaded) {
            console.log("Loaded model: ", url);
            deferred.resolve(loaded)
        }, function (progress) {
            deferred.notify(progress)
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    },
    loadAssimpJson: function (url) {
        var deferred = Q.defer();
        var loader = new THREE.AssimpJSONLoader();
        loader.load(url, function (loaded) {
            console.log("Loaded model: ", url);
            deferred.resolve(loaded)
        }, function (progress) {
            deferred.notify(progress)
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    },
    loadJsonModel: function (url) {
        var deferred = Q.defer();
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load(url, function (loaded) {
            console.log("Loaded model: ", url);
            deferred.resolve(loaded);
        }, null);

        return deferred.promise;
    },
    loadAudio: function (url) {
        // instantiate a loader
        var deferred = Q.defer();
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load(
            // resource URL
            url,
            function (loaded) {
                // console.log("Loaded model: ", url);
                deferred.resolve(loaded)
            }, function (progress) {
                deferred.notify(progress)
            }, function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    },
    loadCubeTexture: function (path, filenames) {
        var deferred = Q.defer();
        var textureCube = new THREE.CubeTextureLoader()
            .setPath(path)
            .load(filenames, function (loaded) {
                // console.log("Loaded model: ", path);
                deferred.resolve(loaded)
            }, function (progress) {
                deferred.notify(progress)
            }, function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    },
    loadOthers: function (res) {
        var deferred = Q.defer();
        var xhrLoader = new THREE.FileLoader();
        xhrLoader.load(res, function (loaded) {
            console.log("Loaded other: ", res);
            deferred.resolve(loaded);
        }, function (progress) {
            deferred.notify(progress);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }
};
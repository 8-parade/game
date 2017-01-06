function Fireworks(radius, explodeTime, segments, color) {
    THREE.Group.call(this);
    this.type = 'normal';
    this.position = new THREE.Vector3();
    this.radius = radius || 50;
    this.segments = segments || 50;
    this.color = color || '0xffffff';
    this.exploded = false;
    this._avgVertexNormals = [];
    this._avgVertexCount = [];
    this._geometry = undefined;
    this.explodeTime = explodeTime | 3;
    this._startTime = undefined;
    return this._init();
}

Fireworks.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
    setPosition: function (position) {
        this.position = position;
        return this;
    },
    explode: function () {
        if (this.exploded) {
            return;
        }
        var now = Date.now();
        if (!this._startTime) {
            this._startTime = now;
        } else {
            if (now - this._startTime > this.explodeTime * 1000) {
                this.exploded = true;
                return;
            }
        }
        var dir = 1;
        var count = 0;
        var timeDiff = now - this._startTime;
        var scale = 2 * 1000 /(timeDiff+ 1000);
        var vertices =  this._geometry.vertices;
        var v = undefined;
        for (var vindex in vertices) {
            v = vertices[vindex];
            v.x += (this._avgVertexNormals[count].x * v.velocity * scale) * dir;
            v.y += (this._avgVertexNormals[count].y * v.velocity * scale) * dir;
            v.z += (this._avgVertexNormals[count].z * v.velocity * scale) * dir;
            count++;
        }
        this._geometry.verticesNeedUpdate = true;
    },
    _init: function () {
        this._geometry = new THREE.SphereGeometry(this.radius, this.segments, this.segments);
        this._geometry.vertices.forEach(function (v) {
            var random = Math.random();
            v.velocity =  Math.max(random, 0.25);
        });
        this._geometry.computeFaceNormals();
        this._geometry.computeVertexNormals();

        for (var i = 0; i < this._geometry.vertices.length; i++) {
            this._avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
            this._avgVertexCount.push(0);
        }

        this._calcExplodeNormals();

        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load('../assets/textures/ps_ball.png');
        var material = new THREE.PointsMaterial({color: this.color, size: 7});
        material.map = texture;
        material.blending = THREE.AdditiveBlending;
        material.transparent = false;
        material.opacity = 0.6;
        var points = new THREE.Points(this._geometry, material);
        this.add(points);
        return this;
    },
    _calcExplodeNormals: function () {
        // first add all the normals
        var faces = this._geometry.faces;
        var f = undefined;
        for (var findex in faces) {
            f = faces[findex];
            var vA = f.vertexNormals[0];
            var vB = f.vertexNormals[1];
            var vC = f.vertexNormals[2];

            // update the count
            this._avgVertexCount[f.a] += 1;
            this._avgVertexCount[f.b] += 1;
            this._avgVertexCount[f.c] += 1;

            // add the vector
            this._avgVertexNormals[f.a].add(vA);
            this._avgVertexNormals[f.b].add(vB);
            this._avgVertexNormals[f.c].add(vC);
        }

        // then calculate the average
        for (var i = 0; i < this._avgVertexNormals.length; i++) {
            this._avgVertexNormals[i].divideScalar(this._avgVertexCount[i]);
        }
    }
});
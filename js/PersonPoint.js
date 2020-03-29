class PersonPoint {
    constructor(radius, height, initPosition){
        this.radius = radius;
        this.height = height;
        this.theta = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.initPosition = initPosition;
        this.generateInitCirclePoint(radius, height);
        //Point Geometry
        let materialColor = Math.floor(Math.random()*180).toString();
        let pointColor = new THREE.Color("rgb("+materialColor+","+materialColor+","+materialColor+")");
        this.pointGeometry = new THREE.BufferGeometry();
        this.position = new Float32Array(3);
        this.pointGeometry.addAttribute("position", new THREE.BufferAttribute(this.position, 3));
        this.pointMaterial = new THREE.PointsMaterial( {

            size: Math.random()*1.5+2.5,
            sizeAttenuation: false,
            color: pointColor
        });
        this.pointMaterial.transparent = true;
        this.pointMaterial.opacity = Math.random()*0.2 +0.8;
        this.point = new THREE.Points(this.pointGeometry, this.pointMaterial);
        // this.point.position.copy(new THREE.Vector3(this.x, this.y, this.z));
        this.point.position.copy(this.initPosition);
        this.point.geometry.dynamic = true;
        //Debug Trail
        this.center = [0, height, 0];
        this.circle = new CircleTrail(this.center, radius);
        //Dynamics
        this.rotateSpeed = -Math.random()*0.002;
        //Trail
        this.numberOfPointsPerTrail = 1000 + Math.floor(Math.random()*100);
        this.trailLineGeometry = new THREE.BufferGeometry();
        this.trailLinePosition = new Float32Array(this.numberOfPointsPerTrail * 3);
        // this.trailLineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 3});
        this.trailLineMaterial = new THREE.LineBasicMaterial({color: pointColor , linewidth: Math.random()*4+2});
        this.trailLineMaterial.transparent = true;
        this.trailLineMaterial.opacity = Math.random()*0.2 +0.5;
        this.trailLineGeometry.addAttribute("position", new THREE.BufferAttribute(this.trailLinePosition, 3));
        this.trailLine = new THREE.Line(this.trailLineGeometry, this.trailLineMaterial);
        this.trailLine.geometry.dynamic = true;
        for (let i = 0; i < this.numberOfPointsPerTrail * 3; i++) {
            this.trailLine.geometry.attributes.position.array[i] = 0;
        }
        this.currentTrailLineDrawingProgress = 0;
        this.trailLine.geometry.setDrawRange(1, this.currentTrailLineDrawingProgress);
        this.trailLine.geometry.attributes.position.needsUpdate = true;
        this.currentTrailIndex = 0;
        this.trailLine.geometry.attributes.position.array[0] = this.x;
        this.trailLine.geometry.attributes.position.array[1] = this.y;
        this.trailLine.geometry.attributes.position.array[2] = this.z;
        // Rotation -> Add Speed to create smooth transition
        this.ringRotateSpeed = Math.random()*0.001 - 0.0005;
        this.ringRotateCounterMax = 1000;
        this.ringRotateCounter = 0;
        this.xRotationAngle = 0;
        this.zRotationAngle = 0;
        // this.xRotationAngle = Math.random()*0.1 - 0.05;
        // this.zRotationAngle = Math.random()*0.1 - 0.05;
        //Regarding Initial Movement
        this.startRotate = false;
        this.target = new THREE.Vector3(this.x, this.y, this.z);
        this.tweenTime = 8000;
        this.tweenToInitPosition();
    }

    tweenToInitPosition(){
        let deepTripPosition = new TWEEN.Tween( this.point.position )
            .to( {
                x: this.target.x,
                y: this.target.y,
                z: this.target.z
            }, this.tweenTime)
            .easing( TWEEN.Easing.Cubic.InOut ).onUpdate( function () {
            }).onComplete(() => this.startRotate = true)
            .start();
    }


    vectorAdd(v1, v2){
        return new THREE.Vector3(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
    }

    generateRotatedPosition(){
        let circlePosition = new THREE.Vector3(this.x, 0, this.z);
        let finalMatrix = new THREE.Matrix4();
        let rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationFromEuler(new THREE.Euler(this.xRotationAngle,0,this.zRotationAngle,"XYZ"));
        finalMatrix.multiply(rotationMatrix);
        circlePosition.applyMatrix4(finalMatrix);
        this.x = circlePosition.x;
        this.y = circlePosition.y + this.height;
        this.z = circlePosition.z;
    }

    generateInitCirclePoint(radius, height){
        let randomTheta = Math.PI * 2 * Math.random();
        this.theta = randomTheta;
        this.x = Math.cos(randomTheta) * this.radius;
        this.y = height;
        this.z = Math.sin(randomTheta) * this.radius;
        // this.generateRotatedPosition();
    }


    update(){
        if (this.startRotate) {
            if (this.ringRotateCounter < this.ringRotateCounterMax){
                this.xRotationAngle += this.ringRotateSpeed;
                this.zRotationAngle += this.ringRotateSpeed;
                this.ringRotateCounter += 1;
            }
            this.theta += this.rotateSpeed;
            this.x = Math.cos(this.theta) * this.radius;
            // this.y = this.y;
            this.z = Math.sin(this.theta) * this.radius;
            this.generateRotatedPosition();
            this.point.position.copy(new THREE.Vector3(this.x, this.y, this.z));

            //Update trail
            if (this.currentTrailIndex < this.numberOfPointsPerTrail) {
                this.currentTrailIndex += 1;
            } else {
                this.currentTrailIndex = 0;
            }
            this.trailLine.geometry.attributes.position.array[this.currentTrailIndex * 3] = this.x;
            this.trailLine.geometry.attributes.position.array[this.currentTrailIndex * 3 + 1] = this.y;
            this.trailLine.geometry.attributes.position.array[this.currentTrailIndex * 3 + 2] = this.z;
            this.trailLine.geometry.setDrawRange(1, this.currentTrailIndex);
            this.trailLine.geometry.attributes.position.needsUpdate = true;
        }
    }
}

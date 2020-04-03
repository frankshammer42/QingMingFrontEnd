class PersonPoint {
    constructor(radius, height, initPosition) {
        this.radius = radius;
        this.height = height;
        this.theta = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.initPosition = initPosition;
        this.generateInitCirclePoint(radius, height);
        //Point Geometry
        let materialColor = Math.floor(Math.random() * 180).toString();
        let pointColor = new THREE.Color("rgb(" + materialColor + "," + materialColor + "," + materialColor + ")");
        this.pointGeometry = new THREE.BufferGeometry();
        this.position = new Float32Array(3);
        this.pointGeometry.addAttribute("position", new THREE.BufferAttribute(this.position, 3));
        this.pointMaterial = new THREE.PointsMaterial({
            size: Math.random()*3,
            sizeAttenuation: false,
            color: pointColor
        });
        this.pointMaterial.transparent = true;
        this.pointMaterial.opacity = Math.random() * 0.2 + 0.8;
        this.point = new THREE.Points(this.pointGeometry, this.pointMaterial);
        // this.point.position.copy(new THREE.Vector3(this.x, this.y, this.z));
        this.point.position.copy(this.initPosition);
        this.point.geometry.dynamic = true;
        //Debug Trail
        this.center = [0, height, 0];
        this.fullTrailCircle = null;

        //Dynamics
        this.rotateSpeed = -Math.random() * 0.002;
        //Trail
        this.numberOfPointsPerTrail = 1000 + Math.floor(Math.random() * 100);
        this.trailLineGeometry = new THREE.BufferGeometry();
        this.trailLinePosition = new Float32Array(this.numberOfPointsPerTrail * 3);
        // this.trailLineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 3});
        this.trailLineMaterial = new THREE.LineBasicMaterial({color: pointColor, linewidth: 3*Math.random()});
        this.trailLineMaterial.transparent = true;
        this.trailLineMaterial.opacity = Math.random() * 0.5 + 0.2;
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
        this.ringRotateSpeedX = Math.random() * 0.0012 - 0.0012/2;
        this.ringRotateSpeedZ = Math.random() * 0.0012 - 0.0012/2;
        this.ringRotateCounterMax = 800;
        this.ringRotateCounter = 0;
        this.xRotationAngle = 0;
        this.zRotationAngle = 0;
        // this.xRotationAngle = Math.random()*0.1 - 0.05;
        // this.zRotationAngle = Math.random()*0.1 - 0.05;
        //Regarding Initial Movement
        this.startRotate = false;
        this.target = new THREE.Vector3(this.x, this.y, this.z);
        this.tweenTime = 10000 + Math.random()*2000;
        this.tweenToInitPosition();
        // For user input
        this.userInputBoard = null;
        this.userInput = null;
        // For Creating Shapes
        this.useOffset = true;
        // this.offSet = new THREE.Vector3(Math.random()*500 - 250, 0, Math.random()*500-250);
        this.offSet = new THREE.Vector3(0,0,0);
        // Circle Trail
        this.useTrail = false;
        this.fullTrailAppear = false;
        this.fullTrailAdded = false;
    }

    createBillboard(userInputContent, camera){
        // let currentPosition = new THREE.Vector3(this.x, this.y, this.z);
        let currentPosition = this.initPosition;
        this.userInput = userInputContent;
        this.userInputBoard = new Billboard(currentPosition, this.userInput, camera);
        this.userInputBoard.container.scale.x *= 0;
        this.userInputBoard.container.scale.y *= 0;
        this.userInputBoard.container.scale.z *= 0;
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
        if (this.useOffset){
            this.x = circlePosition.x + this.offSet.x;
            this.y = circlePosition.y + this.height;
            this.z = circlePosition.z + this.offSet.z;
        }
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
                this.xRotationAngle += this.ringRotateSpeedX;
                this.zRotationAngle += this.ringRotateSpeedZ;
                this.ringRotateCounter += 1;
            }
            this.theta += this.rotateSpeed;
            this.x = Math.cos(this.theta) * this.radius;
            this.z = Math.sin(this.theta) * this.radius;
            this.generateRotatedPosition();
            //Update Position
            this.point.position.copy(new THREE.Vector3(this.x, this.y, this.z));

            if (this.userInputBoard !== null){
                this.userInputBoard.container.position.copy(new THREE.Vector3(this.x, this.y + 10, this.z));
                this.userInputBoard.update();
            }
            //Update trail
            if (this.currentTrailIndex < this.numberOfPointsPerTrail) {
                this.currentTrailIndex += 1;
            } else {
                if (this.useTrail){
                    this.fullTrailAppear = true;
                    this.fullTrailCircle = new CircleTrail(this.center, this.radius, this.xRotationAngle, this.zRotationAngle);
                }
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

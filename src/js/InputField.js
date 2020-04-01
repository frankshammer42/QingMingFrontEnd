//TODO: Add css
//TODO: How to incorporate canvas size into consideration
class InputField{
    constructor(relPosition, content, camera){
        this.relPosition = relPosition;
        this.content = content;
        this.buttonElement = null;
        this.parentCamera = camera;
        this.hintContainer = null;
        this.createHint();
        this.inputElement = null;
        this.inputContainer = null;
        this.createInputField();
        this.submitButtonElement = null;
        this.submitButtonContainer = null;
        this.createSubmitButton();
        this.numberOfTrails = 100;
        this.trailGroup = new THREE.Group();
        this.trails = [];
        this.createTrails();
        //Control variables
        this.startGenerateNewPoint = false;
        this.generateNewPoint = false;
        this.inputFunctionFinished = false;
        // Follow Point
        this.newGeneratedPoint = null;
        // Input Moving Tracking
        this.movingTrack = 0;
    }

    createTrails(){
        for (let i=0; i<this.numberOfTrails; i++){
            let randomScale = 1000;
            let randomInit = new THREE.Vector3(Math.random()*randomScale - randomScale/2, Math.random()*randomScale - randomScale/2, Math.random()*randomScale - randomScale/2);
            let newTrail = new PersonPoint(16, 13.5, randomInit);
            // newTrail.xRotationAngle = Math.random()*Math.PI*2 - Math.PI;
            // newTrail.zRotationAngle = Math.random()*Math.PI*2 - Math.PI;
            newTrail.xRotationAngle = Math.PI*0.5 + (Math.random()*0.1 - 0.05);
            newTrail.rotateSpeed = Math.random()*0.02 - 0.5*0.02;
            newTrail.ringRotateSpeed = 0;
            this.trails.push(newTrail);
            this.trailGroup.add(newTrail.point);
            this.trailGroup.add(newTrail.trailLine);
        }
    }

    createHint(){
        let button = document.createElement('div');
        button.innerHTML = this.content;
        button.className = "addNameHint";
        button.style.width = "300px";
        button.style.height = "300px";
        button.onclick = () => {
            this.hintClickAnimation();
        };
        this.buttonElement = button;
        this.hintContainer = new THREE.CSS3DObject(this.buttonElement);
        this.hintContainer.position.x = this.relPosition.x;
        this.hintContainer.position.y = this.relPosition.y;
        this.hintContainer.position.z = this.relPosition.z;
        this.hintContainer.scale.x = 0.1;
        this.hintContainer.scale.y = 0.1;
        this.hintContainer.scale.z = 0.1;
    }

    createInputField(){
        let inputField = document.createElement('input');
        inputField.style.width = "800px";
        inputField.style.height = "100px";
        inputField.style.zIndex = "50000";
        inputField.style.position = "relative";
        this.inputElement = inputField;
        this.inputContainer = new THREE.CSS3DObject(this.inputElement);
        this.inputContainer.position.x = this.relPosition.x;
        this.inputContainer.position.y = this.relPosition.y;
        this.inputContainer.position.z = this.relPosition.z;
        this.inputContainer.scale.x = 0;
        this.inputContainer.scale.y = 0.1;
        this.inputContainer.scale.z = 0.1;
    }

    createSubmitButton(){
        let submitButton = document.createElement('button');
        submitButton.style.width = "100px";
        submitButton.style.height = "100px";
        submitButton.style.zIndex = "50000";
        submitButton.style.position = "relative";
        submitButton.id = "submit";
        this.submitButtonElement = submitButton;
        submitButton.onclick = () => {
            // console.log("wtf");
            this.putElementsInCircle();
            // this.startGenerateNewPoint = true;
            // this.submitAnimation();
        };
        this.submitButtonContainer = new THREE.CSS3DObject(this.submitButtonElement);
        this.submitButtonContainer.position.x = this.relPosition.x;
        this.submitButtonContainer.position.y = this.relPosition.y;
        this.submitButtonContainer.position.z = this.relPosition.z;
        this.submitButtonContainer.scale.x = 0.0;
        this.submitButtonContainer.scale.y = 0.0;
        this.submitButtonContainer.scale.z = 0.0;
    }

    hintClickAnimation(){
        let inputContainerTarget = new THREE.Vector3(0.1, 0.1, 0.1);
        let hintContainerTarget = new THREE.Vector3(0.6, 0.6, 0.6);
        this.moveValue(this.inputContainer.scale, inputContainerTarget, 2000, ()=>{
            this.moveValue(this.submitButtonContainer.scale, inputContainerTarget, 1500, ()=>{});
        });
        this.buttonElement.innerHTML = "";
        this.moveValue(this.trailGroup.scale, hintContainerTarget, 2000, ()=>{
        });
        // this.moveValue(this.hintContainer.scale, new THREE.Vector3(0.0,0.1,0.1), 2000, ()=>{});
    }

    moveValue(toMove, target, tweenTime, finishFunction ) {
        let deepTripPosition = new TWEEN.Tween(toMove)
            .to({
                x: target.x,
                y: target.y,
                z: target.z
            }, tweenTime)
            .easing(TWEEN.Easing.Cubic.InOut).onUpdate(function() {console.log(
                'wtf'
            );}).onComplete(() => finishFunction())
            .start();
    }

    moveColor(toMove, target, tweenTime, finishFunction){
        let deepTripPosition = new TWEEN.Tween(toMove)
            .to({
                r: target.r,
                g: target.g,
                b: target.b
            }, tweenTime)
            .easing(TWEEN.Easing.Cubic.InOut).onUpdate(function() {}).onComplete(() => finishFunction())
            .start();
    }

    putElementsInCircle(){
        this.submitButtonContainer.scale.copy(new THREE.Vector3(0,0,0));
        let currentOffset = {x: 0};
        let targetOffset = {x: -60};
        let tweenMovingTrack = new TWEEN.Tween(currentOffset)
            .to(
               targetOffset
            , 2000)
            .easing(TWEEN.Easing.Cubic.InOut).onUpdate(()=>{
                    this.movingTrack = currentOffset.x;
                }
            ).onComplete(() => {this.startGenerateNewPoint = true;})
            .start();
        this.moveValue(this.inputContainer.scale, new THREE.Vector3(0,0,0), 2000, ()=>{
        });
    }

    scaleDownFinished(){
        console.log("called finished");
        this.generateNewPoint = true;
        this.inputFunctionFinished = true;
    }

    update(){
        console.log(this.movingTrack);
        this.hintContainer.position.copy(this.parentCamera.position);
        this.hintContainer.rotation.copy(this.parentCamera.rotation);
        this.hintContainer.translateX(-190);
        this.hintContainer.translateY(80);
        this.hintContainer.translateZ(-300);

        this.submitButtonContainer.position.copy(this.parentCamera.position);
        this.submitButtonContainer.rotation.copy(this.parentCamera.rotation);
        this.submitButtonContainer.translateX(-80);
        this.submitButtonContainer.translateY(88);
        this.submitButtonContainer.translateZ(-300);

        this.inputContainer.position.copy(this.parentCamera.position);
        this.inputContainer.rotation.copy(this.parentCamera.rotation);
        this.inputContainer.translateX(-130 + this.movingTrack);
        this.inputContainer.translateY(88);
        this.inputContainer.translateZ(-300);

        if (!this.inputFunctionFinished){
            this.trailGroup.position.copy(camera.position);
            this.trailGroup.rotation.copy(camera.rotation);
            this.trailGroup.translateX(-190);
            this.trailGroup.translateY(80);
            this.trailGroup.translateZ(-300);
        }
        else{
            this.trailGroup.position.copy(this.newGeneratedPoint.point.position);
            if (this.newGeneratedPoint.startRotate){
                if (this.trailGroup.scale.x > 0.01){
                    this.trailGroup.scale.x *= 0.99;
                    this.trailGroup.scale.y *= 0.99;
                    this.trailGroup.scale.z *= 0.99;
                }
            }
        }

        // this.inputContainer.scale.x = 0;
        if (!this.inputFunctionFinished){
            for(let i=0; i<this.numberOfTrails; i++){
                this.trails[i].update();
            }
        }

        if (!this.inputFunctionFinished){
            if (this.startGenerateNewPoint){
                let col = new THREE.Color('#ff0000');
                this.moveValue(this.trailGroup.scale, new THREE.Vector3(0.3,0.3,0.3), 4000, ()=>{this.scaleDownFinished()});
                for(let i=0; i<this.numberOfTrails; i++){
                    this.moveColor(this.trails[i].point.material.color, col, 4000, ()=>{});
                    this.moveColor(this.trails[i].trailLine.material.color, col, 4000, ()=>{});
                    // this.trails[i].update();
                }
                this.startGenerateNewPoint = false;
                // this.trailGroup.scale.x *= 0.99;
                // this.trailGroup.scale.y *= 0.99;
                // this.trailGroup.scale.z *= 0.99;
                // if (this.trailGroup.scale.x < 0.3){
                //     this.generateNewPoint = true;
                //     this.inputFunctionFinished = true;
                // }
            }
        }
    }
}
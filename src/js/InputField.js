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
        this.inputDiv = null;
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
        this.movingTrackX = 0;
        this.movingTrackY = 0;
        // User Input Check and user Input
        this.userInputContent = null;
        // Different Screen Offset
        // this.screenOffset = new THREE.Vector3(190, -80, 0);
        this.screenOffset = new THREE.Vector3(20, 0, 0);
        this.buttonOffset = new THREE.Vector3(0,0,0);
        this.clickSound = null;
        //
        this.appearText = false;
        //
        this.alreadyHinted = false;
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
            newTrail.ringRotateSpeedX = 0;
            newTrail.ringRotateSpeedZ = 0;
            newTrail.useOffset = false;
            this.trails.push(newTrail);
            this.trailGroup.add(newTrail.point);
            this.trailGroup.add(newTrail.trailLine);
        }
    }

    createHint() {
        let button = document.createElement('div');
        button.innerHTML = this.content;
        button.className = "addNameHint";
        button.style.width = "300px";
        button.style.height = "300px";
        button.onclick = () => {
            if (!this.alreadyHinted){
                this.hintClickAnimation();
                this.clickSound.play();
                this.alreadyHinted = true;
            }
        };
        this.buttonElement = button;
        this.hintContainer = new THREE.CSS3DObject(this.buttonElement);
        this.hintContainer.position.x = this.relPosition.x;
        this.hintContainer.position.y = this.relPosition.y;
        this.hintContainer.position.z = this.relPosition.z;
        this.hintContainer.scale.x = 0.0;
        this.hintContainer.scale.y = 0.0;
        this.hintContainer.scale.z = 0.0;
    }

    createInputField(){
        let inputFieldDiv = document.createElement('div');
        inputFieldDiv.className = "inputDiv";
        inputFieldDiv.style.width = "800px";
        inputFieldDiv.style.height = "100px";
        inputFieldDiv.style.zIndex = "50000";
        inputFieldDiv.style.position = "relative";
        // inputFieldDiv.placeholder = "Type your name";
        let inputField =  document.createElement('input');
        inputField.className = "inputField";
        inputField.style.position = "absolute";
        inputField.style.width = "100%";
        inputField.style.height = "100%";
        inputField.id = "inputFieldID";
        inputField.type="text";
        inputField.placeholder= '你的"名字"';
        // inputField.placeholder="what your name";
        inputFieldDiv.appendChild(inputField);
        this.inputElement = inputField;

        let line = document.createElement('div');
        line.className = "inputLine";
        line.style.position = "absolute";
        line.style.width = "100%";
        inputFieldDiv.appendChild(line);

        // let label = document.createElement('LABEL');
        // label.className = "inputLabel";
        // label.style.position = "absolute";
        // label.style.width = "100%";
        // label.for = "inputFieldID";
        // label.innerText = "";
        // inputFieldDiv.appendChild(label);

        this.inputDiv = inputFieldDiv;
        this.inputContainer = new THREE.CSS3DObject(this.inputDiv);
        this.inputContainer.position.x = this.relPosition.x;
        this.inputContainer.position.y = this.relPosition.y;
        this.inputContainer.position.z = this.relPosition.z;
        this.inputContainer.scale.x = 0;
        this.inputContainer.scale.y = 0.1;
        this.inputContainer.scale.z = 0.1;
    }

    postName(content){
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let resObj = JSON.parse(this.responseText);
                console.log(resObj);
            }
        };
        req.open('POST', '/monument-api/visitor', true);
        // let data = new FormData();
        let data = {"name": content};
        let dataJSON = JSON.stringify(data);
        // data.name = content;
        req.send(dataJSON);
    }

    createSubmitButton(){
        let submitButton = document.createElement('button');
        submitButton.style.width = "180px";
        submitButton.style.height = "100px";
        submitButton.style.zIndex = "50000";
        submitButton.style.position = "relative";
        submitButton.id = "submit";
        submitButton.innerHTML="加入行走";
        this.submitButtonElement = submitButton;
        submitButton.onclick = () => {
            this.putElementsInCircle();
            for(let i=0; i<this.numberOfTrails; i++){
                this.trails[i].ringRotateSpeedX = Math.random()*0.02;
                this.trails[i].ringRotateSpeedZ = Math.random()*0.02;
                this.trails[i].ringRotateCounterMax = 1000;
            }
            this.userInputContent = this.inputElement.value.slice(0, 10);
            this.postName(this.userInputContent);
            this.clickSound.play();
        };
        this.submitButtonContainer = new THREE.CSS3DObject(this.submitButtonElement);
        this.submitButtonContainer.position.x = this.relPosition.x;
        this.submitButtonContainer.position.y = this.relPosition.y;
        this.submitButtonContainer.position.z = this.relPosition.z;
        this.submitButtonContainer.scale.x = 0.0;
        this.submitButtonContainer.scale.y = 0.0;
        this.submitButtonContainer.scale.z = 0.0;
    }

    hintClickAnimation() {
      let inputContainerTarget = new THREE.Vector3(0.1, 0.1, 0.1);
      let hintContainerTarget = new THREE.Vector3(0.2, 0.2, 0.2);
      this.moveValue(this.inputContainer.scale, inputContainerTarget, 2000, () => {
                                                          this.moveValue(this.submitButtonContainer.scale, inputContainerTarget, 1500, () => {});
                                                                                      });
      this.buttonElement.innerHTML = "";
      this.moveValue(this.trailGroup.scale, hintContainerTarget, 2000, () => {});
    // this.moveValue(this.hintContainer.scale, new THREE.Vector3(0.0,0.1,0.1), 2000, ()=>{});
    }

    moveValue(toMove, target, tweenTime, finishFunction) {
    let deepTripPosition = new TWEEN.Tween(toMove)
      .to({
        x: target.x,
        y: target.y,
        z: target.z
      }, tweenTime)
      .easing(TWEEN.Easing.Cubic.InOut).onUpdate(function() {
      }).onComplete(() => finishFunction())
      .start();
  }

    moveColor(toMove, target, tweenTime, finishFunction) {
        let deepTripPosition = new TWEEN.Tween(toMove)
          .to({
            r: target.r,
            g: target.g,
            b: target.b
          }, tweenTime)
          .easing(TWEEN.Easing.Cubic.InOut).onUpdate(function() {}).onComplete(() => finishFunction())
          .start();
    }

    putElementsInCircle() {
        let duration = 3000;
        this.submitButtonContainer.scale.copy(new THREE.Vector3(0, 0, 0));
        let currentOffset = {
          x: 0,
          y: 0
        };
        let targetOffset = {
          x: -50,
          y: 5
        };
        let tweenMovingTrack = new TWEEN.Tween(currentOffset)
          .to(
            targetOffset, duration)
          .easing(TWEEN.Easing.Cubic.InOut).onUpdate(() => {
            this.movingTrackX = currentOffset.x;
            this.movingTrackY = currentOffset.y;
          }).onComplete(() => {})
          .start();
        this.moveValue(this.inputContainer.scale, new THREE.Vector3(0, 0, 0), duration, () => {});
        this.moveValue(this.trailGroup.scale, new THREE.Vector3(0.6, 0.6, 0.6), duration, () => {
          this.startGenerateNewPoint = true;
        });
    }

    scaleDownFinished() {
        console.log("called finished");
        this.generateNewPoint = true;
        this.inputFunctionFinished = true;
    }

    update() {
        this.hintContainer.position.copy(this.parentCamera.position);
        this.hintContainer.rotation.copy(this.parentCamera.rotation);
        this.hintContainer.translateX(-190 + this.screenOffset.x);
        this.hintContainer.translateY(80 + this.screenOffset.y);
        this.hintContainer.translateZ(-300);

        this.submitButtonContainer.position.copy(this.parentCamera.position);
        this.submitButtonContainer.rotation.copy(this.parentCamera.rotation);
        this.submitButtonContainer.translateX(-90 + this.screenOffset.x + this.buttonOffset.x);
        this.submitButtonContainer.translateY(83 + this.screenOffset.y + this.buttonOffset.y);
        this.submitButtonContainer.translateZ(-300);

        this.inputContainer.position.copy(this.parentCamera.position);
        this.inputContainer.rotation.copy(this.parentCamera.rotation);
        this.inputContainer.translateX(-140 + this.movingTrackX + this.screenOffset.x);
        this.inputContainer.translateY(83 + this.movingTrackY + this.screenOffset.y);
        this.inputContainer.translateZ(-300);

        if (!this.inputFunctionFinished) {
          this.trailGroup.position.copy(camera.position);
          this.trailGroup.rotation.copy(camera.rotation);
          this.trailGroup.translateX(-190 + this.screenOffset.x);
          this.trailGroup.translateY(80 + this.screenOffset.y);
          this.trailGroup.translateZ(-300);
        } else {
          this.trailGroup.position.copy(this.newGeneratedPoint.point.position);
          if (this.newGeneratedPoint.startRotate) {
            if (this.trailGroup.scale.x > 0.01) {
              this.trailGroup.scale.x *= 0.99;
              this.trailGroup.scale.y *= 0.99;
              this.trailGroup.scale.z *= 0.99;
            }
            if (this.newGeneratedPoint.userInputBoard.container.scale.x !== 0.6){
              this.newGeneratedPoint.userInputBoard.container.scale.x = 0.6;
              this.newGeneratedPoint.userInputBoard.container.scale.y = 0.6;
              this.newGeneratedPoint.userInputBoard.container.scale.z = 0.6;
              this.newGeneratedPoint.userInputBoard.detailsElement.style.fontWeight = 900;
            }
          }
        }

        // this.inputContainer.scale.x = 0;
        if (!this.inputFunctionFinished) {
          for (let i = 0; i < this.numberOfTrails; i++) {
            this.trails[i].update();
          }
          if (this.trails[0].startRotate && !this.appearText){
              this.appearText = true;
              let targetScale = new THREE.Vector3(0.1, 0.1, 0.1);
              this.moveValue(this.hintContainer.scale, targetScale, 2000, ()=>{});
          }
        }

        if (!this.inputFunctionFinished) {
          if (this.startGenerateNewPoint) {
            let col = new THREE.Color('#ff0000');
            this.moveValue(this.trailGroup.scale, new THREE.Vector3(0.15, 0.15, 0.15), 7000, () => {
              this.scaleDownFinished()
            });
            for (let i = 0; i < this.numberOfTrails; i++) {
              this.moveColor(this.trails[i].point.material.color, col, 7000, () => {});
              this.moveColor(this.trails[i].trailLine.material.color, col, 7000, () => {});
              // this.trails[i].ringRotateSpeed = Math.random()*0.02;
            }
            this.startGenerateNewPoint = false;
          }
        }
  }
}

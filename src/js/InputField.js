//TODO: Add css
//TODO: How to incorporate canvas size into consideration
class InputField{
    constructor(relPosition, content, camera){
        this.relPosition = relPosition;
        this.content = content;
        this.buttonElement = null;
        this.parentCamera = camera;
        this.buttonContainer = null;
        this.createButton();
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
        this.startGenerateNewPoint = false;
        this.generateNewPoint = false;
    }

    createTrails(){
        for (let i=0; i<this.numberOfTrails; i++){
            let newTrail = new PersonPoint(15, 20, new THREE.Vector3(0,0,0));
            this.trails.push(newTrail);
            this.trailGroup.add(newTrail.point);
            this.trailGroup.add(newTrail.trailLine);
        }
    }

    createButton(){
        let button = document.createElement('div');
        button.innerHTML = this.content;
        button.className = "InputWords";
        button.style.width = "300px";
        button.style.height = "300px";
        this.buttonElement = button;
        this.buttonContainer = new THREE.CSS3DObject(this.buttonElement);
        this.buttonContainer.position.x = this.relPosition.x;
        this.buttonContainer.position.y = this.relPosition.y;
        this.buttonContainer.position.z = this.relPosition.z;
        this.buttonContainer.scale.x = 0.1;
        this.buttonContainer.scale.y = 0.1;
        this.buttonContainer.scale.z = 0.1;
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
        this.inputContainer.scale.x = 0.1;
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
            console.log("wtf");
            this.removeElements();
            this.startGenerateNewPoint = true;
        };
        this.submitButtonContainer = new THREE.CSS3DObject(this.submitButtonElement);
        this.submitButtonContainer.position.x = this.relPosition.x;
        this.submitButtonContainer.position.y = this.relPosition.y;
        this.submitButtonContainer.position.z = this.relPosition.z;
        this.submitButtonContainer.scale.x = 0.1;
        this.submitButtonContainer.scale.y = 0.1;
        this.submitButtonContainer.scale.z = 0.1;
    }

    removeElements(){
        console.log("removing");
        this.submitButtonContainer.scale.copy(new THREE.Vector3(0,0,0));
        this.inputContainer.scale.copy(new THREE.Vector3(0,0,0));
        this.buttonContainer.scale.copy(new THREE.Vector3(0,0,0));
    }

    update(){
        this.buttonContainer.position.copy(this.parentCamera.position);
        this.buttonContainer.rotation.copy(this.parentCamera.rotation);
        this.buttonContainer.translateX(-190);
        this.buttonContainer.translateY(80);
        this.buttonContainer.translateZ(-300);

        this.submitButtonContainer.position.copy(this.parentCamera.position);
        this.submitButtonContainer.rotation.copy(this.parentCamera.rotation);
        this.submitButtonContainer.translateX(-80);
        this.submitButtonContainer.translateY(95);
        this.submitButtonContainer.translateZ(-300);

        this.inputContainer.position.copy(this.parentCamera.position);
        this.inputContainer.rotation.copy(this.parentCamera.rotation);
        this.inputContainer.translateX(-130);
        this.inputContainer.translateY(95);
        this.inputContainer.translateZ(-300);

        this.trailGroup.position.copy(camera.position);
        this.trailGroup.rotation.copy(camera.rotation);
        this.trailGroup.translateX(-190);
        this.trailGroup.translateY(80);
        this.trailGroup.translateZ(-300);

        // this.inputContainer.scale.x = 0;
        for(let i=0; i<this.numberOfTrails; i++){
            this.trails[i].update();
        }

        if (this.startGenerateNewPoint){
            this.trailGroup.scale.x *= 0.99;
            this.trailGroup.scale.y *= 0.99;
            this.trailGroup.scale.z *= 0.99;
            if (this.trailGroup.scale.x < 0.1){
                this.generateNewPoint = true;
            }
        }
    }
}
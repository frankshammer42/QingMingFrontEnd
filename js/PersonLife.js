function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMaxVecDiffIndex(vec0, vec1) {
    let result = 0;
    let max_value = 0;
    let xdiff = Math.abs(vec0.x - vec1.x);
    max_value = xdiff;
    let ydiff = Math.abs(vec0.y - vec1.y);
    if (ydiff > max_value) {
        result = 1;
        max_value = ydiff
    }
    let zdiff = Math.abs(vec0.z - vec1.z);
    if (zdiff > max_value){
        max_value = zdiff;
        result = 2;
    }
    return result;
}

function generateProArrayWithDis(distArray){
    let result = [];
    // console.log (distArray);
    for (let i=0; i<distArray.length; i++){
        for (let k=0; k<distArray[i]; k++){
            result.push(i);
        }
    }
    return result;
}


class PersonLife {
    constructor(start, end){
        this.stepLength = 200;
        this.maxCount = 2000;
        this.growing_speed = 20;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(10002);
        this.geometry.addAttribute("position", new THREE.BufferAttribute(this.positions, 3));
        this.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1});
        this.line = new THREE.Line( this.geometry,  this.material);
        this.line.geometry.dynamic = true;
        for (let i=0; i < 100002; i++){
            this.line.geometry.attributes.position.array[i] = 0;
        }
        this.current_vertex_count = 2;
        this.current_position = new THREE.Vector3(0,0,0);
        this.initPosition(start, end);
        this.theOther = null;
        this.chooseToClose = false;
    }


    generateProbabilityArray(){
        //Probability Array with 60 10 10 10 10 distribution
        //But for stay 4 24 24 24 24
        let maxDiffIndex = getMaxVecDiffIndex(this.current_position, this.theOther.current_position);
        let posDiff = 0;
        let result;
        switch (maxDiffIndex) {
            case 1:
                if (this.current_position.y - this.theOther.current_position.y > 0){
                    result = generateProArrayWithDis([60, 10, 10, 10, 10]);
                    return result;
                }
                else{
                    result = generateProArrayWithDis([4, 24, 24, 24, 24]);
                    return result;
                }
            case 0:
                if (this.current_position.x - this.theOther.current_position.x <  0) {
                    result = generateProArrayWithDis([10, 60, 10, 10, 10]);
                    return result;
                }
                else {
                    result = generateProArrayWithDis([10, 10, 60, 10, 10]);
                    return result;
                }
            case 2:
                if (this.current_position.z - this.theOther.current_position.z < 0){
                    result = generateProArrayWithDis([10, 10, 10, 60, 10]);
                    return result;
                }
                else {
                    result = generateProArrayWithDis([10, 10, 10, 10, 60]);
                    return result;
                }
            default:
                return generateProArrayWithDis([20, 20, 20, 20, 20]);
        }
    }

    generateStep(probabilityArray){
        let index = getRandomInt(0, 100);
        let dirNumber = probabilityArray[index];
        switch (dirNumber) {
            case 0:
                return new THREE.Vector3(0,-this.stepLength,0);
            case 1:
                return new THREE.Vector3(this.stepLength*2,0,0);
            case 2:
                return new THREE.Vector3(-this.stepLength*2,0,0);
            case 3:
                return new THREE.Vector3(0,0,this.stepLength*2);
            case 4:
                return new THREE.Vector3(0,0,-this.stepLength*2);
            default:
                return new THREE.Vector3(0,0,0);
        }
    }

    initPosition(start, end){
        let current_positions = this.line.geometry.attributes.position.array;
        let index = 0;
        current_positions[0] = start[0];
        current_positions[1] = start[1];
        current_positions[2] = start[2];
        current_positions[3] = end[0];
        current_positions[4] = end[1];
        current_positions[5] = end[2];
        this.current_position = new THREE.Vector3(end[0], end[1], end[2]);
        console.log(this.current_position);
        console.log("PersonLife Initialized");
        this.geometry.setDrawRange(0, this.current_vertex_count);
    }

    destroy(scene){
        scene.remove(this.line);
    }

    update(){
        let probArray = [];
        if (this.chooseToClose){
            probArray = this.generateProbabilityArray();
        }
        else {
            for (let i=0; i<100; i++){
                let dirNumber = Math.floor(i/20);
                probArray.push(dirNumber);
            }
        }
        let currentStep = this.generateStep(probArray);
        // console.log(currentStep);
        this.current_position = this.current_position.add(currentStep);
        // console.log(this.current_position);
        this.current_vertex_count += 1;
        if (this.current_vertex_count < this.maxCount){
            let current_positions = this.line.geometry.attributes.position.array;
            current_positions[this.current_vertex_count*3]  =  this.current_position.x;
            current_positions[this.current_vertex_count*3 + 1]  =  this.current_position.y;
            current_positions[this.current_vertex_count*3 + 2]  =  this.current_position.z;
            this.geometry.setDrawRange(0, this.current_vertex_count);
            this.line.geometry.attributes.position.needsUpdate = true;
        }
    }
}
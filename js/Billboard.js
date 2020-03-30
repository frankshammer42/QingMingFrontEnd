class Billboard{
    constructor(position, content, camera){
        this.position = position;
        this.content = content;
        this.container = null;
        this.camera = camera;
        this.createBoard();
    }

    createBoard(){
        let board = document.createElement( 'div' );
        board.className = 'billboard';
        //board.style.backgroundColor = 'rgba(255,255,255,' + ( Math.random() * 0.5 + 0.25 ) + ')';
        // board.style.backgroundColor = 'rgba(56,56,56, 1)';
        // board.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        // board.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        let details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = this.content;
        board.appendChild( details );
        this.element = board;
        this.container = new THREE.CSS3DObject(this.element);
        this.container.position.x = this.position.x;
        this.container.position.y = this.position.y;
        this.container.position.z = this.position.z;
    }

    update(){
        this.container.quaternion.copy(this.camera.quaternion);
    }
}
// ==================================================
// CLASS - SCENE
// ==================================================
class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);
        this.lights = new Lights();
        this.camera = new Camera();
        this.floor = new Floor();
        this.raceTrack = new RaceTrack();
        this.carPlayer = new EnduroCar(0.0, 0.0, -3.5, this.lights, BRANCO);
        this.moon = new Moon();
        this.controls = new Controls(this, this.camera, this.lights, this.carPlayer);
        this.opponentCarsColors = [AZUL, AMARELO, VERDE, VERMELHO, ROSA];
        this.opponentCars = [];
        this.speed = 0.0;

        this.textures = {
            "1": this.renderer.loadTexture("textures/lua.jpg")
        };

        for (let i = 0; i < 3; i++) {
            this.opponentCars.push(new EnduroCar(-1 + i, 0.0,
                -6 + (-5 * i),
                this.lights,
                this.opponentCarsColors[i]));
        }

        //this.sky = new Sky();


        const fov = 60 * Math.PI / 180;
        const aspect = canvas.width / canvas.height;
        const near = -1;
        const far = -200;

        this.projectionTransform =
            m4.setPerspectiveProjectionMatrixAngle(fov,
                aspect,
                near,
                far);

        this.viewPosition = this.camera.P0;
    }

    update(deltaTime) {
        this.controls.update();

        const collisionType = Collisions.detectCollision(this.carPlayer,this.opponentCars,this.raceTrack);

        if (collisionType)
            this.speed = Collisions.reactCollision(collisionType,this.carPlayer,deltaTime);

        for (const car of this.opponentCars) {
            car.verticalMovement(this.speed, deltaTime);
        }


    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        //Desenhar o carro do jogador
        this.carPlayer.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );

        //Desenhar os carros oponentes
        for (let i = 0; i < 3; i++) {
            this.opponentCars[i].draw(
                this.renderer,
                this.camera.viewTransform,
                this.projectionTransform,
                this.lights,
                this.viewPosition
            )
        }

        //Desenhar o piso
        this.floor.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );

        // Desenhar a pista
        this.raceTrack.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );

        // Desenhar a Lua
        this.moon.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );

        /*Desenhar o céu
        this.sky.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );*/
    }

    execute(timestamp) {
        if (this.lastTimestamp === undefined) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = (timestamp - this.lastTimestamp) / 1000;

        this.lastTimestamp = timestamp;

        this.update(deltaTime);

        this.draw();

        requestAnimationFrame((timestamp) => this.execute(timestamp));
    }

    init() {

        requestAnimationFrame((timestamp) => this.execute(timestamp));
    }
}


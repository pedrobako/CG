// ==================================================
// CLASS - SCENE
// ==================================================
class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);
        this.lights = new Lights();
        this.camera = new Camera();
        this.floor = new Floor();
        this.raceTrack = new RaceTrack(this.renderer);
        this.carPlayer = new EnduroCar(0.0, 0.0, -3.5, this.lights, BRANCO);
        this.moon = new Moon(this.renderer);
        this.controls = new Controls(this, this.camera, this.lights, this.carPlayer);
        this.speed = 0.0;
        this.isDay = true;
        this.opponentCarsColors = [AZUL, AMARELO, VERDE, VERMELHO, ROSA];
        this.start = false;

        this.opponentCars = [];
        for (let i = 0; i < 3; i++) {
            this.opponentCars.push(new EnduroCar(-1 + i, 0.0,
                -6 + (-5 * i),
                this.lights,
                this.opponentCarsColors[i]));
        }

        this.lateralObjects = [];
        this.lateralObjects.push(
            new Billboard(this.renderer, this.lights, -20, "left", "textures/outdoor1.jpg"));
        this.lateralObjects.push(
            new Billboard(this.renderer, this.lights, -60, "right", "textures/outdoor2.jpg"));
        this.lateralObjects.push(this.raceTrack);

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

        const collisionType = Collisions.detectCollision(this.carPlayer, this.opponentCars, this.raceTrack);

        if (collisionType)
            this.speed = Collisions.reactCollision(collisionType, this.carPlayer, deltaTime);

        for (const car of this.opponentCars) {
            car.verticalMovement(this.speed, deltaTime);
            
            if (this.start)
                car.rotateWheels(deltaTime);
        }
        if (this.start){
            this.carPlayer.rotateWheels(deltaTime);

            for (const lateralObject of this.lateralObjects) {
                lateralObject.verticalMovement(this.speed + 15.0, deltaTime);
            }
        }

        this.lights.verticalMovement(this.speed, deltaTime);
        console.log(this.speed);
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
        for (let i = 0; i < this.opponentCars.length; i++) {
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

        for (const lateralObject of this.lateralObjects) {
            lateralObject.draw(
                this.renderer,
                this.camera.viewTransform,
                this.projectionTransform,
                this.lights,
                this.viewPosition
            );
        }

        if (!this.isDay) {
            // Desenhar a Lua
            this.moon.draw(
                this.renderer,
                this.camera.viewTransform,
                this.projectionTransform,
                this.lights,
                this.viewPosition
            );
        }
    }

    setNight() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.lights.setNight();
        this.isDay = false;
    }

    setDay() {

        gl.clearColor(0.20, 0.25, 1.0, 1.0);
        this.lights.setDay();
        this.isDay = true;
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


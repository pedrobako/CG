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
        this.controls = new Controls(this.camera, this.lights);
        this.carPlayer = new EnduroCar(0.0, 0.0, -3.5, this.lights, BRANCO);
        this.opponentCarsColors = [AZUL, AMARELO, VERDE, VERMELHO, ROSA];
        this.opponentCars = [];

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
        const far = -100;

        this.projectionTransform =
            m4.setPerspectiveProjectionMatrixAngle(fov,
                aspect,
                near,
                far);

        this.viewPosition = this.camera.P0;
    }

    update() {
        this.carPlayer.update();
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

        /*Desenhar o céu
        this.sky.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );*/
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}


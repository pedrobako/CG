// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        this.carPlayer = new EnduroCar(0.0, 0.0, -3.5);
        this.floor = new Floor();
        this.raceTrack = new RaceTrack();
        //this.sky = new Sky();
        this.camera = new Camera();
        this.controles = new Controles(this.camera);

        /*
            this.projectionTransform = m4.setOrthographicProjectionMatrix(
                -1, 1,   // left, right
                -1, 1,   // bottom, top
                -5, -100 // near, far
            );
        */

        /*
            this.projectionTransform = m4.setPerspectiveProjectionMatrix(
                -1, 1,   // left, right
                -1, 1,   // bottom, top
                -5, -100 // near, far
            );
        */


        const fov = 60 * Math.PI / 180;
        const aspect = canvas.width / canvas.height;
        const near = -1;
        const far = -100;

        this.projectionTransform =
            m4.setPerspectiveProjectionMatrixAngle(fov,
                aspect,
                near,
                far);

        // Tipos das luzes
        this.lightTypes = [
            0, // Luz direcional: sol
            1  // Luz posicional: farol
        ];

        // Posições das luzes
        this.lightPositions = [
            [0, 0, 0],       // Sol: não utilizada pela luz direcional
            [0, 4.0, 1000]   // Farol: posição provisória
        ];

        // Direções das luzes
        this.lightDirections = [
            [-1.0, -1.0, -2.0], // Direção do sol
            [0, 0, -1]        // Direção provisória do farol
        ];

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
            this.lightTypes,
            this.lightPositions,
            this.lightDirections,
            this.viewPosition
        );

        //Desenhar o piso
        this.floor.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lightTypes,
            this.lightPositions,
            this.lightDirections,
            this.viewPosition
        );

        // Desenhar a pista
        this.raceTrack.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lightTypes,
            this.lightPositions,
            this.lightDirections,
            this.viewPosition
        );

        /*Desenhar o céu
        this.sky.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lightTypes,
            this.lightPositions,
            this.lightDirections,
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


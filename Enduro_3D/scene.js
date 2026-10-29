// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        this.carroJogador = new EnduroCar(0, -7.0, 0);
        this.raceTrack = new RaceTrack();
        this.sky = new Sky();

        //DEFININDO A POSIÇÃO DA CÂMERA
        const P0 = [0, 5, 15]; // Ponto de observação (onde está a câmera)
        const Pref = [0, 0, 0]; // Ponto de referência (pra onde ela olha)
        const V = [0, 1, 0];    // Vetor "up" (direção "pra cima" da câmera)

        this.viewTransform = m4.setViewingMatrix(
            P0,    // Ponto de observação (P0)
            Pref,  // Ponto de referência (Pref)
            V      // Vetor "up" (V)
        );

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
        const near = -5;
        const far = -100;

        this.projectionTransform =
            m4.setPerspectiveProjectionMatrixAngle(fov,
                aspect,
                near,
                far);

        this.lightPositions = [
            [4.0, 4.0, 5.0],
            [4.0, -4.0, 5.0]
        ];

        this.viewPosition = P0;
    }

    update() {
        this.carroJogador.update();
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);
        this.carroJogador.draw(
            this.renderer,
            this.viewTransform,
            this.projectionTransform,
            this.lightPositions,
            this.viewPosition
        );

        // Desenhar as linhas laterais da pista
        this.raceTrack.draw(
            this.renderer,
            this.viewTransform,
            this.projectionTransform,
            this.lightPositions,
            this.viewPosition
        );

        this.sky.draw(
            this.renderer,
            this.viewTransform,
            this.projectionTransform,
            this.lightPositions,
            this.viewPosition
        );
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


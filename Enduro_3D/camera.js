class Camera {

    constructor() {
        // Posição da câmera
        this.P0 = [0, 10, 0];

        // Ponto para o qual a câmera olha: centro da órbita
        this.PRef = [0, 0, -7.0];

        // Vetor "up"
        this.V = [0, 1, 0];

        // Parâmetros da órbita
        this.radius = 6;
        this.azimuth = 0;
        this.elevation = 20 * Math.PI / 180;

        // Matriz de visualização
        this.viewTransform = m4.identity();

        this.setViewTransform();
    }

    setViewTransform() {
        const x = this.PRef[0] +
            this.radius * Math.cos(this.elevation) *
            Math.sin(this.azimuth);

        const y = this.PRef[1] +
            this.radius * Math.sin(this.elevation);

        const z = this.PRef[2] +
            this.radius * Math.cos(this.elevation) *
            Math.cos(this.azimuth);

        this.P0 = [x, y, z];

        this.viewTransform = m4.setViewingMatrix(
            this.P0,
            this.PRef,
            this.V
        );
    }

    setCarFocus() {
        this.PRef = [0, 0, -3.5];
        this.radius = 2;
        this.elevation = 30 * Math.PI / 180;

        this.setViewTransform();
    }

    setGameFocus() {
        this.PRef = [0, 0, 7.0];
        this.radius = 2;
        this.setViewTransform();
    }

    setThirdPerson() {
        this.PRef = [0, 0, -7.0];
        this.radius = 6;
        this.elevation = 20 * Math.PI / 180;

        this.setViewTransform();
    }

    setFirstPerson() {
        // A câmera em primeira pessoa não usa a órbita.
        // Posicionamento provisório em relação ao carro.
        this.P0 = [0, 1.5, 2];
        this.PRef = [0, 1.0, -5];

        this.viewTransform = m4.setViewingMatrix(
            this.P0,
            this.PRef,
            this.V
        );
    }

    setUp() {
        this.elevation += 5 * Math.PI / 180;

        //Limita a elevação máxima a 85°
        this.elevation = Math.min(
            this.elevation,
            85 * Math.PI / 180
        );

        this.setViewTransform();
    }

    setDown() {
        this.elevation -= 5 * Math.PI / 180;

        //Limita a elevação mínima a 30°
        this.elevation = Math.max(
            this.elevation,
            30 * Math.PI / 180
        );

        this.setViewTransform();
    }

    setRight() {
        this.azimuth += 5 * Math.PI / 180;
        this.setViewTransform();
    }

    setLeft() {
        this.azimuth -= 5 * Math.PI / 180;
        this.setViewTransform();
    }
}

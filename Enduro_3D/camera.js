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

        this.cameraType = "ThirdPerson";

        this.setViewTransform();
    }

    setViewTransform() {
        if (this.cameraType != "FirstPerson"){
            const x = this.PRef[0] +
                this.radius * Math.cos(this.elevation) *
                Math.sin(this.azimuth);

            const y = this.PRef[1] +
                this.radius * Math.sin(this.elevation);

            const z = this.PRef[2] +
                this.radius * Math.cos(this.elevation) *
                Math.cos(this.azimuth);

            this.P0 = [x, y, z];
        }

        this.viewTransform = m4.setViewingMatrix(
            this.P0,
            this.PRef,
            this.V
        );
    }

    setCarFocus() {
        this.PRef = [0, 0, -3.5];
        this.azimuth = 0;
        this.radius = 2;
        this.elevation = 30 * Math.PI / 180;
        this.cameraType = "carFocus";

        this.setViewTransform();
    }

    setFirstPerson() {
        this.P0 = [0, 1, -3.0];
        this.PRef = [0, 1, -7];
        this.cameraType = "FirstPerson";

        this.setViewTransform();
    }

    setThirdPerson() {
        this.PRef = [0, 0, -7.0];
        this.azimuth = 0;
        this.radius = 6;
        this.elevation = 20 * Math.PI / 180;
        this.cameraType = "ThirdPerson";

        this.setViewTransform();
    }

    setUp() {
        if (this.cameraType != "FirstPerson") {
            this.elevation += 5 * Math.PI / 180;

            //Limita a elevação máxima a 85°
            this.elevation = Math.min(
                this.elevation,
                85 * Math.PI / 180
            );

            this.setViewTransform();
        }
    }

    setDown() {
        if (this.cameraType != "FirstPerson") {
            this.elevation -= 5 * Math.PI / 180;
            let min = 20;
            if (this.cameraType == "carFocus")
                min = 30;

            //Limita a elevação mínima a 30°
            this.elevation = Math.max(
                this.elevation,
                min * Math.PI / 180
            );

            this.setViewTransform();
        }
    }

    setRight() {
        if (this.cameraType != "FirstPerson") {
            this.azimuth += 5 * Math.PI / 180;
            this.setViewTransform();
        }
    }

    setLeft() {
        if (this.cameraType != "FirstPerson") {
            this.azimuth -= 5 * Math.PI / 180;
            this.setViewTransform();
        }
    }
}
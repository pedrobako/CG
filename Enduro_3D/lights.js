class Lights {
    constructor() {
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

        // Intensidades das luzes
        this.lightIntensities = [
            1.5, // Sol
            1.0, // Faróis
            0.5 // Luz ambiente
        ];
    }
}
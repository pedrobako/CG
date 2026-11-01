class Lights {
    constructor() {
        // Posições das luzes
        this.lightPositions = [
            [0, 0, 0],      // O Sol desconsidera a posição da luz
            [0, 0, 0]       // A luz ambiente desconsidera a posição
        ];

        // Direções das luzes
        this.lightDirections = [
            [-1.0, -1.0, -2.0], // Direção do sol
            [0, 0, 0]           // A luz ambiente desconsidera a direção
        ];

        // Intensidades das luzes
        this.lightIntensities = [
            3.0, // Sol
            0.8 // Luz ambiente
        ];

        this.qtyLights = 2;
    }

    addIntensitySun() {
        this.lightIntensities[SUN_LIGHT] += 0.1;
        console.log("Sol: ", this.lightIntensities[SUN_LIGHT], "Amb: ", this.lightIntensities[AMBIENT_LIGHT]);
    }

    reduceIntensitySun() {
        this.lightIntensities[SUN_LIGHT] -= 0.1;
        console.log("Sol: ", this.lightIntensities[SUN_LIGHT], "Amb: ", this.lightIntensities[AMBIENT_LIGHT]);
    }

    addIntensityAmb() {
        this.lightIntensities[AMBIENT_LIGHT] += 0.1;
        console.log("Sol: ", this.lightIntensities[SUN_LIGHT], "Amb: ", this.lightIntensities[AMBIENT_LIGHT]);
    }

    reduceIntensityAmb() {
        this.lightIntensities[AMBIENT_LIGHT] -= 0.1;
        console.log("Sol: ", this.lightIntensities[SUN_LIGHT], "Amb: ", this.lightIntensities[AMBIENT_LIGHT]);
    }

    setDay() {
        this.lightIntensities[SUN_LIGHT] = 3.0;
        this.lightIntensities[AMBIENT_LIGHT] = 0.8;
        this.turnHeadLightsOff();
    }

    setNight() {
        this.lightIntensities[SUN_LIGHT] = 0.0;
        this.lightIntensities[AMBIENT_LIGHT] = 0.1;
        this.turnHeadLightsOn();
    }

    addCarHeadLight(xCar, yCar, zCar) {
        const posLeftHeadLight = [
            xCar - 0.05,
            yCar + 0.2,
            zCar
        ];

        const posRightHeadLight = [
            xCar + 0.05,
            yCar + 0.2,
            zCar
        ];

        const directLeftHeadLight = [-0.2, -0.3, -1];
        const directRightHeadLight = [0.2, -0.3, -1];

        //Os faróis são adicionados na construção do carro, quando ainda é dia
        const headlightIntensitie = 0;

        this.lightPositions.push(posLeftHeadLight);
        this.lightPositions.push(posRightHeadLight);
        this.lightDirections.push(directLeftHeadLight);
        this.lightDirections.push(directRightHeadLight);
        this.lightIntensities.push(headlightIntensitie);
        this.lightIntensities.push(headlightIntensitie);
        this.qtyLights += 2;
    }

    turnHeadLightsOff(){
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 0;
    }

    turnHeadLightsOn(){
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 2.0;
    }
}
class Lights {
    constructor() {
        // Posições das luzes
        this.lightPositions = [
            [0, 0, 0],      // O Sol desconsidera a posição da luz
            [0, 0, 0]       // A luz ambiente desconsidera a posição
        ];

        // Direções das luzes
        this.lightDirections = [
            [0.0, -1.0, -1.0], // Direção do sol
            [0, 0, 0]           // A luz ambiente desconsidera a direção
        ];

        // Intensidades das luzes
        this.lightIntensities = [
            3.0, // Sol
            0.8 // Luz ambiente
        ];

        this.qtyLights = 2;

        this.stage = DAY;
    }

    addIntensitySun() {
        this.lightIntensities[SUN_LIGHT] += 0.1;
    }

    reduceIntensitySun() {
        this.lightIntensities[SUN_LIGHT] -= 0.1;
    }

    addIntensityAmb() {
        this.lightIntensities[AMBIENT_LIGHT] += 0.1;
    }

    reduceIntensityAmb() {
        this.lightIntensities[AMBIENT_LIGHT] -= 0.1;
    }

    setDay() {
        this.lightIntensities[SUN_LIGHT] = 3.0;
        this.lightIntensities[AMBIENT_LIGHT] = 0.8;
        this.turnLightsOff();
        this.stage = DAY;
    }

    setNight() {
        this.lightIntensities[SUN_LIGHT] = 0.0;
        this.lightIntensities[AMBIENT_LIGHT] = 0.1;
        this.turnLightsOn();
        this.stage = NIGHT;
    }

    turnLightsOff(){
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 0;
    }

    turnLightsOn(){
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 2.0;
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        for (let i=4; i<this.lightPositions.length; i++){
            this.lightPositions[i][2] += displacement;
        }
    }

    carPlayerHorizontalMovement(tx){
        this.lightPositions[2][0] += tx;
        this.lightPositions[3][0] += tx;
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

    addPanelLight(x, y, z) {
        let posLight = [];
        let directLight = [];
        let xDir = 0.2;
        let offset = -2;
        const lightIntensitie = 0;

        if (x<0){
            xDir = -xDir;
            offset = -offset;
        }
        
        directLight = [xDir, 0.0, -1];

        for (let i=1; i<5; i++){
            const lampX = x + (i - 2) * offset;
            posLight = [lampX, y+3.3, z+5+i];
            this.lightPositions.push(posLight);
            this.lightDirections.push(directLight);
            this.lightIntensities.push(lightIntensitie);
            this.qtyLights += 1;
        }
        this.qtyLights += 4;
    }
}
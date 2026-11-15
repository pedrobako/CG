class Lights {
    constructor() {

        // Posições das luzes
        this.lightPositions = [
            [0, 0, 0],      // O Sol desconsidera a posição da luz
            [0, 0, 0]       // A luz ambiente desconsidera a posição
        ];

        // Direções das luzes
        this.lightDirections = [
            [0.5, -1.0, -1.0], // Direção do sol
            [0, 0, 0]           // A luz ambiente desconsidera a direção
        ];

        // Intensidades das luzes
        this.lightIntensities = [
            3.0, // Sol
            0.8 // Luz ambiente
        ];

        this.qtyLights = 2;

        //Criação de grupos de luzes com id
        //Para facilitar a remoção das luzes quando os objetos forem descartados
        this.lightGroups = new Map();
        this.nextLightGroupId = 1;

        this.stage = DAY;
    }

    addLightGroup(positions, directions, intensities, prefix) {

        const id = `${prefix}_${this.nextLightGroupId++}`;
        const startIndex = this.lightPositions.length;

        this.lightPositions.push(...positions);
        this.lightDirections.push(...directions);
        this.lightIntensities.push(...intensities);

        this.lightGroups.set(id, {
            startIndex: startIndex,
            quantity: positions.length
        });

        this.qtyLights = this.lightPositions.length;

        return id;
    }

    removeLightGroup(id) {

        const group = this.lightGroups.get(id);

        if (!group) {
            console.warn(`Grupo de luzes não encontrado: ${id}`);
            return false;
        }

        const { startIndex, quantity } = group;

        this.lightPositions.splice(startIndex, quantity);
        this.lightDirections.splice(startIndex, quantity);
        this.lightIntensities.splice(startIndex, quantity);

        // Atualiza os índices dos grupos posteriores
        for (const otherGroup of this.lightGroups.values()) {

            if (otherGroup.startIndex > startIndex) {
                otherGroup.startIndex -= quantity;
            }
        }

        this.lightGroups.delete(id);

        this.qtyLights = this.lightPositions.length;

        return true;
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

    turnLightsOff() {
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 0;
    }

    turnLightsOn() {
        for (let i = 2; i < this.qtyLights; i++)
            this.lightIntensities[i] = 2.0;
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        //Altero somente as luzes dos carros e outdoors
        //Pulo o Sol, a luz ambiente e os dois faróis do carro do jogador
        for (let i = 4; i < this.lightPositions.length; i++) {
            this.lightPositions[i][2] += displacement;
        }
    }

    carPlayerHorizontalMovement(tx) {
        this.lightPositions[2][0] += tx;
        this.lightPositions[3][0] += tx;
    }

    addCarHeadLight(xCar, yCar, zCar) {
        const positions = [
            [xCar - 0.05, yCar + 0.2, zCar],// Pos farol esquerdo
            [xCar + 0.05, yCar + 0.2, zCar] // Pos farol direito
        ];
        const directions = [
            [-0.2, -0.3, -1],//Direção farol esquerdo
            [0.2, -0.3, -1] //Direção farol direito
        ];

        //Os faróis são adicionados ligados ou desligados
        //De acordo com o estágio for dia ou noite
        let intensities = [];
        if (this.stage == NIGHT)
            intensities = [2.0, 2.0];
        else
            intensities = [0.0, 0.0];

        return this.addLightGroup(positions, directions, intensities, "car");
    }

    removeCarHeadlights(id) {
        return this.removeLightGroup(id);
    }

    addPanelLights(x, y, z) {

        const positions = [];
        const directions = [];
        const intensities = [];

        let xDir = 0.2;
        let offset = -2;

        if (x < 0) {
            xDir = -xDir;
            offset = -offset;
        }

        const directLight = [xDir, 0.0, -1];

        let intensitie;
        if (this.stage == NIGHT)
            intensitie = 2.0;
        else
            intensitie = 0.0;

        for (let i = 1; i < 5; i++) {

            const lampX = x + (i - 2) * offset;
            positions.push([lampX, y + 3.3, z + 5 + i]);
            directions.push(directLight);
            
            intensities.push(intensitie);
        }

        return this.addLightGroup(positions, directions, intensities, "panel");
    }

    removePanelLights(id) {
        return this.removeLightGroup(id);
    }
}
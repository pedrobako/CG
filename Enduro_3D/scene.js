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
        this.carPlayer = new EnduroCar(0.0, 0.0, -4.0, this.lights, WHITE);
        this.moon = new Moon(this.renderer);
        this.controls = new Controls(this, this.camera, this.lights, this.carPlayer);
        this.speed = 0.0;
        this.isDay = true;
        this.opponentCarsColors = [BLUE, YELLOW, GREEN, RED, PINK];
        this.start = false;
        this.opponentCars = [];
        this.createOpponents(5);
        this.lateralObjects = [];
        this.createLateralObjects();
        this.distance = 0.0;
        this.level = 1;
        this.carsToOvertakePerLevel = 200;
        this.carsRemaining = this.carsToOvertakePerLevel;
        this.paused = false;

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

    update(deltaTime) {
        this.controls.update(deltaTime);

        if (this.paused)
            return;

        const collisionType = Collisions.detectCollision(this.carPlayer, this.opponentCars, this.raceTrack);

        if (collisionType)
            this.speed = Collisions.reactCollision(collisionType, this.carPlayer, deltaTime);

        for (const car of this.opponentCars) {
            car.verticalMovement(this.speed, deltaTime);

            if (this.start)
                car.rotateWheels(deltaTime);
        }
        if (this.start) {
            // Atualizar distância percorrida
            this.distance += Math.max(1, this.speed) * deltaTime;

            //Girando as rodas do carro do jogador
            this.carPlayer.rotateWheels(deltaTime);

            for (const lateralObject of this.lateralObjects) {
                lateralObject.verticalMovement(this.speed, deltaTime);
            }
            this.lights.verticalMovement(this.speed, deltaTime);
        }

        this.updateOpponents();

        this.updateLateralObjects();

        this.checkOvertake();

        this.updateHUD();

        console.log(this.speed);
    }

    //Checando as ultrapassagens
    checkOvertake() {
        for (const opponentCar of this.opponentCars) {
            if (opponentCar.zMin > this.carPlayer.zMax && opponentCar.overtakeStatus == NOT_OVERTAKEN) {
                opponentCar.overtakeStatus = OVERTAKEN;
                this.carsRemaining--;
                if (this.carsRemaining == 0) {
                    this.carsRemaining = this.carsToOvertakePerLevel;
                    this.level++;
                    this.setDay();
                }
                if (this.carsRemaining == this.carsToOvertakePerLevel / 2) {
                    this.setNight();
                }
            }
            else if (opponentCar.zMax < this.carPlayer.zMin && opponentCar.overtakeStatus == OVERTAKEN) {
                opponentCar.overtakeStatus = NOT_OVERTAKEN;
                this.carsRemaining++;
            }
        }
    }

    // Atualização da pontuação
    updateHUD() {

        document.getElementById("distance").textContent =
            String(Math.floor(this.distance)).padStart(6, "0");

        document.getElementById("level").textContent =
            this.level;

        document.getElementById("cars-count").textContent =
            this.carsRemaining;
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

    // ========================================================
    // FUNÇÕES PARA MANIPULAR OPONENTES
    // ========================================================
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getOneOpponent(pos, z) {
        let x = 0, y = 0;
        const color = this.opponentCarsColors[this.randomInt(0, this.opponentCarsColors.length - 1)];

        if (pos == POS_LEFT)
            x = (TRACK_LEFT_LIMIT + RIGHT_LIMIT_POS_LEFT) / 2;
        else if (pos == POS_RIGHT)
            x = (RIGHT_LIMIT_POS_CENTER + TRACK_RIGHT_LIMIT) / 2;
        else
            x = 0.0;

        return new EnduroCar(x, y, z, this.lights, color);
    }

    getTwoOpponents(pos, z) {
        let x = 1, y = 0;
        const color1 = this.opponentCarsColors[this.randomInt(0, this.opponentCarsColors.length - 1)];
        const color2 = this.opponentCarsColors[this.randomInt(0, this.opponentCarsColors.length - 1)];

        if (pos == POS_LEFT)
            x = (TRACK_LEFT_LIMIT + LEFT_LIMIT_POS_CENTER) / 2;
        else if (pos == POS_RIGHT)
            x = (TRACK_RIGHT_LIMIT + RIGHT_LIMIT_POS_CENTER) / 2;

        return [
            new EnduroCar(x, y, z, this.lights, color1),
            new EnduroCar(0.0, y, z - 2, this.lights, color2)
        ];
    }

    createOpponents(qty) {
        let initialZ = -110.0;

        for (let i = 0; i < qty; i++) {
            const z = (-i * 30) + initialZ;
            const qtyCars = this.randomInt(1, 10);
            const posCar = this.randomInt(POS_LEFT, POS_RIGHT);
            if (qtyCars <= 7)//70 % de chance de criar apenas 1 carro
                this.opponentCars.push(this.getOneOpponent(posCar, z));
            else
                this.opponentCars.push(...this.getTwoOpponents(posCar, z));
        }
    }

    updateOpponents() {
        for (let i = 0; i < this.opponentCars.length; i++) {
            if (this.opponentCars[i].z > 50) {
                let pos = POS_CENTER;
                if (this.opponentCars[i].pos != POS_CENTER)
                    if (this.randomInt(1, 2) == 1)
                        pos = POS_LEFT;
                    else
                        pos = POS_RIGHT;

                this.lights.removeCarHeadlights(this.opponentCars[i].headlightsId);

                this.opponentCars[i] = this.getOneOpponent(pos, -100);
            }
        }
    }

    // FUNÇÃO PARA CRIAR OS COMPONENTES LATERAIS
    createLateralObjects() {
        this.lateralObjects.push(
            new Billboard(this.renderer, this.lights, -20, "left", "textures/outdoor1.jpg"));
        this.lateralObjects.push(
            new Billboard(this.renderer, this.lights, -60, "right", "textures/outdoor2.jpg"));

        this.lateralObjects.push(this.raceTrack);
    }

    updateLateralObjects() {
        //Não altero a pista que está armazenada na última posição do array
        for (let i = 0; i < this.lateralObjects.length - 1; i++) {
            if (this.lateralObjects[i].z > -3.0) {
                let side = "";
                if (this.randomInt(1, 2) == 1)
                    side = "left";
                else
                    side = "right";

                let texture = "";
                if (this.randomInt(1, 2) == 1)
                    texture = "textures/outdoor1.jpg";
                else
                    texture = "textures/outdoor2.jpg";

                this.lights.removePanelLights(this.lateralObjects[i].panelLightsId);

                this.lateralObjects[i] =
                    new Billboard(this.renderer, this.lights, -100, side, texture);
            }
        }
    }

    togglePause() {
        this.paused = !this.paused;
        this.lastTimestamp = undefined;
    }

    oldStyle() {
        this.raceTrack.oldStyle = !this.raceTrack.oldStyle;
        this.raceTrack.hasTexture = !this.raceTrack.hasTexture;
    }

    activateDemoMode() {
        if (!this.start) {
            this.carsToOvertakePerLevel = 10;
            this.carsRemaining = 10;
            this.updateHUD();
        }
    }

    execute(timestamp) {
        if (this.lastTimestamp === undefined) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = (timestamp - this.lastTimestamp) / 1000;

        this.lastTimestamp = timestamp;

        this.update(deltaTime);

        this.draw();

        this.animationFrameId = requestAnimationFrame((timestamp) => this.execute(timestamp));
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

        // Desenhar linhas auxiliares da pista
        /*
        this.raceTrackDebug = new RaceTrackDebug();
        this.raceTrackDebug.draw(
            this.renderer,
            this.camera.viewTransform,
            this.projectionTransform,
            this.lights,
            this.viewPosition
        );
        */

        //Desenhando objetos na lateral da pista
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

    init() {
        this.animationFrameId = requestAnimationFrame((timestamp) => this.execute(timestamp));
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        this.controls.destroy();
    }
}


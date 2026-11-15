class Controls {
    constructor(scene, camera, lights, carPlayer) {
        this.scene = scene;
        this.camera = camera;
        this.lights = lights;
        this.carPlayer = carPlayer;

        // Controles contínuos ativos
        this.activeControls = new Set();

        // Teclado físico
        document.addEventListener("keydown", (event) => {
            if (this.isContinuousControl(event.code)) {
                event.preventDefault();
                this.activeControls.add(event.code);
            } else {
                this.handleControl(event.code);
            }
        });

        document.addEventListener("keyup", (event) => {
            this.activeControls.delete(event.code);
        });

        // Evita manter teclas pressionadas ao perder o foco da janela
        window.addEventListener("blur", () => {
            this.activeControls.clear();
        });

        // Botões da interface
        document.querySelectorAll(".key[data-key]").forEach((button) => {
            const key = button.dataset.key;

            button.addEventListener("pointerdown", (event) => {
                if (!this.isContinuousControl(key)) return;

                event.preventDefault();
                this.activeControls.add(key);
                button.setPointerCapture(event.pointerId);
            });

            const stopControl = () => {
                this.activeControls.delete(key);
            };

            button.addEventListener("pointerup", stopControl);
            button.addEventListener("pointercancel", stopControl);
            button.addEventListener("lostpointercapture", stopControl);

            // Os controles de ação única continuam usando click
            button.addEventListener("click", () => {
                if (!this.isContinuousControl(key)) {
                    this.handleControl(key);
                }
            });
        });
    }

    isContinuousControl(key) {
        return [
            "ArrowLeft",
            "ArrowRight",
            "ArrowDown",
            "Space",
            "Numpad8",
            "Numpad2",
            "Numpad4",
            "Numpad6"
        ].includes(key);
    }

    update() {
        for (const key of this.activeControls) {
            this.handleContinuousControl(key);
        }
    }

    handleContinuousControl(key) {
        switch (key) {
            case "ArrowLeft":
                this.carPlayer.horizontalMovement(-0.05);
                break;

            case "ArrowRight":
                this.carPlayer.horizontalMovement(0.05);
                break;

            case "ArrowDown":
                if (this.scene.speed > -10.0) 
                    this.scene.speed -= 1.0;
                break;

            case "Space":
                if (this.scene.speed < 20.0)
                    this.scene.speed += 0.5;
                this.scene.start = true;
                break;

            case "Numpad8":
                this.camera.setUp();
                break;

            case "Numpad2":
                this.camera.setDown();
                break;

            case "Numpad4":
                this.camera.setLeft();
                break;

            case "Numpad6":
                this.camera.setRight();
                break;
        }
    }

    handleControl(key) {
        switch (key) {
            case "Numpad5":
                this.camera.setCarFocus();
                break;

            case "Numpad1":
                this.camera.setFirstPerson();
                break;

            case "Numpad3":
                this.camera.setThirdPerson();
                break;

            case "Numpad7":
                this.lights.reduceIntensitySun();
                break;

            case "Numpad9":
                this.lights.addIntensitySun();
                break;

            case "Minus":
            case "NumpadSubtract":
                this.lights.reduceIntensityAmb();
                break;

            case "NumpadAdd":
                this.lights.addIntensityAmb();
                break;

            case "NumpadEnter":
                if (this.scene.isDay) {
                    this.scene.setNight();
                } else {
                    this.scene.setDay();
                }
                break;
        }
    }
}
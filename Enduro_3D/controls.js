class Controls {
    constructor(scene, camera, lights, carPlayer) {
        this.scene = scene;
        this.camera = camera;
        this.lights = lights;
        this.carPlayer = carPlayer;
        this.listeners = [];

        // Controles contínuos ativos
        this.activeControls = new Set();

        // Teclado físico
        this.addListener(document, "keydown", (event) => {
            const button = document.querySelector(`[data-key="${event.code}"]`);

            if (this.isContinuousControl(event.code)) {
                event.preventDefault();
                this.activeControls.add(event.code);
                button?.classList.add("is-pressed");
            } else if (!event.repeat) {
                if (button) {
                    button.classList.add("is-pressed");
                    button.click();
                } else {
                    this.handleControl(event.code);
                }
            }
        });

        this.addListener(document, "keyup", (event) => {
            this.activeControls.delete(event.code);

            const button = document.querySelector(`[data-key="${event.code}"]`);
            button?.classList.remove("is-pressed");
        });

        // Evita manter teclas pressionadas ao perder o foco da janela
        this.addListener(window, "blur", () => {
            this.activeControls.clear();
        });

        // Botões da interface
        document.querySelectorAll(".key[data-key], .driving-button[data-key]").forEach((button) => {
            const key = button.dataset.key;

            this.addListener(button, "pointerdown", (event) => {
                if (!this.isContinuousControl(key)) return;

                event.preventDefault();
                this.activeControls.add(key);
                button.setPointerCapture(event.pointerId);
            });

            const stopControl = () => {
                this.activeControls.delete(key);
            };

            this.addListener(button, "pointerup", stopControl);
            this.addListener(button, "pointercancel", stopControl);
            this.addListener(button, "lostpointercapture", stopControl);

            // Os controles de ação única continuam usando click
            this.addListener(button, "click", () => {
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
            "ArrowUp",
            "Space",
            "Numpad8",
            "Numpad2",
            "Numpad4",
            "Numpad6"
        ].includes(key);
    }

    update(deltaTime) {
        for (const key of this.activeControls) {
            this.handleContinuousControl(key, deltaTime);
        }
    }

    handleContinuousControl(key, deltaTime) {
        if (this.scene.gameOver) return;
        switch (key) {
            case "ArrowLeft":
                if (this.scene.start) {
                    this.carPlayer.horizontalMovement(-1.5 * deltaTime);
                }
                break;

            case "ArrowRight":
                if (this.scene.start) {
                    this.carPlayer.horizontalMovement(1.5 * deltaTime);
                }
                break;

            case "ArrowDown":
            if (this.scene.start) {    
                this.scene.speed = Math.max(-10.0, this.scene.speed - 30.0 * deltaTime);
                break;
            }

            case "Space":
            case "ArrowUp":
                this.scene.speed = Math.min(20.0, this.scene.speed + 30.0 * deltaTime);
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

            case "KeyP":
                this.scene.togglePause();
                break;

            case "KeyD":
                this.scene.activateDemoMode();
                break;

            case "KeyT":
                this.scene.oldStyle();
                break;

            case "KeyR":
                reset();
                break;
        }
    }

    addListener(target, event, handler) {
        target.addEventListener(event, handler);
        this.listeners.push({ target, event, handler });
    }

    destroy() {
        for (const { target, event, handler } of this.listeners) {
            target.removeEventListener(event, handler);
        }
        this.listeners = [];
        this.activeControls.clear();
    }
}
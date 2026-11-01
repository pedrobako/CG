class Controls {
    constructor(camera) {
        this.camera = camera;

        // Teclado físico
        document.addEventListener("keydown", (event) => {
            this.handleControl(event.code);
        });

        // Cliques nos botões da interface
        document.querySelectorAll(".key[data-key]").forEach((button) => {
            button.addEventListener("click", () => {
                this.handleControl(button.dataset.key);
            });
        });
    }

    handleControl(key) {
        switch (key) {
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

            case "Numpad5":
                this.camera.setCarFocus();
                break;

            case "Numpad1":
                this.camera.setFirstPerson();
                break;

            case "Numpad3":
                this.camera.setThirdPerson();
                break;
        }
    }
}
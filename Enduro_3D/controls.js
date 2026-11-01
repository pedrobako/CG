class Controls {
    constructor(camera) {
        this.camera = camera;

        document.addEventListener("keydown", (event) => {
            switch (event.code) {
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
                
                case "Numpad3":
                    this.camera.setThirdPerson();
                    break;
            }
        });
    }
}
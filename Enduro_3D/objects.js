// ==================================================
// CLASS - CAR
// ==================================================

class Car {

    constructor(model) {

        // Referência ao modelo visual do carro
        this.model = model;

        // Posição do carro no mundo
        this.position = [0, 0, 0];

        // Orientação horizontal do carro
        this.heading = 0;

        this.modelTransform = m4.identity();
    }

    updateTransform() {
        this.modelTransform = m4.translation(this.position[0], 
                                             this.position[1],
                                             this.position[2]);
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
    }
}
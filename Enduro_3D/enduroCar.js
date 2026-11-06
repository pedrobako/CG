class EnduroCar {

    constructor(tx, ty, tz, lights, cor) {

        // Transformações do carro.
        this.x = tx;
        this.y = ty;
        this.z = tz;
        this.cor = cor;

        // Cada carro terá sua própria cópia das cores da carroceria.
        const bodyColors = new Float32Array(
            carPiece.carroceria.colors
        );

        // Separação das partes do carro.
        this.body = new SceneObject(
            carPiece.carroceria.vertices,
            bodyColors,
            carPiece.carroceria.normals,
            carPiece.carroceria.indices,
            lights
        );

        this.frontLeftWheel = new SceneObject(
            carPiece.roda1.vertices,
            carPiece.roda1.colors,
            carPiece.roda1.normals,
            carPiece.roda1.indices,
            lights
        );

        this.frontRightWheel = new SceneObject(
            carPiece.roda2.vertices,
            carPiece.roda2.colors,
            carPiece.roda2.normals,
            carPiece.roda2.indices,
            lights
        );

        this.rearLeftWheel = new SceneObject(
            carPiece.roda3.vertices,
            carPiece.roda3.colors,
            carPiece.roda3.normals,
            carPiece.roda3.indices,
            lights
        );

        this.rearRightWheel = new SceneObject(
            carPiece.roda4.vertices,
            carPiece.roda4.colors,
            carPiece.roda4.normals,
            carPiece.roda4.indices,
            lights
        );

        this.headlights = new SceneObject(
            carPiece.farois.vertices,
            carPiece.farois.colors,
            carPiece.farois.normals,
            carPiece.farois.indices,
            lights
        );

        this.taillights = new SceneObject(
            carPiece.lanternas.vertices,
            carPiece.lanternas.colors,
            carPiece.lanternas.normals,
            carPiece.lanternas.indices,
            lights
        );

        this.windshield = new SceneObject(
            carPiece.parabrisa.vertices,
            carPiece.parabrisa.colors,
            carPiece.parabrisa.normals,
            carPiece.parabrisa.indices,
            lights
        );

        this.parts = [
            this.body,
            this.frontLeftWheel,
            this.frontRightWheel,
            this.rearLeftWheel,
            this.rearRightWheel,
            this.headlights,
            this.taillights,
            this.windshield
        ];

        this.taillights.emissive = true;

        lights.addCarHeadLight(this.x, this.y, this.z);

        this.updateCarPosition();
        this.changeColor();

        // Obtendo os parâmetros do carro para verificar colisões
        this.xMin = 0.0;
        this.xMax = 0.0;
        this.zMin = 0.0;
        this.zMax = 0.0;
        this.xCenter = 0.0;
        this.zCenter = 0.0;
        this.getCollisionsParameters();
    }

    updateCarPosition() {

        const transformation = m4.translation(this.x, this.y, this.z);

        if (this.z > 200)
            this.z = -100;

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }

    changeColor() {
        const colors = this.body.colors;

        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = this.cor[0];
            colors[i + 1] = this.cor[1];
            colors[i + 2] = this.cor[2];
        }
    }

    getCollisionsParameters() {
        let xMin = Infinity;
        let xMax = -Infinity;
        let zMin = Infinity;
        let zMax = -Infinity;

        for (const part of this.parts) {
            for (let i = 0; i < part.vertices.length; i += 3) {
                const x = part.vertices[i] + this.x;
                const z = part.vertices[i + 2] + this.z;

                xMin = Math.min(xMin, x);
                xMax = Math.max(xMax, x);
                zMin = Math.min(zMin, z);
                zMax = Math.max(zMax, z);
            }
        }

        this.xMin = xMin;
        this.xMax = xMax;
        this.zMin = zMin;
        this.zMax = zMax;
        this.xCenter = (this.xMin + this.xMax) / 2;
        this.zCenter = (this.zMin + this.zMax) / 2;
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        this.z += displacement;

        this.zMin += displacement;
        this.zMax += displacement;
        this.zCenter += displacement;

        this.updateCarPosition();
    }

    horizontalMovement(tx) {
        
        if ((this.xMin + tx) < TRACK_LEFT_LIMIT)
            tx = TRACK_LEFT_LIMIT - this.xMin;
        else if ((this.xMax + tx) > TRACK_RIGHT_LIMIT)
            tx = TRACK_RIGHT_LIMIT - this.xMax;

        this.x += tx;
        this.xMin += tx;
        this.xMax += tx;
        this.xCenter += tx;

        this.updateCarPosition();
    }

    draw(
        renderer,
        viewTransform,
        projectionTransform,
        lights,
        viewPosition
    ) {
        for (const parte of this.parts) {
            parte.draw(
                renderer,
                viewTransform,
                projectionTransform,
                lights,
                viewPosition
            );
        }
    }
}
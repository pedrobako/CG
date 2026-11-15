class EnduroCar {

    constructor(tx, ty, tz, lights, cor) {

        // Transformações do carro.
        this.x = tx;
        this.y = ty;
        this.z = tz;
        this.lights = lights;
        this.cor = cor;

        // O carro pode estar em 3 posições na pista
        // 1 lado esquerdo
        // 2 centro
        // 3 lado direito
        this.pos = POS_CENTER;

        // Situação do carro adversário
        // 0 não ultrapassado
        // 1 ultrapassado
        this.overtakeStatus = NOT_OVERTAKEN;

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
            this.lights
        );

        this.frontLeftWheel = new EnduroCarWheel(
            carPiece.roda1.vertices,
            carPiece.roda1.colors,
            carPiece.roda1.normals,
            carPiece.roda1.indices,
            this.lights
        );

        this.frontRightWheel = new EnduroCarWheel(
            carPiece.roda2.vertices,
            carPiece.roda2.colors,
            carPiece.roda2.normals,
            carPiece.roda2.indices,
            this.lights
        );

        this.rearLeftWheel = new EnduroCarWheel(
            carPiece.roda3.vertices,
            carPiece.roda3.colors,
            carPiece.roda3.normals,
            carPiece.roda3.indices,
            this.lights
        );

        this.rearRightWheel = new EnduroCarWheel(
            carPiece.roda4.vertices,
            carPiece.roda4.colors,
            carPiece.roda4.normals,
            carPiece.roda4.indices,
            this.lights
        );

        this.headlights = new SceneObject(
            carPiece.farois.vertices,
            carPiece.farois.colors,
            carPiece.farois.normals,
            carPiece.farois.indices,
            this.lights
        );

        this.taillights = new SceneObject(
            carPiece.lanternas.vertices,
            carPiece.lanternas.colors,
            carPiece.lanternas.normals,
            carPiece.lanternas.indices,
            this.lights
        );

        this.windshield = new SceneObject(
            carPiece.parabrisa.vertices,
            carPiece.parabrisa.colors,
            carPiece.parabrisa.normals,
            carPiece.parabrisa.indices,
            this.lights
        );

        this.wheels = [
            this.frontLeftWheel,
            this.frontRightWheel,
            this.rearLeftWheel,
            this.rearRightWheel
        ];

        this.parts = [
            this.body,
            this.headlights,
            this.taillights,
            this.windshield,
            this.frontLeftWheel,
            this.frontRightWheel,
            this.rearLeftWheel,
            this.rearRightWheel
        ];

        this.taillights.emissive = true;

        this.headlightsId = this.lights.addCarHeadLight(this.x, this.y, this.z);

        this.changeColor();

        // Obtendo os parâmetros do carro para verificar colisões
        this.xMin = 0.0;
        this.xMax = 0.0;
        this.zMin = 0.0;
        this.zMax = 0.0;
        this.xCenter = 0.0;
        this.zCenter = 0.0;
        this.updateCollisionsParameters();
        this.updateCar();
    }

    updateCar() {

        const transformation = m4.translation(this.x, this.y, this.z);

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }

        //O carro pode estar em 3 posições na pista
        // 1 lado esquerdo
        // 2 centro
        // 3 lado direito
        this.pos = this.getTrackPosition();
        this.updateCollisionsParameters();
    }

    getTrackPosition() {
        if (this.xMax <= LEFT_LIMIT_POS_CENTER)
            return POS_LEFT;
        else if (this.xMin >= RIGHT_LIMIT_POS_CENTER)
            return POS_RIGHT;
        else
            return POS_CENTER;
    }



    rotateWheels(deltaTime) {

        const carTransform = m4.translation(this.x, this.y, this.z);

        for (const wheel of this.wheels)
            wheel.rotate(deltaTime, carTransform);
    }

    changeColor() {
        const colors = this.body.colors;

        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = this.cor[0];
            colors[i + 1] = this.cor[1];
            colors[i + 2] = this.cor[2];
        }
    }

    updateCollisionsParameters() {
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

        this.updateCar();
    }

    horizontalMovement(tx) {

        if ((this.xMin + tx) < TRACK_LEFT_LIMIT)
            tx = TRACK_LEFT_LIMIT - this.xMin;
        else if ((this.xMax + tx) > TRACK_RIGHT_LIMIT)
            tx = TRACK_RIGHT_LIMIT - this.xMax;

        this.x += tx;

        this.updateCar();

        this.lights.carPlayerHorizontalMovement(tx);
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

class EnduroCarWheel extends SceneObject {

    constructor(vertices, colors, normals, indices, lights) {
        super(
            vertices,
            colors,
            normals,
            indices,
            lights
        );

        this.pivot = getGeometryCenter(this.vertices);

        this.rotationAngle = 0.0;
        this.rotationSpeed = - Math.PI;
    }

    rotate(deltaTime, carTransform) {

        this.rotationAngle += this.rotationSpeed * deltaTime;

        const toOrigin = m4.translation(
            -this.pivot[0],
            -this.pivot[1],
            -this.pivot[2]
        );

        const fromOrigin = m4.translation(
            this.pivot[0],
            this.pivot[1],
            this.pivot[2]
        );

        const rotation = m4.xRotation(this.rotationAngle);

        const wheelRotation = m4.multiply(fromOrigin, m4.multiply(rotation, toOrigin));

        this.modelTransform = m4.multiply(carTransform, wheelRotation);
    }
}
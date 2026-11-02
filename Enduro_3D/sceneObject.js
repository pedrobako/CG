// ==================================================
// CLASS - SCENE OBJECT
// ==================================================
class SceneObject {

    constructor(
        vertices,
        colors,
        normals,
        indices,
        lights
    ) {

        this.vertices = vertices;
        this.colors = colors;
        this.normals = normals;
        this.indices = indices;
        this.lights = lights;
        //Objetos podem ter a cor como emissiva
        //Ou seja, brilharam mesmo no escuro
        //O objetivo é fazer as lanternas trazeiras brilharem
        //Buscando similaridade com o jogo original
        this.emissive = false;

        this.modelTransform = m4.identity();
    }

    draw(
        renderer,
        viewTransform,
        projectionTransform,
        lights,
        viewPosition
    ) {
        renderer.draw(
            this,
            viewTransform,
            projectionTransform,
            lights.lightPositions,
            lights.lightDirections,
            lights.lightIntensities,
            viewPosition
        );
    }
}

class EnduroCar {

    constructor(tx, ty, tz, lights, cor) {

        // Transformações do carro.
        this.tx = tx;
        this.ty = ty;
        this.tz = tz;
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

        this.changeColor();

        this.taillights.emissive = true;

        this.updateModelTransform();

        lights.addCarHeadLight(this.tx, this.ty, this.tz);
    }

    changeColor() {
        const colors = this.body.colors;

        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = this.cor[0];
            colors[i + 1] = this.cor[1];
            colors[i + 2] = this.cor[2];
        }
    }

    updateModelTransform() {

        const transformation = m4.translation(
            this.tx,
            this.ty,
            this.tz
        );

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }

    update() {

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

class RaceTrack extends SceneObject {
    constructor() {
        super(
            raceTrackGeometry.vertices,
            raceTrackGeometry.colors,
            raceTrackGeometry.normals,
            raceTrackGeometry.indices
        );
    }

    update() {
        // A pista ainda é estática; não precisa atualizar sua transformação.
    }
}

class Sky extends SceneObject {
    constructor() {
        super(
            skyGeometry.vertices,
            skyGeometry.colors,
            skyGeometry.normals,
            skyGeometry.indices
        );

        this.modelTransform = m4.identity();
    }
}

class Floor extends SceneObject {
    constructor() {
        super(
            floorGeometry.vertices,
            floorGeometry.colors,
            floorGeometry.normals,
            floorGeometry.indices
        );
    }
}
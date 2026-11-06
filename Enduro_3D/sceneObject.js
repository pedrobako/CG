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

class RaceTrack extends SceneObject {
    constructor() {
        super(
            raceTrackGeometry.vertices,
            raceTrackGeometry.colors,
            raceTrackGeometry.normals,
            raceTrackGeometry.indices
        );
        this.leftLimit = - TRACK_WIDTH/2;
        this.rightLimit = TRACK_WIDTH/2;
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

class Moon extends SceneObject {
    constructor() {
        super(
            moonGeometry.vertices,
            moonGeometry.colors,
            moonGeometry.normals,
            moonGeometry.indices
        );

        this.modelTransform = m4.translation(50, 20, -150);
          //  m4.scaling(2, 2, 2)
        //);
    }
}
// ==================================================
// CLASS - SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(
        vertices,
        colors,
        normals,
        indices,
    ) {

        this.vertices = vertices;
        this.colors = colors;
        this.normals = normals;
        this.indices = indices;

        this.modelTransform = m4.identity();
    }

    draw(
        renderer,
        viewTransform,
        projectionTransform,
        lightTypes,
        lightPositions,
        lightDirections,
        viewPosition
    ) {
        renderer.draw(
            this,
            viewTransform,
            projectionTransform,
            lightTypes,
            lightPositions,
            lightDirections,
            viewPosition
        );
    }
}

class EnduroCar extends SceneObject {
    constructor(tx, ty, tz) {
        super(
            carPiece.vertices,
            carPiece.colors,
            carPiece.normals,
            carPiece.indices
        );

        this.tx = tx;
        this.ty = ty;
        this.tz = tz;
        this.heading = -Math.PI / 2;
        this.modelTransform = m4.multiply(
            m4.translation(this.tx, this.ty, this.tz),
            m4.multiply(
                m4.yRotation(this.heading),
                m4.scaling(0.2, 0.2, 0.2)
            )
        );
    }

    update() {

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
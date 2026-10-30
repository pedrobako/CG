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

    draw(renderer, viewTransform, projectionTransform, lightPosition, viewPosition) {

        renderer.draw(this, viewTransform, projectionTransform, lightPosition, viewPosition);
    }
}

/*class EnduroCarObject extends SceneObject {
    constructor() {
        super(
            carPiece.vertices,
            carPiece.colors,
            carPiece.normals,
            carPiece.indices
        );
    }

    update(tx, ty, tz, heading) {
        this.modelTransform = m4.multiply(
            m4.translation(tx, ty, tz),
            m4.yRotation(heading)
        );
    }
}*/
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
    }

    update() {
        this.modelTransform = m4.multiply(
            m4.translation(this.tx, this.ty, this.tz),
            m4.yRotation(this.heading)
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
    }

    update() {
        // A pista é estática; não precisa atualizar sua transformação.
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

    update() {
        // O céu é estático; não precisa atualizar sua transformação.
    }
}
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
        
        this.hasTexture = false;
        this.texCoords = new Float32Array((vertices.length / 3) * 2);
        this.texture = null;

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
    constructor(renderer) {
        super(
            moonGeometry.vertices,
            moonGeometry.colors,
            moonGeometry.normals,
            moonGeometry.indices
        );

        this.modelTransform = m4.translation(50, 20, -150);
        this.hasTexture = true;
        this.texture = renderer.loadTexture("textures/lua.jpg");
        this.texCoords = moonGeometry.texCoords;
        this.emissive = true;
    }
}

class Billboard {

    constructor(renderer, lights, tz, side, texturePath) {
        this.tx = 8.0;
        this.ty = 0.0;
        this.tz = tz;
        this.theta = -Math.PI / 6;
        this.side = side;

        // Painel publicitário
        this.panel = new SceneObject(
            billboardPanelGeometry.vertices,
            billboardPanelGeometry.colors,
            billboardPanelGeometry.normals,
            billboardPanelGeometry.indices
        );
        this.panel.hasTexture = true;
        this.panel.texture = renderer.loadTexture(texturePath);
        this.panel.texCoords = billboardPanelGeometry.texCoords;

        // Quatro luminárias
        this.lamps = new SceneObject(
            billboardLampsGeometry.vertices,
            billboardLampsGeometry.colors,
            billboardLampsGeometry.normals,
            billboardLampsGeometry.indices
        );

        // Estrutura de sustentação
        this.structure = new SceneObject(
            billboardStructureGeometry.vertices,
            billboardStructureGeometry.colors,
            billboardStructureGeometry.normals,
            billboardStructureGeometry.indices
        );

        this.parts = [
            this.structure,
            this.lamps,
            this.panel
        ];

        this.lamps.emissive = true;

        this.initialTransformation();

        lights.addPanelLight(this.tx, this.ty, this.tz);
    }

    initialTransformation(){
        if (this.side == "left"){
            this.tx = -this.tx;
            this.theta = -this.theta;
        }
        const transformation = m4.multiply(m4.translation(this.tx, this.ty, this.tz), m4.yRotation(this.theta));

        // A transformação será compartilhada pelos componentes.

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }
    
    updateModelTransform() {

        // A transformação será compartilhada pelos componentes.
        const transformation = m4.translation(this.tx, this.ty, this.tz);

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        this.tz += displacement;

        this.updateModelTransform();
    }

    draw(renderer, viewTransform, projectionTransform, lights, viewPosition) {

        for (const part of this.parts) {
            part.draw(
                renderer,
                viewTransform,
                projectionTransform,
                lights,
                viewPosition
            );
        }
    }
}
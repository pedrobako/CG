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
    constructor(renderer) {
        super(
            raceTrackGeometry.vertices,
            raceTrackGeometry.colors,
            raceTrackGeometry.normals,
            raceTrackGeometry.indices
        );
        this.leftLimit = - TRACK_WIDTH / 2;
        this.rightLimit = TRACK_WIDTH / 2;
        this.hasTexture = true;
        this.texture = renderer.createRaceTrackTexture();
        this.baseTexCoords = new Float32Array(raceTrackGeometry.texCoords);
        this.texCoords = new Float32Array(this.baseTexCoords);
        this.textureOffset = 0.0;
        this.tileLength = RACE_TRACK_TILE_LENGTH;
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        this.textureOffset =
            (this.textureOffset + displacement / this.tileLength) % 1.0;

        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i + 1] =
                this.baseTexCoords[i + 1] - this.textureOffset;
        }
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

        //this.modelTransform = m4.translation(50, 20, -150);
        this.modelTransform = m4.multiply(m4.translation(40, 15, -100),
                                            m4.scaling(0.7, 0.7, 0.7)
                                );
        this.hasTexture = true;
        this.texture = renderer.loadTexture("textures/lua.jpg");
        this.texCoords = moonGeometry.texCoords;
        this.emissive = true;
    }
}

class Billboard {

    constructor(renderer, lights, tz, side, texturePath) {
        this.x = 8.0;
        this.y = 0.0;
        this.z = tz;
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

        this.panelLightsId = lights.addPanelLights(this.x, this.y, this.z);
    }

    initialTransformation() {
        if (this.side == "left") {
            this.x = -this.x;
            this.theta = -this.theta;
        }
        const transformation =
            m4.multiply(m4.translation(this.x, this.y, this.z), m4.yRotation(this.theta));

        // A transformação será compartilhada pelos componentes.
        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }

    updateModelTransform() {

        // A transformação será compartilhada pelos componentes.
        const transformation = m4.translation(this.x, this.y, this.z);

        for (const part of this.parts) {
            part.modelTransform = transformation;
        }
    }

    verticalMovement(speed, deltaTime) {
        const displacement = speed * deltaTime;

        this.z += displacement;

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

class RaceTrackDebug extends SceneObject {

    constructor() {

        super(
            raceTrackDebugGeometry.vertices,
            raceTrackDebugGeometry.colors,
            raceTrackDebugGeometry.normals,
            raceTrackDebugGeometry.indices
        );
    }
}
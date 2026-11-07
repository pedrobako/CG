 // ==================================================
 // BILLBOARD GEOMETRY
 // ==================================================

const BILLBOARD_WIDTH = 8.0;
const BILLBOARD_HEIGHT = 3.0;
const BILLBOARD_POST_HEIGHT = 5.0;
const BILLBOARD_POST_WIDTH = 0.15;
const BILLBOARD_DEPTH = 0.15;

// ==================================================
// AUXILIARY FUNCTIONS
// ==================================================

// Adiciona um paralelepípedo às listas de vértices,
// cores e índices.
function addBoxGeometry(
    vertices,
    colors,
    indices,
    centerX,
    centerY,
    centerZ,
    width,
    height,
    depth,
    color
) {
    const x = width / 2;
    const y = height / 2;
    const z = depth / 2;

    const vertexOffset = vertices.length / 3;

    // Vertices
    vertices.push(
        centerX - x, centerY - y, centerZ - z, // 0
        centerX + x, centerY - y, centerZ - z, // 1
        centerX + x, centerY + y, centerZ - z, // 2
        centerX - x, centerY + y, centerZ - z, // 3

        centerX - x, centerY - y, centerZ + z, // 4
        centerX + x, centerY - y, centerZ + z, // 5
        centerX + x, centerY + y, centerZ + z, // 6
        centerX - x, centerY + y, centerZ + z  // 7
    );

    // Colors
    for (let i = 0; i < 8; i++) {
        colors.push(...color);
    }

    // Indices
    const boxIndices = [
        // Front
        4, 5, 6,
        4, 6, 7,

        // Back
        1, 0, 3,
        1, 3, 2,

        // Left
        0, 4, 7,
        0, 7, 3,

        // Right
        5, 1, 2,
        5, 2, 6,

        // Top
        3, 7, 6,
        3, 6, 2,

        // Bottom
        0, 1, 5,
        0, 5, 4
    ];

    for (const index of boxIndices) {
        indices.push(index + vertexOffset);
    }
}


// ==================================================
// 1. BILLBOARD PANEL
// ==================================================

function billboardPanelVertices() {
    const halfWidth = BILLBOARD_WIDTH / 2;

    const bottom = BILLBOARD_POST_HEIGHT - BILLBOARD_HEIGHT;
    const top = BILLBOARD_POST_HEIGHT;

    // Face frontal, voltada para o eixo +Z.
    // Pequeno afastamento para evitar sobreposição
    // com a estrutura de sustentação.
    const z = BILLBOARD_DEPTH / 2 + 0.002;

    return new Float32Array([
        -halfWidth, bottom, z, // 0 - Bottom left
         halfWidth, bottom, z, // 1 - Bottom right
         halfWidth, top, z,    // 2 - Top right
        -halfWidth, top, z     // 3 - Top left
    ]);
}


function billboardPanelColors() {
    const colors = [];

    // Branco para não interferir nas cores da textura.
    for (let i = 0; i < 4; i++) {
        colors.push(1.0, 1.0, 1.0);
    }

    return new Float32Array(colors);
}


function billboardPanelIndices() {
    return new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]);
}


function billboardPanelTexCoords() {
    return new Float32Array([
        0.0, 0.0, // Bottom left
        1.0, 0.0, // Bottom right
        1.0, 1.0, // Top right
        0.0, 1.0  // Top left
    ]);
}


const billboardPanelGeometry = addNormalsToGeometry(
    billboardPanelVertices(),
    billboardPanelColors(),
    billboardPanelIndices(),
    billboardPanelTexCoords()
);


// ==================================================
// 2. BILLBOARD LAMPS
// ==================================================

function billboardLampsVertices() {
    const vertices = [];
    const colors = [];
    const indices = [];

    const lampCount = 4;

    const spacing = BILLBOARD_WIDTH / (lampCount + 1);

    const armColor = [0.20, 0.20, 0.20];
    const lampColor = [0.35, 0.35, 0.35];

    for (let i = 1; i <= lampCount; i++) {

        const x = -BILLBOARD_WIDTH / 2 + spacing * i;

        // Suporte horizontal que avança em direção
        // à frente do painel.
        addBoxGeometry(
            vertices,
            colors,
            indices,
            x,
            BILLBOARD_POST_HEIGHT + 0.12,
            0.40,
            0.08,
            0.08,
            0.80,
            armColor
        );

        // Carcaça da luminária.
        // Fica posicionada acima e à frente do painel.
        addBoxGeometry(
            vertices,
            colors,
            indices,
            x,
            BILLBOARD_POST_HEIGHT + 0.02,
            0.78,
            0.45,
            0.12,
            0.30,
            lampColor
        );
    }

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices)
    };
}


const billboardLampsData = billboardLampsVertices();

const billboardLampsGeometry = addNormalsToGeometry(
    billboardLampsData.vertices,
    billboardLampsData.colors,
    billboardLampsData.indices
);


// ==================================================
// 3. BILLBOARD STRUCTURE
// ==================================================

function billboardStructureVertices() {
    const vertices = [];
    const colors = [];
    const indices = [];

    const structureColor = [0.25, 0.25, 0.25];

    const halfWidth = BILLBOARD_WIDTH / 2;

    // Left support post
    addBoxGeometry(
        vertices,
        colors,
        indices,
        -halfWidth + BILLBOARD_POST_WIDTH / 2,
        BILLBOARD_POST_HEIGHT / 2,
        0,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_HEIGHT,
        BILLBOARD_POST_WIDTH,
        structureColor
    );

    // Right support post
    addBoxGeometry(
        vertices,
        colors,
        indices,
        halfWidth - BILLBOARD_POST_WIDTH / 2,
        BILLBOARD_POST_HEIGHT / 2,
        0,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_HEIGHT,
        BILLBOARD_POST_WIDTH,
        structureColor
    );

    // Upper horizontal support
    addBoxGeometry(
        vertices,
        colors,
        indices,
        0,
        BILLBOARD_POST_HEIGHT - BILLBOARD_POST_WIDTH / 2,
        0,
        BILLBOARD_WIDTH,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_WIDTH,
        structureColor
    );

    // Lower horizontal support
    addBoxGeometry(
        vertices,
        colors,
        indices,
        0,
        BILLBOARD_POST_HEIGHT - BILLBOARD_HEIGHT
            + BILLBOARD_POST_WIDTH / 2,
        0,
        BILLBOARD_WIDTH,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_WIDTH,
        structureColor
    );

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices)
    };
}


const billboardStructureData = billboardStructureVertices();

const billboardStructureGeometry = addNormalsToGeometry(
    billboardStructureData.vertices,
    billboardStructureData.colors,
    billboardStructureData.indices
);
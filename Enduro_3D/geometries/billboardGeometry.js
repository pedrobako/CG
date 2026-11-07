const BILLBOARD_WIDTH = 8.0;
const BILLBOARD_HEIGHT = 3.0;
const BILLBOARD_POST_HEIGHT = 5.0;
const BILLBOARD_POST_WIDTH = 0.15;
const BILLBOARD_DEPTH = 0.15;

// Gera os vértices de um paralelepípedo.
function boxVertices(centerX, centerY, centerZ, width, height, depth) {
    const x = width / 2;
    const y = height / 2;
    const z = depth / 2;

    return [
        centerX - x, centerY - y, centerZ - z, // 0
        centerX + x, centerY - y, centerZ - z, // 1
        centerX + x, centerY + y, centerZ - z, // 2
        centerX - x, centerY + y, centerZ - z, // 3

        centerX - x, centerY - y, centerZ + z, // 4
        centerX + x, centerY - y, centerZ + z, // 5
        centerX + x, centerY + y, centerZ + z, // 6
        centerX - x, centerY + y, centerZ + z  // 7
    ];
}


function billboardVertices() {
    const vertices = [];

    // Painel principal
    vertices.push(...boxVertices(
        0,
        BILLBOARD_POST_HEIGHT - BILLBOARD_HEIGHT / 2,
        0,
        BILLBOARD_WIDTH,
        BILLBOARD_HEIGHT,
        BILLBOARD_DEPTH
    ));

    // Poste esquerdo
    vertices.push(...boxVertices(
        -BILLBOARD_WIDTH / 2 + BILLBOARD_POST_WIDTH / 2,
        BILLBOARD_POST_HEIGHT / 2,
        0,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_HEIGHT,
        BILLBOARD_POST_WIDTH
    ));

    // Poste direito
    vertices.push(...boxVertices(
        BILLBOARD_WIDTH / 2 - BILLBOARD_POST_WIDTH / 2,
        BILLBOARD_POST_HEIGHT / 2,
        0,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_HEIGHT,
        BILLBOARD_POST_WIDTH
    ));

    // Barra superior de sustentação
    vertices.push(...boxVertices(
        0,
        BILLBOARD_POST_HEIGHT - BILLBOARD_POST_WIDTH / 2,
        0,
        BILLBOARD_WIDTH,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_WIDTH
    ));

    // Barra inferior de sustentação
    vertices.push(...boxVertices(
        0,
        BILLBOARD_POST_HEIGHT - BILLBOARD_HEIGHT + BILLBOARD_POST_WIDTH / 2,
        0,
        BILLBOARD_WIDTH,
        BILLBOARD_POST_WIDTH,
        BILLBOARD_POST_WIDTH
    ));

    return new Float32Array(vertices);
}


// Índices de um paralelepípedo.
// Cada face é formada por dois triângulos.
function boxIndices() {
    return [
        // Frente
        4, 5, 6,
        4, 6, 7,

        // Trás
        1, 0, 3,
        1, 3, 2,

        // Esquerda
        0, 4, 7,
        0, 7, 3,

        // Direita
        5, 1, 2,
        5, 2, 6,

        // Superior
        3, 7, 6,
        3, 6, 2,

        // Inferior
        0, 1, 5,
        0, 5, 4
    ];
}


function billboardIndices() {
    const indices = [];
    const indicesPerBox = boxIndices();

    // São cinco paralelepípedos, com oito vértices cada.
    for (let i = 0; i < 5; i++) {
        const offset = i * 8;

        for (const index of indicesPerBox) {
            indices.push(index + offset);
        }
    }

    return new Uint16Array(indices);
}


function billboardColors() {
    const colors = [];

    // Painel: cinza
    const panelColor = [0.65, 0.65, 0.65];

    // Estrutura: cinza-escuro
    const structureColor = [0.25, 0.25, 0.25];

    // Painel principal
    for (let i = 0; i < 8; i++) {
        colors.push(...panelColor);
    }

    // Quatro elementos estruturais
    for (let i = 0; i < 32; i++) {
        colors.push(...structureColor);
    }

    return new Float32Array(colors);
}


// Geometria final
const billboardGeometry = addNormalsToGeometry(
    billboardVertices(),
    billboardColors(),
    billboardIndices()
);

function raceTrackVertices() {
    const halfTrackWidth = TRACK_WIDTH/2;
    const lineWidth = 0.5;
    const length = 200.0;
    const halfLength = TRACK_LENGHT/2;
    const y = 0.02;

    const outerLeft = -halfTrackWidth - lineWidth;
    const innerLeft = -halfTrackWidth;

    const innerRight = halfTrackWidth;
    const outerRight = halfTrackWidth + lineWidth;

    return new Float32Array([
        // Linha lateral esquerda
        outerLeft, y, -halfLength, // 0
        innerLeft, y, -halfLength, // 1
        innerLeft, y,  halfLength, // 2
        outerLeft, y,  halfLength, // 3

        // Linha lateral direita
        innerRight, y, -halfLength, // 4
        outerRight, y, -halfLength, // 5
        outerRight, y,  halfLength, // 6
        innerRight, y,  halfLength  // 7
    ]);
}


function raceTrackColors() {
    // Cinza-claro, semelhante às linhas do Enduro original.
    const color = [0.75, 0.75, 0.75];
    const colors = [];

    for (let i = 0; i < 8; i++) {
        colors.push(...color);
    }

    return new Float32Array(colors);
}


function raceTrackIndices() {
    // Dois triângulos para cada retângulo.
    // A ordem dos vértices produz normais voltadas para cima.
    return new Uint16Array([
        // Linha esquerda
        0, 2, 1,
        0, 3, 2,

        // Linha direita
        4, 6, 5,
        4, 7, 6
    ]);
}

function raceTrackTexCoords() {

    const repeatCount = TRACK_LENGHT / RACE_TRACK_TILE_LENGTH;

    return new Float32Array([
        // Faixa esquerda
        0, 0,
        1, 0,
        1, repeatCount,
        0, repeatCount,

        // Faixa direita
        0, 0,
        1, 0,
        1, repeatCount,
        0, repeatCount
    ]);
}

// ==================================================
// GENERATE RACE TRACK TEXTURE COORDINATES
// ==================================================

function raceTrackTexCoords() {
    const texCoords = [];

    const repeatCount = TRACK_LENGHT / RACE_TRACK_TILE_LENGTH;

    // Faixa lateral esquerda
    texCoords.push(
        0.0, 0.0,
        1.0, 0.0,
        1.0, repeatCount,
        0.0, repeatCount
    );

    // Faixa lateral direita
    texCoords.push(
        0.0, 0.0,
        1.0, 0.0,
        1.0, repeatCount,
        0.0, repeatCount
    );

    return texCoords;
}

// ==================================================
// GENERATE RACE TRACK DEBUG GEOMETRY
// ==================================================

function generateRaceTrackDebugVertices() {

    const halfTrackWidth = TRACK_WIDTH / 2;
    const halfLength = TRACK_LENGHT / 2;

    const lineWidth = 0.1;//0.025;
    const y = 0.04;

    const vertices = [];

    function addRectangle(x1, z1, x2, z2) {
        vertices.push(
            x1, y, z1,
            x2, y, z1,
            x2, y, z2,
            x1, y, z2
        );
    }

    // Duas linhas longitudinais: divisão em três partes.
    const leftDivision = -TRACK_WIDTH / 6;
    const rightDivision = TRACK_WIDTH / 6;

    addRectangle(
        leftDivision - lineWidth / 2,
        -halfLength,
        leftDivision + lineWidth / 2,
        halfLength
    );

    addRectangle(
        rightDivision - lineWidth / 2,
        -halfLength,
        rightDivision + lineWidth / 2,
        halfLength
    );

    // Linha transversal: limite posterior da pista.
    const rearLimitZ = -6.4;

    addRectangle(
        -halfTrackWidth,
        rearLimitZ - lineWidth / 2,
        halfTrackWidth,
        rearLimitZ + lineWidth / 2
    );

    return new Float32Array(vertices);
}


// ==================================================
// GENERATE RACE TRACK DEBUG COLORS
// ==================================================

function generateRaceTrackDebugColors() {

    const colors = [];

    // Branco para as duas linhas longitudinais (8 vértices).
    for (let i = 0; i < 8; i++) {
        colors.push(...WHITE);
    }

    // Preto para a linha transversal (4 vértices).
    for (let i = 0; i < 4; i++) {
        colors.push(...BLACK);
    }

    return new Float32Array(colors);
}


// ==================================================
// GENERATE RACE TRACK DEBUG INDICES
// ==================================================

function generateRaceTrackDebugIndices() {

    return new Uint16Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11
    ]);
}


const raceTrackDebugGeometry = addNormalsToGeometry(
    generateRaceTrackDebugVertices(),
    generateRaceTrackDebugColors(),
    generateRaceTrackDebugIndices()
);


// Criar a geometria com normais para iluminação.
const raceTrackGeometry = addNormalsToGeometry(
    raceTrackVertices(),
    raceTrackColors(),
    raceTrackIndices(),
    raceTrackTexCoords()
);

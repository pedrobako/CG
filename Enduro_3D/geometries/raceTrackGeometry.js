
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


// Criar a geometria com normais para iluminação.
const raceTrackGeometry = addNormalsToGeometry(
    raceTrackVertices(),
    raceTrackColors(),
    raceTrackIndices(),
    raceTrackTexCoords()
);


function raceTrackVertices() {
    // Duas linhas laterais da pista.
    // Eixo Y = vertical; eixo Z = comprimento da pista.
    // Largura da pista: 10 unidades.
    // Espessura das linhas: 0.08 unidade.
    // Comprimento: 100 unidades.

    const halfTrackWidth = 5.0;
    const lineWidth = 0.08;
    const halfLength = 50.0;
    const y = 0.02;

    const outerLeft = -halfTrackWidth - lineWidth / 2;
    const innerLeft = -halfTrackWidth + lineWidth / 2;

    const innerRight = halfTrackWidth - lineWidth / 2;
    const outerRight = halfTrackWidth + lineWidth / 2;

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


// Criar a geometria com normais para iluminação.
const raceTrackGeometry = addNormalsToGeometry(
    raceTrackVertices(),
    raceTrackColors(),
    raceTrackIndices()
);

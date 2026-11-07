
function skyVertices() {
    const halfWidth = 50.0;
    const height = 40.0;
    const z = -50.0;
    const yBottom = 0.0;

    return new Float32Array([
        -halfWidth, yBottom, z,  // Inferior esquerdo
         halfWidth, yBottom, z,  // Inferior direito
         halfWidth, height, z,   // Superior direito
        -halfWidth, height, z   // Superior esquerdo
    ]);
}

function skyColors() {
    const blue = [0.20, 0.25, 1.0];
    const colors = [];

    for (let i = 0; i < 4; i++) {
        colors.push(...blue);
    }

    return new Float32Array(colors);
}

function skyIndices() {
    return new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]);
}

const skyGeometry = addNormalsToGeometry(
    skyVertices(),
    skyColors(),
    skyIndices()
);

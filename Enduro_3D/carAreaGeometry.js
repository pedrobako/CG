function carAreaVertices() {
    // Um retângulo que circunscreve o carro
    const areaWidth = 0.6;
    const halfWidth = areaWidth/2;
    const areaDeth = 0.8;
    const halfDeth = areaDeth/2;
    const x = 0.0;
    const y = 0.02;
    const z = 0.0;

    return new Float32Array([
        x-halfWidth, y, z+halfDeth,
        x+halfWidth, y, z+halfDeth,
        x-halfWidth, y, z-halfDeth,
        x+halfWidth, y, z-halfDeth
    ]);
}

function carAreaColors() {
    const color = [BRIGHT_RED];
    const colors = [];

    for (let i = 0; i < 8; i++) {
        colors.push(...color);
    }

    return new Float32Array(colors);
}


function carAreaIndices() {
    return new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);
}

// Criar a geometria com normais para iluminação.
const carAreaGeometry = addNormalsToGeometry(
    carAreaVertices(),
    carAreaColors(),
    carAreaIndices()
);
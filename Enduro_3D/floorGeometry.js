function floorVertices() {
    
    return new Float32Array([
        -100.0, 0.0, -100.0, //vértice "superior" esquerdo
        100.0, 0.0, -100.0, //vértice "superior" direito
        100.0, 0.0, 100.0, //vértice "inferior" direito
        -100.0, 0.0, 100.0 //vértice "inferior" esquerdo
    ]);
}

function floorColors() {
    // Cinza-claro, semelhante às linhas do Enduro original.
    const color = [0.0, 100/255, 0.0];
    const colors = [];

    for (let i = 0; i < 4; i++) {
        colors.push(...color);
    }

    return new Float32Array(colors);
}

function floorIndices() {
    // Dois triângulos para cada retângulo.
    // A ordem dos vértices produz normais voltadas para cima.
    return new Uint16Array([
        0, 3, 1,
        1, 3, 2
    ]);
}

// Criar a geometria com normais para iluminação.
const floorGeometry = addNormalsToGeometry(
    floorVertices(),
    floorColors(),
    floorIndices()
);
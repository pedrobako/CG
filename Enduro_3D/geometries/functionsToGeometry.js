// ==================================================
// Funções auxiliares de cálculos sobre geometrias
// ==================================================

// ==================================================
// Função para calcular o centro de geometrias
// ==================================================
function getGeometryCenter(vertices) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < vertices.length; i += 3) {
        for (let axis = 0; axis < 3; axis++) {
            min[axis] = Math.min(min[axis], vertices[i + axis]);
            max[axis] = Math.max(max[axis], vertices[i + axis]);
        }
    }

    return [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
    ];
}


// ==================================================
// Função para calcular as normais dos vértices
// ==================================================
function addNormalsToGeometry(vertices, colors, indices, texCoords=null) {

    const newVertices = [];
    const newColors = [];
    const newNormals = [];
    const newIndices = [];
    const newTexCoords = [];

    // Cada triângulo terá seus próprios vértices.
    // Isso permite atribuir uma normal constante
    // aos três vértices de cada triângulo.

    for (let i = 0; i < indices.length; i += 3) {

        const ia = indices[i];
        const ib = indices[i + 1];
        const ic = indices[i + 2];

        const a = [
            vertices[ia * 3],
            vertices[ia * 3 + 1],
            vertices[ia * 3 + 2]
        ];

        const b = [
            vertices[ib * 3],
            vertices[ib * 3 + 1],
            vertices[ib * 3 + 2]
        ];

        const c = [
            vertices[ic * 3],
            vertices[ic * 3 + 1],
            vertices[ic * 3 + 2]
        ];

        // Vetores das arestas
        const u = [
            b[0] - a[0],
            b[1] - a[1],
            b[2] - a[2]
        ];

        const v = [
            c[0] - a[0],
            c[1] - a[1],
            c[2] - a[2]
        ];

        // Produto vetorial: u x v
        let nx = u[1] * v[2] - u[2] * v[1];
        let ny = u[2] * v[0] - u[0] * v[2];
        let nz = u[0] * v[1] - u[1] * v[0];

        // Normalização
        const length = Math.sqrt(
            nx * nx + ny * ny + nz * nz
        );

        if (length === 0) {
            throw new Error("Triângulo degenerado: normal indefinida.");
        }

        nx /= length;
        ny /= length;
        nz /= length;

        // Copia os três vértices do triângulo.
        // Cada vértice recebe a mesma normal.

        for (const index of [ia, ib, ic]) {

            newVertices.push(
                vertices[index * 3],
                vertices[index * 3 + 1],
                vertices[index * 3 + 2]
            );

            newColors.push(
                colors[index * 3],
                colors[index * 3 + 1],
                colors[index * 3 + 2]
            );

            newNormals.push(nx, ny, nz);

            newIndices.push(newIndices.length);

            // Coordenadas UV
            if (!texCoords)
                texCoords = new Float32Array((vertices.length / 3) * 2);

            newTexCoords.push(
                texCoords[index * 2],
                texCoords[index * 2 + 1]
            );
        }
    }

    return {
        vertices: new Float32Array(newVertices),
        colors: new Float32Array(newColors),
        normals: new Float32Array(newNormals),
        indices: new Uint16Array(newIndices),
        texCoords: new Float32Array(newTexCoords)
    };
}
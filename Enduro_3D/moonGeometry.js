// ==================================================
// GENERATE MOON VERTICES
// ==================================================

function generateMoonVertices(radius=10, latitudeBands = 20, longitudeBands = 30) {
    const vertices = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {

        const theta = lat * Math.PI / latitudeBands;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {

            const phi = lon * 2 * Math.PI / longitudeBands;

            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = radius * sinTheta * cosPhi;
            const y = radius * cosTheta;
            const z = radius * sinTheta * sinPhi;

            vertices.push(x, y, z);
        }
    }

    return vertices;
}

// ==================================================
// GENERATE MOON COLORS
// ==================================================

function generateMoonColors() {
    // Cinza-claro, semelhante às linhas do Enduro original.
    const color = [0.75, 0.75, 0.75];
    const colors = [];

    for (let i = 0; i < 8; i++) {
        colors.push(...color);
    }

    return new Float32Array(colors);
}

// ==================================================
// GENERATE MOON INDICES
// ==================================================

function generateMoonIndices(latitudeBands = 20, longitudeBands = 30) {
    const indices = [];

    for (let lat = 0; lat < latitudeBands; lat++) {

        for (let lon = 0; lon < longitudeBands; lon++) {

            const first =
                lat * (longitudeBands + 1) + lon;

            const second =
                first + longitudeBands + 1;

            // Primeiro triângulo
            if (lat > 0) {
                indices.push(
                    first,
                    first + 1,
                    second
                );
            }

            // Segundo triângulo
            if (lat < latitudeBands - 1) {
                indices.push(
                    second,
                    first + 1,
                    second + 1
                );
            }
        }
    }

    return indices;
}

// ==================================================
// GENERATE MOON TEXTURE COORDINATES
// ==================================================

function generateMoonTexCoords(
    latitudeBands = 20,
    longitudeBands = 30
) {

    const texCoords = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {

        const theta = lat * Math.PI / latitudeBands;

        for (let lon = 0; lon <= longitudeBands; lon++) {

            const phi = lon * 2 * Math.PI / longitudeBands;

            const u = phi / (2 * Math.PI);
            const v = 1.0 - theta / Math.PI;

            texCoords.push(u, v);
        }
    }

    return texCoords;
}

const moonGeometry = addNormalsToGeometry(
    generateMoonVertices(),
    generateMoonColors(),
    generateMoonIndices(),
    generateMoonTexCoords()
);
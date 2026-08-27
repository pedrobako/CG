const canvasFlor = document.getElementById("canvas");
const gl = canvasFlor.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

function calculaVerticesCirculo(raio, numSides) {
    const vertices = [];

    // Center point of the pentagon
    const cX = 0.0;
    const cY = 0.2;
    vertices.push(cX, cY);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = cX + raio * Math.cos(angle);
        const y = cY + (raio * Math.sin(angle));
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}
const raio = 0.3;
const numSides = 40;
const verticesCirculo = calculaVerticesCirculo(raio, numSides);

function calculaVerticesPetalas(verticesCirculo, raio, numSides){
    // Trinângulo isósceles ABC, no qual "A" toca a circunferência
    // E "D" é distante um raio da circunferência na direção normal
    //       A
    //      /|\
    //     /_|_\
    //    B  D  C

    const vertices = [];
    const qtdPetalas = 8;
    const salto = numSides/qtdPetalas * 2;
    const xCentro = verticesCirculo[0];
    const yCentro = verticesCirculo[1];

    for (let i=0; i<qtdPetalas; i++){
        //Pegando o ponto "A" do triângulo que toca a circunferência
        const aX = verticesCirculo[2 + i*salto];
        const aY = verticesCirculo[3 + i*salto];
        vertices.push(aX, aY);

        //Calculando a normal com um raio de distância
        const nX = (aX - xCentro);
        const nY = (aY - yCentro);

        //Achando o ponto "D" na direção normal distante um raio da circunferência (altura do triângulo)
        const dX = aX + nX;
        const dY = aY + nY;

        //Calculando a perpendicular a AD = CD
        const tX = -nY;
        const tY = nX;

        //Achando o ponto "B"
        const bX = dX - 0.5*tX;
        const bY = dY - 0.5*tY;
        vertices.push(bX, bY);

        //Achando o ponto "C"
        const cX = dX + 0.5*tX;
        const cY = dY + 0.5*tY;
        vertices.push(cX, cY);
    }
    return new Float32Array(vertices);
}

const verticesPetalas = calculaVerticesPetalas(verticesCirculo, raio, numSides);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_Circulo = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Circulo);

gl.bufferData(
    gl.ARRAY_BUFFER,
    verticesCirculo,
    gl.STATIC_DRAW
);

const verticesBuffer_Petalas = gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    verticesBuffer_Petalas
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    verticesPetalas,
    gl.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_TFan = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_TFan = `#version 300 es

precision mediump float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
     outColor = uColor;
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader_TFan = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource_TFan
);

const fragmentShader_TFan = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource_TFan
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_TFan = gl.createProgram();

gl.attachShader(program_TFan, vertexShader_TFan);
gl.attachShader(program_TFan, fragmentShader_TFan);

gl.linkProgram(program_TFan);

if (!gl.getProgramParameter(program_TFan, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program_TFan)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_TFan =
    gl.getAttribLocation(
        program_TFan,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program_TFan,
        "uColor"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Circulo);

gl.enableVertexAttribArray(positionLocation_TFan);

gl.vertexAttribPointer(
    positionLocation_TFan,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. DESENHAR O CÍRCULO
// --------------------------------------------------

gl.useProgram(program_TFan);

gl.uniform4f(
    colorLocation,
    1.0, 1.0, 0.0, 1.0
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    0, 
    verticesCirculo.length/2
);

// --------------------------------------------------
// 8. RECONFIGURAR ATRIBUTOS
// --------------------------------------------------
gl.bindBuffer(
    gl.ARRAY_BUFFER,
    verticesBuffer_Petalas
);

gl.vertexAttribPointer(
    positionLocation_TFan,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 10. DESENHAR AS PÉTALAS
// --------------------------------------------------
gl.uniform4f(
    colorLocation,
    1.0, 0.0, 0.5, 1.0
);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    verticesPetalas.length / 2
);
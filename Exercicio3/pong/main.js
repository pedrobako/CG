const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
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


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;
let lancaBola = false;

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();

    if (lancaBola)
        requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );
}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
let tyBE_offset = 0.01;
let tyBD_offset = 0.01;
let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.005;
let tyBola_offset = 0.005;
let pontosBD = 0;
let pontosBE = 0;

function atualizaPlacar(){
    const placarBE = document.getElementById("placarEsquerda");
    placarBE.textContent = pontosBE;

    const placarBD = document.getElementById("placarDireita");
    placarBD.textContent = pontosBD;
}

function gol(){
    //Gol na barra direita
    if (txBola > 0.95){
        pontosBE++;
        atualizaPlacar();
        lancaBola = false;
        return true;
    }

    //Gol na barra esquerda
    if (txBola < -0.95){
        pontosBD++;
        atualizaPlacar();
        lancaBola = false;
        return true;
    }
    return false;
}

function bolaTocaBarra(){
    //Toca na barra direita
    if ((txBola >= (0.8))&&(tyBola <= (tyBD+0.2))&&(tyBola >= (tyBD-0.2)))
        return true;

    //Toca na barra esquerda
    if ((txBola <= (-0.8))&&(tyBola <= (tyBE+0.2))&&(tyBola >= (tyBE-0.2)))
        return true;

    return false;
}

function atualizaAnimacao(){

    if ((teclaUp)&&(tyBD < 0.8))
        tyBD += tyBD_offset;

    if ((teclaDown)&&(tyBD > -0.8))
        tyBD -= tyBD_offset;
    
    if ((teclaW)&&(tyBE < 0.8))
        tyBE += tyBE_offset;

    if ((teclaS)&&(tyBE > -0.8))
        tyBE -= tyBE_offset;

    txBola += txBola_offset;
    if (bolaTocaBarra())
        txBola_offset = -txBola_offset;

    tyBola += tyBola_offset;
    if(tyBola > 1.0 || tyBola<-1.0)
        tyBola_offset = -tyBola_offset;

    if (gol()){
        txBola = 0.0;
        tyBola = 0.0;
        txBola_offset = -txBola_offset;
    }

    MbolaCentro = m3.translation(txBola,tyBola);
    MbarraDireita = m3.translation(0.9, tyBD);
    MbarraEsquerda = m3.translation(-0.9, tyBE);
}


// --------------------------------------------------
// INTERAÇÃO COM O TECLADO
// --------------------------------------------------
let teclaW = false;
let teclaS = false;
let teclaUp = false;
let teclaDown = false;

function keyboardClick(event) {

    switch(event.key) {
      case ("ArrowUp"):
        teclaUp = true;
        break;
      case ("ArrowDown"):
        teclaDown = true;
        break;
      case ("w"):
      case ("W"):
        teclaW = true;
        break;
      case ("s"):
      case ("S"):
        teclaS = true;
        break;
      case (" "):
        lancaBola = true;
        drawScene();
        break;
  }
}

function keyboardRelease(event) {

    switch(event.key) {
      case ("ArrowUp"):
        teclaUp = false;
        break;
      case ("ArrowDown"):
        teclaDown = false;
        break;
      case ("w"):
      case ("W"):
        teclaW = false;
        break;
      case ("s"):
      case ("S"):
        teclaS = false;
        break;
  }
}

window.addEventListener("keydown", keyboardClick, false);
window.addEventListener("keyup", keyboardRelease, false);
// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();

//Obtendo o canvas do HTML (local onde o WebGL irá "desenhar"
const canvas = document.getElementById("canvas");

//Obtendo o contexto webGL
//Criando a variável que será a interface com a API WebGL
const gl = canvas.getContext("webgl2");

if (!gl){
	throw new Error("WebGL 2 não é suportado.");
}

// 1. VÉRTICES
// Vértices das rodas
function calculaVerticesCirculo(centro, raio, numSides) {
    const vertices = [];

    // Center point of the pentagon
    const cX = centro[0];
    const cY = centro[1];
    vertices.push(cX, cY);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = cX + raio * Math.cos(angle);
        const y = cY + (raio * Math.sin(angle));
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

// Vértices da roda traseira
let centro = ([-0.35, -0.3]);
let raio = 0.15;
let numSides = 40;
const verticesRodaTraseira = calculaVerticesCirculo(centro, raio, numSides);

// Vértices da roda dianteira
centro = ([0.35, -0.3]);
raio = 0.15;
numSides = 40;
const verticesRodaDianteira = calculaVerticesCirculo(centro, raio, numSides);

// Vértices da carroceria
const verticesCarroceria = new Float32Array([
	//Parte de baixo
	0.8, 0.3,
	-0.8, 0.3,
	-0.8, -0.3,
	0.8, -0.3,

	//Parte de cima
	0.2, 0.6,
	-0.5, 0.6,
	-0.5, 0.3,
	0.2, 0.3,

	//Parabrisa
	0.2, 0.6,
	0.2, 0.3,
	0.5, 0.3
]);

// 2. BUFFERS
// Declarando o buffer (criando um espaço na memória)
const verticesBuffer = gl.createBuffer();

// Vinculando o buffer criado com o buffer alvo do webGL
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

// Enviando os dados dos vértices para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesCarroceria,
	gl.STATIC_DRAW
);

// 3. VERTEX SHADER
const vertexShaderSource = `#version 300 es
in vec2 aPosition;

void main(){
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// 4. FRAGMENT SHADER
const fragmentShaderSource = `#version 300 es
	precision mediump float;
	out vec4 outColor;

	void main(){
		outColor = vec4(0.5, 0.5, 0.5, 1.0);
	}`;

// 5. COMPILAR SHADERS
function createShader(gl, type, source){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		const error = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(error);
	}
	return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// 6. CRIAR O PROGRAMA
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
	throw new Error(gl.getProgramInfoLog(program));
}

// 7. LOCAL DO ATRIBUTO
const positionLocation = gl.getAttribLocation(program, "aPosition");

// 8. CONFIGURAR O ATRIBUTO
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 9. LIMPAR TELA
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 10. Desenhar carroceria
gl.useProgram(program);

// Parte de baixo
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Parte de cima
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

// Parabrisa
gl.drawArrays(gl.TRIANGLE_FAN, 8, 3);


// Desenhar rodas
// Desenhando roda traseira
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesRodaTraseira,
	gl.STATIC_DRAW
);

gl.useProgram(program);
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	verticesRodaTraseira.length/2); //Qtd de vértices que serão utilizados

// Desenhando roda dianteira
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesRodaDianteira,
	gl.STATIC_DRAW
);

gl.useProgram(program);
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	verticesRodaDianteira.length/2); //Qtd de vértices que serão utilizados

/*
// Desenhar os braços
// Preparando o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesBracos,
	gl.STATIC_DRAW
);

// Iniciando o programa
gl.useProgram(program);

// Desenhando o braço esquerdo
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Desenhando o braco direito
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

// Desenhar as pernas
// Preparando o buffer e iniciando o programa
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesPernas,
	gl.STATIC_DRAW
);

gl.useProgram(program);

// Desenhando a perna esquerda
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Desenhando a perna direita
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
*/
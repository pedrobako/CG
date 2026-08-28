//Obtendo o canvas do HTML (local onde o WebGL irá "desenhar"
const canvas = document.getElementById("canvas");

//Obtendo o contexto webGL
//Criando a variável que será a interface com a API WebGL
const gl = canvas.getContext("webgl2");

//Lançando o erro caso não consiga obter a interface com a API WebGL
if (!gl){
	throw new Error("WebGL 2 não é suportado.");
}

// VÉRTICES
const verticesTronco = new Float32Array([
     0.3,  0.5,
    -0.3,  0.5,
    -0.3, -0.3,
     0.3, -0.3
]);

const verticesCabeca = new Float32Array([
	0.1, 0.7,
	-0.1, 0.7,
	-0.1, 0.5,
	0.1, 0.5
])

const verticesBracos = new Float32Array([
	//Braço esquerdo
	-0.3, 0.5,
	-0.7, 0.3,
	-0.6, 0.2,
	-0.2, 0.4,

	//Braço direito
	0.3,  0.5,
    0.7,  0.3,
    0.6,  0.2,
    0.2,  0.4
])

const verticesPernas = new Float32Array([
	//Perna esquerda
	-0.1, -0.3,
	-0.3, -0.3,
	-0.3, -0.8,
	-0.1, -0.8,

	//Perna direita
	0.1, -0.3,
    0.3, -0.3,
    0.3, -0.8,
    0.1, -0.8
])

// DEFININDO AS CORES
const coresTronco = new Float32Array([
    // Verde nos 4 vértices
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
]);

const coresCabeca = new Float32Array([
    // Azul nos 4 vértices
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
]);

const coresBracos = new Float32Array([
    // Amarelo nos 4 vértices do braço esquerdo
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    // Amarelo nos 4 vértices do braço direito
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
]);

const coresPernas = new Float32Array([
    // Vermelho nos 4 vértices da perna esquerda
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,

    // Vermelho nos 4 vértices da perna direita
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
]);

// DEFININDO O CÓDIGO DO VERTEX SHADER
const vertexShaderSource = `#version 300 es //definindo a versão 3.00 da linguagem GLSL ES para este shader

	//declarando uma varável de entrada de dados do tipo vetor float de duas posições
	in vec2 aPosition;

	//declarando um vetor de entrada de 4 posições para receber o atributo de cor
	in vec4 aColor;

	//declarando um vetor de saída de 4 posições para transmitir o atributo de cor para o fragmentshader
	out vec4 vColor;

	void main(){
		//gl_Position é uma variável pré-definida(built-in) do GLSL, ela define onde o vértice será colocado
		//Ele recebe 4 valores (x, y, z, w) onde w está relacionado com transformações geométricas e perspectivas
		//vec4 é um tipo que indica um vetor com 4 componentes floats
		gl_Position = vec4(
							aPosition,//variável de entrada que repassará duas das 4 posições do vetor (x e y do vértice)
							0.0,//posição z do vértice, neste caso é zero, pois estamos trabalhando em 2D
							1.0//posição w relacionada com transformações geométricas e perspectivas
							);
		
		vColor = aColor;
	}`;

// DEFININDO O CÓDIGO DO FRAGMENT SHADER
const fragmentShaderSource = `#version 300 es //defindo a versão 3.00 da linguagem GLSL ES para este shader
	//setando precisão média para o float que será utilizado
	precision mediump float;
	
	//declarando uma varável de entrada de dados do tipo vetor float de 4 posições que receberá os dados de cor do vertexshader
	in vec4 vColor;

	//declarando uma varável de saída de dados do tipo vetor float de 4 posições
	out vec4 outColor;

	void main(){
		//outColor = vec4(0.5, 0.5, 0.5, 1.0); //atribuindo os valores RGBA do vetor de saída do FS, onde A é "Alpha" transparência/opacidade
		outColor = vColor;
	}`;

// COMPILANDO OS SHADERS
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

// CRIANDO O PROGRAMA
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
	throw new Error(gl.getProgramInfoLog(program));
}

// CONFIGURANDO O BUFFER
// Declarando o buffer de vértices
const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

// Obtendo o local(índice) do atributo posição(aPosition) no VertexShader
const positionLocation = gl.getAttribLocation(program, "aPosition");

// Habilitando o aPosition para receber dados a partir de um array
gl.enableVertexAttribArray(positionLocation);

// Definindo como os dados oriundos do Array de vértices serão interpretados
gl.vertexAttribPointer(
	positionLocation, //onde deverão ser entregues os dados do array de vértices
	2, //quantidade de valores por vértice
	gl.FLOAT, //tipo de dados do array de vértices (Float32Array combina com gl.FLOAT)
	false, //diz se o WebGL deve normalizar os valores antes de entregá-los ao Vertex Shader
	0, //salto entre o final dos dados de um vértice para os dados do próximo vértice
	0 //salto para início da leitura do 1º vértice
);

// Declarando o buffer de cores
const coresBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, coresBuffer);

// Obtendo o local(indice) do atributo cor no FragmentShader
const colorLocation = gl.getAttribLocation(program, "aColor");

//Habilitando o aColor para receber dados a partir de uma array
gl.enableVertexAttribArray(colorLocation);

// Definindo como os dados oriundos do Array de cores serão interpretados
gl.vertexAttribPointer(
	colorLocation, //onde deverão ser entregues os dados do array de vértices
	4, //quantidade de valores por vértice
	gl.FLOAT, //tipo de dados do array de vértices (Float32Array combina com gl.FLOAT)
	false, //diz se o WebGL deve normalizar os valores antes de entregá-los ao Vertex Shader
	0, //salto entre o final dos dados de um vértice para os dados do próximo vértice
	0 //salto para início da leitura do 1º vértice
);

// DEFINIR O PROGRAMA QUE SERÁ USADO, QUE JÁ ESTÁ TOTALMENTE CONFIGURADO COM O VERTEXSHADER E FRAGMENTSHADER
gl.useProgram(program);

// LIMPAR TELA
gl.clearColor(0.1, 0.1, 0.1, 1.0);//Define a cor que "limpará" a tela
gl.clear(gl.COLOR_BUFFER_BIT);//Efetivamente aplica a cor selecionada em todo o canvas

// Desenhar os braços (Desenhando os braços antes do tronco para que eles fiquem "por trás")
// Vinculando o buffer com o buffer dos vértices
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
// Enviando os dados para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesBracos,
	gl.STATIC_DRAW
);

// Vinculando o buffer com o buffer das cores
gl.bindBuffer(gl.ARRAY_BUFFER, coresBuffer);
// Enviando os dados para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	coresBracos,
	gl.STATIC_DRAW
);

// Desenhando o braço esquerdo
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4 //Qtd de vértices que serão utilizados
);
// Desenhando o braco direito
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);//Iniciando no índice 4 e lendo 4 vértices

// Desenhando o tronco
// Vinculando o buffer com o buffer dos vértices
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
// Enviando os dados para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesTronco,
	gl.STATIC_DRAW
);

// Vinculando o buffer com o buffer das cores
gl.bindBuffer(gl.ARRAY_BUFFER, coresBuffer);
// Enviando os dados para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	coresTronco,
	gl.STATIC_DRAW
);

// Desenhando efetivamente
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Desenhando a cabeça
// Vinculando o buffer criado com o buffer alvo do webGL
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
// Enviando os dados dos vértices para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesCabeca,
	gl.STATIC_DRAW
);

// Vinculando o buffer criado com o buffer alvo do webGL
gl.bindBuffer(gl.ARRAY_BUFFER, coresBuffer);
// Enviando os dados dos vértices para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	coresCabeca,
	gl.STATIC_DRAW
);

// Desenhando efetivamente
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Desenhar as pernas
// Vinculando o buffer criado com o buffer alvo do webGL
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
// Enviando os dados dos vértices para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	verticesPernas,
	gl.STATIC_DRAW
);

// Vinculando o buffer criado com o buffer alvo do webGL
gl.bindBuffer(gl.ARRAY_BUFFER, coresBuffer);
// Enviando os dados dos vértices para o buffer
gl.bufferData(
	gl.ARRAY_BUFFER,
	coresPernas,
	gl.STATIC_DRAW
);

// Desenhando a perna esquerda
gl.drawArrays(
	gl.TRIANGLE_FAN, //modo forme uma sequência de triângulos usando o 1º vértice como vértice comum.
	0, //índice do 1º vértice
	4); //Qtd de vértices que serão utilizados

// Desenhando a perna direita
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);//Iniciando no índice 4 e lendo 4 vértices

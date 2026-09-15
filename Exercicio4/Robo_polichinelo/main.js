const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
if (!gl)
	throw new Error("WebGL 2 nao eh suportado.");

//-------------------------------------------------------
//VÉRTICES
//-------------------------------------------------------
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
]);

const verticesBracoEsquerdo = new Float32Array([
	//Braço esquerdo
	-0.3, 0.5,
	-0.7, 0.3,
	-0.6, 0.2,
	-0.2, 0.4,
]);

const verticesBracoDireito = new Float32Array([
	//Braço direito
	0.3,  0.5,
    0.7,  0.3,
    0.6,  0.2,
    0.2,  0.4
]);

const verticesPernaEsquerda = new Float32Array([
	//Perna esquerda
	-0.1, -0.3,
	-0.3, -0.3,
	-0.3, -0.8,
	-0.1, -0.8,
]);

const verticesPernaDireita = new Float32Array([
	//Perna direita
	0.1, -0.3,
    0.3, -0.3,
    0.3, -0.8,
    0.1, -0.8
]);

//-------------------------------------------------------
//CORES UNIFORMES
//-------------------------------------------------------
// Tronco Verde
const corTronco = new Float32Array([0.0, 1.0, 0.0]);

// Cabeça Azul
const corCabeca = new Float32Array([0.0, 0.0, 1.0]);

// Braço Esquerdo Amarelo
const corBracoEsquerdo = new Float32Array([1.0, 1.0, 0.0]);

// Braço Direito Amarelo
const corBracoDireito = new Float32Array([1.0, 1.0, 0.0]);

// Perna Esquerda Vermelha
const corPernaEsquerda = new Float32Array([1.0, 0.0, 0.0]);

// Perna Direita Vermelha
const corPernaDireita = new Float32Array([1.0, 0.0, 0.0]);

//-------------------------------------------------------
//BUFFER
//-------------------------------------------------------
const verticesBuffer = gl.createBuffer();

//-------------------------------------------------------
//CLASSE SCENE OBJECT
//-------------------------------------------------------
class SceneObject{
	constructor(vertices, cor){
		this.vertices = vertices;
		this.cor = cor;
		this.modelTransform = m3.identity();
	}
	atualizarTransformacao(modelTransform){
		this.modelTransform = modelTransform;
	}
}

//-------------------------------------------------------
//VERTEX SHADER
//-------------------------------------------------------
const vertexShaderSource = `#version 300 es
	in vec2 aPosition;
	uniform mat3 uTransform;
	
	void main(){
		vec3 position = uTransform * vec3(aPosition, 1.0);
		gl_Position = vec4(position.xy, 0.0, 1.0);
	}
	`;
	
//-------------------------------------------------------
//FRAGMENT SHADER
//-------------------------------------------------------
const fragmentShaderSource = `#version 300 es
	precision mediump float;
	uniform vec3 uColor;
	out vec4 outColor;
	
	void main(){
		outColor = vec4(uColor, 1.0);
	}
	`;

//-------------------------------------------------------
//COMPILAR SHADERS
//-------------------------------------------------------
function createShader(gl, type, source){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		const error = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(error);
	}
	
	return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//-------------------------------------------------------
//CRIAR PROGRAMA
//-------------------------------------------------------
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS))
	throw new Error(gl.getProgramInfoLog(program));

//-------------------------------------------------------
//LOCAL DOS ATRIBUTOS
//-------------------------------------------------------
const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
const transformLocation = gl.getUniformLocation(program, "uTransform");

//-------------------------------------------------------
//LIMPAR TELA
//-------------------------------------------------------
function limpaTela(r=0.1, g=0.1, b=0.1){
	gl.clearColor(r, g, b, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}
limpaTela();

//-------------------------------------------------------
//ANIMAÇÃO
//-------------------------------------------------------
let anguloBraco = 0;
let offsetBraco = 0.04;
let anguloPerna = 0;
let offsetPerna = 0.02;
let movimenta = 0;
let zoom = 1.0;

let MbracoEsquerdo;
let MbracoDireito;
let MpernaEsquerda;
let MpernaDireita;
let Mtronco;
let Mcabeca;

function rotacaoEmTornoDoPonto(x, y, angulo){
	return m3.multiply(m3.translation(x, y), m3.multiply(m3.rotation(angulo), m3.translation(-x, -y)));
}

function atualizaAnimacao(){
	anguloBraco += offsetBraco;
//	anguloPerna += offsetPerna;
	
	//if ((anguloPerna > Math.PI/3) || (anguloPerna < 0))
	//	offsetPerna = - offsetPerna;

	if ((anguloBraco > Math.PI/2) || (anguloBraco < -Math.PI/4)){
		offsetBraco = - offsetBraco;
	}
	
	// Converte o movimento do braço para o movimento da perna
    anguloPerna =
        (anguloBraco + Math.PI/4) *
        (Math.PI/3) /
        (3*Math.PI/4);
	
	MbracoEsquerdo = m3.multiply(m3.scaling(zoom, zoom), m3.multiply(m3.translation(movimenta, 0), rotacaoEmTornoDoPonto(-0.3, 0.5, -anguloBraco)));
	MbracoDireito = m3.multiply(m3.scaling(zoom, zoom), m3.multiply(m3.translation(movimenta, 0), rotacaoEmTornoDoPonto(0.3, 0.5, anguloBraco)));
	MpernaEsquerda = m3.multiply(m3.scaling(zoom, zoom), m3.multiply(m3.translation(movimenta, 0), rotacaoEmTornoDoPonto(-0.1, -0.3, -anguloPerna)));
	MpernaDireita = m3.multiply(m3.scaling(zoom, zoom), m3.multiply(m3.translation(movimenta, 0), rotacaoEmTornoDoPonto(0.1, -0.3, anguloPerna)));
	Mtronco = m3.multiply(m3.scaling(zoom, zoom), m3.translation(movimenta, 0));
	Mcabeca = m3.multiply(m3.scaling(zoom, zoom), m3.translation(movimenta, 0));
}

//-------------------------------------------------------
//DESENHAR
//-------------------------------------------------------
function desenhaPernaEsquerda(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesPernaEsquerda, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corPernaEsquerda);
	gl.uniformMatrix3fv(transformLocation, false, MpernaEsquerda);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesPernaEsquerda.length/2);
}

function desenhaPernaDireita(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesPernaDireita, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corPernaDireita);
	gl.uniformMatrix3fv(transformLocation, false, MpernaDireita);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesPernaDireita.length/2);
}

function desenhaTronco(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesTronco, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corTronco);
	gl.uniformMatrix3fv(transformLocation, false, Mtronco);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesTronco.length/2);
}

function desenhaBracoEsquerdo(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesBracoEsquerdo, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corBracoEsquerdo);
	gl.uniformMatrix3fv(transformLocation, false, MbracoEsquerdo);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesBracoEsquerdo.length/2);
}

function desenhaBracoDireito(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesBracoDireito, gl.STATIC_DRAW)
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corBracoDireito);
	gl.uniformMatrix3fv(transformLocation, false, MbracoDireito);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesBracoDireito.length/2);
}

function desenhaCabeca(){
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesCabeca, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.uniform3fv(colorLocation, corCabeca);
	gl.uniformMatrix3fv(transformLocation, false, Mcabeca);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesCabeca.length/2);
}
	
function desenhaCena(){
	limpaTela();
	atualizaAnimacao();
	gl.useProgram(program);
	desenhaPernaEsquerda();
	desenhaPernaDireita();
	desenhaBracoEsquerdo();
	desenhaBracoDireito();
	desenhaTronco();
	desenhaCabeca();
	
	if (barraEspaco == true)
		requestAnimationFrame(desenhaCena);
}

// --------------------------------------------------
// INTERAÇÃO COM O TECLADO
// --------------------------------------------------
let barraEspaco = false;

function keyboardClick(event) {

    switch(event.key) {
      case (" "):
		barraEspaco = ! barraEspaco;
        desenhaCena();
        break;
	  case ("ArrowLeft"):
        if (barraEspaco == true)
			movimenta -= 0.01;
        break;
      case ("ArrowRight"):
        if (barraEspaco == true)
			movimenta += 0.01;
        break;
	  case ("ArrowUp"):
        if (barraEspaco == true)
			zoom += 0.01;
        break;
      case ("ArrowDown"):
        if (barraEspaco == true)
			zoom -= 0.01;
        break;
  }
}

window.addEventListener("keydown", keyboardClick, false);

desenhaCena();

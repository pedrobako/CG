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
		this.movimento = m3.identity();
		this.posX = 0.0;
		this.posY = 0.0;
		this.zoom = 1.0;
		this.offsetX = 0.01;
		this.offsetZoom = 0.01;
	}
	
	getPosX(){
		return this.posX;
	}
	
	setPosX(posX){
		this.posX = posX;
	}
	
	getZoom(){
		return this.zoom;
	}
	
	setZoom(zoom){
		this.zoom = zoom;
	}
	
	atualizaMovimento(){
		this.movimento = m3.multiply(m3.scaling(this.zoom, this.zoom), m3.translation(this.posX, this.posY));
	}
	
	movimentoDireita(){
		this.posX += this.offsetX;
		this.atualizaMovimento();
		//this.movimento = m3.multiply(this.movimento, m3.translation(this.posX, 0));
	}
	
	movimentoEsquerda(){
		this.posX -= this.offsetX;
		this.atualizaMovimento();
		//this.movimento = m3.multiply(this.movimento, m3.translation(this.posX, 0));
	}
	
	zoomIn(){
		this.zoom += this.offsetZoom;
		this.atualizaMovimento();
		//this.movimento = m3.multiply(this.movimento, m3.scaling(this.zoom, this.zoom));
	}
	
	zoomOut(){
		this.zoom -= this.offsetZoom;
		this.atualizaMovimento();
		//this.movimento = m3.multiply(this.movimento, m3.scaling(this.zoom, this.zoom));
	}
	
	rotacaoEmTornoDoPonto(pontoRotacao, angulo){
		let x = pontoRotacao[0];
		let y = pontoRotacao[1];
		return m3.multiply(m3.translation(x, y), m3.multiply(m3.rotation(angulo), m3.translation(-x, -y)));
	}
}

//-------------------------------------------------------
//CLASSES ROBÔ
//-------------------------------------------------------
class Robo extends SceneObject{
	constructor(cabeca, tronco, bracoEsquerdo, bracoDireito, pernaEsquerda, pernaDireita){
		super(null, null);
		this.cabeca = cabeca;
		this.tronco = tronco;
		this.bracoEsquerdo = bracoEsquerdo;
		this.bracoDireito = bracoDireito;
		this.pernaEsquerda = pernaEsquerda;
		this.pernaDireita = pernaDireita;
		this.anguloPoli = 0;
		this.offsetPoli = 0.04;
	}
	
	polichinelo(){
		
		if ((this.anguloPoli > Math.PI / 2) || (this.anguloPoli < - Math.PI / 4)){
			this.offsetPoli = - this.offsetPoli;
		}
		
		this.anguloPoli += this.offsetPoli;
		
		this.bracoEsquerdo.setAngulo(-this.anguloPoli);
		this.bracoDireito.setAngulo(this.anguloPoli);
		
		// Converte o movimento do braço para o movimento da perna
		let anguloPerna =
			(this.anguloPoli + Math.PI/4) *
			(Math.PI/3) /
			(3*Math.PI/4);
			
		this.pernaEsquerda.setAngulo(-anguloPerna);
		this.pernaDireita.setAngulo(anguloPerna);
	}
	
	movimentoDireita(){
		this.cabeca.movimentoDireita();
		this.tronco.movimentoDireita();
		this.bracoEsquerdo.movimentoDireita();
		this.bracoDireito.movimentoDireita();
		this.pernaDireita.movimentoDireita();
		this.pernaEsquerda.movimentoDireita();
	}
	
	movimentoEsquerda(){
		this.cabeca.movimentoEsquerda();
		this.tronco.movimentoEsquerda();
		this.bracoEsquerdo.movimentoEsquerda();
		this.bracoDireito.movimentoEsquerda();
		this.pernaDireita.movimentoEsquerda();
		this.pernaEsquerda.movimentoEsquerda();
	}
	
	zoomIn(){
		this.cabeca.zoomIn();
		this.tronco.zoomIn();
		this.bracoEsquerdo.zoomIn();
		this.bracoDireito.zoomIn();
		this.pernaDireita.zoomIn();
		this.pernaEsquerda.zoomIn();
	}
	
	zoomOut(){
		this.cabeca.zoomOut();
		this.tronco.zoomOut();
		this.bracoEsquerdo.zoomOut();
		this.bracoDireito.zoomOut();
		this.pernaDireita.zoomOut();
		this.pernaEsquerda.zoomOut();
	}
}

class Cabeca extends SceneObject{
	constructor(vertices, cor){
		super(vertices, cor);
	}
}

class Tronco extends SceneObject{
	constructor(vertices, cor){
		super(vertices, cor);
	}
}

class Braco extends SceneObject{
	constructor(vertices, cor, pontoArticulacao){
		super(vertices, cor);
		this.angulo = 0;
		this.pontoArticulacao = pontoArticulacao;
	}
	
	atualizaMovimento(){
		this.movimento = m3.multiply(m3.scaling(this.zoom, this.zoom), m3.multiply(m3.translation(this.posX, this.posY), this.rotacaoEmTornoDoPonto(this.pontoArticulacao, this.angulo)));
	}
	
	setAngulo(angulo){
		this.angulo = angulo;
		this.atualizaMovimento();
		//this.movimento = this.rotacaoEmTornoDoPonto(this.pontoArticulacao, this.angulo);
	}
	
	getAngulo(){
		return this.angulo;
	}
}

class Perna extends SceneObject{
	constructor(vertices, cor, pontoArticulacao){
		super(vertices, cor);
		this.angulo = 0;
		this.pontoArticulacao = pontoArticulacao;
	}
	
	atualizaMovimento(){
		this.movimento = m3.multiply(m3.scaling(this.zoom, this.zoom), m3.multiply(m3.translation(this.posX, this.posY), this.rotacaoEmTornoDoPonto(this.pontoArticulacao, this.angulo)));
	}
	
	setAngulo(angulo){
		this.angulo = angulo;
		this.atualizaMovimento();
		//this.movimento = this.rotacaoEmTornoDoPonto(this.pontoArticulacao, this.angulo);
	}
	
	getAngulo(){
		return this.angulo;
	}
}
//-------------------------------------------------------
//CRIANDO OS OBJETOS (INSTANCIANDO OBJECT SCENE)
//E INSTANCIANDO UM ROBÔ
//-------------------------------------------------------
const tronco = new Tronco(verticesTronco, corTronco);
const cabeca = new Cabeca(verticesCabeca, corCabeca);
const bracoEsquerdo = new Braco(verticesBracoEsquerdo, corBracoEsquerdo, ([verticesBracoEsquerdo[0], verticesBracoEsquerdo[1]]));
const bracoDireito = new Braco(verticesBracoDireito, corBracoDireito, ([verticesBracoDireito[0], verticesBracoDireito[1]]));
const pernaEsquerda = new Perna(verticesPernaEsquerda, corPernaEsquerda, ([verticesPernaEsquerda[0], verticesPernaEsquerda[1]]));
const pernaDireita = new Perna(verticesPernaDireita, corPernaDireita, ([verticesPernaDireita[0], verticesPernaDireita[1]]));
const robo = new Robo(cabeca, tronco, bracoEsquerdo, bracoDireito, pernaEsquerda, pernaDireita);

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
			robo.movimentoEsquerda();
        break;
      case ("ArrowRight"):
        if (barraEspaco == true)
			robo.movimentoDireita();
        break;
	  case ("ArrowUp"):
        if (barraEspaco == true)
			robo.zoomIn();
        break;
      case ("ArrowDown"):
        if (barraEspaco == true)
			robo.zoomOut();
        break;
  }
}

window.addEventListener("keydown", keyboardClick, false);

//-------------------------------------------------------
//DESENHANDO OS OBJETOS
//-------------------------------------------------------
function desenhaObjeto(objeto) {
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        objeto.vertices,
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

    gl.uniform3fv(colorLocation, objeto.cor);

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        objeto.movimento
    );

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        objeto.vertices.length / 2
    );
}

function desenhaCena() {
    limpaTela();

    gl.useProgram(program);

    robo.polichinelo();
	
	desenhaObjeto(cabeca);
	desenhaObjeto(bracoEsquerdo);
	desenhaObjeto(bracoDireito);
	desenhaObjeto(pernaEsquerda);
	desenhaObjeto(pernaDireita);
	desenhaObjeto(tronco);
	
	
//	atualizaAnimacao();	
	if (barraEspaco == true)
		requestAnimationFrame(desenhaCena);
}

desenhaCena();

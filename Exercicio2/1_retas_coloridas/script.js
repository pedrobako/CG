canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl){
    throw new Error("Webgl 2 não é suportado");
}

//Variáveis globais
let xIni = 100;
let yIni = 300;
let xFim = 500;
let yFim = 300;
let deltaY;
let deltaX;
let passoX = 1;
let passoY = 1;
let verticesPixel = [];
let verticesWebgl = new Float32Array();
let tamPontoWebgl = new Float32Array();
let tamPonto = 10.0;
let contaClique = 0;
let corBranca  = new Float32Array([1.0, 1.0, 1.0]); 
let corPreta   = new Float32Array([0.0, 0.0, 0.0]); // (0)
let corVermelha = new Float32Array([1.0, 0.0, 0.0]); // (1)
let corVerde   = new Float32Array([0.0, 1.0, 0.0]); // (2)
let corAzul    = new Float32Array([0.0, 0.0, 1.0]); // (3)
let corAmarela = new Float32Array([1.0, 1.0, 0.0]); // (4)
let corMagenta = new Float32Array([1.0, 0.0, 1.0]); // (5)
let corCiano   = new Float32Array([0.0, 1.0, 1.0]); // (6)
let corMarrom  = new Float32Array([0.6, 0.3, 0.0]); // (7)
let corRosa    = new Float32Array([1.0, 0.4, 0.7]); // (8)
let corLaranja = new Float32Array([1.0, 0.5, 0.0]); // (9)
let cor = new Float32Array(corPreta);
let coresWebgl = new Float32Array();

function tratamentoInicial(){
    //Se X e Y forem decrescentes, inverto os pontos inicial e final
    if ((xFim <= xIni)&&(yFim <= yIni)){
        let troca = xIni;
        xIni = xFim;
        xFim = troca;
        troca = yIni;
        yIni = yFim;
        yFim = troca;
    }

    //Após uma possível inversão dos pontos iniciais com os pontos finais
    //Calculo os deltas globais e se X e Y serão incrementados ou decrementados
    deltaY = yFim - yIni;
    deltaX = xFim - xIni;
    if (deltaX < 0)
        passoX = -1;
    else
        passoX = 1;

    if (deltaY < 0)
        passoY = -1;
    else
        passoY = 1;

    //Reta horizontal
    if (deltaY == 0){
        for (let i=0; i<=Math.abs(deltaX); i++){
            verticesPixel.push(xIni+i*passoX, yIni);
        }
        return true;//Os pontos da reta foram obtidos
    }

    //Reta vertical
    if (deltaX == 0){
        for (let i=0; i<=Math.abs(deltaY); i++){
            verticesPixel.push(xIni, yIni+i*passoY);
        }
        return true;//Os pontos da reta foram obtidos
    }

    //Reta diagonal
    //Somente 3 casos:
    //1º x crescente e y crescente
    //2º x crescente e y decrescente
    //3º x decrescente e y crescente
    //O caso em que ambos são decrescentes não entra pois foi tratado inicialmente e os pontos finanis e iniciais foram invertidos
    if (Math.abs(deltaX) == Math.abs(deltaY)){
        if (xIni < xFim){
            if (yIni < yFim){
                for (let i=0; i<=Math.abs(deltaX); i++)
                    verticesPixel.push(xIni+i, yIni+i);
            }
            else if (yIni > yFim){
                for (let i=0; i<=Math.abs(deltaX); i++)
                    verticesPixel.push(xIni+i, yIni-i);
            }
        }
        else if(xIni > xFim)
            for (let i=0; i<=Math.abs(deltaY); i++)
                verticesPixel.push(xIni-i, yIni+i);
        return true;//Os pontos da reta foram obtidos
    }
    return false;//Os pontos da reta NÃO foram obtidos
}

function bresenham(){
    console.log('Bresenham');
    //O ponto inicial sempre fará parte dos pontos da reta
    verticesPixel.push(xIni, yIni);

    let xK = xIni;//Xzero
    let yK = yIni;//Yzero
    let pK;

    //Se X for o eixo dominante nele será aplicado o incremento/decremento unitário constante
    //E o incremento/decremento em y será analisado a cada passo
    if (Math.abs(deltaX) > Math.abs(deltaY)){
        pK = 2*Math.abs(deltaY) - Math.abs(deltaX);
        for (let k=0; k < Math.abs(deltaX); k++){
            if (pK < 0)
                pK = pK + 2*Math.abs(deltaY);
            else{
                pK = pK + 2*(Math.abs(deltaY) - Math.abs(deltaX));
                yK = yK + passoY;
            }
            xK = xK + passoX;
            verticesPixel.push(xK, yK);
        }
    }
    //Se Y for o eixo dominante a situação se inverte
    else{
        pK = 2*Math.abs(deltaX) - Math.abs(deltaY);
        for (let k=0; k < Math.abs(deltaY); k++){
            if (pK < 0)
                pK = pK + 2*Math.abs(deltaX);
            else{
                pK = pK + 2*(Math.abs(deltaX) - Math.abs(deltaY));
                xK = xK + passoX;
            }
            yK = yK + passoY;
            verticesPixel.push(xK, yK);
        }
    }
    
}

function converteVetorPixelVetorFloat(vetorPixel){
    let vetorFloat = new Float32Array(vetorPixel.length);
    for (let i=0; i<vetorPixel.length; i+=2){
        vetorFloat[i] = ((vetorPixel[i]/canvas.width)*2 - 1);
        vetorFloat[i+1] = (1 - (vetorPixel[i+1]/canvas.height)*2);
    }
    return vetorFloat;
}

function mouseClick(event){
    if (contaClique == 0){
        contaClique++;
        // Posição do clique em pixels
        xIni = event.offsetX;
        yIni = event.offsetY;
    } else{
        contaClique=0;
        xFim = event.offsetX;
        yFim = event.offsetY;
        desenha();
    }
}

function keyboardClick(event){
    switch(event.key) {
        case "ArrowUp":
            if (tamPonto < 10)
                tamPonto ++;
            break;
        case "ArrowDown":
            if (tamPonto > 1)    
                tamPonto --;
            break;
        case "0":
            cor = corPreta;
            break;
        case "1":
            cor = corVermelha; 
            break;
        case "2":
            cor = corVerde; 
            break;
        case "3":
            cor = corAzul; 
            break;
        case "4":
            cor = corAmarela; 
            break;
        case "5":
            cor = corMagenta; 
            break;
        case "6":
            cor = corCiano; 
            break;
        case "7":
            cor = corMarrom; 
            break;
        case "8":
            cor = corRosa; 
            break;
        case "9":
            cor = corLaranja; 
            break;
    }
}

function desenha(){
    verticesPixel = [];
    
    if (!tratamentoInicial())//Se os pontos da reta não foram obtidos no tratamento inicial, executo bresenham
            bresenham();

    
    // Adiciona a nova reta ao vetor de retas
    const novaReta = converteVetorPixelVetorFloat(verticesPixel);
    verticesWebgl = new Float32Array([
    ...verticesWebgl,
    ...novaReta
    ]);

    // Adiciona as cores ao vetor de cores
    let novasCores = [];
    for (let i = 0; i < novaReta.length / 2; i++){
        novasCores.push(...cor);
    }
    coresWebgl = new Float32Array([
        ...coresWebgl,
        ...novasCores
    ]);

    
    // Adiciona o tamanho do ponto ao vetor de tamanho dos pontos
    let novosPontos = [];
    for (let i = 0; i < novaReta.length / 2; i++){
        novosPontos.push(tamPonto);
    }
    tamPontoWebgl = new Float32Array([
        ...tamPontoWebgl,
        ...novosPontos
    ]);

    gl.useProgram(program);
 
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesWebgl, gl.STATIC_DRAW);
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, corBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coresWebgl, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tamPontoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tamPontoWebgl, gl.STATIC_DRAW);
    
    gl.drawArrays(gl.POINTS, 0, verticesWebgl.length / 2);
}

function limpaTela(corFundo){
    gl.clearColor(corFundo[0], corFundo[1], corFundo[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

const vertexShaderSource = `#version 300 es
    in vec2 aPosition;
    in vec3 aColor;
    in float aPointSize;
    out vec3 vColor;

    void main(){
        gl_Position = vec4(aPosition, 0.0, 1.0);
        gl_PointSize = aPointSize;
        vColor = aColor;
    }`;

const fragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec3 vColor;
    out vec4 outColor;
    
    void main(){
        outColor = vec4(vColor, 1.0);
    }`;

function createShader(gl, type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        gl.deleteShader(shader);
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
    throw new Error(gl.getProgramInfoLog(program));
}

const verticeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);

const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const corBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, corBuffer);

const colorLocation = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

const tamPontoBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, tamPontoBuffer);

const pointLocation = gl.getAttribLocation(program, "aPointSize");
gl.enableVertexAttribArray(pointLocation);
gl.vertexAttribPointer(pointLocation, 1, gl.FLOAT, false, 0, 0);

gl.useProgram(program);

limpaTela(corBranca);
canvas.addEventListener("mousedown", mouseClick, false);
document.addEventListener("keydown", keyboardClick, false);

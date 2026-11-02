const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec3 aPosition;
in vec3 aColor;
in vec3 aNormal;

out vec3 vColor;
out vec3 vNormal;
out vec3 vSurfacePosition;

uniform mat4 u_modelTransform;
uniform mat4 u_viewTransform;
uniform mat4 u_projectionTransform;

void main() {

    vColor = aColor;

    vNormal = transpose(inverse(mat3(u_modelTransform))) * aNormal;
    vSurfacePosition = (u_modelTransform * vec4(aPosition, 1)).xyz;

    gl_Position = u_projectionTransform * u_viewTransform * u_modelTransform * vec4(aPosition, 1.0);
}
`;



const fragmentShaderSource = `#version 300 es

precision mediump float;

#define MAX_LIGHTS 4
#define SUN_LIGHT 0
#define AMBIENT_LIGHT 1
#define FIRST_HEADLIGHT 2

in vec3 vColor;
in vec3 vNormal;
in vec3 vSurfacePosition;

uniform vec3 u_lightPositions[MAX_LIGHTS];
uniform vec3 u_lightDirections[MAX_LIGHTS];
uniform int u_numLights;
uniform float u_lightIntensities[MAX_LIGHTS];
uniform vec3 u_viewPosition;

//Permite que peças brilhem independente da iluminação da cena
uniform bool u_emissive;

out vec4 outColor;

void main() {

    vec3 ambientReflection = vColor;
    vec3 diffuseReflection = vColor;
    vec3 specularReflection = vec3(1.0);

    vec3 N = normalize(vNormal);
    vec3 V = normalize(u_viewPosition - vSurfacePosition);

    // 1. Componente ambiente: calculada uma única vez
    vec3 ambient =
        u_lightIntensities[AMBIENT_LIGHT] * ambientReflection;

    vec3 directLight = vec3(0.0);

    // 2. Processar o Sol e os faróis
    for (int i = 0; i < MAX_LIGHTS; i++) {

        if (i >= u_numLights) {
            break;
        }

        // A luz ambiente não participa da iluminação direta
        if (i == AMBIENT_LIGHT) {
            continue;
        }

        vec3 L;
        float attenuation = 1.0;
        float spotFactor = 1.0;

        if (i == SUN_LIGHT) {

            // Sol: luz direcional
            L = normalize(-u_lightDirections[SUN_LIGHT]);

        } else if (i >= FIRST_HEADLIGHT) {

            // Faróis: luzes posicionais
            vec3 surfaceToLight = u_lightPositions[i] - vSurfacePosition;

            float distanceToLight = length(surfaceToLight);

            L = normalize(surfaceToLight);

            // Atenuação pela distância
            float a0 = 1.0;
            float a1 = 0.05;
            float a2 = 0.005;

            attenuation = 1.0 / (
                a0 +
                a1 * distanceToLight +
                a2 * distanceToLight * distanceToLight
            );

            // Direção da luz até a superfície
            vec3 lightToSurface = normalize(vSurfacePosition - u_lightPositions[i]);

            // Cosseno do ângulo entre o facho e a superfície
            float theta = dot(
                lightToSurface,
                normalize(u_lightDirections[i])
            );

            float innerCutoff = cos(radians(12.0));
            float outerCutoff = cos(radians(15.0));

            spotFactor = smoothstep(
                outerCutoff,
                innerCutoff,
                theta
            );

        } else {
            continue;
        }

        // 3. Componente difusa
        float diffuseFactor = max(dot(N, L), 0.0);

        vec3 diffuse =
            diffuseFactor * diffuseReflection;

        // 4. Componente especular: Blinn-Phong
        float specularFactor = 0.0;

        if (diffuseFactor > 0.0) {
            vec3 H = normalize(L + V);

            specularFactor = pow(
                max(dot(N, H), 0.0),
                64.0
            );
        }

        vec3 specular =
            specularFactor * specularReflection;

        // 5. Acumular a contribuição da fonte
        directLight +=
            u_lightIntensities[i] *
            attenuation *
            spotFactor *
            (diffuse + specular);
    }

    // 6. Combinar iluminação ambiente e direta
    vec3 finalColor = ambient + directLight;

    if (u_emissive)
        outColor = vec4(vColor, 1.0);
    else
        outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;


function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );

// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(0.20, 0.25, 1.0, 1.0);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);

gl.enable(
    gl.DEPTH_TEST
);

// ================================================================
// CRIAR CARREGAR OS MODELOS GLB, CRIAR A CENA E INICIAR A ANIMAÇÃO
// ================================================================

// ==================================================
// CARREGAR O MODELO GLB
// ==================================================


// ==================================================
// CARREGAR O MODELO GLB
// ==================================================

const gltfLoader = new GLTFLoader();
let carPiece = null;

gltfLoader.load("models/enduroCar.glb")
    .then(resultado => {

        carPiece = gltfLoader.createCarGeometry(
            resultado.gltf,
            resultado.binary
        );

        // Criar e iniciar a cena normalmente.
        const scene = new Scene(gl, program);
        scene.init();

    })
    .catch(erro => {
        console.error(
            "Erro ao carregar ou processar o GLB:",
            erro
        );
    });

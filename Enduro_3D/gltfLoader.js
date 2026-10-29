
class GLTFLoader {


    async load(url) {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Não foi possível carregar o modelo: ${url}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();

        // Interpretar o cabeçalho do arquivo GLB
        const header = new DataView(arrayBuffer);

        const magic = header.getUint32(0, true);
        const version = header.getUint32(4, true);
        const length = header.getUint32(8, true);

        // A assinatura ASCII "glTF" corresponde a 0x46546C67
        if (magic !== 0x46546C67) {
            throw new Error("O arquivo não possui uma assinatura GLB válida.");
        }

        if (version !== 2) {
            throw new Error(`Versão GLB não suportada: ${version}`);
        }

        if (length !== arrayBuffer.byteLength) {
            throw new Error("O tamanho declarado no cabeçalho não corresponde ao arquivo.");
        }

        // O cabeçalho ocupa os primeiros 12 bytes.
        // O próximo campo informa o tamanho do chunk JSON.
        const jsonChunkLength = header.getUint32(12, true);

        // Os 4 bytes seguintes identificam o tipo do chunk JSON.
        const jsonChunkType = header.getUint32(16, true);

        // O JSON começa no byte 20.
        const jsonChunkStart = 20;
        const jsonChunkEnd = jsonChunkStart + jsonChunkLength;

        if (jsonChunkType !== 0x4E4F534A) {
            throw new Error("O primeiro chunk não é do tipo JSON.");
        }

        if (jsonChunkEnd > arrayBuffer.byteLength) {
            throw new Error("O chunk JSON ultrapassa o tamanho do arquivo.");
        }

        // Extrai os bytes do JSON e converte-os em texto.
        const jsonBytes = new Uint8Array(
            arrayBuffer,
            jsonChunkStart,
            jsonChunkLength
        );

        const jsonText = new TextDecoder().decode(jsonBytes);

        // Converte o texto JSON em um objeto JavaScript.
        const gltf = JSON.parse(jsonText);

        const binHeaderOffset = jsonChunkEnd;

        // O cabeçalho do chunk BIN contém:
        // 4 bytes para o tamanho e 4 bytes para o tipo.
        const binChunkLength = header.getUint32(binHeaderOffset, true);
        const binChunkType = header.getUint32(binHeaderOffset + 4, true);

        if (binChunkType !== 0x004E4942) {
            throw new Error("Chunk BIN não encontrado.");
        }

        const binChunkStart = binHeaderOffset + 8;

        if (binChunkStart + binChunkLength > arrayBuffer.byteLength) {
            throw new Error("O chunk BIN ultrapassa o tamanho do arquivo.");
        }

        const binary = arrayBuffer.slice(
            binChunkStart,
            binChunkStart + binChunkLength
        );

        return {
            gltf: gltf,
            binary: binary
        };

        return arrayBuffer;
    }


    // Extrai os dados de um accessor do arquivo glTF.
    // Um accessor descreve como acessar dados de uma geometria,
    // como posições, normais, índices ou coordenadas de textura.
    getAccessorData(gltf, binary, accessorIndex) {

        // Recupera a descrição do accessor pelo índice informado.
        const accessor = gltf.accessors[accessorIndex];

        // Recupera o bufferView que indica a região do buffer
        // binário onde os dados do accessor estão armazenados.
        const bufferView = gltf.bufferViews[accessor.bufferView];

        // Define quantos componentes existem em cada elemento.
        // SCALAR = 1 componente; VEC2 = 2; VEC3 = 3; VEC4 = 4.
        const componentCount = {
            SCALAR: 1,
            VEC2: 2,
            VEC3: 3,
            VEC4: 4
        }[accessor.type];

        // Interrompe a execução se o tipo do accessor não for reconhecido.
        if (!componentCount) {
            throw new Error(
                `Tipo de accessor não suportado: ${accessor.type}`
            );
        }

        // Associa cada tipo numérico do glTF ao seu tamanho em bytes
        // e ao método DataView usado para ler esse tipo.
        // 5123 = UNSIGNED_SHORT: inteiro sem sinal de 16 bits.
        // 5125 = UNSIGNED_INT: inteiro sem sinal de 32 bits.
        // 5126 = FLOAT: número de ponto flutuante de 32 bits.
        const componentTypes = {
            5123: { bytes: 2, getter: "getUint16" },
            5125: { bytes: 4, getter: "getUint32" },
            5126: { bytes: 4, getter: "getFloat32" }
        };

        // Recupera as informações correspondentes ao tipo numérico
        // utilizado pelo accessor.
        const component = componentTypes[accessor.componentType];

        // Interrompe a execução se o tipo numérico não for suportado.
        if (!component) {
            throw new Error(
                `Tipo de componente não suportado: ${accessor.componentType}`
            );
        }

        // Quantidade de bytes de cada componente individual.
        const componentSize = component.bytes;

        // Quantidade de bytes ocupados por um elemento completo.
        // Exemplo: um VEC3 com componentes FLOAT ocupa 3 * 4 = 12 bytes.
        const elementSize = componentSize * componentCount;

        // Distância, em bytes, entre o início de dois elementos consecutivos.
        // Se byteStride não estiver definido, os elementos são considerados
        // consecutivos, sem espaço adicional entre eles.
        const stride = bufferView.byteStride ?? elementSize;

        // Calcula a posição inicial dos dados dentro do buffer binário.
        // Soma o deslocamento do bufferView com o deslocamento do accessor.
        // Os valores padrão são zero quando os deslocamentos não existem.
        const start =
            (bufferView.byteOffset ?? 0) +
            (accessor.byteOffset ?? 0);

        // Cria um DataView para ler diferentes tipos numéricos
        // diretamente do buffer binário.
        const view = new DataView(binary);

        // Armazenará os componentes extraídos antes da conversão para um TypedArray.
        const data = [];

        // Percorre todos os elementos definidos pelo accessor.
        for (let i = 0; i < accessor.count; i++) {

            // Armazena temporariamente os componentes do elemento atual.
            const element = [];

            // Percorre os componentes de cada elemento.
            for (let j = 0; j < componentCount; j++) {

                // Calcula a posição do componente atual no buffer.
                // start: início dos dados.
                // i * stride: deslocamento até o elemento atual.
                // j * componentSize: deslocamento até o componente atual.
                const offset = start + i * stride + j * componentSize;

                // Lê o valor usando o método apropriado do DataView.
                // O segundo argumento true indica ordem little-endian.
                element.push(
                    view[component.getter](offset, true)
                );
            }

            // Adiciona todos os componentes do elemento ao vetor de dados.
            data.push(...element);
        }

        // Converte os dados para um vetor tipado de inteiros de 16 bits,
        // caso o accessor utilize UNSIGNED_SHORT.
        if (accessor.componentType === 5123) {
            return new Uint16Array(data);
        }

        // Converte os dados para um vetor tipado de inteiros de 32 bits,
        // caso o accessor utilize UNSIGNED_INT.
        if (accessor.componentType === 5125) {
            return new Uint32Array(data);
        }

        // Para o tipo FLOAT, retorna um vetor de ponto flutuante de 32 bits.
        return new Float32Array(data);
    }


    // Extrai os dados de uma primitiva específica de uma malha glTF.
    // Uma malha pode conter várias primitivas, cada uma com seus atributos
    // e, eventualmente, seu próprio material.
    getMeshPrimitive(gltf, binary, meshIndex, primitiveIndex = 0) {

        // Recupera a malha pelo índice informado.
        const mesh = gltf.meshes[meshIndex];

        // Verifica se a malha existe.
        if (!mesh) {
            throw new Error(`Malha não encontrada: ${meshIndex}`);
        }

        // Recupera a primitiva desejada.
        // O valor padrão do índice é zero.
        const primitive = mesh.primitives[primitiveIndex];

        // Verifica se a primitiva existe na malha.
        if (!primitive) {
            throw new Error(
                `Primitiva não encontrada na malha ${meshIndex}`
            );
        }

        // Verifica se a primitiva possui o atributo POSITION,
        // que contém as coordenadas dos vértices.
        if (primitive.attributes.POSITION === undefined) {
            throw new Error("A malha não possui atributo POSITION.");
        }

        // Extrai as posições dos vértices usando o accessor POSITION.
        const positions = this.getAccessorData(
            gltf,
            binary,
            primitive.attributes.POSITION
        );

        // Se existir o atributo NORMAL, extrai as normais dos vértices.
        // Caso contrário, define normals como null.
        const normals = primitive.attributes.NORMAL !== undefined
            ? this.getAccessorData(
                gltf,
                binary,
                primitive.attributes.NORMAL
            )
            : null;

        // Se a primitiva possuir índices, extrai seus valores.
        // Caso contrário, define indices como null.
        const indices = primitive.indices !== undefined
            ? this.getAccessorData(
                gltf,
                binary,
                primitive.indices
            )
            : null;

        // Retorna um objeto com os dados extraídos da primitiva.
        return {
            // Usa o nome da malha ou cria um nome padrão.
            name: mesh.name ?? `Malha ${meshIndex}`,

            // Coordenadas dos vértices.
            positions: positions,

            // Normais, quando disponíveis.
            normals: normals,

            // Índices, quando disponíveis.
            indices: indices,

            // Índice do material associado, ou null se não houver.
            materialIndex: primitive.material ?? null,

            // Modo de desenho da primitiva.
            // O valor 4 corresponde a TRIANGLES no glTF.
            mode: primitive.mode ?? 4
        };
    }


    // Gera uma cor para cada vértice com base na cor-base do material.
    // O método considera apenas os três componentes RGB da cor-base.
    getVertexColors(gltf, vertexCount, materialIndex) {

        // Recupera o material associado à primitiva.
        const material = gltf.materials[materialIndex];

        // Obtém o fator de cor-base do material.
        // Se o material ou o fator não existir, utiliza branco.
        // A cor-base glTF normalmente possui quatro componentes: RGBA.
        const baseColor =
            material?.pbrMetallicRoughness?.baseColorFactor
            ?? [1, 1, 1, 1];

        // Reserva espaço para três valores por vértice: R, G e B.
        const colors = new Float32Array(vertexCount * 3);

        // Percorre todos os vértices.
        for (let i = 0; i < vertexCount; i++) {

            // Atribui o componente vermelho.
            colors[i * 3] = baseColor[0];

            // Atribui o componente verde.
            colors[i * 3 + 1] = baseColor[1];

            // Atribui o componente azul.
            colors[i * 3 + 2] = baseColor[2];
        }

        // Retorna as cores no formato esperado pelo WebGL.
        return colors;
    }


    // Cria um objeto renderizável a partir de uma primitiva glTF.
    // Prepara os vértices, as cores, as normais e os índices
    // para utilização pelo Renderer.
    createRenderableObject(gltf, binary, meshIndex, primitiveIndex = 0) {

        // Extrai os dados da primitiva selecionada.
        const primitive = this.getMeshPrimitive(
            gltf,
            binary,
            meshIndex,
            primitiveIndex
        );

        // Cria as cores dos vértices com base no material.
        // O número de vértices é obtido dividindo a quantidade
        // de coordenadas pelo número de componentes por vértice (3).
        const colors = this.getVertexColors(
            gltf,
            primitive.positions.length / 3,
            primitive.materialIndex
        );

        // Prepara a geometria para renderização.
        // A função também calcula ou adiciona as normais necessárias.
        const geometry = addNormalsToGeometry(
            primitive.positions,
            colors,
            primitive.indices
        );

        // Exibe informações de diagnóstico no console.
        // Cada quantidade é apresentada em número de elementos,
        // e não em número de componentes individuais.
        console.log("Resultado de addNormalsToGeometry:", {
            vertices: geometry.vertices.length / 3,
            cores: geometry.colors.length / 3,
            normais: geometry.normals.length / 3,
            indices: geometry.indices.length
        });

        // Retorna os dados preparados e uma matriz identidade.
        // A matriz identidade não aplica transformações adicionais.
        return {
            vertices: geometry.vertices,
            colors: geometry.colors,
            normals: geometry.normals,
            indices: geometry.indices,
            materialIndex: primitive.materialIndex,
            modelTransform: m4.identity()
        };
    }

    // Calcula a matriz de transformação de um nó glTF.
    // A matriz combina translação, rotação e escala.
    getNodeTransform(node) {

        // Recupera a translação do nó.
        // Se não estiver definida, utiliza [0, 0, 0].
        const translation = node.translation ?? [0, 0, 0];

        // Recupera a rotação em forma de quaternion [x, y, z, w].
        // O quaternion padrão representa ausência de rotação.
        const rotation = node.rotation ?? [0, 0, 0, 1];

        // Recupera a escala nos eixos X, Y e Z.
        // A escala padrão mantém as dimensões originais.
        const scale = node.scale ?? [1, 1, 1];

        // Cria a matriz de translação.
        const matrizTranslacao = m4.translation(
            translation[0],
            translation[1],
            translation[2]
        );

        // Converte o quaternion em uma matriz de rotação.
        const matrizRotacao = m4.quaternionToRotationMatrix(rotation);

        // Cria a matriz de escala.
        const matrizEscala = m4.scaling(
            scale[0],
            scale[1],
            scale[2]
        );

        // Combina as transformações.
        // A ordem corresponde a T * (R * S).
        // Para vetores-coluna, a escala é aplicada primeiro,
        // depois a rotação e, por último, a translação.
        return m4.multiply(
            matrizTranslacao,
            m4.multiply(matrizRotacao, matrizEscala)
        );
    }


    // Cria uma geometria única para o carro a partir do modelo glTF.
    // Percorre os nós da cena, aplica suas transformações,
    // combina os vértices e os índices das primitivas e calcula as normais.
    createCarGeometry(gltf, binary) {

        // Recupera a cena principal do arquivo glTF.
        // Se gltf.scene não estiver definido, utiliza a cena de índice zero.
        const scene = gltf.scenes[gltf.scene ?? 0];

        // Vetor que reunirá as posições de todos os vértices do carro.
        const vertices = [];

        // Vetor que reunirá as cores de todos os vértices.
        const colors = [];

        // Vetor que reunirá os índices das primitivas.
        const indices = [];

        // Percorre os nós listados diretamente na cena.
        for (const nodeIndex of scene.nodes) {

            // Recupera o nó atual.
            const node = gltf.nodes[nodeIndex];

            // Ignora o piso importado do Blender,
            // pois o terreno será construído no próprio projeto.
            if (node.name === "Piso") {
                continue;
            }

            // Ignora nós que não possuem uma malha associada.
            if (node.mesh === undefined) {
                continue;
            }

            // Calcula a matriz de transformação do nó.
            const matriz = this.getNodeTransform(node);

            // Recupera a malha associada ao nó.
            const mesh = gltf.meshes[node.mesh];

            // Percorre todas as primitivas da malha.
            for (
                let primitiveIndex = 0;
                primitiveIndex < mesh.primitives.length;
                primitiveIndex++
            ) {

                // Extrai os dados da primitiva atual.
                const primitive = this.getMeshPrimitive(
                    gltf,
                    binary,
                    node.mesh,
                    primitiveIndex
                );

                // Este método aceita somente primitivas TRIANGLES.
                // O modo 4 representa triângulos no glTF.
                if (primitive.mode !== 4) {
                    throw new Error(
                        `Modo de primitiva não suportado: ${primitive.mode}`
                    );
                }

                // Gera a cor de cada vértice com base no material.
                const cores = this.getVertexColors(
                    gltf,
                    primitive.positions.length / 3,
                    primitive.materialIndex
                );

                // Armazenará as posições dos vértices após as transformações.
                const posicoesTransformadas = [];

                // Percorre as posições de três em três valores,
                // pois cada vértice possui coordenadas X, Y e Z.
                for (let i = 0; i < primitive.positions.length; i += 3) {

                    // Recupera a posição original do vértice e aplica
                    // a matriz de transformação do nó.
                    const ponto = m4.transformPoint(matriz, [
                        primitive.positions[i],
                        primitive.positions[i + 1],
                        primitive.positions[i + 2]
                    ]);

                    // Rotaciona o ponto em 90 graus no eixo Y,
                    // conforme a orientação desejada para o modelo.
                    // Esta transformação é específica deste projeto.
                    const pontoRotacionado = [
                        -ponto[2],
                        ponto[1],
                        ponto[0]
                    ];

                    // Adiciona as coordenadas transformadas ao vetor.
                    posicoesTransformadas.push(...pontoRotacionado);
                }

                // Recupera os índices da primitiva.
                // Se não houver índices, cria uma sequência de índices
                // correspondente à ordem dos vértices.
                const indicesPrimitiva = primitive.indices
                    ?? Array.from(
                        { length: primitive.positions.length / 3 },
                        (_, i) => i
                    );

                // Calcula quantos vértices já foram adicionados.
                // Esse valor será utilizado para ajustar os índices
                // da primitiva atual dentro da geometria combinada.
                const offset = vertices.length / 3;

                // Acrescenta as posições transformadas à geometria final.
                vertices.push(...posicoesTransformadas);

                // Acrescenta as cores dos vértices.
                colors.push(...cores);

                // Ajusta os índices locais para que apontem
                // para os vértices corretos na geometria combinada.
                for (const indice of indicesPrimitiva) {
                    indices.push(offset + indice);
                }
            }
        }

        // Converte os vetores em arrays tipados e prepara a geometria.
        // A função addNormalsToGeometry calcula ou adiciona as normais.
        const geometria = addNormalsToGeometry(
            new Float32Array(vertices),
            new Float32Array(colors),
            new Uint32Array(indices)
        );

        // Retorna os dados da geometria final do carro.
        return {
            vertices: geometria.vertices,
            colors: geometria.colors,
            normals: geometria.normals,
            indices: geometria.indices,
            modelTransform: m4.identity()
        };
    }
}

class GLTFLoader {

    async load(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Não foi possível carregar o modelo: ${url}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        const header = new DataView(arrayBuffer);

        // Cabeçalho GLB.
        const magic = header.getUint32(0, true);
        const version = header.getUint32(4, true);
        const length = header.getUint32(8, true);

        if (magic !== 0x46546C67) {
            throw new Error("O arquivo não possui uma assinatura GLB válida.");
        }

        if (version !== 2) {
            throw new Error(`Versão GLB não suportada: ${version}`);
        }

        if (length !== arrayBuffer.byteLength) {
            throw new Error(
                "O tamanho declarado no cabeçalho não corresponde ao arquivo."
            );
        }

        // Chunk JSON.
        const jsonChunkLength = header.getUint32(12, true);
        const jsonChunkType = header.getUint32(16, true);

        if (jsonChunkType !== 0x4E4F534A) {
            throw new Error("O primeiro chunk não é do tipo JSON.");
        }

        const jsonChunkStart = 20;
        const jsonChunkEnd = jsonChunkStart + jsonChunkLength;

        if (jsonChunkEnd > arrayBuffer.byteLength) {
            throw new Error("O chunk JSON ultrapassa o tamanho do arquivo.");
        }

        const jsonBytes = new Uint8Array(
            arrayBuffer,
            jsonChunkStart,
            jsonChunkLength
        );

        const gltf = JSON.parse(
            new TextDecoder().decode(jsonBytes)
        );

        // Chunk BIN.
        const binHeaderOffset = jsonChunkEnd;

        if (binHeaderOffset + 8 > arrayBuffer.byteLength) {
            throw new Error("Cabeçalho do chunk BIN não encontrado.");
        }

        const binChunkLength = header.getUint32(
            binHeaderOffset,
            true
        );

        const binChunkType = header.getUint32(
            binHeaderOffset + 4,
            true
        );

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

        return { gltf, binary };
    }


    getAccessorData(gltf, binary, accessorIndex) {
        const accessor = gltf.accessors[accessorIndex];

        if (!accessor) {
            throw new Error(`Accessor não encontrado: ${accessorIndex}`);
        }

        // Accessors sem bufferView possuem valores iniciais zerados.
        if (accessor.bufferView === undefined) {
            const componentCount = {
                SCALAR: 1,
                VEC2: 2,
                VEC3: 3,
                VEC4: 4
            }[accessor.type];

            if (!componentCount) {
                throw new Error(
                    `Tipo de accessor não suportado: ${accessor.type}`
                );
            }

            return new Float32Array(accessor.count * componentCount);
        }

        const bufferView = gltf.bufferViews[accessor.bufferView];

        const componentCount = {
            SCALAR: 1,
            VEC2: 2,
            VEC3: 3,
            VEC4: 4
        }[accessor.type];

        if (!componentCount) {
            throw new Error(
                `Tipo de accessor não suportado: ${accessor.type}`
            );
        }

        const componentTypes = {
            5121: { bytes: 1, getter: "getUint8" },
            5123: { bytes: 2, getter: "getUint16" },
            5125: { bytes: 4, getter: "getUint32" },
            5126: { bytes: 4, getter: "getFloat32" }
        };

        const component = componentTypes[accessor.componentType];

        if (!component) {
            throw new Error(
                `Tipo de componente não suportado: ${accessor.componentType}`
            );
        }

        const componentSize = component.bytes;
        const elementSize = componentSize * componentCount;
        const stride = bufferView.byteStride ?? elementSize;

        const start =
            (bufferView.byteOffset ?? 0) +
            (accessor.byteOffset ?? 0);

        const view = new DataView(binary);
        const data = [];

        for (let i = 0; i < accessor.count; i++) {
            for (let j = 0; j < componentCount; j++) {
                const offset =
                    start + i * stride + j * componentSize;

                data.push(
                    view[component.getter](offset, true)
                );
            }
        }

        if (accessor.componentType === 5121) {
            return new Uint8Array(data);
        }

        if (accessor.componentType === 5123) {
            return new Uint16Array(data);
        }

        if (accessor.componentType === 5125) {
            return new Uint32Array(data);
        }

        return new Float32Array(data);
    }


    getMeshPrimitive(gltf, binary, meshIndex, primitiveIndex = 0) {
        const mesh = gltf.meshes[meshIndex];

        if (!mesh) {
            throw new Error(`Malha não encontrada: ${meshIndex}`);
        }

        const primitive = mesh.primitives[primitiveIndex];

        if (!primitive) {
            throw new Error(
                `Primitiva não encontrada na malha ${meshIndex}`
            );
        }

        if (primitive.attributes.POSITION === undefined) {
            throw new Error("A malha não possui atributo POSITION.");
        }

        const positions = this.getAccessorData(
            gltf,
            binary,
            primitive.attributes.POSITION
        );

        const normals = primitive.attributes.NORMAL !== undefined
            ? this.getAccessorData(
                gltf,
                binary,
                primitive.attributes.NORMAL
            )
            : null;

        const indices = primitive.indices !== undefined
            ? this.getAccessorData(
                gltf,
                binary,
                primitive.indices
            )
            : null;

        return {
            name: mesh.name ?? `Malha ${meshIndex}`,
            positions,
            normals,
            indices,
            materialIndex: primitive.material ?? null,
            mode: primitive.mode ?? 4
        };
    }


    getVertexColors(gltf, vertexCount, materialIndex) {
        const material = materialIndex !== null
            ? gltf.materials?.[materialIndex]
            : null;

        const baseColor =
            material?.pbrMetallicRoughness?.baseColorFactor
            ?? [1, 1, 1, 1];

        const colors = new Float32Array(vertexCount * 3);

        for (let i = 0; i < vertexCount; i++) {
            colors[i * 3] = baseColor[0];
            colors[i * 3 + 1] = baseColor[1];
            colors[i * 3 + 2] = baseColor[2];
        }

        return colors;
    }


    createRenderableObject(
        gltf,
        binary,
        meshIndex,
        primitiveIndex = 0
    ) {
        const primitive = this.getMeshPrimitive(
            gltf,
            binary,
            meshIndex,
            primitiveIndex
        );

        const colors = this.getVertexColors(
            gltf,
            primitive.positions.length / 3,
            primitive.materialIndex
        );

        const geometry = addNormalsToGeometry(
            primitive.positions,
            colors,
            primitive.indices
        );

        return {
            vertices: geometry.vertices,
            colors: geometry.colors,
            normals: geometry.normals,
            indices: geometry.indices,
            materialIndex: primitive.materialIndex,
            modelTransform: m4.identity()
        };
    }


    getNodeTransform(node) {
        // Se o nó já possui uma matriz glTF, utiliza-a diretamente.
        if (node.matrix) {
            return new Float32Array(node.matrix);
        }

        const translation = node.translation ?? [0, 0, 0];
        const rotation = node.rotation ?? [0, 0, 0, 1];
        const scale = node.scale ?? [1, 1, 1];

        const matrizTranslacao = m4.translation(
            translation[0],
            translation[1],
            translation[2]
        );

        const matrizRotacao =
            m4.quaternionToRotationMatrix(rotation);

        const matrizEscala = m4.scaling(
            scale[0],
            scale[1],
            scale[2]
        );

        return m4.multiply(
            matrizTranslacao,
            m4.multiply(matrizRotacao, matrizEscala)
        );
    }


    classificarPeca(nome) {
        // Agrupa todos os componentes de cada roda.
        const prefixosRodas = [
            "Aro ",
            "Cravo pneu ",
            "Cubo ",
            "Parafuso aro ",
            "Pneu "
        ];

        for (const prefixo of prefixosRodas) {
            if (nome.startsWith(prefixo)) {
                const correspondencia = nome.match(
                    /([1-4])(?:\.\d+)?$/
                );

                if (correspondencia) {
                    return `roda${correspondencia[1]}`;
                }
            }
        }

        if (nome.startsWith("Farol dianteiro")) {
            return "farois";
        }

        if (nome.startsWith("Lanterna traseira vermelha única")) {
            return "lanternas";
        }

        if (nome === "Para-brisa") {
            return "parabrisa";
        }

        return "carroceria";
    }


    createCarGeometry(gltf, binary) {
        const nomesGrupos = [
            "carroceria",
            "roda1",
            "roda2",
            "roda3",
            "roda4",
            "farois",
            "lanternas",
            "parabrisa"
        ];

        const heading = -Math.PI / 2;
        const scale = 0.2;

        const transformacaoInicial = m4.multiply(
            m4.yRotation(heading),
            m4.scaling(scale, scale, scale)
        );

        const grupos = {};

        for (const nome of nomesGrupos) {
            grupos[nome] = {
                vertices: [],
                colors: [],
                indices: []
            };
        }

        // Percorre os nós do modelo e distribui as peças nos grupos.
        for (const node of gltf.nodes) {
            if (node.name === "Piso" || node.mesh === undefined) {
                continue;
            }

            const nomeGrupo = this.classificarPeca(
                node.name ?? ""
            );

            const grupo = grupos[nomeGrupo];
            const matriz = this.getNodeTransform(node);
            const mesh = gltf.meshes[node.mesh];

            for (
                let primitiveIndex = 0;
                primitiveIndex < mesh.primitives.length;
                primitiveIndex++
            ) {
                const primitive = this.getMeshPrimitive(
                    gltf,
                    binary,
                    node.mesh,
                    primitiveIndex
                );

                if (primitive.mode !== 4) {
                    throw new Error(
                        `Modo de primitiva não suportado em "${node.name}": ` +
                        `${primitive.mode}. Esperado TRIANGLES (4).`
                    );
                }

                const cores = this.getVertexColors(
                    gltf,
                    primitive.positions.length / 3,
                    primitive.materialIndex
                );

                const offset = grupo.vertices.length / 3;

                // Aplica a transformação local do nó e converte
                // as coordenadas do modelo para (-Z, Y, X).
                for (
                    let i = 0;
                    i < primitive.positions.length;
                    i += 3
                ) {
                    const ponto = m4.transformPoint(
                        matriz,
                        [
                            primitive.positions[i],
                            primitive.positions[i + 1],
                            primitive.positions[i + 2]
                        ]
                    );

                    // Converte as coordenadas do modelo para (-Z, Y, X).
                    const pontoConvertido = [
                        -ponto[2],
                        ponto[1],
                        ponto[0]
                    ];

                    // Aplica a orientação e a escala iniciais do carro.
                    const pontoFinal = m4.transformPoint(
                        transformacaoInicial,
                        pontoConvertido
                    );

                    grupo.vertices.push(
                        pontoFinal[0],
                        pontoFinal[1],
                        pontoFinal[2]
                    );
                }

                grupo.colors.push(...cores);

                if (primitive.indices !== null) {
                    for (const indice of primitive.indices) {
                        grupo.indices.push(indice + offset);
                    }
                } else {
                    const vertexCount =
                        primitive.positions.length / 3;

                    for (let i = 0; i < vertexCount; i++) {
                        grupo.indices.push(offset + i);
                    }
                }
            }
        }

        // Calcula as normais de cada grupo separadamente.
        for (const nome of nomesGrupos) {
            const grupo = grupos[nome];

            if (grupo.vertices.length === 0) {
                console.warn(
                    `O grupo "${nome}" não possui vértices.`
                );

                grupos[nome] = {
                    vertices: new Float32Array(),
                    colors: new Float32Array(),
                    normals: new Float32Array(),
                    indices: new Uint32Array()
                };

                continue;
            }

            const geometria = addNormalsToGeometry(
                new Float32Array(grupo.vertices),
                new Float32Array(grupo.colors),
                new Uint32Array(grupo.indices)
            );

            grupos[nome] = {
                vertices: geometria.vertices,
                colors: geometria.colors,
                normals: geometria.normals,
                indices: geometria.indices
            };
        }

        return grupos;
    }

}
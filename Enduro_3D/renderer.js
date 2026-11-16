// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getAttribLocation(
                program,
                "aColor"
            );

        this.normalLocation =
            gl.getAttribLocation(
                program,
                "aNormal"
            );

        this.uHasTexture = gl.getUniformLocation(
            this.program,
            "u_hasTexture"
        );

        this.texCoordLocation =
            gl.getAttribLocation(
                program,
                "aTexCoord"
            );

        this.textureLocation =
            gl.getUniformLocation(
                program,
                "u_texture"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.projectionTransformLocation =
            gl.getUniformLocation(
                program,
                "u_projectionTransform"
            );

        this.lightPositionsLocation =
            gl.getUniformLocation(
                program,
                "u_lightPositions[0]"
            );

        this.numLightsLocation =
            gl.getUniformLocation(
                program,
                "u_numLights"
            );

        this.lightDirectionsLocation =
            gl.getUniformLocation(
                program,
                "u_lightDirections[0]"
            );

        this.lightIntensitiesLocation =
            gl.getUniformLocation(
                program,
                "u_lightIntensities[0]"
            );

        this.emissiveLocation =
            gl.getUniformLocation(
                program,
                "u_emissive"
            );

        this.viewPositionLocation =
            gl.getUniformLocation(
                program,
                "u_viewPosition"
            );

        this.verticesBuffer = gl.createBuffer();

        this.colorBuffer = gl.createBuffer();

        this.normalBuffer = gl.createBuffer();

        this.indexBuffer = gl.createBuffer();

        this.texCoordBuffer = gl.createBuffer();
    }

    draw(object,
        viewTransform,
        projectionTransform,
        lightPositions,
        lightDirections,
        lightIntensities,
        viewPosition) {
        const gl = this.gl;

        //Positions
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        //Colors
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.colorBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.colors,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.colorLocation
        );

        gl.vertexAttribPointer(
            this.colorLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        //Normals
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.normalBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.normals,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.normalLocation
        );

        gl.vertexAttribPointer(
            this.normalLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        //Indices
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this.indexBuffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            object.indices,
            gl.STATIC_DRAW
        );

        //Model Transform
        gl.uniformMatrix4fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        //Texturas
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.texCoordBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.texCoords,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.texCoordLocation
        );

        gl.vertexAttribPointer(
            this.texCoordLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        //View Transform
        gl.uniformMatrix4fv(
            this.viewTransformLocation,
            false,
            viewTransform
        );

        //Projection Transform
        gl.uniformMatrix4fv(
            this.projectionTransformLocation,
            false,
            projectionTransform
        );

        // Quantidade de luzes ativas
        gl.uniform1i(
            this.numLightsLocation,
            lightPositions.length
        );

        // Posições das luzes
        gl.uniform3fv(
            this.lightPositionsLocation,
            new Float32Array(lightPositions.flat())
        );

        // Direções das luzes
        gl.uniform3fv(
            this.lightDirectionsLocation,
            new Float32Array(lightDirections.flat())
        );

        // Intensidades das luzes
        gl.uniform1fv(
            this.lightIntensitiesLocation,
            new Float32Array(lightIntensities)
        );

        gl.uniform1i(
            this.emissiveLocation,
            object.emissive ? 1 : 0
        );

        gl.uniform3fv(
            this.viewPositionLocation,
            viewPosition
        );

        //Texturas
        gl.uniform1i(
            this.uHasTexture,
            object.hasTexture ? 1 : 0
        );

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(
            gl.TEXTURE_2D,
            object.texture
        );

        gl.uniform1i(
            this.textureLocation,
            0
        );

        //DRAW OBJECT USING INDICES
        gl.drawElements(
            gl.TRIANGLES,
            object.indices.length,
            gl.UNSIGNED_SHORT,
            0
        );
    }

    loadTexture(url) {

        const gl = this.gl;

        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Textura provisória enquanto a imagem carrega
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 255, 255])
        );

        const image = new Image();

        image.onload = () => {

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image
            );

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
        };

        image.onerror = () => {
            console.error("Erro ao carregar textura:", url);
        };

        image.src = url;

        return texture;
    }

    createRaceTrackTexture() {
        const gl = this.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Duas faixas horizontais:
        // uma vermelha e outra branca.
        const pixels = new Uint8Array([
            255, 0, 0, 255,       // Vermelho
            255, 0, 0, 255,       // Vermelho

            255, 255, 255, 255,   // Branco
            255, 255, 255, 255    // Branco
        ]);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            2,
            2,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    }
}

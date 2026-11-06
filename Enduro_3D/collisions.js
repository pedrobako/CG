class Collisions {

    // Parâmetros das colisões
    static collisionDuration = 0.3;
    static collisionSpeed = -5.0;
    static normalSpeed = 1.0;
    static collisionPushSpeed = 2.0;

    // Estado da colisão ativa
    static activeCollision = null;
    static collisionTimer = 0.0;

    // ==================================================
    // DETECTAR COLISÕES
    // Retorna o tipo de colisão ou null
    // ==================================================
    static detectCollision(playerCar, opponentCars, raceTrack) {

        // ----------------------------------------------
        // Colisões com carros oponentes
        // ----------------------------------------------
        for (const opponentCar of opponentCars) {

            const overlapX =
                playerCar.xMin <= opponentCar.xMax &&
                playerCar.xMax >= opponentCar.xMin;

            const overlapZ =
                playerCar.zMin <= opponentCar.zMax &&
                playerCar.zMax >= opponentCar.zMin;

            if (overlapX && overlapZ) {

                const overlapWidth =
                    Math.min(playerCar.xMax, opponentCar.xMax) -
                    Math.max(playerCar.xMin, opponentCar.xMin);

                const overlapDepth =
                    Math.min(playerCar.zMax, opponentCar.zMax) -
                    Math.max(playerCar.zMin, opponentCar.zMin);

                // Colisão lateral
                if (overlapWidth < overlapDepth) {

                    return opponentCar.xCenter < playerCar.xCenter
                        ? "car-left"
                        : "car-right";
                }

                // Colisão frontal
                return "car-front";
            }
        }

        // ----------------------------------------------
        // Colisões com os limites da pista
        // ----------------------------------------------
        if (playerCar.xMin <= raceTrack.leftLimit) {
            return "track-left";
        }

        if (playerCar.xMax >= raceTrack.rightLimit) {
            return "track-right";
        }

        return null;
    }

    // ==================================================
    // TRATAR COLISÕES
    // Recebe o tipo detectado e retorna a velocidade
    // longitudinal dos carros oponentes
    // ==================================================
    static reactCollision(type, playerCar, deltaTime) {

        // Inicia uma reação somente se não houver outra ativa.
        if (this.activeCollision === null && type !== null) {
            this.activeCollision = type;
            this.collisionTimer = 0.0;
        }

        // Não existe colisão ativa.
        if (this.activeCollision === null) {
            return this.normalSpeed;
        }

        let speed = this.normalSpeed;

        switch (this.activeCollision) {

            case "car-front":
                speed = this.collisionSpeed;
                break;

            case "car-left":
                speed = this.collisionSpeed;

                playerCar.horizontalMovement(
                    this.collisionPushSpeed * deltaTime
                );
                break;

            case "car-right":
                speed = this.collisionSpeed;

                playerCar.horizontalMovement(
                    -this.collisionPushSpeed * deltaTime
                );
                break;

            case "track-left":
                speed = Math.min(this.normalSpeed-1, 0.0);

                playerCar.horizontalMovement(
                    this.collisionPushSpeed * deltaTime
                );
                break;

            case "track-right":
                speed = Math.min(this.normalSpeed-1, 0.0);

                playerCar.horizontalMovement(
                    -this.collisionPushSpeed * deltaTime
                );
                break;
        }

        // Atualiza o temporizador da reação.
        this.collisionTimer += deltaTime;

        // Encerra a reação quando o tempo termina.
        if (this.collisionTimer >= this.collisionDuration) {
            this.activeCollision = null;
            this.collisionTimer = 0.0;
        }

        return speed;
    }

    // ==================================================
    // REINICIAR ESTADO DAS COLISÕES
    // ==================================================
    static reset() {
        this.activeCollision = null;
        this.collisionTimer = 0.0;
    }
}
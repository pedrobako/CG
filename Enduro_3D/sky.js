
class Sky {
    constructor() {
        this.sky = new SkyObject();
    }

    update() {
        this.sky.update();
    }

    draw(
        renderer,
        viewTransform,
        projectionTransform,
        lightPositions,
        viewPosition
    ) {
        this.sky.draw(
            renderer,
            viewTransform,
            projectionTransform,
            lightPositions,
            viewPosition
        );
    }
}
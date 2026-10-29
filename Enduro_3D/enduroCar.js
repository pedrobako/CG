class EnduroCar {
    constructor(tx, ty, tz) {

        this.enduroCar = new EnduroCarObject();

        this.tx = tx;
        this.ty = ty;
        this.tz = tz;
        this.heading = -Math.PI/2;
    }

    update() {
        this.enduroCar.update(this.tx,this.ty,this.tz,this.heading);
    }

    draw(renderer, viewTransform, projectionTransform, lightPosition, viewPosition) {
        this.enduroCar.draw(renderer, viewTransform, projectionTransform, lightPosition, viewPosition);
    }
}
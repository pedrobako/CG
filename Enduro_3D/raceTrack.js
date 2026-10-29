class RaceTrack {
    constructor() {
        this.raceTrack = new RaceTrackObject();
    }

    update() {
        this.raceTrack.update();
    }

    draw(renderer, viewTransform, projectionTransform, lightPosition, viewPosition) {
        this.raceTrack.draw(
            renderer,
            viewTransform,
            projectionTransform,
            lightPosition,
            viewPosition
        );
    }
}
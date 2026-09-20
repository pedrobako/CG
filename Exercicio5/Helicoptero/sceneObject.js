// ==================================================
// CLASS - SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(
        vertices,
        colors,
        indices,
		center
    ) {

        this.vertices = vertices;
        this.colors = colors;
        this.indices = indices;
        this.modelTransform = m4.identity();
		this.center = center;
		this.offset = 0.01;
    }
	
	updateCenter() {

		let somaX = 0;
		let somaY = 0;
		let somaZ = 0;

		const quantidadeVertices = this.vertices.length / 3;

		for (let i = 0; i < this.vertices.length; i += 3) {

			const x = this.vertices[i];
			const y = this.vertices[i + 1];
			const z = this.vertices[i + 2];

			const tx =
				this.modelTransform[0] * x +
				this.modelTransform[4] * y +
				this.modelTransform[8] * z +
				this.modelTransform[12];

			const ty =
				this.modelTransform[1] * x +
				this.modelTransform[5] * y +
				this.modelTransform[9] * z +
				this.modelTransform[13];

			const tz =
				this.modelTransform[2] * x +
				this.modelTransform[6] * y +
				this.modelTransform[10] * z +
				this.modelTransform[14];

			somaX += tx;
			somaY += ty;
			somaZ += tz;
		}

		this.center = [
			somaX / quantidadeVertices,
			somaY / quantidadeVertices,
			somaZ / quantidadeVertices
		];
	}

    update(modelTransform) {
        this.modelTransform = m4.multiply(modelTransform, this.modelTransform);
		this.updateCenter();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform =
            modelTransform;
		this.updateCenter();
    }

    draw(renderer) {

        renderer.draw(this);
    }
}

class Helicopter extends SceneObject{
	constructor(helicopterBody, helicopterTopShaft, helicopterTail, helicopterPropellers, helicopterTailPropeller){
		super(null, null, null, helicopterBody.center);
		this.helicopterBody = helicopterBody;
		this.helicopterTopShaft = helicopterTopShaft;
		this.helicopterTail = helicopterTail;
		this.helicopterPropellers = helicopterPropellers;
		this.helicopterTailPropeller = helicopterTailPropeller;
		this.direction = "left";
		this.isTurnOn = false;
		this.isLanded = false;
		this.isLanding = false;
	}
	
	draw(renderer){
		this.helicopterBody.draw(renderer);
        this.helicopterTopShaft.draw(renderer);
        this.helicopterTail.draw(renderer);
        this.helicopterPropellers.draw(renderer);
        this.helicopterTailPropeller.draw(renderer);
	}
	
	updateCenter(){
		this.helicopterBody.updateCenter();
        this.helicopterTopShaft.updateCenter();
        this.helicopterTail.updateCenter();
        this.helicopterPropellers.updateCenter();
        this.helicopterTailPropeller.updateCenter();
		this.center = this.helicopterBody.center;
	}
	
	update(modelTransform){
		this.helicopterBody.update(modelTransform);
        this.helicopterTopShaft.update(modelTransform);
        this.helicopterTail.update(modelTransform);
        this.helicopterPropellers.update(modelTransform);
        this.helicopterTailPropeller.update(modelTransform);
		this.center = this.helicopterBody.center;
	}
	
	scaling(sX, sY, sZ){
		this.update(m4.scaling(sX, sY, sZ));
	}
	
	rotate(){
		this.helicopterPropellers.rotate();
		this.helicopterTailPropeller.rotate();
	}
	
	landing(){
		if (this.center[1] > -0.9){
			this.moveDown();
			this.isLanding = true;
		}
		else{
			this.isLanded = true;
			this.isLanding = false;
		}
	}
	
	rotationHelicopter(theta){
		const p1X = this.center[0];
		const p1Y = this.center[1];
		const p1Z = this.center[2];
		const p2X = this.helicopterPropellers.center[0];
		const p2Y = this.helicopterPropellers.center[1];
		const p2Z = this.helicopterPropellers.center[2];
		const v = [p2X - p1X, p2Y - p1Y, p2Z - p1Z];
		const modV = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		const a = v[0]/modV;
		const b = v[1]/modV;
		const c = v[2]/modV;
		const d = Math.sqrt(b*b + c*c);
		const rXAlpha = [
						 1, 0, 0, 0,
						 0, c/d, b/d, 0,
						 0, -b/d, c/d, 0,
						 0, 0, 0, 1,
						];
		const rXAlphaInv = m4.transpose(rXAlpha);
		const rYBeta = [
						 d, 0, a, 0,
						 0, 1, 0, 0,
						 -a, 0, d, 0,
						 0, 0, 0, 1,
						];
		const rYBetaInv = m4.transpose(rYBeta);
		const rotation = m4.multiply(m4.translation(p1X, p1Y, p1Z),
						 m4.multiply(rXAlphaInv,
						 m4.multiply(rYBetaInv,
						 m4.multiply(m4.zRotation(theta),
						 m4.multiply(rYBeta,
						 m4.multiply(rXAlpha,
									 m4.translation(-p1X, -p1Y, -p1Z))))))
									);
		this.update(rotation);
	}
	
	changeDirection(){
		if (this.direction == "left")
			this.direction = "right";
		else
			this.direction = "left";
		
		this.rotationHelicopter(Math.PI);
	}
	
	moveRight(){
		const dX = this.offset;
		if (this.direction == "left")
			this.changeDirection();
		
		this.update(m4.translation(dX, 0.0, 0.0));
		
		this.updateCenter(dX, 0.0, 0.0);
	}
	
	moveLeft(){
		const dX = -this.offset;
		if (this.direction == "right")
			this.changeDirection();
		
		this.update(m4.translation(dX, 0.0, 0.0));
		
		this.updateCenter(dX, 0.0, 0.0);
	}
	
	moveUp(){
		const dY = this.offset;
		this.update(m4.translation(0.0, dY, 0.0));
		
		this.updateCenter(0.0, dY, 0.0);
	}
	
	moveDown(){
		const dY = -this.offset;
		this.update(m4.translation(0.0, dY, 0.0));
		
		this.updateCenter(0.0, dY, 0.0);
	}
}

class HelicopterBody extends SceneObject{
    constructor(){
        super(
            helicopterBodyGeometry.vertices,
            helicopterBodyGeometry.colors,
            helicopterBodyGeometry.indices,
			helicopterBodyGeometry.center
        );
    }
}

class HelicopterTopShaft extends SceneObject{
    constructor(){
        super(
            helicopterTopShaftGeometry.vertices,
            helicopterTopShaftGeometry.colors,
            helicopterTopShaftGeometry.indices,
			helicopterTopShaftGeometry.center
        );
    }
}

class HelicopterTail extends SceneObject{
    constructor(){
        super(
            helicopterTailGeometry.vertices,
            helicopterTailGeometry.colors,
            helicopterTailGeometry.indices,
			helicopterTailGeometry.center
        );
    }
}

class HelicopterPropellers extends SceneObject{
    constructor(){
        super(
            helicopterPropellersGeometry.vertices,
            helicopterPropellersGeometry.colors,
            helicopterPropellersGeometry.indices,
			helicopterPropellersGeometry.center
        );
    }
	
	rotate(){
		this.update(m4.multiply(m4.translation(this.center[0], this.center[1], this.center[2]),
								m4.multiply(m4.yRotation(4*this.offset),
											m4.translation(-this.center[0], -this.center[1], -this.center[2]))));
	}
}

class HelicopterTailPropeller extends SceneObject{
    constructor(){
        super(
            helicopterTailPropellerGeometry.vertices,
            helicopterTailPropellerGeometry.colors,
            helicopterTailPropellerGeometry.indices,
			helicopterTailPropellerGeometry.center
        );
    }
	
	rotate(){
		this.update(m4.multiply(m4.translation(this.center[0], this.center[1], this.center[2]),
								m4.multiply(m4.zRotation(4*this.offset),
											m4.translation(-this.center[0], -this.center[1], -this.center[2]))));
	}
}

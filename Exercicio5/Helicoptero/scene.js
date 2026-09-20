// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);
		
		this.helicopter = new Helicopter(new HelicopterBody(),
										 new HelicopterTopShaft(),
										 new HelicopterTail(),
										 new HelicopterPropellers(),
										 new HelicopterTailPropeller()
										 );
										 
		this.keys = {
					ArrowLeft: false,
					ArrowRight: false,
					ArrowUp: false,
					ArrowDown: false
					};
		
		this.helicopter.scaling(0.5, 0.5, 0.5);
		this.helicopter.isLanding = true;
		while (this.helicopter.isLanding == true)
			this.helicopter.landing();
    }
	
	setupKeyboard() {

		window.addEventListener("keydown", (event) => {
			if (event.key in this.keys) {
				this.keys[event.key] = true;
				event.preventDefault();
			}
			
			if (event.key == " ")
				if (this.helicopter.isTurnOn){
					this.helicopter.isTurnOn = false;
					this.helicopter.isLanding = true;
				}
				else{
					this.helicopter.isTurnOn = true;
					this.helicopter.isLanding = false;
				}
		});

		window.addEventListener("keyup", (event) => {
			if (event.key in this.keys) {
				this.keys[event.key] = false;
				event.preventDefault();
			}
		});
	}
	
	setupControls() {

		document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    	});

		const botoes = {
			btnLeft: "ArrowLeft",
			btnRight: "ArrowRight",
			btnUp: "ArrowUp",
			btnDown: "ArrowDown"
		};

		for (const id in botoes) {

			const botao = document.getElementById(id);
			const tecla = botoes[id];

			botao.addEventListener("pointerdown", (event) => {

				event.preventDefault();

				// O botão passa a capturar o ponteiro
				botao.setPointerCapture(event.pointerId);

				this.keys[tecla] = true;
			});

			botao.addEventListener("pointerup", (event) => {

				event.preventDefault();

				this.keys[tecla] = false;

				botao.releasePointerCapture(event.pointerId);
			});

			botao.addEventListener("pointercancel", (event) => {

				this.keys[tecla] = false;
			});
		}
		
		const btnStart = document.getElementById("btnStart");

		btnStart.addEventListener("pointerdown", (event) => {

			event.preventDefault();

			if (this.helicopter.isTurnOn) {
				this.helicopter.isTurnOn = false;
				this.helicopter.isLanding = true;
			}
			else {
				this.helicopter.isTurnOn = true;
				this.helicopter.isLanding = false;
			}
		});
	}

    update() {
        if (this.helicopter.isTurnOn){
			this.helicopter.rotate();
			if (this.keys.ArrowRight)
				this.helicopter.moveRight();

            if (this.keys.ArrowLeft)
				this.helicopter.moveLeft();

            if (this.keys.ArrowUp)
				this.helicopter.moveUp();

            if (this.keys.ArrowDown)
				this.helicopter.moveDown();
		}
		
		if (this.helicopter.isLanding == true)
			this.helicopter.landing();
		
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);
		
		this.helicopter.draw(this.renderer);
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        this.setupKeyboard();
		this.setupControls();
		requestAnimationFrame(
            () => this.execute()
        );
    }
}


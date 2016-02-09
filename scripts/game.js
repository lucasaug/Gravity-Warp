// Game class which manages gamestates

function Game(canvas, width) {
    "use strict";

    this.width                = width;
    this.height               = width;
    // the x and y position of the field is calculated so it
    // never surpasses the canvas, even when rotated.
    this.x                    = Math.floor((width * (1 - Math.SQRT2)) / (-2 * Math.SQRT2));
    this.y                    = this.x;
    this.currentGameStateName = null;

    // buffer canvas and context, we pass these to the
    // gamestates
    this.bCanvas              = null;
    this.ctx                  = null;

    // last frame render timestamp
    this.lastRender   = 0;
    // constant for determining framerate, milliseconds between each frame
    this.frameUpdate  = 15;

    // list of existing gamestates
    // a gamestate must implement the following methods:
    // onEnter, update and onExit
    // (pretty self explanatory)
    this.gameStates           = {};

    this.startGame = function () {
        // define the buffers
        this.bCanvas = document.createElement("canvas");
        this.bCanvas.setAttribute("width", canvas.width);
        this.bCanvas.setAttribute("height", canvas.height);
        this.ctx = this.bCanvas.getContext('2d');

        // here we create the gamestates
        this.gameStates = {
            "menu"     : new MenuGameState(canvas, this.x, this.y, this.width, this.height, this.bCanvas,
                                           this.ctx),
            "playing"  : new PlayingGameState(canvas, this.x, this.y, this.width, this.height, this.bCanvas,
                                              this.ctx),
            "gameover" : new MenuGameState(canvas, this.x, this.y, this.width, this.height, this.bCanvas,
                                           this.ctx, true),
        };

        // and now define the first gamestate (menu) and start game
        this.currentGameStateName = "menu";
        this.gameStates[this.currentGameStateName].onEnter();
        this.update();
    }

    this.update = function () {
        // calculates if it's been enough time for a new frame to be rendered
        // if it is, calls update on the gamestate
        var elapsed = Date.now() - this.lastRender;
        if (elapsed > this.frameUpdate) {
            this.lastRender = Date.now();
            var shouldStop = this.gameStates[this.currentGameStateName].update();
            if (shouldStop) {
                if (this.currentGameStateName === "menu" || this.currentGameStateName === "gameover")
                    this.changeGameState("playing");
                else if (this.currentGameStateName === "playing")
                    this.changeGameState("gameover");
            }
        }
        requestAnimationFrame(this.update.bind(this));
    };

    this.changeGameState = function (newGSName) {
        this.gameStates[this.currentGameStateName].onExit();
        this.currentGameStateName = newGSName;
        this.gameStates[this.currentGameStateName].onEnter();
    }
}

// Initial GameState, draws game menu
// time only needs to be set if gameOver is true

function MenuGameState(canvas, x, y, width, height, bCanvas, ctx, gameOver, time) {
    // TODO ALGUMA FORMA DE PASSAR O TEMPO
    "use strict";

    this.width     = width  - 2 * x;
    this.height    = height - 2 * y;
    this.x         = x;
    this.y         = y;
    this.canvas    = canvas;
    // this is the buffer canvas for drawing images
    // for performance improvements
    this.bCanvas   = bCanvas;
    // this context refers to the buffer's context
    this.ctx       = ctx;
    this.angle     = 0;
    this.rotSpd    = Math.PI / 720;
    this.bgAlpha   = 0.0;
    this.alphaStep = 0.01;
    this.maxAlpha  = 0.6;
    this.startGame = false;

    this.onEnter = function () {
        var self = this;

        // redefine function to avoid "this" issues
        this.detectInput = function (e) {
            if (e.keyCode === 13) {
                self.startGame = true;
            }
        };

        // sets event handlers
        window.onkeydown = this.detectInput;
    };

    this.update = function () {
        // draws buffer canvas into actual canvas
        this.canvas.getContext('2d').drawImage(this.bCanvas,0,0);

        this.ctx.save();
        this.ctx.fillStyle = "#300FC0";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
        this.ctx.rotate(-1*this.angle + Math.PI/2);
        this.ctx.translate(-1*this.canvas.width/2, -1*this.canvas.height/2);
        this.ctx.fillStyle = "#000040";
        this.ctx.fillRect(this.x,this.y,this.canvas.width-2*this.x,this.canvas.height-2*this.y);

        // draws a nice background
        this.ctx.beginPath();
        for(var i = this.x + 10; i < this.width + this.x; i += 10) {
            this.ctx.moveTo(i,this.y);
            this.ctx.lineTo(i,this.height + this.y);
        }
        for(var i = this.y + 10; i < this.height + this.y; i += 10) {
            this.ctx.moveTo(this.x, i);
            this.ctx.lineTo(this.width + this.x, i);
        }
        this.ctx.stroke();

        this.ctx.restore();

        // white fading-in background
        this.ctx.fillStyle = "rgba(255, 255, 255, " + this.bgAlpha * this.maxAlpha + ")";
        this.ctx.fillRect(this.canvas.width * 0.1, this.canvas.height * 0.1, 
                          this.canvas.width * 0.8,  this.canvas.height * 0.8);

        if (this.bgAlpha < 1) {
            this.bgAlpha += this.alphaStep;
        }

        // writes game instructions
        var title = "Gravity Warp",
            desc  = [
                "Control the cube using the arrow keys or",
                "the wasd keys.",
                "Avoid the obstacles in the way, trying to",
                "survive for as long as possible.",
                "Your score will be calculated based on the",
                "seconds survived."
            ],
            startTxt = "Press Enter/Return to start";

        // if this is the gameover menu, sets the appropriate messages
        if (gameOver) {
            title = "Game Over",
            desc  = [
                "You survived for " + time + " seconds."
            ],
            startTxt = "Press Enter/Return to play again";
        }

        // fonts and line spacing are determined by the total canvas width
        // and height
        this.ctx.font = this.canvas.width * 0.08 +"px Garamond";
        this.ctx.fillStyle = "rgba(0, 0, 0, " + this.bgAlpha + ")";
        this.ctx.fillText(title, this.canvas.width * 0.25, this.canvas.height * 0.22 + 20);
        this.ctx.font = this.canvas.width * 0.03 +"px Garamond";
        for(var i = 1; i < desc.length + 1; i++)
            this.ctx.fillText(desc[i-1],  this.canvas.width * 0.18, 
                        this.canvas.height * 0.2 + i * (0.05 * this.canvas.width) + (0.13 * this.canvas.width));

        this.ctx.font = this.canvas.width * 0.05 +"px Garamond";
        this.ctx.fillStyle = "rgba(30, 0, 60, " + this.bgAlpha + ")";
        this.ctx.fillText(startTxt, this.canvas.width * 0.2, this.canvas.height * 0.8);

        this.angle += this.rotSpd;

        // if a key was pressed, the game should start
        if (this.startGame)
            return true;
        else
            return false;
    };

    this.onExit = function () {
        // resets the game start attribute and alpha
        this.startGame = false;
        this.bgAlpha = 0.;

        window.removeEventListener("keyup", this.detectInput);
    };
}

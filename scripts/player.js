// class for the player of the game

function Player(x,y,size) {
    "use strict";

    // inheritance
    this.prototype = SQEntity.prototype;
    
    SQEntity.call(this,x,y,size);

    this.velocity  = new Vector(0,0);
    this.canJump = true;

    this.update = function () {
        this.position.addTo(this.velocity);
        // makes sure position is an integer
        this.position.x = (this.position.x) | 0;
        this.position.y = (this.position.y) | 0;
    };

    // accelerates the player by a vector
    this.accel = function (amount) {
        this.velocity.addTo(amount);
    };

    // moves the player by a vectorial amount
    this.move = function (amount) {
        this.position.addTo(amount);
    };

    // abstraction of a player jump
    this.jump = function (jumpSpeed, gravDir) {
        var quant = gravDir.multiply(-1) || new Vector(0,-1);
        quant.multiplyBy(jumpSpeed);
        if (this.canJump && quant) {
            this.canJump = false;
            this.accel(quant);
            self = this;
            setTimeout(function () {self.canJump = true}, 300);
        }
    };

    // applies gravity
    this.addGrav = function (gravity, dir) {
        var direction = dir || {x: 1, y: 1};
        if (direction.x != 0 && direction.y != 0)
            this.accel(gravity);
        else if (direction.x != 0)
            this.accel(gravity.xComponent());
        else if (direction.y != 0)
            this.accel(gravity.yComponent());

    };

    // stops player movement in a given direction
    this.stop = function (direction) {
        if (direction.x != 0)
            this.velocity.x = 0;
        if (direction.y != 0)
            this.velocity.y = 0;
    };

    // draws the player in the correct positiom
    this.draw = function (ctx) {
        var lastFill   = ctx.fillStyle,
            lastStroke = ctx.strokeStyle;
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "#000000";
        // just to be really sure
        var position = {
            x : (this.position.x) | 0,
            y : (this.position.y) | 0
        };
        ctx.fillRect(position.x, position.y, this.size, this.size);
        ctx.fillStyle = lastFill;
        ctx.strokeStyle = lastStroke;
    };
}

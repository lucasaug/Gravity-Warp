function Obstacle(x,y,size) {
    "use strict";

    // inheritance
    this.prototype = SQEntity.prototype;
    
    SQEntity.call(this,x,y,size);

    // timestamp of the moment it was spawned
    this.birthTime = Date.now();

    // determines if obstacle should be rendered or not
    this.alive     = true;

    // if this variable is set to true, this obstacle
    // must stay where it is and never unspawn
    this.permanent = false;

    this.draw = function (ctx) {
        var lastFill   = ctx.fillStyle,
            lastStroke = ctx.strokeStyle;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
        ctx.fillStyle = lastFill;
        ctx.strokeStyle = lastStroke;
    };
}

// implementation of a square shaped entity, on top of which
// the player, enemies and points will be built

function SQEntity(x,y,size) {
    "use strict";

    this.position = new Vector(x,y);
    this.size = size;

    // detects if this entity is colliding with another entity
    this.collidingWith = function (sqentity) {
        var minBoundThis = {
                x: Math.min(this.position.x, this.position.x + this.size),
                y: Math.min(this.position.y, this.position.y + this.size)
            },
            maxBoundThis = {
                x: Math.max(this.position.x, this.position.x + this.size),
                y: Math.max(this.position.y, this.position.y + this.size)
            },
            minBoundOther = {
                x: Math.min(sqentity.position.x, sqentity.position.x + sqentity.size),
                y: Math.min(sqentity.position.y, sqentity.position.y + sqentity.size)
            },
            maxBoundOther = {
                x: Math.max(sqentity.position.x, sqentity.position.x + sqentity.size),
                y: Math.max(sqentity.position.y, sqentity.position.y + sqentity.size)
            },
            intersectX = minBoundThis.x < maxBoundOther.x && maxBoundThis.x > minBoundOther.x,
            intersectY = minBoundThis.y < maxBoundOther.y && maxBoundThis.y > minBoundOther.y;
        if (intersectX && intersectY)
            return true;
        else
            return false;
    };
}

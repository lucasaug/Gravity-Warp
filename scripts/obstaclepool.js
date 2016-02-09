function ObstaclePool() {
    "use strict";

    this.obstacles = [];
    this.obstSize  = 20;
    // maximum number os obstacle array
    this.obstLimit = 30;
    // lifespan of an obstacle, in miliseconds
    this.lifeSpan  = 20000;

    this.addObstacle = function (newObstacle) {
        newObstacle.permanent = true;
        this.obstacles.push(newObstacle);
    };

    this.spawn = function (width, height, canvasX, canvasY, player) {
        // width and height refer to the field, not the canvas
        // canvasX and canvasY refer to the field's offset to the canvas

        // we take a random number between 0 and 3 to decide in which
        // ground we will spawn it
        var ground = Math.floor(Math.random()*4);
        var x,y;
        // this variable becomes true when we've made sure
        // this position doesn't collide with the player
        var valid = false;

        while(!valid) {
            if (ground === 3) {
                // positive x
                x = width - this.obstSize;
                y = Math.floor(Math.random() * (height - this.obstSize));
            }else if (ground === 2) {
                // negative x
                x = 0;
                y = Math.floor(Math.random() * (height - this.obstSize));
            }else if (ground === 1) {
                // positive y
                x = Math.floor(Math.random() * (width - this.obstSize));
                y = height - this.obstSize;
            }else if (ground === 0) {
                // negative y
                x = Math.floor(Math.random() * (width - this.obstSize));
                y = 0;
            }

            x += canvasX;
            y += canvasY;

            var collisionTester = new Obstacle(x, y, this.obstSize);

            if (!collisionTester.collidingWith(player))
                valid = true;
            else
                ground = Math.floor(Math.random()*4);
        }
        // adds an obstacle to the list if it's not full
        // if it is, reuses an object
        // only does any of that if there's enough space
        if (this.obstacles.length < this.obstLimit) {
            this.obstacles.push(new Obstacle(x, y, this.obstSize));
        }else{
            var spawned = false;
            for(var i = 0; i < this.obstLimit && !spawned; i++) {
                if (!this.obstacles[i].alive) {
                    this.obstacles[i].position = new Vector(x,y);
                    this.obstacles[i].alive = true;
                    this.obstacles[i].birthTime = Date.now();
                    spawned = true;
                }
            }
        }
    };
    
    this.update = function (player) {
        for(var i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].alive) {
                if (this.obstacles[i].collidingWith(player)) {
                    // player collided with an obstacle - death
                    return true;
                }
                if (!this.obstacles[i].permanent &&
                    Date.now() - this.obstacles[i].birthTime > this.lifeSpan) {
                    this.obstacles[i].alive = false;
                }
            }
        }
        return false;
    };

    this.render = function (ctx) {
        this.obstacles.forEach(function (obst) {
            if (obst.alive)
                obst.draw(ctx);
        });
    };

    this.reset = function () {
        this.obstacles.forEach(function (obst) {
            obst.alive = false;
            obst.permanent = false;
        });
    };
}

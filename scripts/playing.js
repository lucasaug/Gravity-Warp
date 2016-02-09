// Gamestate for actual game running

function PlayingGameState(canvas, x, y, width, height, bCanvas, ctx) {
    "use strict";

    // width and height are relative to the playing field, not the whole canvas
    this.width        = Math.round(width  - 2*x);
    this.height       = Math.round(height - 2*y);
    // field's offset to the canvas
    this.x            = x;
    this.y            = y;
    // sets a place for the player object
    this.player       = null;
    this.playerSize   = Math.round(canvas.width*30/600);
    // pool of obstacle objects
    this.obstaclePool = new ObstaclePool();
    this.canvas       = canvas;
    // this is the canvas which will hold the background grid image
    // and game field, we do this to get some performance boost
    this.backGrid     = null;
    // this is the buffer canvas for drawing images
    // for performance improvements
    this.bCanvas   = bCanvas;
    // this context refers to the buffer's context
    this.ctx       = ctx;
    // flags for detecting arrow key presses (as well as wasd)
    this.leftPressed  = false;
    this.rightPressed = false;
    this.upPressed    = false;
    // distance travelled by player when walking or jumping
    this.playerSpeed  = 1;
    this.jumpSpeed    = 20;
    // gravity force
    this.gravity      = new Vector(0,1);
    // current directions which would make sense calling 'ground'
    this.currentGDir  = new Vector(1,1);
    // constant for speed of gravity rotation
    this.gravAngSpd   = Math.PI/720;
    // timestamp of last moment in which the field rotated
    this.lastRotation = Date.now();
    // determines in which direction the field is/was rotating
    // -1 means clockwise, 1 means the opposite
    this.rotDir       = 0;
    // the angle the field is rotating towards
    // must be given in values between -Math.PI and Math.PI
    this.nextAngle    = this.gravity.getAngle();
    // this is set to true if a rotation has been planned
    // with a setTimeout call
    this.betweenRot   = false;
    // this contains the id for the obstacle spawning setTimeout
    this.spawnId      = null;
    // this contains the id for the gravity rotating setTimeout
    this.rotateId     = null;

    // position on the canvas, upper left edge
    this.x = x;
    this.y = y;

    this.onEnter = function () {
        this.gravity.setAngle(0);
        this.nextAngle = 0;
        this.betweenRot = false;

        var self = this;

        // redefine function to avoid "this" issues
        this.keydown = function (e) {
            if (e.keyCode == 37 || e.keyCode == 65) self.leftPressed = true;
            if (e.keyCode == 38 || e.keyCode == 87) self.upPressed = true;
            if (e.keyCode == 39 || e.keyCode == 68) self.rightPressed = true;
        };

        this.keyup = function (e) {
            if (e.keyCode == 37 || e.keyCode == 65) self.leftPressed = false;
            if (e.keyCode == 38 || e.keyCode == 87) self.upPressed = false;
            if (e.keyCode == 39 || e.keyCode == 68) self.rightPressed = false;
        };

        // sets event handlers
        window.onkeydown = this.keydown;
        window.onkeyup = this.keyup;

        // creates the background grid canvas and draws the background on it
        this.backGrid = document.createElement("canvas");
        this.backGrid.setAttribute("width", this.canvas.width);
        this.backGrid.setAttribute("height", this.canvas.height);

        var gridContext = this.backGrid.getContext("2d");
        gridContext.fillStyle = "#000040";
        gridContext.fillRect(this.x,this.y,this.canvas.width-2*this.x,this.canvas.height-2*this.y);
        gridContext.beginPath();
        for(var i = this.x + 10; i < this.width + this.x; i += 10) {
            gridContext.moveTo(i,this.y);
            gridContext.lineTo(i,this.height + this.y);
        }
        for(var i = this.y + 10; i < this.height + this.y; i += 10) {
            gridContext.moveTo(this.x, i);
            gridContext.lineTo(this.width + this.x, i);
        }
        gridContext.stroke();

        // creates the player
        this.player = new Player(
                    ((this.width/2) | 0) - this.playerSize + this.x,
                    ((this.height/2) | 0) - this.playerSize + this.y,
                      this.playerSize
                    );
        // resets the obstacle pool in case this is needed
        this.obstaclePool.reset();

        // sets the four hard-coded obstacles
        var obstSize = this.obstaclePool.obstSize;
        this.obstaclePool.addObstacle(new Obstacle(this.x, this.y, obstSize), this.x, this.y);
        this.obstaclePool.addObstacle(new Obstacle(this.x, this.y + this.height - obstSize,
                                      obstSize),this.x, this.y);
        this.obstaclePool.addObstacle(new Obstacle(this.x + this.width - obstSize, this.y, obstSize),this.x,
                                      this.y);
        this.obstaclePool.addObstacle(new Obstacle(this.x + this.width - obstSize,
                                      this.y + this.height - obstSize,obstSize),this.x, this.y);

        /*/ starts the random spawning of obstacles
        this.spawnId = window.setTimeout(
        (function spawn() {
            this.obstaclePool.spawn(this.width, this.height, this.x, this.y, this.player);
            this.spawnId = window.setTimeout(spawn.bind(this), Math.floor(Math.random() * 3000) + 1000);
        }).bind(this),
        Math.floor(Math.random() * 3000) + 1000);*/
    };

    this.onExit = function () {this.obstaclePool.spawn(this.width, this.height, this.x, this.y, this.player);
        window.removeEventListener("keydown", this.keydown);
        window.removeEventListener("keyup",   this.keyup);
        window.clearTimeout(this.spawnId);
        window.clearTimeout(this.rotateId);

        this.gravity.setAngle(0);
        this.nextAngle = 0;
        this.betweenRot = false;
    };

    this.update = function () {
        console.log(this.gravity.getAngle());
        this.render(this.ctx);
        var shouldStop = this.step();
        if (shouldStop) {
            // renders the scene again so the death is visible
            this.render(this.ctx);
            this.render(this.ctx);
        }
        return shouldStop;
    };

    this.step = function () {
        this.jumpGravStabilize();

        // moving the player left/right and jumping
        var movement = new Vector(0,0);
        if (this.leftPressed)
            movement = this.gravity.getUnit().multiply(-5 * this.playerSpeed).rotate(-1 * Math.PI/2);
        if (this.rightPressed)
            movement = this.gravity.getUnit().multiply(-5 * this.playerSpeed).rotate(Math.PI/2);
        if (this.upPressed && this.playerInGround())
            this.player.jump(this.jumpSpeed, this.gravity.getUnit());

        // moves player and applies velocity
        this.movePlayer(movement);
        this.player.update();

        this.limitPlayerBounds();

        this.processGravity();

        // kills obstacles if needed
        // this function returns true if the player has been killed by an obstacle
        var dead = this.obstaclePool.update(this.player);
        if (dead)
            return true;
        return false;
    };

    this.render = function (ctx) {
        // draws buffer canvas into actual canvas
        this.canvas.getContext('2d').drawImage(this.bCanvas,0,0);

        ctx.save();
        ctx.fillStyle = "#300FC0";
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        // rotates the canvas properly
        ctx.translate(this.canvas.width/2, this.canvas.height/2);
        ctx.rotate(-1*this.gravity.getAngle() + Math.PI/2);
        ctx.translate(-1*this.canvas.width/2, -1*this.canvas.height/2);
        // draws the field and background grid
        ctx.drawImage(this.backGrid, 0, 0);
        this.player.draw(ctx);

        // draws the obstacles
        this.obstaclePool.render(this.ctx);

        ctx.restore();
    };

    // keeps player inside the field
    this.limitPlayerBounds = function () {
        var inFieldX = this.entityInFieldX(this.player);
        if (inFieldX != 0) {
            if (inFieldX > 0) {
                this.player.position.x = this.x + this.width - this.player.size;
            }else{
                this.player.position.x = this.x;
            }
        }

        var inFieldY = this.entityInFieldY(this.player);
        if (inFieldY != 0) {
            if (inFieldY > 0) {
                this.player.position.y = this.y + this.height - this.player.size;
            }else{
                this.player.position.y = this.y;
            }
        }
    };

    // checks if gravity is rotating or 
    // should(n't) start rotating
    this.processGravity = function () {

        // checks if gravity should be rotated
        // if so, rotates it in the correct direction
        // if not, randomly decides if should start rotating now
        if (this.gravity.getAngle() !== this.nextAngle) {
            if (this.gravity.getAngle() < this.nextAngle) {
                this.gravity.rotateBy(this.rotDir * this.gravAngSpd);
                // if it rotates more than needed, corrects the angle
                if (this.gravity.getAngle() >= this.nextAngle) {
                    this.gravity.setAngle(this.nextAngle);
                    this.lastRotation = Date.now();
                }
            }else if (this.gravity.getAngle() > this.nextAngle) {
                this.gravity.rotateBy(this.rotDir * this.gravAngSpd);
                // if it rotates more than needed, corrects the angle
                if (this.gravity.getAngle() <= this.nextAngle) {
                    this.gravity.setAngle(this.nextAngle);
                    this.lastRotation = Date.now();
                }
            }

        }else if (Date.now() - this.lastRotation > 5000 && !this.betweenRot) {
            this.betweenRot = true;
            this.rotateId = window.setTimeout( (function () {
                this.betweenRot = false;
                this.rotDir = 0;
                while(!this.rotDir)
                    this.rotDir = Math.floor((Math.random()*3) - 1);
                if (this.rotDir > 0) {
                    this.nextAngle = this.gravity.rotate(Math.PI / 2).getAngle();
                    if (this.nextAngle >= 3.1372293304599146)
                        this.nextAngle = -1 * Math.PI;
                }else{
                    this.nextAngle = this.gravity.rotate(-1 * Math.PI / 2).getAngle();
                    if (this.nextAngle >= -1 * 3.1372293304599146)
                        this.nextAngle = Math.PI;
                }
            }).bind(this) , Math.floor(Math.random() * 15) * 1000);
        }
    };

    // regulates the jumping and collisions with the field
    // aplies gravity
    this.jumpGravStabilize = function () {
        var vel = { x: this.player.velocity.x,
                    y: this.player.velocity.y },
            gravDir = this.gravityDirection();

        var groundDir = new Vector(this.playerGroundXDir(gravDir),
                                   this.playerGroundYDir(gravDir));

        // stops jumping if player hit the ceiling
        if (this.playerInCeiling()) {
            if ((-1*gravDir.x > 0 && vel.x > 0) || (-1*gravDir.x < 0 && vel.x < 0))
                this.player.stop({x:1});
            if ((-1*gravDir.y > 0 && vel.y > 0) || (-1*gravDir.y < 0 && vel.y < 0))
                this.player.stop({y:1});
        };
        // stops gravity and velocities from acting in the ground direction if player
        // is in ground
        if (this.playerInGround()) {
            if (groundDir.x != 0 && groundDir.y != 0)
                this.currentGDir = new Vector(0,0);
            else if (groundDir.x != 0) {
                this.currentGDir.x = 0;
                this.currentGDir.y = 1;
            }else{
                this.currentGDir.x = 1;
                this.currentGDir.y = 0;
            }

            if ((gravDir.x > 0 && vel.x > 0) || (gravDir.x < 0 && vel.x < 0))
                this.player.stop({x:1});
            if ((gravDir.y > 0 && vel.y > 0) || (gravDir.y < 0 && vel.y < 0))
                this.player.stop({y:1});
        }else if (this.currentGDir.x == 0 || this.currentGDir.y == 0) {
            this.currentGDir = new Vector(1,1);
        }

        // apply gravity
        this.player.addGrav(this.gravity, this.currentGDir);
    };

    // interface for moving the player
    this.movePlayer = function (quant) {
        this.player.move(quant);
    };

    // detects in which components the gravity is acting
    this.gravityDirection = function () {
        var xDir = 0;
        if (this.gravity.x > 0) {
            xDir = 1;
        }else if (this.gravity.x < 0) {
            xDir = -1;
        }
        var yDir = 0;
        if (this.gravity.y > 0) {
            yDir = 1;
        }else if (this.gravity.y < 0) {
            yDir = -1;
        }
        return new Vector(xDir,yDir);
    };

    // detects what is the x direction of the player's ground, if it is in a ground
    // returns X ground direction (1 or -1), if not in a ground, returns 0
    this.playerGroundXDir = function (gravDir) {
        if (gravDir.x > 0) {
            if (this.x + this.width == this.player.position.x + this.player.size)
               return 1;
        }
        if (gravDir.x < 0) {
            if (this.x == this.player.position.x)
               return -1;
        }
        return 0;
    };

    // same for y
    this.playerGroundYDir = function (gravDir) {
        if (gravDir.y > 0) {
            if (this.y + this.height == this.player.position.y + this.player.size)
               return 1;
        }
        if (gravDir.y < 0) {
            if (this.y == this.player.position.y)
               return -1;
        }
        return 0;
    };

    // detects if player is in any ground, returns 1 or -1 for
    // x and y, indicating where the floor is on a given axis
    this.playerInGround = function () {
        var gravDir = this.gravityDirection();

        var groundDir = {
            x: this.playerGroundXDir(gravDir),
            y: this.playerGroundYDir(gravDir)
        };
        if (groundDir.x != 0 || groundDir.y != 0) {
            return true;
        }

        return false;
    };

    // detects if player is in any ceiling
    this.playerInCeiling = function () {
        var jumpDir = this.gravityDirection();
        jumpDir.multiplyBy(-1);

        if (jumpDir.x > 0) {
            if (this.x + this.width == this.player.position.x + this.player.size)
               return true;
        }
        if (jumpDir.x < 0) {
            if (this.x == this.player.position.x)
               return true;
        }
        if (jumpDir.y > 0) {
            if (this.y + this.height == this.player.position.y + this.player.size)
               return true;
        }
        if (jumpDir.y < 0) {
            if (this.y == this.player.position.y)
               return true;
        }
        return false;
    };

    // detects if an entity is within the X range of the game
    this.entityInFieldX = function (sqentity) {
        var xMin = Math.min(sqentity.position.x, sqentity.position.x + sqentity.size),
            xMax = Math.max(sqentity.position.x, sqentity.position.x + sqentity.size);
        if (xMin > this.x && xMax < this.x + this.width) {
            return 0
        }else if (xMin <= this.x) {
            return -1;
        }else{
            return 1;
        }
    };

    // detects if an entity is within the Y range of the game
    this.entityInFieldY = function (sqentity) {
        var yMin = Math.min(sqentity.position.y, sqentity.position.y + sqentity.size),
            yMax = Math.max(sqentity.position.y, sqentity.position.y + sqentity.size);
        if (yMin > this.y && yMax < this.y + this.height) {
            return 0
        }else if (yMin <= this.y) {
            return -1;
        }else{
            return 1;
        }
    };
}

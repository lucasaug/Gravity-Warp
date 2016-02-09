// Vector class with the following operations implemented:

// - addition
// - subtraction
// - multiplication
// - division

// all these functions have two implementations: one that changes
// the vector in which the operation is applied, and other that
// returns the a new vector which is the result of the operation

// also implements getters and setters for angle and length
// has functions for rotation, getting the unit length vector,
// getting x and y component vectors of another vector,
// dot products and projection onto another vector

function Vector(x, y) {
    "use strict";

    this.x = x;
    this.y = y;

    this.addTo = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
    };

    this.subtractFrom = function (vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    };

    this.multiplyBy = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
    };

    this.divideBy = function (scalar) {
        this.multiplyBy(1 / scalar);
    };

    this.rotateBy = function (angle) {
        var currentAng = this.getAngle();
        this.setAngle(currentAng + angle);
    };

    this.add = function (vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    };

    this.subtract = function (vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    };

    this.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    this.divide = function (scalar) {
        return this.multiply(1 / scalar);
    };

    this.rotate = function (angle) {
        var result = new Vector(this.x, this.y);
        result.rotateBy(angle);
        return result;
    };

    this.setAngle = function (angle) {
        var length = this.getLength();
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    };

    this.getAngle = function () {
        return Math.atan2(this.y, this.x);
    };

    this.setLength = function (length) {
        var angle = this.getAngle();
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    };

    this.getLength = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    this.getUnit = function () {
        return this.divide(this.getLength());
    };

    this.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    this.projectionOnto = function (vector) {
        var result = this.dot(vector) / vector.getLength();
        return vector.getUnit().multiply(result);
    };

    this.xComponent = function () {
        return new Vector(this.x, 0);
    };

    this.yComponent = function () {
        return new Vector(0, this.y);
    };
}

const GROUND_FRICTION = 0.8;
const AIR_RESISTANCE = 0.8;
var RUN_SPEED = 8.0;
const JUMP_POWER = 25.0;
const GRAVITY = 1.0;
const TERMINAL_VELOCITY = 10;

var jumperX = 75, jumperY = 75;
var jumperSpeedX = 0, jumperSpeedY = 0;
var jumperOnGround = false;
var JUMPER_RADIUS = 10;
var jumperDrag; // set in Main.js

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_SPACE = 32;
var holdLeft = false;
var holdRight = false;

function jumperMove() {
    if(holdLeft) {
        jumperSpeedX = -RUN_SPEED;
    }
    if(holdRight) {
        jumperSpeedX = RUN_SPEED;
    }

    if(jumperOnGround) {
        jumperSpeedX *= GROUND_FRICTION;
    } else {
        jumperSpeedX *= AIR_RESISTANCE;
        // jumperSpeedY += GRAVITY;
        if(jumperSpeedY > JUMPER_RADIUS) { // cheap test to ensure can't fall through floor
            jumperSpeedY = JUMPER_RADIUS;
        }
    }

    jumperSpeedY += GRAVITY;

    // vertical collisions
    if(jumperSpeedY > 0) {
        // falling
        if(isBrickAtPixelCoord(jumperX + camPanX, jumperY + JUMPER_RADIUS)) {
            // hit ground
            jumperOnGround = true;
            jumperSpeedY = 0;
            jumperY = (Math.floor(jumperY / BRICK_H) + 1) * BRICK_H - JUMPER_RADIUS * 0.75; // keep the edge on the ground, don't sink down
        } else {
            jumperOnGround = false;
            // jumperY += jumperSpeedY;
        }
    } else if(jumperSpeedY < 0) {
        // jumping
        if(!isBrickAtPixelCoord(jumperX + camPanX, jumperY - JUMPER_RADIUS)) {
            // jumperY += jumperSpeedY;
            jumperOnGround = false;
        } else {
            jumperSpeedY = 0;
            jumperOnGround = false;
        }
    }

    // horizontal collisions
    if(!isBrickAtPixelCoord(jumperX + jumperSpeedX + camPanX + (Math.sign(jumperSpeedX) * JUMPER_RADIUS * 0.5), jumperY)) {
        // jumperX += jumperSpeedX;
    } else {
        jumperSpeedX = 0;
        // jumperX = (Math.floor(jumperX / BRICK_W) + 1) * BRICK_W - JUMPER_RADIUS;
    }        

    jumperX -= camPanSpeed; // move with slider (not necessary mechanic, a bit harder)

    if(jumperX < -BRICK_W * 0.5) {
        camPanSpeed = 0; // stop game if you fall behind screen
    }


    jumperX += Math.min(jumperSpeedX, TERMINAL_VELOCITY);
    jumperY += Math.min(jumperSpeedY, TERMINAL_VELOCITY);
}
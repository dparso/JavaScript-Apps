
// warrior movement
const GROUNDSPEED_DECAY = 0.94;
const DRIVE_POWER = 8;
const REVERSE_POWER = 0.3;
const TURN_RATE = 0.08;
const MIN_SPEED_TO_TURN = 0.3;



function warriorClass(image, name) {
    // positions
    this.x = 75;
    this.y = 75;
    this.angle = 0;
    this.speed = 2;
    this.keys = 0;

    this.keyHeld_Gas = false;
    this.keyHeld_Reverse = false;
    this.keyHeld_TurnLeft = false;
    this.keyHeld_TurnRight = false;

    this.controlKeyLeft;
    this.controlKeyUp;
    this.controlKeyRight;
    this.controlKeyDown;

    this.setupInput = function(leftKey, upKey, rightKey, downKey) {
        this.controlKeyLeft = leftKey;            
        this.controlKeyUp = upKey;
        this.controlKeyRight = rightKey;
        this.controlKeyDown = downKey;
    }

    this.img = image;
    this.name = name;

    this.reset = function() {
        for(var row = 0; row < TILE_ROWS; row++) {
            for(var col = 0; col < TILE_COLS; col++) {
                if(tracks[row][col] == TILE_START) {
                    tracks[row][col] = 0;
                    this.x = col * TILE_W + TILE_W / 2;
                    this.y = row * TILE_H + TILE_H / 2;
                    this.angle = -Math.PI / 2; // -90 * Math.PI / 180.0 in degrees
                    this.speed = 2;
                    return;
                } // end of if
            } // end of col
        } // end of row
    } // end of warriorReset

    this.move = function() {
        // this.speed *= GROUNDSPEED_DECAY;
        // potentially allow sliding 
        var changeX = 0;
        var changeY = 0;

        if(this.keyHeld_Gas) {
            changeY = -DRIVE_POWER;
        }

        if(this.keyHeld_Reverse) {
            changeY = DRIVE_POWER;
        }

        if(this.keyHeld_TurnLeft) {
            changeX = -DRIVE_POWER;
        }
        if(this.keyHeld_TurnRight) {
            changeX = DRIVE_POWER;
        }
        this.x += changeX;
        this.y += changeY;

        if(!collisionHandling(this)) {
            // undo change if colliding
            this.x -= changeX;
            this.y -= changeY;
        }
    }

    this.draw = function() {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle);
    }
}

function posToGrid(xPos, yPos) {
    // return coordinates corresponding to which track the mouse is over
    var gridX, gridY;

    gridX = Math.floor(xPos / TILE_W);
    gridY = Math.floor(yPos / TILE_H);

    return {col: gridX, row: gridY};
}
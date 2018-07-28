
// car movement
const GROUNDSPEED_DECAY = 0.94;
const DRIVE_POWER = 0.5;
const REVERSE_POWER = 0.3;
const TURN_RATE = 0.08;
const MIN_SPEED_TO_TURN = 0.3;



function carClass(image, name) {
    // positions
    this.x = 75;
    this.y = 75;
    this.angle = 0;
    this.speed = 2;

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
        for(var row = 0; row < TRACK_ROWS; row++) {
            for(var col = 0; col < TRACK_COLS; col++) {
                if(tracks[row][col] == TRACK_START) {
                    tracks[row][col] = 0;
                    this.x = col * TRACK_W + TRACK_W / 2;
                    this.y = row * TRACK_H + TRACK_H / 2;
                    this.angle = -Math.PI / 2; // -90 * Math.PI / 180.0 in degrees
                    this.speed = 2;
                    startPositions.push([row, col]);
                    return;
                } // end of if
            } // end of col
        } // end of row
    } // end of carReset

    this.move = function() {
        this.speed *= GROUNDSPEED_DECAY;

        if(this.keyHeld_Gas) {
            if(this.name == "Player 2") {
                this.speed += DRIVE_POWER;
            } else {
                this.speed += DRIVE_POWER;
            }
        }
        if(this.keyHeld_Reverse) {
            this.speed -= REVERSE_POWER;
        }

        if(Math.abs(this.speed) > MIN_SPEED_TO_TURN) {
            if(this.keyHeld_TurnLeft) {
                this.angle -= TURN_RATE;
            }
            if(this.keyHeld_TurnRight) {
                this.angle += TURN_RATE;
            }
        }
        collisionHandling(this);

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    this.draw = function() {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle);
    }
}

function posToGrid(xPos, yPos) {
    // return coordinates corresponding to which track the mouse is over
    var gridX, gridY;

    gridX = Math.floor(xPos / TRACK_W);
    gridY = Math.floor(yPos / TRACK_H);

    return {col: gridX, row: gridY};
}
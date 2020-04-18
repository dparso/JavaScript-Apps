
// car movement
const GROUNDSPEED_DECAY = 0.94;
const DRIVE_POWER = 0.5;
const REVERSE_POWER = 0.3;
const TURN_RATE = 0.08;
const MIN_SPEED_TO_TURN = 0.3;
const MAX_SECONDS_ON_TILE = 2;

var carId = 0;

function CarClass(image, name) {
    // positions
    this.x = 75; // represents the CENTER of the car
    this.y = 75;
    this.tile;
    this.angle = 0;
    this.speed = 2;
    this.id = carId++;
    this.timeOnTile = 0;

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
                    this.tile = pixelToGrid(this.x, this.y);
                    this.angle = 3 * Math.PI / 2; // -90 * Math.PI / 180.0 in degrees
                    this.speed = 0;
                    startPositions.push([row, col]);
                    return;
                } // end of if
            } // end of col
        } // end of row
    } // end of carReset

    this.move = function() {
        this.speed *= GROUNDSPEED_DECAY;

        if(this.keyHeld_Gas) {
            this.speed += DRIVE_POWER;

        }
        if(this.keyHeld_Reverse) {
            this.speed -= REVERSE_POWER;
        }

        let angleChanged = false;
        let originalAngle = this.angle;
        if(Math.abs(this.speed) > MIN_SPEED_TO_TURN) {
            if(this.keyHeld_TurnLeft) {
                this.angle -= TURN_RATE;
                if(this.angle < 0) {
                    this.angle = 2 * Math.PI - this.angle;
                }
                angleChanged = true;
            }
            if(this.keyHeld_TurnRight) {
                this.angle += TURN_RATE;
                this.angle %= 2 * Math.PI;
                angleChanged = true;
            }
        }

        if(!collisionHandling(this)) {
            // this.angle = originalAngle;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        var newTile = pixelToGrid(this.x, this.y);
        if(gridInRange(newTile.row, newTile.col) && gridInRange(this.tile.row, this.tile.col)) {
            if(newTile.row != this.tile.row || newTile.col != this.tile.col) {
                tiles[this.tile.row][this.tile.col].notifyCarDepart(this.id);
                tiles[newTile.row][newTile.col].notifyCarArrive(this.id);
                this.timeOnTile = 0;
            }
        }

        this.timeOnTile++;
        this.tile = newTile;
    }

    this.drive = function() {
        this.keyHeld_Gas = true;
        this.keyHeld_Reverse = false;
    }

    this.reverse = function() {
        this.keyHeld_Gas = false;
        this.keyHeld_Reverse = true;
    }

    this.noAccelerate = function() {
        this.keyHeld_Gas = false;
        this.keyHeld_Reverse = false;
    }

    this.turnLeft = function() {
        this.keyHeld_TurnLeft = true;
        this.keyHeld_TurnRight = false;
    }

    this.turnRight = function() {
        this.keyHeld_TurnLeft = false;
        this.keyHeld_TurnRight = true; 
    }

    this.noTurn = function() {
        this.keyHeld_TurnLeft = false;
        this.keyHeld_TurnRight = false;
    }

    this.collidesWith = function(car) {
        let segs = this.getSegments();
        let checkSegs = car.getSegments();
        for(var s = 0; s < segs.length; s++) {
            for(var checkS = 1; checkS < checkSegs.length; checkS++) {
                if(intersects(segs[s], checkSegs[checkS])) {
                    console.log("Yes");
                    return true;
                }
            }
        }
        return false;
    }

    this.getRotatedPoint = function(p) {
        // translate to origin, rotate, translate back
        let originX = p.x - this.x;
        let originY = p.y - this.y;

        let cos = Math.cos(this.angle);
        let sin = Math.sin(this.angle);

        let rotatedX = originX * cos - originY * sin;
        let rotatedY = originX * sin + originY * cos;

        return {x: rotatedX + this.x, y: rotatedY + this.y};
    }

    this.getPoints = function() {
        let a, b, c, d;
        a = this.getRotatedPoint({x: this.x - this.img.width / 8, y: this.y - this.img.height / 8});
        b = this.getRotatedPoint({x: this.x + this.img.width / 8, y: this.y - this.img.height / 8});
        c = this.getRotatedPoint({x: this.x + this.img.width / 8, y: this.y + this.img.height / 8});
        d = this.getRotatedPoint({x: this.x - this.img.width / 8, y: this.y + this.img.height / 8});
        return [a, b, c, d];
    }

    this.getSegments = function() {
        let segments = [];
        let pts = this.getPoints();
        let s = {a: pts[0], b: pts[1]};
        segments.push(s);
        for(var i = 1; i < pts.length; i++) {
            s = {a: pts[i], b: pts[(i + 1) % pts.length]};
            segments.push(s);
        }

        return segments;
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
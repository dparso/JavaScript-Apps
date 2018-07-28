const BALL_COUNT = 0;

function ballClass() {
    var tempRandAng = Math.random()*Math.PI*2.0;
    var tempRandSpeed = 3.0+Math.random()*5.0;

    this.speedX = Math.cos(tempRandAng)*tempRandSpeed;
    this.speedY = Math.sin(tempRandAng)*tempRandSpeed;

    this.findNewRandPosition = function() {
      this.x = Math.random()*canvas.width;
      this.y = Math.random()*canvas.height;
    }

    this.findNewRandPosition(); // note: calling that function as part of initialization

    this.move = function() {
        if(this.x < 0) { // if ball has moved beyond the left edge
            this.speedX *= -1; // reverse ball's horizontal direction
        }

        if(this.x > canvas.width) { // if ball has moved beyond the right edge
            this.speedX *= -1; // reverse ball's horizontal direction
        }

        if(this.y < 0) { // if ball has moved beyond the top edge
            this.speedY *= -1; // reverse ball's vertical direction
        }

        if(this.y > canvas.height) { // if ball has moved beyond the bottom edge
            this.speedY *= -1;
        }

        this.bounceOffWalls();

        this.x += this.speedX;
        this.y += this.speedY;
    }

    this.isOnWall = function() {
      return isWallAtPixelPosition(this.x, this.y);
    }

    this.bounceOffWalls = function() {
        var tilePos = pixelToGrid(this.x, this.y);

        // first check whether the ball is within any part of the wall
        if(tilePos.col < 0 || tilePos.col >= TILE_COLS ||
        tilePos.row < 0 || tilePos.row >= TILE_ROWS) {
            return false;
        }

        if(tiles[tilePos.row][tilePos.col] == 1) {
            // ok, so we know we overlap a wall now.
            // let's backtrack to see whether we changed rows or cols on way in
            var prevX = this.x-this.speedX;
            var prevY = this.y-this.speedY;

            var prevTileCol = Math.floor(prevX / TILE_W);
            var prevTileRow = Math.floor(prevY / TILE_H);

            var bothTestsFailed = true;
            if(prevTileCol != tilePos.col) { // must have come in horizontally
                // make sure the side we want to reflect off isn't blocked!
                if(tiles[tilePos.row][prevTileCol] != 1) {
                    this.speedX *= -1;
                    bothTestsFailed = false;
                }
            }
            if(prevTileRow != tilePos.row) { // must have come in vertically
                // make sure the side we want to reflect off isn't blocked!
                if(tiles[prevTileRow][tilePos.col] != 1) {
                    this.speedY *= -1;
                    bothTestsFailed = false;
                }
            }
            // we hit an "armpit" on the inside corner, this blocks going into it
            if(bothTestsFailed) {
                  this.speedX *= -1;
                  this.speedY *= -1;
            }
        }
    }

    this.draw = function() {
        drawCircle(this.x, this.y, 2, 'white');
    }
} // end of ball class

function createEveryBall() {
    for(var i = 0; i < BALL_COUNT; i++) {
        ballList.push(new ballClass());
        while(ballList[i].isOnWall()) {
            ballList[i].findNewRandPosition();
        }
    }
}

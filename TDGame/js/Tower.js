// tower movement
const TOWER_FIRE_RATE = 1; // per second
var TOWER_ID = 0;

function TowerClass(image) {
    // positions
    this.x = 220;
    this.y = 140;
    this.angle = 0;
    this.range = 2;
    this.id = TOWER_ID++;
    this.timeSinceAttack = 0;

    this.img = image;

    this.reset = function() {
        // setInterval(this.attack, 1000 / TOWER_FIRE_RATE);
        this.target = monsterList[0];
        // for(var row = 0; row < TILE_ROWS; row++) {
        //     for(var col = 0; col < TILE_COLS; col++) {
        //         if(tiles[row][col] == TILE_START) {
        //             tiles[row][col] = 0;
        //             this.x = col * TILE_W + TILE_W / 2;
        //             this.y = row * TILE_H + TILE_H / 2;
        //             return;
        //         } // end of if
        //     } // end of col
        // } // end of row
    } // end of towerReset

    this.move = function() {
        this.track({x: this.target.x, y: this.target.y});

        if(this.timeSinceAttack > (1000 / fps) / TOWER_FIRE_RATE) {
            this.attack();
            this.timeSinceAttack = 0;
        }
        this.timeSinceAttack++;
    }

    this.track = function(point) {
        this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    }

    this.attack = function() {
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.target, PROJECTILE_TYPE_1);
        projectileList.push(projectile);
    }

    this.draw = function() {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle);
    }
}

function createTowers() {
    var tower = new TowerClass(tower1Pic);
    tower.reset();
    towerList.push(tower);
}
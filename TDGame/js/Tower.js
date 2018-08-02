// tower movement
const TOWER_FIRE_RATE = 1; // per second
var TOWER_ID = 0;

function TowerClass(image) {
    // positions
    this.x = 220;
    this.y = 140;
    this.angle = 0;
    this.range = 3;
    this.id = TOWER_ID++;
    this.timeSinceAttack = (1000 / fps) / TOWER_FIRE_RATE; // allow immediate firing
    this.active = false; // drag & drop shouldn't be firing
    this.visible = false;

    this.img = image;

    this.reset = function() {
        this.findTarget();
        this.active = false; // might not want this here
    } // end of towerReset

    this.findTarget = function() {
        // for now, targets based on physical proximity
        var tilePos = pixelToGrid(this.x, this.y);
        // iterate through tiles in range and find a target
        for(var row = tilePos.row - this.range; row <= tilePos.row + this.range; row++) {
            for(var col = tilePos.col - this.range; col <= tilePos.col + this.range; col++) {
                if(gridInRange(row, col)) {
                    var tile = StateController.currLevel.tiles[row][col];
                    if(tile.hasMonsters()) {
                        this.target = monsterList[tile.monstersOnTile.values().next().value];
                        return;                       
                    }
                }
            }
        }
    }

    this.move = function() {
        if(!this.active) {
            return;
        }

        // is locally set
        if(this.target) {
            // is alive
            if(this.target.health > 0) {
                // check if target has moved out of range
                if(Math.abs(this.target.x - this.x) > TILE_W * this.range || Math.abs(this.target.y - this.y) > TILE_H * this.range) {
                    this.target = null;
                } else {
                    this.track({x: this.target.x, y: this.target.y});
                    if(this.timeSinceAttack > (1000 / fps) / TOWER_FIRE_RATE) {
                        this.attack();
                        this.timeSinceAttack = 0;
                    }
                }
            } else {
                this.findTarget();       
            }
        } else {
            this.findTarget();
        }
        this.timeSinceAttack++;
    }

    this.track = function(point) {
        this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    }

    this.attack = function() {
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.target, PROJECTILE_TYPE_1);
        projectileList[projectile.id] = projectile;
    }

    this.draw = function() {
        if(this.visible) {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle);
        }
    }
}

function createTowers() {
    // var tower = new TowerClass(tilePics[TILE_TOWER_1]);
    // tower.reset();
    // tower.active = true;
    // towerList[tower.id] = tower;

    // var tower2 = new TowerClass(tilePics[TILE_TOWER_2]);
    // tower2.reset();
    // tower2.active = true;
    // towerList[tower2.id] = tower2;
}
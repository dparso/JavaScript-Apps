// tower properties
var TOWER_ID = 0;
var towerRanges = [3, 5];
var towerDamages = [3.0, 1.0];
var towerAttackSpeeds = [1, 5];
var towerCosts = [2, 1];

function TowerClass(image, type) {
    // positions
    this.x;
    this.y;
    this.currTile;

    this.angle = 0;
    this.range = towerRanges[type];
    this.attackSpeed = towerAttackSpeeds[type];
    this.damage = towerDamages[type];
    this.type = type;

    this.id = TOWER_ID++;
    this.timeSinceAttack = (1000 / fps) / this.attackSpeed; // allow immediate firing
    this.active = false; // drag & drop shouldn't be firing
    this.visible = false;

    this.classType = "tower";

    this.img = image;

    this.reset = function() {
        this.currTile = pixelToGrid(this.x, this.y);
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
                if(Math.abs(this.target.currTile.row - this.currTile.row) > this.range || Math.abs(this.target.currTile.col - this.currTile.col) > this.range) {
                    this.target = null;
                } else {
                    this.track({x: this.target.x + TILE_W / 2, y: this.target.y + TILE_H / 2});
                    if(this.timeSinceAttack > (1000 / fps) / this.attackSpeed) {
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
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.target, this.type, this.damage);
        projectileList[projectile.id] = projectile;
    }

    this.draw = function() {
        if(this.visible) {
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle);
        }
    }
}
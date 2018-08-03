const PROJECTILE_SPEED = 15;
const PROJECTILE_TYPE_1 = 1;
const PROJECTILE_TYPE_1_DAMAGE = 1;

const PROJECTILE_DISPLAY_RADIUS = 4;
var PROJECTILE_ID = 0;

var projectileSpeeds = [15, 30]; // note: faster speeds means less reliable hitboxes in hitTarget()
var splashes = [1, 0]; // does it deal splash
var splashRatios = [0.5, 0]; // how much of original damage does it deal
var splashRange = [2, 0]; // how many tiles does it cover

function ProjectileClass(start, target, type, damage) {
    // positions
    this.start = start;
    this.x = start.x;
    this.y = start.y;
    this.angle = 0;
    this.target = target;
    this.type = type;
    this.id = PROJECTILE_ID++;
    this.visible = true;
    this.damage = damage;
    this.speed = projectileSpeeds[type];
    
    this.classType = "projectile";


    this.move = function() {
        if(this.visible) {
            // change angle
            // this.track({x: this.target.x, y: this.target.y});

            // move closer
            // this will track (to not track, calculate a velocity to start, and stick with it)

            // opportunity for efficiency here -- lots of complex math
            var changeX = (this.target.x + TILE_W / 2) - this.x;
            var changeY = (this.target.y + TILE_H / 2) - this.y;

            var magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

            var xDir = changeX / magnitude;
            var yDir = changeY / magnitude;

            this.x += xDir * this.speed;
            this.y += yDir * this.speed;

            if(this.hitTarget()) {
                // monster might have died in travel time
                if(this.target.health > 0) {
                    monsterList[this.target.id].hitWithProjectile(this.damage);
                }

                if(splashes[this.type]) {
                    var thisTile = pixelToGrid(this.x, this.y);

                    // apply splash to every nearby tile
                    for(var row = thisTile.row - splashRange[this.type]; row <= thisTile.row + splashRange[this.type]; row++) {
                        for(var col = thisTile.col - splashRange[this.type]; col <= thisTile.col + splashRange[this.type]; col++) {    
                            if(!gridInRange(row, col)) continue;

                            var targetTile = StateController.currLevel.tiles[row][col];
                            // apply to all monsters on that tile
                            if(targetTile.hasMonsters()) {
                                targetTile.monstersOnTile.forEach(
                                    ((monster) => {
                                        monsterList[monster].hitWithProjectile(this.damage * splashRatios[this.type]);
                                    })
                                );
                            }
                        }
                    }
                }

                this.die(); // always disappear
            }
        }
    }

    this.hitTarget = function() {
        return Math.abs((this.target.y + TILE_H / 2) - this.y) < 30 && Math.abs((this.target.x + TILE_W / 2) - this.x) < 30;
    }

    // this.track = function(point) {
        // this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    // }

    this.draw = function() {
        if(this.visible) {
            drawCircle(this.x, this.y, PROJECTILE_DISPLAY_RADIUS, 'black');
        }
    }

    this.die = function() {
        delete projectileList[this.id];
    }
}

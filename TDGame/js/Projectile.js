const PROJECTILE_TYPE_1 = 0;
const PROJECTILE_TYPE_2 = 1;
const PROJECTILE_TYPE_3 = 2;
const PROJECTILE_TYPE_4 = 2;

// const PROJECTILE_DISPLAY_RADIUS = [4, 2, 10]; // [cannon, shooter]
var PROJECTILE_ID = [0, 0];

var projectileSpeeds = [15, 30, 5, 10]; // note: faster speeds means less reliable hitboxes in hitTarget()
var splashes = [1, 0, 0, 1]; // does it deal splash
var splashRatios = [0.75, 0, 0, 0.9]; // how much of original damage does it deal
var splashRange = [3, 0, 0, 2]; // how many tiles does it cover

function ProjectileClass(start, target, type, damage, parent, context) {
    // positions
    this.start = start;
    this.x = start.x;
    this.y = start.y;
    this.context = context;
    this.id = PROJECTILE_ID[this.context]++;
    this.parentId = parent; // which tower fired

    this.angle = 0;
    this.target = target;
    this.type = type;
    this.visible = true;
    this.damage = damage;
    this.speed = projectileSpeeds[type];
    
    this.img = projectilePics[type];
    this.classType = "projectile"; // really don't need this

    // this could be better organize; for now, only the glaive thrower will use these variables
    var xVel = null, yVel = null;
    var hits = 50; // maximum hits per glaive

    this.move = function() {
        if(this.visible) {
            if(this.type == PROJECTILE_TYPE_3) {
                if(xVel == null) {
                    // calculate initial velocity
                    var changeX = (this.target.x + TILE_W / 2) - this.x;
                    var changeY = (this.target.y + TILE_H / 2) - this.y;

                    var magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

                    xVel = changeX / magnitude;
                    yVel = changeY / magnitude;
                }
                this.x += xVel * this.speed;
                this.y += yVel * this.speed;

                var tilePos = pixelToGrid(this.x, this.y);

                // out of bounds?
                if(!gridInRange(tilePos.row, tilePos.col)) {
                    this.die();
                    return;
                }

                // hit something?
                // console.log(tilePos);
                var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
                // console.log("+" + tile);
                if(tile.hasMonsters()) {
                    // hit them all!
                    tile.monstersOnTile.forEach(
                        ((monster) => {
                            if(!hits) {
                                this.die();
                                return;
                            }
                            var obj = monsterList[this.context][monster];
                            if(obj.hitWithProjectile(this.damage)) {
                                StateController.notifyTowerKilledMonster(this.parentId, this.context, obj.type);
                            }
                            hits--;
                        })
                    );
                }

            } else {
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
                        if(this.target.hitWithProjectile(this.damage)) {
                            StateController.notifyTowerKilledMonster(this.parentId, this.context, this.target.type);
                        }
                    }

                    if(splashes[this.type]) {
                        var thisTile = pixelToGrid(this.x, this.y);

                        // apply splash to every nearby tile
                        for(var row = thisTile.row - splashRange[this.type]; row <= thisTile.row + splashRange[this.type]; row++) {
                            for(var col = thisTile.col - splashRange[this.type]; col <= thisTile.col + splashRange[this.type]; col++) {    
                                if(!gridInRange(row, col)) continue;

                                var targetTile = StateController.currLevel.tiles[this.context][row][col];
                                // apply to all monsters on that tile
                                if(targetTile.hasMonsters()) {
                                    targetTile.monstersOnTile.forEach(
                                        ((monster) => {
                                            var obj = monsterList[this.context][monster];
                                            if(obj.hitWithProjectile(this.damage * splashRatios[this.type])) {
                                                StateController.notifyTowerKilledMonster(this.parentId, this.context, obj.type);
                                            }
                                        })
                                    );
                                } // end of hasMonsters
                            } // end of col
                        } // end of row
                    } // end of splash

                    this.die(); // always disappear
                } // end of hitTarget()
            } // end of else, !type 3
        } // end of visible
    } // end of move()

    this.hitTarget = function() {
        return Math.abs((this.target.y + TILE_H / 2) - this.y) < 30 && Math.abs((this.target.x + TILE_W / 2) - this.x) < 30;
    }

    // this.track = function(point) {
        // this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    // }

    this.draw = function() {
        if(this.visible) {
            // ctx[this.context].drawImage(this.img, this.x, this.y);
            drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle % 360, this.context); // randomize angle
            this.angle += 1;
        }
    }

    this.die = function() {
        if(this.type == PROJECTILE_TYPE_1) {
            // explode!
            makeAnimation(EXPLOSION, this.target.x + TILE_W / 2, this.target.y + TILE_H / 2, 0, this.context);
        }
        delete projectileList[this.context][this.id];
    }
}

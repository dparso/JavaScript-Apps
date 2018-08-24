const PROJECTILE_TYPE_1 = 0;
const PROJECTILE_TYPE_2 = 1;
const PROJECTILE_TYPE_3 = 2;
const PROJECTILE_TYPE_4 = 3;

const PORTAL_CIRCLING = 0;
const PORTAL_TRACKING = 1;
const PORTAL_STATIONARY = 2;
const PORTAL_LIFE = 3; // seconds
const PORTAL_CAPACITY = 3; // number of monsters it can send before disappearing

var PROJECTILE_ID = [0, 0];

// [shooter, cannon, glaive, wizard, conduit, juror, reaper, solar prince, aether]
var projectileSpeeds = [25, 15, 10, 13, 5, 20, 10, 0, 15]; // note: faster speeds means less reliable hitboxes in hitTarget()
var splashes = [0, 1, 0, 1, 0, 0, 0, 0]; // does it deal splash
var splashRatios = [[0, 0, 0, 0, 0, 0, 0],
                    [0.3, 0.3, 0.5, 0.5, 0.6, 0.7, 0.9],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0.5, 0.5, 0.6, 0.6, 0.6, 0.7, 0.7],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]]; // how much of original damage does it deal


var splashRanges = [[0, 0, 0, 0, 0, 0, 0],
                   [2, 3, 4, 4, 6, 8, 10],
                   [0, 0, 0, 0, 0, 0, 0],
                   [2, 2, 2, 2, 2, 2, 3],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0]]; // how many tiles does it cover

// glaive properties
var glaive_strengths = [5, 10, 20, 50, 200, 500, 2000];

function ProjectileClass(start, targetId, img, type, damage, speed, tier, rotates, parent, context) {
    // positions
    this.start = start;
    this.x = start.x;
    this.y = start.y;
    this.context = context;
    this.id = PROJECTILE_ID[this.context]++;
    this.parentId = parent; // which tower fired

    this.angle = 0;
    this.targetId = targetId;
    this.target = monsterList[this.context][targetId];
    this.type = type;
    this.visible = true;
    this.damage = damage;
    this.speed = speed;
    this.rotates = rotates;
    this.rotateSpeed = 1;

    this.splashRange = splashRanges[type][tier + 1];
    this.splashRatio = splashRatios[type][tier + 1];

    this.img = img;
    this.classType = "projectile"; // really don't need this
}

ProjectileClass.prototype.move = function() {
    if(this.target === undefined) {
        this.die();
        return;
    }
    
    if(this.visible) {
        // change angle
        if(this.type === JUROR) {
            this.track({x: this.target.x + TILE_W / 2, y: this.target.y + TILE_H / 2});
        }

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


        if(monsterList[this.context][this.targetId]) {
            if(this.hitTarget()) {
                // console.log("projectile " + this.type + " hitting " + this.targetId);
                // monster might have died in travel time
                if(this.target.alive) {
                    var type = this.target.type;
                    if(monsterList[this.context][this.targetId].hitWithProjectile(this.damage)) {
                        StateController.notifyTowerKilledMonster(this.parentId, this.context, type);
                    }
                }
                if(splashes[this.type]) {
                    var thisTile = pixelToGrid(this.x, this.y);

                    // apply splash to every nearby tile
                    for(var row = thisTile.row - this.splashRange; row <= thisTile.row + this.splashRange; row++) {
                        for(var col = thisTile.col - this.splashRange; col <= thisTile.col + this.splashRange; col++) {    
                            if(!gridInRange(row, col)) continue;

                            var targetTile = StateController.currLevel.tiles[this.context][row][col];
                            // apply to all monsters on that tile
                            if(targetTile.hasMonsters()) {
                                Object.keys(targetTile.monstersOnTile).forEach(
                                    ((monster) => {
                                        var type = monsterList[this.context][monster].type;
                                        if(monsterList[this.context][monster] !== undefined) {
                                            if(monsterList[this.context][monster].hitWithProjectile(this.damage * this.splashRatio)) {
                                                StateController.notifyTowerKilledMonster(this.parentId, this.context, type);
                                            }
                                        }
                                    })
                                );
                            } // end of hasMonsters
                        } // end of col
                    } // end of row
                } // end of splash

                this.die(); // always disappear
                return;
            } // end of hitTarget()
        } else {
            this.die();
            return;
        }
    } // end of visible
} // end of move()

ProjectileClass.prototype.track = function(point) {
    this.angle = Math.atan2(point.y - this.y, point.x - this.x);     
    // would like to lead the target a bit, but simply adding to this angle in the direction
    // of change doesn't work 
}

ProjectileClass.prototype.hitTarget = function() {
    return Math.abs((this.target.y + TILE_H / 2) - this.y) < 30 && Math.abs((this.target.x + TILE_W / 2) - this.x) < 30;
}

ProjectileClass.prototype.draw = function() {
    if(this.visible) {
        drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle, this.context); // randomize angle
        if(this.rotates) {
            this.angle += this.rotateSpeed;
        }
    }
}

ProjectileClass.prototype.die = function() {
    if(this.type === PROJECTILE_TYPE_2 && this.target) {
        // explode!
        makeAnimation(EXPLOSION, this.target.x + TILE_W / 2, this.target.y + TILE_H / 2, 0, this.context);
    }
    delete projectileList[this.context][this.id];
}

function StraightProjectileClass(start, targetPoint, img, type, damage, speed, hits, tier, rotates, parent, context) {
    ProjectileClass.call(this, start, -1, img, type, damage, speed, tier, rotates, parent, context);
    this.hits = hits;
    this.xVel = null, this.yVel = null;
    this.targetPoint = targetPoint;
}

StraightProjectileClass.prototype = Object.create(ProjectileClass.prototype);  
StraightProjectileClass.prototype.constructor = StraightProjectileClass; 

StraightProjectileClass.prototype.move = function() {
    if(this.xVel === null) {
        // calculate initial velocity
        var changeX = (this.targetPoint.x + TILE_W / 2) - this.x;
        var changeY = (this.targetPoint.y + TILE_H / 2) - this.y;

        var magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

        this.xVel = changeX / magnitude;
        this.yVel = changeY / magnitude;
    }

    this.x += this.xVel * this.speed;
    this.y += this.yVel * this.speed;
    // this.x += Math.cos(this.angle) * 10;
    // this.y += Math.cos(this.angle) * 10;

    var tilePos = pixelToGrid(this.x, this.y);

    // out of bounds?
    if(!gridInRange(tilePos.row, tilePos.col)) {
        this.die();
        return;
    }

    // hit something?
    var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
    if(tile.hasMonsters()) {
        // hit them all!
        Object.keys(tile.monstersOnTile).forEach(
            ((monster) => {
                if(!this.hits) {
                    this.die();
                    return;
                }
                if(monsterList[this.context][monster] !== undefined) {
                    var type = monsterList[this.context][monster].type;
                    if(monsterList[this.context][monster].hitWithProjectile(this.damage)) {
                        StateController.notifyTowerKilledMonster(this.parentId, this.context, type);
                    }
                    this.hits--;
                }
            })
        );
    }
}


function PortalClass(start, targetId, state, img, type, damage, speed, tier, rotates, parent, context) {
    ProjectileClass.call(this, start, targetId, img, type, damage, speed, tier, rotates, parent, context);

    this.state = state;
    this.currTile = StateController.currLevel.tiles[context][start.row][start.col];

    let pix = gridToPixel(start.row, start.col);
    this.center = {x: pix.x, y: pix.y};
    this.x = this.center.x;
    this.y = this.center.y;
    this.pointInMonsterPath = null;

    this.capacity = PORTAL_CAPACITY;
    this.lifeRemaining = fps * PORTAL_LIFE;

    this.targetPreviousLocation = null;
    this.teleportDistance = 15;

    // this.x = this.target.x + TILE_W / 2;
    // this.y = this.target.y + TILE_H / 2;
    this.rotateSpeed = -0.1;
    // this.circleAngle = Math.PI / 2;
}

PortalClass.prototype = Object.create(ProjectileClass.prototype);  
PortalClass.prototype.constructor = PortalClass;

PortalClass.prototype.reachedTarget = function(targetPixel) {
    return Math.abs((targetPixel.y) - this.y) < 20 && Math.abs((targetPixel.x) - this.x) < 20;
}

PortalClass.prototype.move = function() {
    if(this.state === PORTAL_CIRCLING) {
        // drawSprite(this.img, this.x, this.y, 1, 1, this.circleAngle, 1.0, this.context);
        this.circleAngle -= .1;
        // let cos = Math.cos(this.circleAngle);
        // let sin = Math.sin(this.circleAngle);

        this.x = this.center.x + Math.sin(this.circleAngle) * this.img.width;
        this.y = this.center.y + Math.cos(this.circleAngle) * this.img.width;
        // console.log(this.circleAngle % Math.PI);
        // console.log(this.x + ", " + this.y);
    } else if(this.state === PORTAL_TRACKING) {
        this.target = monsterList[this.context][this.targetId];
        if(this.target === undefined) {
            this.becomeStationary();
            return;
        }


        // lead the target
        var trackPoint = {x: this.target.x, y: this.target.y};
        if(this.targetPreviousLocation !== null) {
            if(this.targetPreviousLocation.x > this.target.x) {
                // moving left, lead -x
                trackPoint.x -= 3 * TILE_W / 2;

            } else if (this.targetPreviousLocation.x < this.target.x) {
                // moving right, lead +x
                trackPoint.x += 3 * TILE_W / 2;
            }

            if(this.targetPreviousLocation.y > this.target.y) {
                // moving up, lead -y
                trackPoint.y -= 3 * TILE_H / 2;
            } else if (this.targetPreviousLocation.y < this.target.y) {
                // moving down, lead +y
                trackPoint.y += 3 * TILE_H / 2;

            }
        }

        this.targetPreviousLocation = {x: this.target.x, y: this.target.y};

        let changeX = (trackPoint.x) - this.x;
        let changeY = (trackPoint.y) - this.y;

        let magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

        let xDir = changeX / magnitude;
        let yDir = changeY / magnitude;

        this.x += xDir * this.speed;
        this.y += yDir * this.speed;

        if(this.reachedTarget(trackPoint)) {
            this.x = trackPoint.x;
            this.y = trackPoint.y;
            this.becomeStationary();
        }
    } else {
        // wait & check for monsters on the tile
        if(this.currTile === undefined) {
            this.die();
            return;
        }
        if(this.currTile.hasMonsters()) {
            Object.keys(this.currTile.monstersOnTile).forEach(
                ((monster) => {
                    if(this.capacity <= 0) {
                        this.die();
                        return;
                    }
                    if(monsterList[this.context][monster] !== undefined && monsterList[this.context][monster].alive) {
                        // deal damage, teleport if still alive
                        var obj = monsterList[this.context][monster];
                        if(obj.hitWithProjectile(this.damage)) {
                            StateController.notifyTowerKilledMonster(this.parentId, this.context, obj.type);
                        } else {
                            this.teleportMonster(monsterList[this.context][monster].id);
                        }
                        this.capacity--;
                    }
                })
            );
        }

        this.lifeRemaining--;
        if(this.lifeRemaining <= 0) {
            this.die();
        }
    }
    this.angle -= 0.2;
}

PortalClass.prototype.teleportMonster = function(monsterId) {
    // debugger;
    let monster = monsterList[this.context][monsterId];
    if(this.pointInMonsterPath === null) {
        console.log("SEE PROJECTILE 370!");
        return;
    }

    let newIndex = Math.min(this.pointInMonsterPath + this.teleportDistance, fullMonsterPath[this.context].length - 1);
    let newTile = fullMonsterPath[this.context][newIndex].tile;
    let newPixel = gridToPixel(newTile.row, newTile.col);

    // notify tiles
    StateController.currLevel.tiles[this.context][monster.currTile.row][monster.currTile.col].notifyMonsterDepart(monster.id);
    StateController.currLevel.tiles[this.context][newTile.row][newTile.col].notifyMonsterArrive(monster.id);

    monster.x = newPixel.x;
    monster.y = newPixel.y;
    monster.currTile = newTile;

    monster.pathPosition = fullMonsterPath[this.context][newIndex].position;
}

PortalClass.prototype.becomeStationary = function() {
    this.state = PORTAL_STATIONARY;
    let gridPos = pixelToGrid(this.x, this.y);
    if(!gridInRange(gridPos.row, gridPos.col)) {
        this.die();
        return;
    }
    // console.log(this.x + ", " + this.y + ", " + gridPos);
    this.currTile = StateController.currLevel.tiles[this.context][gridPos.row][gridPos.col];

    // calculate where in the monsterPath you are
    for(var i = 0; i < fullMonsterPath[this.context].length; i++) {
        let tile = fullMonsterPath[this.context][i].tile;
        if(tile.row === this.currTile.row && tile.col === this.currTile.col) {
            this.pointInMonsterPath = i;
        }
    }
}


PortalClass.prototype.draw = function() {
    drawBitmapCenteredWithRotation(this.img, this.x + TILE_W / 2, this.y + TILE_H / 2, this.angle, this.context);
}

const PROJECTILE_TYPE_1 = 0;
const PROJECTILE_TYPE_2 = 1;
const PROJECTILE_TYPE_3 = 2;
const PROJECTILE_TYPE_4 = 3;

var PROJECTILE_ID = [0, 0];

// [shooter, cannon, glaive, wizard]
var projectileSpeeds = [25, 15, 10, 10, 5]; // note: faster speeds means less reliable hitboxes in hitTarget()
var splashes = [0, 1, 0, 1, 0]; // does it deal splash
var splashRatios = [[0, 0, 0, 0, 0, 0, 0],
                    [0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.9],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
                    [0, 0, 0, 0, 0, 0, 0]]; // how much of original damage does it deal


var splashRanges = [[0, 0, 0, 0, 0, 0, 0],
                   [2, 3, 4, 4, 6, 8, 10],
                   [0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0],
                   [2, 2, 2, 2, 2, 2, 3],
                   [0, 0, 0, 0, 0, 0, 0]]; // how many tiles does it cover

// glaive properties
var glaive_strengths = [40, 60, 80, 120, 400, 800, 1200];

function ProjectileClass(start, target, img, type, damage, speed, tier, parent, context) {
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
    this.speed = speed;

    this.splashRange = splashRanges[type][tier + 1];
    this.splashRatio = splashRatios[type][tier + 1];
    // console.log(splashRatios.length + ", " + splashRatios[0].length);
    // console.log(type + ", " + (tier + 1));
    // console.log(this.splashRange + ", " + this.splashRatio);
    
    this.img = img;
    this.classType = "projectile"; // really don't need this
}

ProjectileClass.prototype.move = function() {
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
                if(this.target.hitWithProjectile(this.damage)) {
                    StateController.notifyTowerKilledMonster(this.parentId, this.context, this.target.type);
                }
            }
            console.log(splashes[this.type]);
            if(splashes[this.type]) {
                console.log(this.splashRange + ", " + this.splashRatio);
                var thisTile = pixelToGrid(this.x, this.y);

                // apply splash to every nearby tile
                for(var row = thisTile.row - this.splashRange; row <= thisTile.row + this.splashRange; row++) {
                    for(var col = thisTile.col - this.splashRange; col <= thisTile.col + this.splashRange; col++) {    
                        if(!gridInRange(row, col)) continue;

                        var targetTile = StateController.currLevel.tiles[this.context][row][col];
                        // apply to all monsters on that tile
                        if(targetTile.hasMonsters()) {
                            targetTile.monstersOnTile.forEach(
                                ((monster) => {
                                    var obj = monsterList[this.context][monster];
                                    if(obj.hitWithProjectile(this.damage * this.splashRatio)) {
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
    } // end of visible
} // end of move()

ProjectileClass.prototype.hitTarget = function() {
    return Math.abs((this.target.y + TILE_H / 2) - this.y) < 30 && Math.abs((this.target.x + TILE_W / 2) - this.x) < 30;
}

ProjectileClass.prototype.draw = function() {
    if(this.visible) {
        // ctx[this.context].drawImage(this.img, this.x, this.y);
        drawBitmapCenteredWithRotation(this.img, this.x, this.y, this.angle % 360, this.context); // randomize angle
        this.angle += 1;
    }
}

ProjectileClass.prototype.die = function() {
    if(this.type == PROJECTILE_TYPE_2) {
        // explode!
        makeAnimation(EXPLOSION, this.target.x + TILE_W / 2, this.target.y + TILE_H / 2, 0, this.context);
    }
    delete projectileList[this.context][this.id];
}

function StraightProjectileClass(start, target, img, type, damage, speed, hits, tier, parent, context) {
    ProjectileClass.call(this, start, target, img, type, damage, speed, tier, parent, context);
    this.hits = hits;
    this.xVel = null, this.yVel = null;
}

StraightProjectileClass.prototype = Object.create(ProjectileClass.prototype);  
StraightProjectileClass.prototype.constructor = StraightProjectileClass; 

StraightProjectileClass.prototype.move = function() {
    if(this.xVel == null) {
        // calculate initial velocity
        var changeX = (this.target.x + TILE_W / 2) - this.x;
        var changeY = (this.target.y + TILE_H / 2) - this.y;

        var magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

        this.xVel = changeX / magnitude;
        this.yVel = changeY / magnitude;
    }

    this.x += this.xVel * this.speed;
    this.y += this.yVel * this.speed;
    // this.x += Math.cos(this.angle) * this.speed;
    // this.y += Math.sin(this.angle) * this.speed;

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
        tile.monstersOnTile.forEach(
            ((monster) => {
                if(!this.hits) {
                    this.die();
                    return;
                }
                var obj = monsterList[this.context][monster];
                if(obj.hitWithProjectile(this.damage)) {
                    StateController.notifyTowerKilledMonster(this.parentId, this.context, obj.type);
                }
                this.hits--;
            })
        );
    }
}

function FlowProjectileClass(start, target, img, type, damage, speed, parent, context) {
    ProjectileClass.call(this, start, target, img, type, damage, speed, parent, context);
    this.time = 0;
}

FlowProjectileClass.prototype = Object.create(ProjectileClass.prototype);  
FlowProjectileClass.prototype.constructor = FlowProjectileClass; 

FlowProjectileClass.prototype.move = function() {
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

        this.x += Math.cos(this.time) * 10;
        this.y += Math.sin(this.time) * 10;
        this.time++;

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
    } // end of visible
}
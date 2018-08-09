// tower properties
var TOWER_ID = [0, 0];

var SHOOTER = 0;
var CANNON = 1;
var GLAIVE = 2;
var WIZARD = 3;
var CONDUIT = 4;

var towerRanges = [5, 3, 3, 5, 4];
var towerDamages = [1.5, 6.0, 5.0, 20.0, 10.0];
var towerAttackSpeeds = [6, 1, 3, 5, 6];
var towerCosts = [12, 20, 50, 100, 120];
var towerNames = ["Shooter", "Cannon", "Glaive", "Wizard", "Conduit"];

const TARGET_FIRST = 0;
const TARGET_LAST = 1;
const TARGET_PRIORITIES = [TARGET_FIRST, TARGET_LAST];  
const PRIORITY_NAMES = ["first", "last"];

function towerRotates(type) {
    return type < 3;
}

// TowerClass definition & properties
function TowerClass(type, context) {
    // positions
    this.x;
    this.y;
    this.currTile;
    this.context = context;

    this.angle = 0;
    this.fireAngle = 0; // for wizards
    this.type = type;

    // upgrades
    // this.upgrades = [-1, -1, -1];
    this.tier = -1;
    this.properties = [towerDamages[type], towerRanges[type], towerAttackSpeeds[type]];

    this.id = TOWER_ID[this.context]++;
    this.timeSinceAttack = (1000 / fps) / this.properties[ATTACK_SPEED]; // allow immediate firing
    this.active = false; // drag & drop shouldn't be firing
    this.visible = false;
    this.killCount = 0;
    this.value = towerCosts[type] / 2;
    this.targets = [];
    this.targetPriority = TARGET_FIRST;

    this.classType = "tower";

    this.img = tilePics[this.type + TOWER_OFFSET_NUM];
}

// TowerClass methods
TowerClass.prototype.reset = function() {
    this.currTile = pixelToGrid(this.x, this.y);
    this.findTarget();
    this.active = false; // might not want this here
} // end of towerReset

TowerClass.prototype.getFirstTarget = function(toIndex) {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < fullMonsterPath[this.context].length; tileNum++) {
        var tilePos = fullMonsterPath[this.context][tileNum];
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                // found our target!
                this.targets[toIndex] = monsterList[this.context][tile.monstersOnTile.values().next().value];
                return;
            }
        }
    }
}

TowerClass.prototype.getLastTarget = function(toIndex) {
    // last
    for(var tileNum = fullMonsterPath[this.context].length - 1; tileNum > 0; tileNum--) {
        var tilePos = fullMonsterPath[this.context][tileNum];
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                // found our target!
                this.targets[toIndex] = monsterList[this.context][tile.monstersOnTile.values().next().value];
                return;
            }
        }
    }
}

TowerClass.prototype.findTarget = function() {
    if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }
}

TowerClass.prototype.move = function() {
    if(!this.active) {
        return;
    }

    this.findTarget(); // this is NOT necessary

    // is locally set
    if(this.targets[0]) {
        // is alive
        if(this.targets[0].health > 0) {
            // check if target has moved out of range
            if(Math.abs(this.targets[0].currTile.row - this.currTile.row) > this.properties[RANGE] || Math.abs(this.targets[0].currTile.col - this.currTile.col) > this.properties[RANGE]) {
                this.targets[0] = null;
            } else {
                this.track({x: this.targets[0].x + TILE_W / 2, y: this.targets[0].y + TILE_H / 2});
                if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
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

TowerClass.prototype.track = function(point) {
    this.angle = Math.atan2(point.y - this.y, point.x - this.x);     
    // would like to lead the target a bit, but simply adding to this angle in the direction
    // of change doesn't work   
}

TowerClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }
    for(var target = 0; target < this.targets.length; target++) {
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], this.type, dmg, projectileSpeeds[this.type], this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}

TowerClass.prototype.draw = function() {
    if(this.visible) {
        var angle = this.angle;
        if(!towerRotates(this.type)) {
            angle = 0;
        }
        drawBitmapCenteredWithRotation(this.img, this.x, this.y, angle, this.context);
        if(this.type == 3) {
            // wizard: draw fireball on staff
            drawBitmapCenteredWithRotation(animationPics[FIRE][0], this.x + 12, this.y - 5, this.fireAngle++, this.context);
            this.fireAngle %= 360;
        }
    }
}

TowerClass.prototype.inRange = function(row, col) {
    return Math.abs(row - this.currTile.row) <= this.properties[RANGE] && Math.abs(col - this.currTile.col) <= this.properties[RANGE];
}

TowerClass.prototype.notifyKilledMonster = function(type) {
    this.killCount++;
    // some sort of experience later on
}

// tells whether this tower has any upgrades available
TowerClass.prototype.canUpgrade = function() {
    return this.tier < tier_costs.length;
}

TowerClass.prototype.checkUpgrade = function() {
    if(!this.canUpgrade() && this.context == ENEMY) {
        // remove self from upgradeable
        var index = upgradeableTowers.indexOf(this.id);
        if (index > -1) {
           upgradeableTowers.splice(index, 1);
        }
    }
}

TowerClass.prototype.upgradeTier = function(prop) {
    this.tier++;
    this.value += (tier_costs[this.tier] * towerCosts[this.type]) / 2;

    // multiply
    this.properties[DAMAGE] *= upgrade_effects[DAMAGE][this.tier];
    this.properties[ATTACK_SPEED] *= upgrade_effects[ATTACK_SPEED][this.tier];
    // add
    this.properties[RANGE] += upgrade_effects[RANGE][this.tier];
}

TowerClass.prototype.cyclePriority = function() {
    this.targetPriority++;
    this.targetPriority %= TARGET_PRIORITIES.length;
}

function CannonClass(type, context) {
    TowerClass.call(this, type, context);
}

CannonClass.prototype = Object.create(TowerClass.prototype);  
CannonClass.prototype.constructor = CannonClass; 

function ShooterClass(type, context) {
    TowerClass.call(this, type, context);
}

ShooterClass.prototype = Object.create(TowerClass.prototype);  
ShooterClass.prototype.constructor = ShooterClass; 

// override to add spray attack on T5
ShooterClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    for(var target = 0; target < this.targets.length; target++) {
        if(this.tier == tier_costs.length - 1) {
            // spray!
            for(var degree = -30; degree <= 30; degree++) {
                var rad = degree * (Math.PI / 180) + this.angle;
                var xOff = Math.cos(rad) * 1000; 
                var yOff = Math.sin(rad) * 1000;
                var pro = new StraightProjectileClass({x: this.x, y: this.y}, {x: this.x + xOff, y: this.y + yOff}, this.type, dmg, projectileSpeeds[this.type], 1, this.id, this.context);
                projectileList[this.context][pro.id] = pro; 
            }
        }
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target], this.type, dmg, projectileSpeeds[this.type], this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}

function GlaiveClass(type, context) {
    TowerClass.call(this, type, context);
}

GlaiveClass.prototype = Object.create(TowerClass.prototype);  
GlaiveClass.prototype.constructor = GlaiveClass; 


// override to slow projectiles at higher tier
GlaiveClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    var speed = projectileSpeeds[this.type];
    speed -= speed * this.tier / tier_costs.length; // approaches
    var hits = glaive_strengths[this.tier + 1];
    for(var target = 0; target < this.targets.length; target++) {
        var projectile = new StraightProjectileClass({x: this.x, y: this.y}, this.targets[target], this.type, dmg, speed, hits, this.id, this.context);
        projectileList[this.context][projectile.id] = projectile;            
    }
}

function WizardClass(type, context) {
    TowerClass.call(this, type, context);
}

WizardClass.prototype = Object.create(TowerClass.prototype);  
WizardClass.prototype.constructor = WizardClass; 

// override to allow multiple targeting
WizardClass.prototype.findTarget = function() {
    if(this.tier == tier_costs.length - 1) {
        // wizard: two targets!
        this.getFirstTarget(0);
        this.getLastTarget(1);
    } else if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }
}

function ConduitClass(type, context) {
    TowerClass.call(this, type, context);
    this.moved = false;
}

ConduitClass.prototype = Object.create(TowerClass.prototype);  
ConduitClass.prototype.constructor = ConduitClass; 

ConduitClass.prototype.move = function() {
    // if(!this.moved) this.drawLightning({x: this.x, y: this.y}, {x: mouseX, y: mouseY});
    if(!this.moved) this.drawLightning({x: this.x, y: this.y}, {x: canvas[this.context].width / 2, y: canvas[this.context].height / 2});
    this.moved = true;

    // if(!this.active) {
    //     return;
    // }

    // this.findTarget(); // this is NOT necessary

    // // is locally set
    // if(this.targets[0]) {
    //     // is alive
    //     if(this.targets[0].health > 0) {
    //         // check if target has moved out of range
    //         if(Math.abs(this.targets[0].currTile.row - this.currTile.row) > this.properties[RANGE] || Math.abs(this.targets[0].currTile.col - this.currTile.col) > this.properties[RANGE]) {
    //             this.targets[0] = null;
    //         } else {
    //             if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
    //                 this.attack();
    //                 this.timeSinceAttack = 0;
    //             }
    //         }
    //     } else {
    //         this.findTarget();       
    //     }
    // } else {
    //     this.findTarget();
    // }
}

ConduitClass.prototype.attack = function() {
    // var dmg = this.properties[DAMAGE];
    // var atk = this.properties[ATTACK_SPEED];
    // if(atk > fps) {
    //     // could put this elsewhere to avoid computation every shot
    //     // maximum shots per second is fps, so allow greater firing speed by adjusting damage
    //     // solve for diff: dmg * atk = (dmg + diff) * fps
    //     var diff = dmg * atk / fps - dmg;
    //     dmg += diff;
    // }
    // for(var target = 0; target < this.targets.length; target++) {
    //     this.drawLightning({x: this.targets[target].x, y: this.targets[target].y});         
    // }
}

ConduitClass.prototype.drawLightning = function(from, to) {
    // https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas
    
    // var maxDifference = Math.abs(from.y - to.y) / 2.0;

    var light = new LightningClass(from, to, this.context);
    // light.render();
    setInterval(light.render, 10);
    // console.log("here");
    // render(from, to, maxDifference, segmentHeight, this.context);
}

//    lightning.push({x: target.x + (Math.random() - 0.9) * 10, y: target.y + (Math.random() - 0.9) * 10});

function LightningClass(source, target, context) {
    this.color = "hsl(180, 80%, 80%)";
    this.roughness = 2;
    this.maxDifference = 80; // this defines how widely the lightning will bulge/vary
    this.source = source;
    this.target = target;
    this.context = context;
    
    this.render = function() {
        // ctx[context].shadowBlur = 0;
        // ctx[context].globalCompositeOperation = "source-over";
        // ctx[context].fillRect(0, 0, 700, 700);
        // ctx[context].globalCompositeOperation = "lighter";
        // ctx[context].shadowBlur = 15;
        console.log(this.source + ", " + this.target);
        var lightning = createLightning(this.source, this.target);

        // ctx[this.context].save();
        ctx[this.context].globalCompositeOperation = "lighter";

        ctx[this.context].strokeStyle = this.color;
        ctx[this.context].shadowColor = this.color;

        ctx[this.context].fillStyle = this.color;
        ctx[this.context].fillStyle = "hsla(0, 0%, 10%, 0.2)";
        ctx[this.context].beginPath();
        for (var i = 0; i < lightning.length; i++) {
            ctx[this.context].lineTo(lightning[i].x, lightning[i].y);
        }
        ctx[this.context].stroke();
        // ctx[this.context].restore();
        // requestAnimationFrame(this.render());
    }
}

const minSegmentHeight = 5;

function createLightning(source, target) {
    var lightning = [];
    segmentHeight = Math.abs(source.y - target.y); // abs?
    lightning.push({x: source.x, y: source.y});
    lightning.push({x: target.x, y: target.y + (Math.random() - 0.9) * 50});
    var currDiff = this.maxDifference;
    while (segmentHeight > minSegmentHeight) {
        var newSegments = [];
        for (var i = 0; i < lightning.length - 1; i++) {
            var start = lightning[i];
            var end = lightning[i + 1];
            var midX = (start.x + end.x) / 2;
            var newX = midX + (Math.random() * 2 - 1) * currDiff;
            newSegments.push(start, {x: newX, y: (start.y + end.y) / 2});
        }

        newSegments.push(lightning.pop());
        lightning = newSegments;

        currDiff /= this.roughness;
        segmentHeight /= 2;
    }
    return lightning;
    }   

// render();
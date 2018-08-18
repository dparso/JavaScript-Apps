// tower properties
var TOWER_ID = [0, 0];

const SHOOTER = 0;
const CANNON = 1;
const GLAIVE = 2;
const WIZARD = 3;
const CONDUIT = 4;
const JUROR = 5;
const REAPER = 6;
const SOLAR_PRINCE = 7;
const AETHER = 8;
const GENERATOR = 9;

var REAPER_UNIQUE = [0, 0]; // only one reaper per side
var SOLAR_PRINCE_UNIQUE = [0, 0]; // only one reaper per side

const NUM_TIERS = 6;
                 // [50.0, 75.0, 120.0, 150.0, 150.0, 200.0, 750.0, 3000.0, 1000.0]

const tier_costs = [[75.0, 100.0, 175.0, 500.0, 1200.0, 8000.0], // shooter
                    [130.0, 275.0, 450.0, 1000.0, 8000.0, 30000.0], // cannon
                    [220.0, 350.0, 800.0, 2000.0, 6000.0, 42000.0], // glaive
                    [250.0, 550.0, 1400.0, 3500.0, 13500.0, 60000.0], // wizard
                    [240.0, 500.0, 2000.0, 8000.0, 14000.0, 80000.0], // conduit
                    [300.0, 1200.0, 4000.0, 23000.0, 84000.0, 240000.0], // juror
                    [1800.0, 6000.0, 20000.0, 60000.0, 150000.0, 500000.0], // reaper
                    [10000.0, 50000.0, 120000.0, 250000.0, 500000.0, 12000000.0], // solar prince
                    [2000.0, 3500.0, 6200.0, 10000.0, 28000.0, 50000.0], // aether
                    [2000.0, 3500.0, 6200.0, 10000.0, 28000.0, 50000.0]]; // generator

// if changing these, make sure that the info pane doesn't resize from the text size on the upgrade button hover
const dmg_upgrade_effects = [[5.0, 2.0, 1.75, 2.0, 2.5, 25.0], // shooter
                             [2.5, 3.0, 3.5, 4.5, 30.0, 150.0], // cannon
                             [1.5, 1.5, 2.0, 2.5, 5.0, 12.0], // glaive
                             [1.5, 2.0, 3.0, 7.0, 13.0, 80.0], // wizard
                             [1.5, 2.0, 4.0, 3.0, 5.0, 200.0], // conduit
                             [3.0, 3.5, 4.0, 12.0, 18.0, 25.0], // juror
                             [3.5, 6.0, 8.0, 10.0, 12.0, 20.0], // solar prince
                             [3.5, 6.0, 8.0, 10.0, 13.0, 18.0], // reaper
                             [3.5, 6.0, 9.0, 12.0, 15.0, 20.0], // aether
                             [3.5, 6.0, 9.0, 12.0, 15.0, 20.0]]; // generator

const rng_upgrade_effects = [[1, 0, 1, 0, 2, 1], // shooter
                             [1, 0, 1, 0, 1, 0], // cannon
                             [0, 1, 0, 0, 0, 0], // glaive
                             [1, 1, 0, 1, 0, 2], // wizard
                             [1, 1, 0, 0, 0, 2], // conduit
                             [1, 1, 0, 0, 0, 2], // juror
                             [1, 1, 0, 0, 0, 0], // solar prince
                             [1, 0, 0, 1, 0, 1], // reaper
                             [1, 1, 1, 2, 1, 1], // aether
                             [1, 1, 1, 2, 1, 1]]; // generator

const atk_upgrade_effects = [[1.5, 1.5, 2.0, 2.5, 1.5, 1.5], // shooter
                             [1.1, 1.1, 1.1, 1.1, 1.2, 1.8], // cannon
                             [1.4, 1.2, 2.0, 2.5, 2.5, 4.0], // glaive
                             [1.5, 1.5, 1.5, 1.2, 1.2, 1.0], // wizard
                             [1.5, 1.5, 1.5, 2.5, 3.5, 2.0], // conduit
                             [2.0, 1.2, 1.2, 2.0, 1.5, 1.5], // juror
                             [1.5, 1.5, 1.5, 1.5, 1.5, 1.5], // solar prince
                             [1, 1, 1, 1, 1, 1], // reaper
                             [1, 1, 1, 1, 1, 1], // aether
                             [1, 1, 1, 1, 1, 1]]; // generator

const upgrade_effects = [dmg_upgrade_effects, rng_upgrade_effects, atk_upgrade_effects];

var towerRanges = [3, 3, 2, 4, 1, 4, 2, 4, 4, 2];
var towerDamages = [2.0, 3.0, 2.0, 5.0, 7.5, 10.0, 100.0, 1000.0, 1.0, 1.0];
var towerAttackSpeeds = [1, 1, 2, 2, 3, 1, 1, 10, 2, 1];
var towerCosts = [50.0, 75.0, 120.0, 150.0, 150.0, 200.0, 750.0, 3000.0, 1000.0, 100.0];
var towerNames = ["Shooter", "Cannon", "Glaive", "Wizard", "Conduit", "Juror", "Reaper", "Solar Prince", "Aether", "Barracks"];
var towerDescriptions = ["Basic tower. Deals low single-target damage.",
                         "Slow but powerful. Deals medium area-of-effect damage.", 
                         "Shoots spinning blades that damage anything within area.", 
                         "Conjures powerful fireballs that deal area-of-effect damage.", 
                         "Shoots lighting bolts that chain across multiple foes.", 
                         "Fires strong arrows of light at multiple targets.", 
                         "Master of death. Scythe applies damage-over-time effect.", 
                         "Arbiter of light. Deals extremely high damage in a cone.",
                         "Portal master.",
                         "Trains and sends monsters on the enemy's side."];


// conduit
var lightning_strengths = [2, 2, 3, 3, 3, 3, 4];
var lightning_jump_dist = [2, 3, 5, 10, 15, 30, 80];
var lightning_jumps = [1, 3, 8, 15, 30, 80, 120];
const MAX_LIGHTNING_DIFFERENCE = 60;

// juror
var juror_num_targets = [1, 2, 3, 4, 8, 12, 20];

// reaper
var scythe_speeds = [0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4];
var reaper_dot_durations = [4, 8, 10, 12, 14, 16, 30]; // seconds
var reaper_dot_ratio = 0.75; // ratio of total damage to apply
var reaper_dot_rates = [1, 2, 3, 6, 10, 30, 80]; // rate of apply
var reaper_dot_stacks = [1, 3, 5, 10, 20, 30, 40]; // how many can be on a target

const TARGET_FIRST = 0;
const TARGET_LAST = 1;
const TARGET_PRIORITIES = [TARGET_FIRST, TARGET_LAST];  
const PRIORITY_NAMES = ["first", "last"];

function towerRotates(type) {
    return type < 3;
}

const DAMAGE = 0;
const RANGE = 1;
const ATTACK_SPEED = 2;

const TOWER_TARGET_CHECK_RATE = 2; // x times per second

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
    this.target;
    this.targetPriority = TARGET_FIRST;
    this.tilesInRange = [];
    this.timeSinceTargetCheck = 0;

    this.classType = "tower";

    this.img = towerPics[this.type + TOWER_OFFSET_NUM];
}

// TowerClass methods
TowerClass.prototype.calculateTilesInRange = function() {
    // get all the tiles in fullMonsterPath that are in range, for attack checking
    this.tilesInRange = [];
    for(var tileNum = 0; tileNum < fullMonsterPath[this.context].length; tileNum++) {
        var tilePos = fullMonsterPath[this.context][tileNum].tile;
        if(this.inRange(tilePos.row, tilePos.col)) {
            this.tilesInRange.push({tile: tilePos, index: tileNum});
        }
    }
}

TowerClass.prototype.reset = function() {
    this.currTile = pixelToGrid(this.x, this.y);
    this.findTarget();
    this.active = false; // might not want this here
} // end of towerReset

TowerClass.prototype.getFirstTarget = function(toIndex = -1) {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tilePos = this.tilesInRange[tileNum].tile;
        var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
        if(tile.hasMonsters()) {
            // found our target!
            this.target = monsterList[this.context][Object.keys(tile.monstersOnTile)[0]];
            if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log("found on tile " + tile.row + ", " + tile.col + ", index " + toIndex + ", id " + this.target.id);
            return;
        }
    }
    if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log("found nothing");
}

TowerClass.prototype.getLastTarget = function(toIndex = -1) {
    // last
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum].tile;
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                // found our target!
                this.target = monsterList[this.context][Object.keys(tile.monstersOnTile)[0]];
                return;
            }
        }
    }
}

TowerClass.prototype.findTarget = function() {
    this.target = null;
    if(this.targetPriority === TARGET_FIRST) {
        this.getFirstTarget();
    } else {
        this.getLastTarget();
    }
}

TowerClass.prototype.move = function() {
    if(!this.active) {
        return;
    }

    if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
        this.findTarget(); // this is NOT necessary to do every time, computationally speaking
        this.timeSinceTargetCheck = 0;
    }
    this.timeSinceTargetCheck++;

    // is locally set
    if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log(this.target);
    if(this.target) {
        if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log("defined");
        // check if target has moved out of range
        if(!this.inRange(this.target.currTile.row, this.target.currTile.col)) {
            this.target = null;
        } else {
            this.track({x: this.target.x + TILE_W / 2, y: this.target.y + TILE_H / 2});
            if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                this.attack();
                this.timeSinceAttack = 0;
            }
        }
    } else {
        // deleted since last frame
        if(this.type === SOLAR_PRINCE && this.context === PLAYER) console.log("finding new, gone");
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

    var projectile = new ProjectileClass({x: this.x, y: this.y}, this.target.id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, true, this.id, this.context);
    projectileList[this.context][projectile.id] = projectile;
}

TowerClass.prototype.draw = function() {
    if(this.visible) {
        var angle = this.angle;
        if(!towerRotates(this.type)) {
            angle = 0;
        }
        var xOff = 0, yOff = 0;
        // if(this.img.width > TILE_W) {
        //     xOff = (TILE_W - this.img.width) / 2;
        // }

        if(this.img.height > TILE_H) {
            yOff = (TILE_H - this.img.height) / 2;
        }

        drawBitmapCenteredWithRotation(this.img, this.x + xOff, this.y + yOff, angle, this.context);
        if(this.type === 3) {
            // wizard: draw fireball on staff
            drawBitmapCenteredWithRotation(animationPics[FIRE][0], this.x + 12, this.y - 13, this.fireAngle++, this.context);
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
    return this.tier < tier_costs[this.type].length;
}

TowerClass.prototype.checkUpgrade = function() {
    if(!this.canUpgrade() && this.context === ENEMY) {
        // remove self from upgradeable
        var index = upgradeableTowers.indexOf(this.id);
        if (index > -1) {
           upgradeableTowers.splice(index, 1);
        }
    }
}

TowerClass.prototype.upgradeTier = function(prop) {
    this.tier++;
    this.value += (tier_costs[this.type][this.tier]) / 2;

    // note: first accesses upgrade type, second which tower, third how much (based on tier)
    // multiply
    this.properties[DAMAGE] *= upgrade_effects[DAMAGE][this.type][this.tier];
    this.properties[ATTACK_SPEED] *= upgrade_effects[ATTACK_SPEED][this.type][this.tier];
    // add
    this.properties[RANGE] += upgrade_effects[RANGE][this.type][this.tier];
    if(upgrade_effects[RANGE][this.type][this.tier] > 0) {
        // range has changed: recalculate tiles in range
        this.calculateTilesInRange();
        if(this.type === SOLAR_PRINCE) this.radialSort();
    }
}

TowerClass.prototype.cyclePriority = function() {
    this.targetPriority++;
    this.targetPriority %= TARGET_PRIORITIES.length;
}



// test alternative to save/restore, from https://stackoverflow.com/questions/38069462/html5-canvas-save-and-restore-performance
function drawSprite(image, x, y, scaleX, scaleY, angle, alpha, context) {
    // var leftImg = tilePics[LIGHT_WING_LEFT];
    // var leftX = this.x - 13 * this.img.width / 10;
    // var leftY = this.y - 10 * this.img.height / 13;

    ctx[context].setTransform(scaleX, 0, 0, scaleY, image.width, image.height); // set scale and position
    ctx[context].rotate(angle);
    ctx[context].globalAlpha = alpha;
    // ctx[context].drawImage(image, 100, 100, w, h, -cx, -cy, w, h); // render the subimage
    ctx[context].drawImage(image, x, y); // render the subimage
    ctx[context].setTransform(1, 0, 0, 1, 0, 0); // set scale and position
}

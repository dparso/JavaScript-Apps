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

const tier_costs = [[75.0, 100.0, 175.0, 500.0, 1500.0, 12000.0], // shooter
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
const dmg_upgrade_effects = [[5.0, 2.0, 1.75, 2.0, 7.5, 45.0], // shooter
                             [2.5, 3.0, 3.5, 4.5, 30.0, 150.0], // cannon
                             [1.5, 1.5, 2.0, 2.5, 5.0, 12.0], // glaive
                             [1.5, 2.0, 3.0, 7.0, 13.0, 80.0], // wizard
                             [1.5, 2.0, 4.0, 3.0, 5.0, 200.0], // conduit
                             [3.0, 3.5, 4.0, 12.0, 18.0, 25.0], // juror
                             [3.5, 6.0, 8.0, 14.0, 22.0, 30.0], // reaper
                             [3.5, 6.0, 8.0, 10.0, 13.0, 18.0], // solar prince
                             [3.5, 6.0, 9.0, 12.0, 150.0, 200.0], // aether
                             [3.5, 6.0, 9.0, 12.0, 15.0, 20.0]]; // generator

const rng_upgrade_effects = [[1, 0, 1, 0, 2, 1], // shooter
                             [1, 0, 1, 0, 1, 0], // cannon
                             [0, 1, 0, 0, 0, 0], // glaive
                             [1, 1, 0, 1, 0, 2], // wizard
                             [1, 1, 0, 0, 0, 2], // conduit
                             [1, 1, 0, 0, 0, 2], // juror
                             [1, 1, 0, 0, 0, 0], // reaper
                             [1, 0, 0, 1, 0, 1], // solar prince
                             [1, 1, 1, 2, 1, 1], // aether
                             [1, 1, 1, 2, 1, 1]]; // generator

const atk_upgrade_effects = [[1.5, 1.5, 2.0, 2.5, 1.5, 1.5], // shooter
                             [1.1, 1.1, 1.1, 1.1, 1.2, 1.8], // cannon
                             [1.4, 1.2, 2.0, 2.5, 2.5, 4.0], // glaive
                             [1.5, 1.5, 1.5, 1.2, 1.2, 1.0], // wizard
                             [1.5, 1.5, 1.5, 2.5, 3.5, 2.0], // conduit
                             [2.0, 1.2, 1.2, 2.0, 1.5, 1.5], // juror
                             [1.5, 1.5, 1, 1.2, 1.2, 1.2], // reaper
                             [1, 1, 1, 1, 1, 1], // solar prince
                             [1, 1, 1, 1, 1, 1], // aether
                             [1, 1, 1, 1, 1, 1]]; // generator

const upgrade_effects = [dmg_upgrade_effects, rng_upgrade_effects, atk_upgrade_effects];

var towerRanges = [3, 3, 2, 4, 1, 4, 2, 4, 4, 2];
var towerDamages = [2.0, 3.0, 2.0, 5.0, 7.5, 10.0, 100.0, 1000.0, 1.0, 1.0];
var towerAttackSpeeds = [1, // shooter
                         1, // cannon
                         2, // glaive
                         2, // wizard
                         3, // conduit
                         1, // juror
                         1, // reaper
                         10, // solar prince
                         2, // aether
                         1]; // generator

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

const TOWER_TARGET_CHECK_RATE = 15; // x times per second

// TowerClass definition & properties
function TowerClass(type, owner) {
    // positions
    this.x;
    this.y;
    this.currTile;
    this.owner = owner;

    this.angle = 0;
    this.fireAngle = 0; // for wizards
    this.type = type;

    // upgrades
    // this.upgrades = [-1, -1, -1];
    this.tier = -1;
    this.properties = [towerDamages[type], towerRanges[type], towerAttackSpeeds[type]];

    this.id = TOWER_ID[this.owner]++;
    this.timeSinceAttack = (1000 / fps) / this.properties[ATTACK_SPEED]; // allow immediate firing
    this.active = false; // drag & drop shouldn't be firing
    this.visible = false;
    this.killCount = 0;
    this.value = towerCosts[type] / 2;
    this.targets = [];
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
    var lowerRow = Math.max(0, this.currTile.row - this.properties[RANGE]);
    var upperRow = Math.min(TILE_ROWS - 1, this.currTile.row + this.properties[RANGE]);
    
    var lowerCol = Math.max(0, this.currTile.col - this.properties[RANGE]);
    var upperCol = Math.min(TILE_COLS - 1, this.currTile.col + this.properties[RANGE]);

    for(var row = lowerRow; row <= upperRow; row++) {
        for(var col = lowerCol; col <= upperCol; col++) {
            this.tilesInRange.push(StateController.currLevel.tiles[row][col]);
        }
    }

    this.tilesInRange.sort(function(a, b) {
        return a.distanceToGoal - b.distanceToGoal;
    });
}

TowerClass.prototype.reset = function() {
    this.currTile = pixelToGrid(this.x, this.y);
    this.findTarget();
    this.active = false; // might not want this here
} // end of towerReset

// these three should be combined into one with a variable start/end index
TowerClass.prototype.getFirstTarget = function() {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tile = this.tilesInRange[tileNum];
        if(tile.hasMonsters()) {
            // found our target!
            this.targets.push(monsterList[this.owner][Object.keys(tile.monstersOnTile)[0]]);
            if(this.targets[0] === undefined) {
                debugger;
            }

            return;
        }
    }
}

TowerClass.prototype.getRandomTarget = function() {
    // act like we're finding first, then skip backward some random number between there and 0
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tile = this.tilesInRange[tileNum];
        if(tile.hasMonsters()) {
            // this is the first monster: skip forward some number of tiles
            let skipDistance = Math.floor(Math.random() * (this.tilesInRange.length - tileNum - 1));
            // from that random position, walk up finding the first random target
            while(tileNum + skipDistance < this.tilesInRange.length) {
                tile = this.tilesInRange[tileNum + skipDistance];
                if(tile.hasMonsters()) {
                    this.targets.push(monsterList[this.owner][Object.keys(tile.monstersOnTile)[0]]);
                    return;
                }
                skipDistance++;
            }
        }
    }
}

TowerClass.prototype.getLastTarget = function() {
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tile = this.tilesInRange[tileNum];
        if(this.inRange(tile.row, tile.col)) {
            if(tile.hasMonsters()) {
                // found our target!
                this.targets.push(monsterList[this.owner][Object.keys(tile.monstersOnTile)[0]]);
                return;
            }
        }
    }
}

TowerClass.prototype.findTarget = function() {
    this.targets = [];
    this.timeSinceTargetCheck = 0;
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
    }
    this.timeSinceTargetCheck++;

    // is locally set
    if(this.targets[0]) {
        // check if target has moved out of range
        if(!this.inRange(this.targets[0].currTile.row, this.targets[0].currTile.col)) {
            this.targets = [];
            this.findTarget();
        } else {
            this.track({x: this.targets[0].x + TILE_W / 2, y: this.targets[0].y + TILE_H / 2});
            if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                this.attack();
                this.timeSinceAttack = 0;
            }
        }
    } else {
        // deleted since last frame
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
        var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[target].id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, true, this.id, this.owner);
        projectileList[this.owner][projectile.id] = projectile;
    }
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

        drawBitmapCenteredWithRotation(this.img, this.x + xOff, this.y + yOff, angle);
        if(this.type === 3) {
            // wizard: draw fireball on staff
            drawBitmapCenteredWithRotation(animationPics[FIRE][0], this.x + 12, this.y - 13, this.fireAngle++);
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
    if(!this.canUpgrade() && this.owner === ENEMY) {
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
function drawSprite(image, x, y, scaleX, scaleY, angle, alpha) {
    // var leftImg = tilePics[LIGHT_WING_LEFT];
    // var leftX = this.x - 13 * this.img.width / 10;
    // var leftY = this.y - 10 * this.img.height / 13;

    ctx.setTransform(scaleX, 0, 0, scaleY, image.width, image.height); // set scale and position
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    // ctx.drawImage(image, 100, 100, w, h, -cx, -cy, w, h); // render the subimage
    ctx.drawImage(image, x, y); // render the subimage
    ctx.setTransform(1, 0, 0, 1, 0, 0); // set scale and position
}

TowerClass.prototype.damageMonstersOnTile = function(tile) {
    Object.keys(tile.monstersOnTile).forEach(
        ((monster) => {
            var obj = monsterList[this.owner][monster];
            if(obj !== undefined && obj.alive) {
                if(monsterList[this.owner][monster].hitWithProjectile(this.properties[DAMAGE])) {
                    StateController.notifyTowerKilledMonster(this.id, this.owner, obj.type);
                }
            }
        })
    );
}
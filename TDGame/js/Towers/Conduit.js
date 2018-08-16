// conduit
function ConduitClass(type, context) {
    TowerClass.call(this, type, context);

    // this.targets = [];
    this.maxJumpDistance = 50;
    this.maxJumps = 10;
    this.dampening = 0.96; // how much damage is reduced across each jump
}

ConduitClass.prototype = Object.create(TowerClass.prototype);  
ConduitClass.prototype.constructor = ConduitClass; 

ConduitClass.prototype.findChainTargets = function(fromTile, toIndex) {
    var jumps = 0;
    var jumpDistance = 0;
    var index = fromTile;
    var first = true;

    // walk down the path finding jumps
    while(jumps < lightning_jumps[this.tier + 1] && jumpDistance < lightning_jump_dist[this.tier + 1] && index < fullMonsterPath[this.context].length) {
        var pos = fullMonsterPath[this.context][index].tile;

        var tile = StateController.currLevel.tiles[this.context][pos.row][pos.col];
        Object.keys(tile.monstersOnTile).forEach(
            ((monster) => {
                if(!first) {
                    if(jumps > lightning_jumps[this.tier + 1]) {
                        return;
                    }
                    this.targets[toIndex].push(monsterList[this.context][Number(monster)]);
                    jumps++;
                } else {
                    first = false;
                }
            })
        );
        index++;
        jumpDistance++;
    }
}

ConduitClass.prototype.getFirstTarget = function(toIndex) {
    // follow the path, end -> start, and attack the first monster in range
    for(var tileNum = 0; tileNum < this.tilesInRange.length; tileNum++) {
        var tilePos = this.tilesInRange[tileNum];
        var tile = StateController.currLevel.tiles[this.context][tilePos.tile.row][tilePos.tile.col];
        if(tile.hasMonsters()) {
            // found target
            this.targets[toIndex] = [monsterList[this.context][Object.keys(tile.monstersOnTile)[0]]];
            this.findChainTargets(tilePos.index, 0);
            return;
        }
    }
}

ConduitClass.prototype.getLastTarget = function(toIndex) {
    for(var tileNum = this.tilesInRange.length - 1; tileNum > 0; tileNum--) {
        var tilePos = this.tilesInRange[tileNum].tile;
        if(this.inRange(tilePos.row, tilePos.col)) {
            var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
            if(tile.hasMonsters()) {
                this.targets[toIndex] = [monsterList[this.context][Object.keys(tile.monstersOnTile)[0]]];
                this.findChainTargets(tileNum, 0);
                return;
            }
        }
    }
}

ConduitClass.prototype.move = function() {
    // this.drawLightning({x: this.x, y: this.y}, {x: mouseX, y: mouseY}, 80, 5);

    if(!this.active) {
        return;
    }

    if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
        this.findTarget(); // this is NOT necessary to do every time, computationally speaking
        this.timeSinceTargetCheck = 0;
    }
    this.timeSinceTargetCheck++;

    // is locally set
    console.log(this.targets[0]);
    if(this.targets[0] !== undefined && this.targets[0] !== null) {
        // has targets
        if(this.targets[0].length > 0) {
            // is alive
            if(this.targets[0][0] !== null && this.targets[0][0] !== undefined) {
                if(this.targets[0][0].health > 0) {
                    // check if target has moved out of range
                    if(Math.abs(this.targets[0][0].currTile.row - this.currTile.row) > this.properties[RANGE] || Math.abs(this.targets[0][0].currTile.col - this.currTile.col) > this.properties[RANGE]) {
                        this.targets[0] = null;
                    } else if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                        this.attack();
                        this.timeSinceAttack = 0;
                    }
                } else { // dead: new target
                    this.findTarget();       
                }
            } else { // no target yet
                this.findTarget();
            }
        } else {
            this.findTarget();
        }
    }
    this.timeSinceAttack++;
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

    var start = {x: this.x, y: this.y};
    var strength = lightning_strengths[this.tier + 1];
    for(var target = 0; target < this.targets.length; target++) {
        for(var chain = 0; chain < this.targets[target].length; chain++) {
            var trgt = this.targets[target][chain];
            if(trgt === undefined) {
                continue;
            }
            if(chain > 0) strength = 2; // reduce clutter for the chain
            var tar = {x: trgt.x + TILE_W / 2, y: trgt.y + TILE_H / 2};
            // lightning gets slightly less crazy as it jumps
            this.drawLightning(start, tar, Math.max(MAX_LIGHTNING_DIFFERENCE - chain * 5, 10), strength);
            start = tar;   
            if(this.targets[target][chain].hitWithProjectile(this.properties[DAMAGE] * Math.pow(this.dampening, chain))) {
                StateController.notifyTowerKilledMonster(this.id, this.context, target.type);
            }     
        }
    }
}

ConduitClass.prototype.drawLightning = function(from, to, maxDiff, strength) {
    // https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas
    var direction = 0; // 0 corresponds to y variation, 1 to x
    if(Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
        direction = 1;
    }

    var max = Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    var segmentHeight = 50;

    render(from, to, direction, maxDiff, segmentHeight, this.context, strength, "#d3061e");
}

// light blue: #429af7
// stronger blue: #5947ff
// palpatine purple: #692baf
// evil red: #d3061e

const minSegmentHeight = 5;
const roughness = 2;
function render(source, target, direction, maxDifference, segmentHeight, context, count, color) {
    if(count <= 0) return;


    var lightning = createLightning(source, target, direction, maxDifference, segmentHeight);

    ctx[context].save();
    ctx[context].globalCompositeOperation="source-over";
    ctx[context].globalCompositeOperation = "lighter";

    ctx[context].strokeStyle = color;
    ctx[context].shadowColor = color;
    ctx[context].shadowBlur = 15;

    ctx[context].fillStyle = color;
    ctx[context].fillStyle = "hsla(0, 0%, 10%, 0.2)";
    ctx[context].beginPath();
    for (var i = 0; i < lightning.length; i++) {
        ctx[context].lineTo(lightning[i].x, lightning[i].y);
    }
    ctx[context].stroke();
    ctx[context].restore();
    requestAnimationFrame(function() {render(source, target, direction, maxDifference, segmentHeight, context, --count, color);});
}

function createLightning(source, target, direction, maxDifference, segmentHeight) {
    var lightning = [];
    lightning.push({x: source.x, y: source.y});
    lightning.push({x: target.x + (Math.random() - 0.9) * 10, y: target.y + (Math.random() - 0.9) * 10});
    var currDiff = maxDifference;
    while (segmentHeight > minSegmentHeight) {
        var newSegments = [];
        for (var i = 0; i < lightning.length - 1; i++) {
            if(direction) {
                var start = lightning[i];
                var end = lightning[i + 1];
                var midY = (start.y + end.y) / 2;
                var newY = midY + (Math.random() * 2 - 1) * currDiff;
                newSegments.push(start, {x: (start.x + end.x) / 2, y: newY});          
            } else {
                var start = lightning[i];
                var end = lightning[i + 1];
                var midX = (start.x + end.x) / 2;
                var newX = midX + (Math.random() * 2 - 1) * currDiff;
                newSegments.push(start, {x: newX, y: (start.y + end.y) / 2});
            }
        }

        newSegments.push(lightning.pop());
        lightning = newSegments;

        currDiff /= roughness;
        segmentHeight /= 2;
    }
    return lightning;
}
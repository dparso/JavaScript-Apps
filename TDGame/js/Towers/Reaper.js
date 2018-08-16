// reaper
function ReaperClass(type, context) {
    TowerClass.call(this, type, context);
    this.floatY = 0;
    this.floatX = 0;
    this.float = 0;
    this.maxFloatX = 15.0;
    this.maxFloatY = 5.0;
    this.floatXSpeed = 0.1;
    this.floatYSpeed = 0.15;
    this.floatXDirection = 1;
    this.floatYDirection = 1;

    REAPER_UNIQUE[this.context] = 1;
}

ReaperClass.prototype = Object.create(TowerClass.prototype);  
ReaperClass.prototype.constructor = ReaperClass; 

ReaperClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    scytheAnimation(this.x, this.y, 0, scythe_speeds[this.tier + 1], this.context);
    for(var tile = 0; tile < this.tilesInRange.length; tile++) {
        var t = this.tilesInRange[tile].tile;
        var targetTile = StateController.currLevel.tiles[this.context][t.row][t.col];
        // apply to all monsters on that tile
        if(targetTile.hasMonsters()) {
            Object.keys(targetTile.monstersOnTile).forEach(
                ((monster) => {
                    var obj = monsterList[this.context][monster];
                    if(obj !== undefined) {
                        if(obj.hitWithProjectile(dmg)) {
                            StateController.notifyTowerKilledMonster(this.id, this.context, obj.type);
                        } else {
                            // apply DoT
                            if(obj.towersWithDots[this.id] === undefined) {
                                var dot = new DoTClass(monster, dmg * reaper_dot_ratio, reaper_dot_rates[this.tier + 1], reaper_dot_durations[this.tier + 1], this.id, this.context);
                                obj.dots[dot.id] = dot;
                                obj.towersWithDots[this.id] = dot.id;
                                obj.reaperDot = true;
                            } else {
                                // refresh & update (probably more efficient than creating a new object)
                                var dotId = obj.towersWithDots[this.id];
                                obj.dots[dotId].time = 0;
                                obj.dots[dotId].damage = dmg * reaper_dot_ratio;
                                obj.dots[dotId].rate = reaper_dot_rates[this.tier + 1];
                                obj.dots[dotId].duration = reaper_dot_durations[this.tier + 1];
                                obj.reaperDot = true;
                            }
                        }
                    }
                })
            );
        }
    }
}

ReaperClass.prototype.draw = function() {
    if(this.visible) {
        ctx[this.context].save();
        ctx[this.context].shadowColor = 'black';
        ctx[this.context].shadowBlur = 35;
        ctx[this.context].globalAlpha = .75;

        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;

        ctx[this.context].drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);
        ctx[this.context].restore();
    }
}
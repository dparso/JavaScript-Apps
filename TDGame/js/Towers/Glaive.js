// glaive
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
    speed -= speed * this.tier / tier_costs[this.type].length; // approaches 1
    var hits = glaive_strengths[this.tier + 1];
    var projectile = new StraightProjectileClass({x: this.x, y: this.y}, {x: this.targets[0].x, y: this.targets[0].y}, projectilePics[this.type][0], this.type, dmg, speed, hits, this.tier, true, this.id, this.context);
    projectileList[this.context][projectile.id] = projectile;            
}


// cannon
function CannonClass(type, owner) {
    TowerClass.call(this, type, owner);
}

CannonClass.prototype = Object.create(TowerClass.prototype);  
CannonClass.prototype.constructor = CannonClass; 

CannonClass.prototype.attack = function() {
    var dmg = this.properties[DAMAGE];
    var atk = this.properties[ATTACK_SPEED];
    if(atk > fps) {
        // could put this elsewhere to avoid computation every shot
        // maximum shots per second is fps, so allow greater firing speed by adjusting damage
        // solve for diff: dmg * atk = (dmg + diff) * fps
        var diff = dmg * atk / fps - dmg;
        dmg += diff;
    }

    var img = projectilePics[this.type][0];
    var speed = projectileSpeeds[this.type];
    if(this.tier >= 4){
        img = projectilePics[this.type][1]; // big bomb!
        speed /= 2;
    }
    var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[0].id, img, this.type, dmg, speed, this.tier, true, this.id, this.owner);
    projectileList[this.owner][projectile.id] = projectile;            
}
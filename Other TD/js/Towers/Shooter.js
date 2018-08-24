// shooter
function ShooterClass(type, owner) {
    TowerClass.call(this, type, owner);
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

    // if(this.tier >= 4) {
    //     // spray!
    //     for(var degree = -15; degree <= 15; degree++) {
    //         var rad = degree * (Math.PI / 180) + this.angle;
    //         var xOff = Math.cos(rad) * 1000;
    //         var yOff = Math.sin(rad) * 1000;
    //         var pro = new StraightProjectileClass({x: this.x, y: this.y}, {x: this.x + xOff, y: this.y + yOff}, projectilePics[this.type][0], this.type, dmg / 2.0, projectileSpeeds[this.type], 1, this.tier, false, this.id, this.owner);
    //         projectileList[this.owner][pro.id] = pro;
    //         console.log(pro);
    //     }
    // }
    
    var projectile = new ProjectileClass({x: this.x, y: this.y}, this.targets[0].id, projectilePics[this.type][0], this.type, dmg, projectileSpeeds[this.type], this.tier, false, this.id, this.owner);
    projectileList[this.owner][projectile.id] = projectile;            
}
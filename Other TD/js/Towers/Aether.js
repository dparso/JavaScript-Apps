// aether
function AetherClass(type, owner) {
    TowerClass.call(this, type, owner);
    this.floatY = 0;
    this.floatX = 0;
    this.float = 0;
    this.maxFloatX = 15.0;
    this.maxFloatY = 5.0;
    this.floatXSpeed = 0.1;
    this.floatYSpeed = 0.15;
    this.floatXDirection = 1;
    this.floatYDirection = 1;

    // portals
    this.portalGenerationRate = 5; // per second
    this.timeSincePortalGen = 0;
    this.maxPortals = 3;
    // create three portals to spin around
    this.activePortals = [];
}

AetherClass.prototype = Object.create(TowerClass.prototype);  
AetherClass.prototype.constructor = AetherClass; 

AetherClass.prototype.addPortalToSpin = function() {
    var prevPortal = this.activePortals[this.activePortals.length - 1];
    if(this.activePortals.length < this.maxPortals) {
        var portal = new PortalClass(this.currTile, -1, PORTAL_CIRCLING, projectilePics[this.type][0], this.type, this.properties[DAMAGE], projectileSpeeds[this.type], this.tier, false, this.id, this.owner);
        portal.circleAngle = prevPortal === undefined ? 0 : prevPortal.circleAngle + (2 * Math.PI / this.maxPortals);
        prevPortal = portal;
        this.activePortals.push(portal);
    }
}

AetherClass.prototype.attack = function() {
    // Aether can only attack if he has a portal available to use
    if(this.activePortals.length > 0) {
        var portal = this.activePortals.shift();
        portal.state = PORTAL_TRACKING;
        portal.targetId = this.targets[0].id;
        projectileList[this.owner][portal.id] = portal;
    }
}

AetherClass.prototype.move = function() {
    if(!this.active) {
        return;
    }

    if(this.timeSincePortalGen > 1000 / fps / this.portalGenerationRate) {
        this.addPortalToSpin();
        this.timeSincePortalGen = 0;
    }

    if(this.timeSinceTargetCheck > 1000 / fps / TOWER_TARGET_CHECK_RATE) {
        this.findTarget(); // this is NOT necessary to do every time, computationally speaking
        this.timeSinceTargetCheck = 0;
    }

    // is locally set
    if(this.targets[0]) {
        // check if target has moved out of range
        if(!this.inRange(this.targets[0].currTile.row, this.targets[0].currTile.col)) {
            this.targets = [];
        } else {
            this.track({x: this.targets[0].x + TILE_W / 2, y: this.targets[0].y + TILE_H / 2});
            if(this.timeSinceAttack > (1000 / fps) / this.properties[ATTACK_SPEED]) {
                this.attack();
                this.timeSinceAttack = 0;
            }
        }
    } else {
        // deleted in the mean time
        this.findTarget();
    }

    for(var i = 0; i < this.activePortals.length; i++) {
        this.activePortals[i].move(true);
    }

    this.timeSinceAttack++;
    this.timeSinceTargetCheck++;
    this.timeSincePortalGen++;
}

AetherClass.prototype.draw = function() {
    if(this.visible) {
        ctx.save();
        // this whole process is inefficient but produces an incredible sparkling effect
        ctx.translate(this.x, this.y);
        ctx.scale(0.2, 0.2);
        ctx.shadowColor = 'purple';
        ctx.shadowBlur = 35;
        ctx.globalAlpha = .75;

        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;
        // ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);

        ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
        ctx.restore();

        for(var i = 0; i < this.activePortals.length; i++) {
            this.activePortals[i].draw(true);
        }
    }
}

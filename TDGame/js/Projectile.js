const PROJECTILE_SPEED = 15;
const PROJECTILE_TYPE_1 = 1;
const PROJECTILE_TYPE_1_DAMAGE = 1;

const PROJECTILE_DISPLAY_RADIUS = 3;
var PROJECTILE_ID = 0;

function ProjectileClass(start, target, type) {
    // positions
    this.start = start;
    this.time = 0;
    this.x = start.x;
    this.y = start.y;
    this.angle = 0;
    this.target = target;
    this.type = type;
    this.id = PROJECTILE_ID++;
    this.visible = true;
    this.damage = 

    this.move = function() {
        if(this.visible) {
            // change angle
            this.track({x: this.target.x, y: this.target.y});

            // move closer
            // this will track (to not track, calculate a velocity to start, and stick with it)

            // opportunity for efficiency here -- lots of complex math
            var changeX = this.target.x - this.x;
            var changeY = this.target.y - this.y;
            var magnitude = Math.sqrt(Math.abs(changeX * changeX + changeY * changeY));

            var xDir = changeX / magnitude;
            var yDir = changeY / magnitude;

            this.x += xDir * PROJECTILE_SPEED;
            this.y += yDir * PROJECTILE_SPEED;

            if(this.hitTarget()) {
                // monster might have died in travel time
                if(this.target.health > 0) {
                    monsterList[this.target.id].hitWithProjectile(PROJECTILE_TYPE_1_DAMAGE);
                }
                this.die();
            }
            this.time++;
        }
    }

    this.hitTarget = function() {
        return Math.abs(this.target.y - this.y) < 10 && Math.abs(this.target.x - this.x) < 10;
    }

    this.track = function(point) {
        this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    }

    this.draw = function() {
        if(this.visible) {
            drawCircle(this.x, this.y, PROJECTILE_DISPLAY_RADIUS, 'orange');
        }
    }

    this.die = function() {
        delete projectileList[this.id];
    }
}

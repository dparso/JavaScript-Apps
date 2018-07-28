const PROJECTILE_SPEED = 1/3; // for now, this means the projectile travels 1/3 amount of the distance on each frame
const PROJECTILE_TYPE_1 = 1;
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

    this.move = function() {
        if(this.visible) {
            // change angle
            this.track({x: this.target.x, y: this.target.y});

            // move closer
            // this will track (to not track, calculate a velocity to start, and stick with it)
            var changeX = this.target.x - this.x;
            var changeY = this.target.y - this.y;
            // var changeX = this.target.x - this.x;
            // var changeY = this.target.y - this.y;
            //  xn = x0 + v * t * cos(theta)
            //  yn = y0 + v * t * sin(theta)
            this.x += changeX * PROJECTILE_SPEED;
            this.y += changeY * PROJECTILE_SPEED;
            // if(this.id == 0) {
            //     console.log("cos " + Math.cos(this.angle));  
            // }

            // this.x += PROJECTILE_SPEED * this.time * Math.cos(this.angle);
            // this.y += PROJECTILE_SPEED * this.time * Math.sin(this.angle);

            if(this.hitTarget()) {
                this.visible = false;
            }
            this.time++;
        }
    }

    this.hitTarget = function() {
        return Math.abs(this.target.y - this.y) < 10 && Math.abs(this.target.x - this.x) < 10;
    }

    this.track = function(point) {
        // console.log("angle " + this.angle);
        this.angle = Math.atan2(point.y - this.y, point.x - this.x);        
    }

    this.draw = function() {
        // console.log(this.visible);
        if(this.visible) {
            drawCircle(this.x, this.y, PROJECTILE_DISPLAY_RADIUS, 'white');
        }
    }
}

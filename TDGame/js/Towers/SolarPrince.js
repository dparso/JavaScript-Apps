// solar prince
function SolarPrinceClass(type, context) {
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
    this.yPerspective; // middle of chest

    this.leftWingAngle = 0;
    this.rightWingAngle = 0;

    this.attackAngle = 15;
    this.maxJumpDistance = 50;
    this.maxJumps = 10;
    this.dampening = 0.96; // how much damage is reduced across each jump
    this.tilesInRadialOrder = [];

    SOLAR_PRINCE_UNIQUE[this.context] = 1;
}

SolarPrinceClass.prototype = Object.create(TowerClass.prototype);  
SolarPrinceClass.prototype.constructor = SolarPrinceClass; 

SolarPrinceClass.prototype.radialSort = function() {
    // order tiles in range based on angle relative to tower (chest)
    this.yPerspective = this.y - 0.5 * this.img.height;
    this.tilesInRadialOrder = [];
    for(var tile = 0; tile < this.tilesInRange.length; tile++) {
        var t = this.tilesInRange[tile].tile;
        var pix = gridToPixel(t.row, t.col);
        var angle = trueAngleBetweenPoints({x: this.x, y: this.yPerspective}, {x: pix.x, y: pix.y});
        this.tilesInRadialOrder.push({tile: this.tilesInRange[tile], angle: angle});
    }

    this.tilesInRadialOrder.sort(function(a, b) {
        return a.angle - b.angle;
    });
}

SolarPrinceClass.prototype.draw = function() {
    if(this.visible) {
        this.floatX += this.floatXSpeed;
        this.floatY += this.floatYSpeed;
        this.x += Math.cos(this.floatX) / 4;
        this.y += Math.sin(this.floatY) / 4;

        var leftImg = towerPics[LIGHT_WING_LEFT];
        var leftX = this.x - 19 * this.img.width / 10;
        var leftY = this.y - 5 * this.img.height / 10;
        var rightImg = towerPics[LIGHT_WING_RIGHT];
        var rightX = this.x - this.img.width / 2;
        var rightY = this.y - 5 * this.img.height / 10;

        var wingSpeed = 10; // lower is faster
        var flapsPerHover = 1.0; // number of times the wings flap per time the figure completes a period

        ctx[this.context].save();
        ctx[this.context].shadowColor = 'gold';
        ctx[this.context].shadowBlur = 35;
        ctx[this.context].globalAlpha = 0.60;

        ctx[this.context].save();
        ctx[this.context].translate(leftX + 3 * leftImg.width / 2, leftY);
        ctx[this.context].rotate(Math.cos(this.leftWingAngle - Math.PI) / wingSpeed);
        ctx[this.context].drawImage(leftImg, -leftImg.width, -leftImg.height / 2);
        ctx[this.context].restore(); // undo translate

 

        ctx[this.context].save();
        ctx[this.context].translate(rightX + rightImg.width / 2, rightY);
        ctx[this.context].rotate(Math.cos(this.rightWingAngle - 2 * Math.PI) / wingSpeed);
        ctx[this.context].drawImage(rightImg, 0, -rightImg.height / 2);
        ctx[this.context].restore(); // undo translate

        ctx[this.context].drawImage(this.img, this.x - this.img.width / 2 + 1, this.y - this.img.height / 2 - TILE_H - 2);
        ctx[this.context].restore(); // undo blur & alpha

        this.leftWingAngle += flapsPerHover * this.floatYSpeed;
        this.rightWingAngle += flapsPerHover * this.floatYSpeed;
    }
}

SolarPrinceClass.prototype.attack = function() {
    var start = {x: this.x, y: this.yPerspective};
    var myAngle = Math.atan2(this.targets[0].y - this.yPerspective, this.targets[0].x - this.x);
    var ang = trueAngleBetweenPoints({x: this.x, y: this.yPerspective}, {x: this.targets[0].x, y: this.targets[0].y});
    var lowerBound = ang - this.attackAngle;
    var upperBound = ang + this.attackAngle;

    var adjustedLower = lowerBound;
    var adjustedUpper = upperBound;

    if(lowerBound < 0) {
        adjustedLower = lowerBound + 360;
    }

    if(upperBound > 360) {
        adjustedUpper = upperBound - 360;
        // want to include the tiles whose angles are less than (ang + 30) % 360
    }

    var index = this.indexOfAngle(adjustedLower);
    var tileObj = this.tilesInRadialOrder[index];
    var angle = tileObj.angle;
    var tilePos = tileObj.tile; 

    var count = 0;
    var i = index;
    if(tiles.tilesInRadialOrder.length == 0) {
        console.log("no tiles");
    }
    
    while(count < this.tilesInRadialOrder.length) { // count at most all tiles
        tileObj = this.tilesInRadialOrder[i];
        if(tileObj === undefined) {
            // doesn't happen often, just in case
            count++;
            i++;
            i %= this.tilesInRadialOrder.length;
            continue;
        }

        angle = tileObj.angle;
        if(adjustedLower > adjustedUpper) {
            // this means the tower's desired range includes the circle "reset" of 359->360->0: special case
            if(angle > adjustedUpper && angle < adjustedLower) {
                count++;
                i++;
                i %= this.tilesInRadialOrder.length;
                continue;
            }
        } else {
            if(angle > adjustedUpper || angle < adjustedLower) {
                count++;
                i++;
                i %= this.tilesInRadialOrder.length;
                continue;
            }
        }

        tilePos = tileObj.tile.tile;
        var tile = StateController.currLevel.tiles[this.context][tilePos.row][tilePos.col];
        // damage all monsters on this tile
        if(tile.hasMonsters()) {
            Object.keys(tile.monstersOnTile).forEach(
                ((monster) => {
                    var obj = monsterList[this.context][monster];
                    if(obj !== undefined) {
                        if(obj.health > 0) {
                            if(obj.hitWithProjectile(this.properties[DAMAGE])) {
                                StateController.notifyTowerKilledMonster(this.id, this.context, obj.type);
                            }
                        }
                    }
                })
            );
        }

        i++;
        i %= this.tilesInRadialOrder.length;
        count++;
    }

    for(var degree = -this.attackAngle; degree <= this.attackAngle; degree += 5) {
        var rad = degree * (Math.PI / 180) + myAngle;
        var xOff = Math.cos(rad) * 1000; 
        var yOff = Math.sin(rad) * 1000;
        this.drawLightning(start, {x: this.x + xOff, y: this.y + yOff}, 20, 10);
    }
}

SolarPrinceClass.prototype.indexOfAngle = function(angle) {
    // binary search for a tile in this.tilesInRadialOrder close to angle
    var start = 0, end = this.tilesInRadialOrder.length - 1;
    var mid = 0;
    while(start < end) {
        mid = Math.floor((start + end) / 2);
        if(Math.abs(angle - this.tilesInRadialOrder[mid].angle) < 10) {
            // good enough
            return mid;
        } else if(angle < this.tilesInRadialOrder[mid].angle) {
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }
    // approximately the closest /shrug
    return mid;
}

SolarPrinceClass.prototype.drawLightning = function(from, to, maxDiff, strength) {
    // https://codepen.io/mcdorli/post/creating-lightnings-with-javascript-and-html5-canvas
    var direction = 0; // 0 corresponds to y variation, 1 to x
    if(Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
        direction = 1;
    }

    var max = Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    var segmentHeight = 50;

    render(from, to, direction, maxDiff, segmentHeight, this.context, strength, "#ffd402");
}
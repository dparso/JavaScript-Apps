// manages computer's driving skills
var driverId = 0;


function DriverClass(level, car) {
	this.id = ++driverId;
	this.level = level;
	this.car = car;
	this.timeOnTile = 0;

	this.update = function() {
		 /*
		 determine which direction to go
		 this comes down to figuring out whether to turn left or right,
		 based on current angle. In degrees,
		 0 is right
		 90 is down
		 180 is left
		 270 is up
		 */

		 // helps to prevent stalls or dead ends
         if(this.car.timeOnTile > MAX_SECONDS_ON_TILE * fps) {
            this.car.reverse();
            this.car.turnRight();
            return;
        }

		var tile = tiles[this.car.tile.row][this.car.tile.col];
		var par = tile.parent; // determines where to go from here

		// travel according to vector of curr -> par, affected by vector par -> grandPar
		// start with just par
		var accelerate = true;

        if(par) {
			var grandPar = par.parent; // determines where to go from par
        	if(grandPar) {
        		// slow down if there is another change of direction
        		if(grandPar.row != tile.row && grandPar.col != tile.col) {
        			accelerate = false;
        		}
        	}
        	// this assumes no diagonals!
        	var targetAngle;
        	var dir; // 0 right, 1 left
            if(par.row - this.car.tile.row < 0) { // parent is up
            	targetAngle = directionToRadian[UP];
            	if(this.car.angle > directionToRadian[DOWN] && this.car.angle < targetAngle) {
            		dir = 0;
            	} else {
            		dir = 1;
            	}
            } else if(par.row - this.car.tile.row > 0) { // parent is down
            	targetAngle = directionToRadian[DOWN];
            	if(this.car.angle < directionToRadian[UP] && this.car.angle > targetAngle) {
            		dir = 1;
            	} else {
            		dir = 0;
            	}
            } else if(par.col - this.car.tile.col < 0) { // parent is left
            	targetAngle = directionToRadian[LEFT];
            	if(this.car.angle < targetAngle) {
            		dir = 0;
            	} else {
            		dir = 1;
            	}
            } else { // parent is right
            	targetAngle = directionToRadian[RIGHT];
            	if(this.car.angle < directionToRadian[LEFT]) {
            		dir = 1;
            	} else {
            		dir = 0;
            	}
            }
            // turn left or right?
            var diff = Math.abs(targetAngle - this.car.angle);
            if(diff > Math.PI / 64) {
            	if(dir) {
	            	this.car.turnLeft();
	            } else {
	            	this.car.turnRight();

	            }
	        } else {
	        	this.car.noTurn();
	        }
        } else {
        	this.car.noTurn();
        }

        if(accelerate || this.car.speed < 3) {
			this.car.drive();
        } else {
        	this.car.noAccelerate();
        }
	}
}

// meant for tiles specifically
function Queue() {
    this.data = [];

    this.push = function(data) {
        data.visited = searchCount;
        this.data.unshift(data);
    }

    this.pop = function() {
        return this.data.pop();
    }

    this.empty = function() {
        return this.data.length === 0;
    }
}

var searchCount = 0;
function calculateBFS(start) {
    searchCount++;

    var currTile;
    var foundPath = false;
    currTile = start;
    currTile.distanceToGoal = 0;
    var finish = currTile;
    
    if(currTile === undefined) {
        return;
    }

    var frontier = new Queue();
    frontier.push(currTile);

    // run a full BFS, no goal in mind
    while(!frontier.empty()) {
        var currTile = frontier.pop();

        // add neighbors that are PATH and unvisited
        for(var rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for(var colOffset = -1; colOffset <= 1; colOffset++) {
                if(allowDiagonals) {
                    if(rowOffset === 0 && colOffset === 0) continue;
                } else if(Math.abs(rowOffset) === Math.abs(colOffset)) {
                    continue;
                }

                if(gridInRange(currTile.row + rowOffset, currTile.col + colOffset)) {
                    var tile = tiles[currTile.row + rowOffset][currTile.col + colOffset];

                    if((tile.type == TRACK_ROAD || tile.type == TRACK_START) && tile.visited < searchCount) {
                        // add this to frontier
                        tile.parent = currTile;
                        tile.distanceToGoal = currTile.distanceToGoal + 1;
                        frontier.push(tile);
                    }
                }
            }
        }
    }
}
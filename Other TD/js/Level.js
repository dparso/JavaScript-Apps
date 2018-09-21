const LEVEL_START = 0;
const LEVEL_TRACK = 1;
const LEVEL_SELECT = 2;

function LevelClass(levelType, levelGrid, drawFunction, loadFunction) {
	this.grid = levelGrid;
	this.type = levelType;
	this.tiles = [];

	this.draw = drawFunction;
	this.load = function() {
		this.tiles = new Array(TILE_ROWS);
		for(var row = 0; row < TILE_ROWS; row++) {
			this.tiles[row] = new Array(TILE_COLS);
			for(var col = 0; col < TILE_COLS; col++) {
				var type = this.grid[row][col];
				var isTransparent = tileTypeHasTransparency(type);
	            var atLeft = false, atUp = false, atRight = false, atDown = false;
	            var imgIndex = 0;
	            // choose which image to use
	            if(type === TILE_WALL) {
	            	let left = {row: row, col: col - 1};
	            	let up = {row: row - 1, col: col};
	            	let right = {row: row, col: col + 1};
	            	let down = {row: row + 1, col: col};
	            	if(gridInRange(left.row, left.col)) {
						if(this.grid[left.row][left.col] === TILE_WALL) {
	            			atLeft = true;
	            		}
	            	} else {
	            		atLeft = true;
	            	}

	            	if(gridInRange(up.row, up.col)) {
						if(this.grid[up.row][up.col] === TILE_WALL) {
	            			atUp = true;
	            		}
	            	} else {
	            		atUp = true;
	            	}

	            	if(gridInRange(right.row, right.col)) {
						if(this.grid[right.row][right.col] === TILE_WALL) {
	            			atRight = true;
	            		}
	            	} else {
	            		atRight = true;
	            	}

	            	if(gridInRange(down.row, down.col)) {
						if(this.grid[down.row][down.col] === TILE_WALL) {
	            			atDown = true;
	            		}
	            	} else {
	            		atDown = true;
	            	}
	            	// console.log(row + ", " + col + ": left " + atLeft + ", up " + atUp + ", right " + atRight + ", down " + atDown);
	            	imgIndex = this.getTileTypeFromSurroundings(atLeft, atUp, atRight, atDown);
		        } else if(type === TILE_OBSTACLE) {
		        	let choice = Math.random();
		        	if(choice < 0.75) {
		        		imgIndex = Math.floor(Math.random() * 2);
		        	} else if(choice < 0.875) {
		        		imgIndex = Math.floor(Math.random() * 2 + 2);
		        	} else {
		        		imgIndex = Math.floor(Math.random() * 2 + 4);
		        	}
		        	// console.log(imgIndex);
		        }

	            var img = tilePics[type][imgIndex];
	          	if(type === TILE_MONSTER_START || type === TILE_MONSTER_END) {
	          		img = tilePics[TILE_PATH][0];
	          	}

	            var tile = new TileClass({row: row, col: col}, type, img, isTransparent);
	            // console.log(tile);
	            this.tiles[row][col] = tile;

            	// tell the enemy handler that this is a valid location for a tower
            	// availableTowerLocations.push({row: row, col: col});

	            // set monster starts (could be cleaner)
	            if(type === TILE_MONSTER_START) {
	                MONSTER_START = {row: row, col: col};
	            } else if(type === TILE_MONSTER_END) {
	                MONSTER_END = {row: row, col: col};
	            }					
			} // end of for col
		} // end of for row
		
	    if(this.type === LEVEL_TRACK) {
	    	calculateMonsterPathBFS();
	    }
	} // end of load

	this.tilesDraw = function() {
	    var drawTileX = 0;
	    var drawTileY = 0;
	    // draw appropriate images
	    for(var row = 0; row < TILE_ROWS; row++) {
	        drawTileX = 0;
	        for(var col = 0; col < TILE_COLS; col++) {
	            var currTile = this.tiles[row][col];
	            // console.log(currTile);
	            // draw path under tile
	            if(currTile.transparent) {
            		bg_ctx.drawImage(tilePics[TILE_PATH][0], Math.round(drawTileX), Math.round(drawTileY));
            	}

            	bg_ctx.drawImage(currTile.img, Math.round(drawTileX), Math.round(drawTileY));
	            drawTileX += TILE_W;
	        }
	        drawTileY += TILE_H;
	    }
	}

	this.getTileTypeFromSurroundings = function(atLeft, atUp, atRight, atDown) {
		var imgIndex = 0;
    	// 15 unique cases: probably a clever way to do this, but straightforward checks will do
    	// idea is to minimize worst case number of checks instead of writing every check out fully
    	if(atLeft && atRight) {
    		if(atUp && atDown) {
				// four.png
				imgIndex = 10;
			} else if(atUp) {
				// three_up
				imgIndex = 7;
			} else if(atDown) {
				// three_down
				imgIndex = 9;
			} // else 0, already is
    	} else if(atUp && atDown) {
    		if(atLeft) {
    			// three_left
    			imgIndex = 6;
    		} else if(atRight) {
    			// three_right
    			imgIndex = 8;
    		} else {
    			// one_vertical
    			imgIndex = 1;
    		}
    	} else if(atLeft) {
    		if(atUp) {
        		// two_left_up
        		imgIndex = 2;
        	} else if(atDown) {
        		// two_left_down
        		imgIndex = 3;
        	} else {
        		// one_left
        		imgIndex = 11;
        	}
    	} else if(atRight) {
    		if(atUp) {
    			// two_right_up
    			imgIndex = 4;
    		} else if(atDown) {
    			// two_right_down
    			imgIndex = 5;
    		} else {
    			// one_right
    			imgIndex = 13;
    		}
    	} else if(atUp) {
    		// one_up
    		imgIndex = 12;
    	} else if(atDown) {
    		// one_down
    		imgIndex = 14;
    	} // else: alone, give 0
    	return imgIndex;
	}
} // end of LevelClass
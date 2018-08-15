const LEVEL_START = 0;
const LEVEL_TRACK = 1;
const LEVEL_SELECT = 2;

function LevelClass(levelType, levelGrids, drawFunction, loadFunction) {
	this.grids = levelGrids;
	this.type = levelType;
	this.tiles = [[], []]; // two sets of tiles

	this.draw = drawFunction;
	this.load = function() {
		// create tile objects from grid values
	    this.tiles[PLAYER] = new Array(TILE_ROWS);
	    this.tiles[ENEMY] = new Array(TILE_ROWS);
	    for(var row = 0; row < TILE_ROWS; row++) {
	        this.tiles[PLAYER][row] = new Array(TILE_COLS);
	        this.tiles[ENEMY][row] = new Array(TILE_COLS);
	        for(var col = 0; col < TILE_COLS; col++) {
	            var type = this.grids[PLAYER][row][col];
	            var type2 = this.grids[ENEMY][row][col];

	            var isTransparent = tileTypeHasTransparency(type);
	            var isTransparent2 = tileTypeHasTransparency(type2);

	            var atLeft = false, atUp = false, atRight = false, atDown = false;
	            // var img2 = tilePics[type2][0];
	            var imgIndex = 0, imgIndex2 = 0;
	            // choose which image to use
	            if(type == TILE_WALL) {
	            	let left = {row: row, col: col - 1};
	            	let up = {row: row - 1, col: col};
	            	let right = {row: row, col: col + 1};
	            	let down = {row: row + 1, col: col};
	            	if(gridInRange(left.row, left.col)) {
						if(this.grids[PLAYER][left.row][left.col] == TILE_WALL) {
	            			atLeft = true;
	            		}
	            	} else {
	            		atLeft = true;
	            	}

	            	if(gridInRange(up.row, up.col)) {
						if(this.grids[PLAYER][up.row][up.col] == TILE_WALL) {
	            			atUp = true;
	            		}
	            	} else {
	            		atUp = true;
	            	}

	            	if(gridInRange(right.row, right.col)) {
						if(this.grids[PLAYER][right.row][right.col] == TILE_WALL) {
	            			atRight = true;
	            		}
	            	} else {
	            		atRight = true;
	            	}

	            	if(gridInRange(down.row, down.col)) {
						if(this.grids[PLAYER][down.row][down.col] == TILE_WALL) {
	            			atDown = true;
	            		}
	            	} else {
	            		atDown = true;
	            	}

	            	// console.log(row + ", " + col + ": left " + atLeft + ", up " + atUp + ", right " + atRight + ", down " + atDown);
	            	imgIndex = this.getTileTypeFromSurroundings(atLeft, atUp, atRight, atDown);
	            }

	            if(type2 == TILE_WALL_2) {
	            	let left = {row: row, col: col - 1};
	            	let up = {row: row - 1, col: col};
	            	let right = {row: row, col: col + 1};
	            	let down = {row: row + 1, col: col};
	            	if(gridInRange(left.row, left.col)) {
						if(this.grids[ENEMY][left.row][left.col] == TILE_WALL_2) {
	            			atLeft = true;
	            		}
	            	} else {
	            		atLeft = true;
	            	}

	            	if(gridInRange(up.row, up.col)) {
						if(this.grids[ENEMY][up.row][up.col] == TILE_WALL_2) {
	            			atUp = true;
	            		}
	            	} else {
	            		atUp = true;
	            	}

	            	if(gridInRange(right.row, right.col)) {
						if(this.grids[ENEMY][right.row][right.col] == TILE_WALL_2) {
	            			atRight = true;
	            		}
	            	} else {
	            		atRight = true;
	            	}

	            	if(gridInRange(down.row, down.col)) {
						if(this.grids[ENEMY][down.row][down.col] == TILE_WALL_2) {
	            			atDown = true;
	            		}
	            	} else {
	            		atDown = true;
	            	}

	            	// console.log(row + ", " + col + ": left " + atLeft + ", up " + atUp + ", right " + atRight + ", down " + atDown);
	            	imgIndex2 = this.getTileTypeFromSurroundings(atLeft, atUp, atRight, atDown);
	            }


	            var img = tilePics[type][imgIndex];
	            var img2 = tilePics[type2][imgIndex2];

	          	if(type == TILE_MONSTER_START || type == TILE_MONSTER_END) {
	          		img = tilePics[TILE_PATH][0];
	          	}

	          	if(type2 == TILE_MONSTER_START || type2 == TILE_MONSTER_END) {
	          		img2 = tilePics[TILE_PATH][0];
	          	}

	            var tile = new TileClass({row: row, col: col}, type, img, isTransparent);
	            var tile2 = new TileClass({row: row, col: col}, type2, img2, isTransparent2);

	            this.tiles[PLAYER][row][col] = tile;
	            this.tiles[ENEMY][row][col] = tile2;

	            if(type2 == TILE_WALL_2) {
	            	// tell the enemy handler that this is a valid location for a tower
	            	availableTowerLocations.push({row: row, col: col});
	            }

	            // set monster starts (could be cleaner)
	            if(type == TILE_MONSTER_START) {
	                MONSTER_START[PLAYER] = {row: row, col: col};
	            } else if(type == TILE_MONSTER_END) {
	                MONSTER_END[PLAYER] = {row: row, col: col};
	            }

	            if(type2 == TILE_MONSTER_START) {
	                MONSTER_START[ENEMY] = {row: row, col: col};
	            } else if(type2 == TILE_MONSTER_END) {
	                MONSTER_END[ENEMY] = {row: row, col: col};
	            }
	        }
	    }

	    if(this.type == LEVEL_TRACK) {
	    	calculateMonsterPath(PLAYER);
	    	calculateMonsterPath(ENEMY);
	    }
	}

	this.tilesDraw = function(context) {
	    var drawTileX = 0;
	    var drawTileY = 0;
	    // draw appropriate images
	    for(var row = 0; row < TILE_ROWS; row++) {
	        drawTileX = 0;
	        for(var col = 0; col < TILE_COLS; col++) {
	            var currTile = this.tiles[context][row][col];
	            // draw path under tile
	            if(currTile.transparent) {
            		ctx[context].drawImage(tilePics[TILE_PATH][0], drawTileX, drawTileY);
            	}

            	ctx[context].drawImage(currTile.img, drawTileX, drawTileY);

	            // if(currTile.type >= TOWER_OFFSET_NUM) {
	            //     // draw with rotation
	            //     drawBitmapCenteredWithRotation(currTile.img, drawTileX + currTile.img.width / 2, drawTileY + currTile.img.height / 2, 0, context);
	            // } else {
	            //     ctx[context].drawImage(currTile.img, drawTileX, drawTileY);
	            // }
	            
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
    	} else {
    		console.log("Umm, problem!");
    	}
    	return imgIndex;
	}
} // end of LevelClass
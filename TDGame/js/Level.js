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

	            var tile = new TileClass({row: row, col: col}, type, tilePics[type], isTransparent);
	            var tile2 = new TileClass({row: row, col: col}, type2, tilePics[type2], isTransparent2);

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
	            if(currTile.transparent) {
            		ctx[context].drawImage(tilePics[TILE_GROUND], drawTileX, drawTileY);
	            }

	            if(currTile.type >= TOWER_OFFSET_NUM) {
	                // draw with rotation
	                drawBitmapCenteredWithRotation(currTile.img, drawTileX + currTile.img.width / 2, drawTileY + currTile.img.height / 2, 0, context);
	            } else {
	                ctx[context].drawImage(currTile.img, drawTileX, drawTileY);
	            }
	            drawTileX += TILE_W;
	        }
	        drawTileY += TILE_H;
	    }
	}
}
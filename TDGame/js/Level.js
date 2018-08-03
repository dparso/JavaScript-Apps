const LEVEL_START = 0;
const LEVEL_TRACK = 1;
const LEVEL_SELECT = 2;


function LevelClass(levelType, levelGrid, drawFunction, loadFunction) {
	this.grid = levelGrid;
	this.type = levelType;
	this.tiles;

	this.draw = drawFunction;
	this.load = function() {
		// create tile objects from grid values
	    this.tiles = new Array(TILE_ROWS);
	    for(var row = 0; row < TILE_ROWS; row++) {
	        this.tiles[row] = new Array(TILE_COLS);
	        for(var col = 0; col < TILE_COLS; col++) {
	            var type = this.grid[row][col];
	            var isTransparent = tileTypeHasTransparency(type);
	            var tile = new TileClass({row: row, col: col}, type, tilePics[type], isTransparent);
	            this.tiles[row][col] = tile;

	            if(type == TILE_MONSTER_START) {
	                MONSTER_START = {row: row, col: col};
	            } else if(type == TILE_MONSTER_END) {
	                MONSTER_END = {row: row, col: col};
	            }
	        }
	    }

	    if(this.type == LEVEL_TRACK) {
	    	calculateMonsterPath();
	    }
	}

	this.tilesDraw = function() {
	    var drawTileX = 0;
	    var drawTileY = 0;
	    // draw appropriate images
	    for(var row = 0; row < TILE_ROWS; row++) {
	        drawTileX = 0;
	        for(var col = 0; col < TILE_COLS; col++) {
	            var currTile = this.tiles[row][col];

	            if(currTile.transparent) {
	                canvasContext.drawImage(tilePics[TILE_GROUND], drawTileX, drawTileY);
	            }

	            if(currTile.type >= TOWER_OFFSET_NUM) {
	                // draw with rotation
	                drawBitmapCenteredWithRotation(currTile.img, drawTileX + currTile.img.width / 2, drawTileY + currTile.img.height / 2, 0);
	            } else {
	                canvasContext.drawImage(currTile.img, drawTileX, drawTileY);
	            }
	            drawTileX += TILE_W;
	        }
	        drawTileY += TILE_H;
	    }
	}
}
function TileClass(row, col, type) {
    this.row = row;
    this.col = col;
    this.type = type;

    // BFS variables
    // instead of n^2 resetting for these variables on each search,
    // the values correspond to the "id" of the search that assigned them
    // so new searches will know to ignore
    this.visited = 0;
    this.onPath = 0;
    this.parent = null;
    this.distanceToGoal = TRACK_COLS * TRACK_ROWS; // max value to start

    this.carsOnTile = {}; // car IDs

    this.getCars = function() {
        return this.carsOnTile;
    }

    this.hasCars = function () {
        return Object.keys(this.carsOnTile).length > 0;
    }

    this.notifyCarArrive = function(carId) {
        this.carsOnTile[carId] = carId;
    }

    this.notifyCarDepart = function(carId) {
        delete this.carsOnTile[carId];
    }
}
function SearchNode(gridPos, value) {
	this.gridPos = gridPos;
	this.value = value;
}

SearchNode.prototype.valueOf = function() {return this.value};

function AStarSearcher(grid, begin, goal, diagonals) {
	this.grid = grid; // 2D grid of (x, y)
	this.begin = begin;
	this.goal = goal;

	this.tracker = new Array(this.grid.length);
	this.openSet = new PriorityQueue();
	// note that this is a max priority queue
	// to get min, all values are multiplied by -1

	this.allowDiagonals = diagonals;

	this.heuristic = function(row, col) {
		if(this.allowDiagonals) return -Math.abs(row - this.goal.row) - Math.abs(col - this.goal.col);
		
		let x = col - this.goal.col;
		let y = row - this.goal.row;

		return -Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}

	// initialize values to infinity
	for(var i = 0; i < this.grid.length; i++) {
		this.tracker[i] = new Array(this.grid[i].length);
		for(var j = 0; j < this.grid[i].length; j++) {
			this.tracker[i][j] = {gScore: Number.MIN_VALUE, fScore: Number.MIN_VALUE, cameFrom: null, visited: false};
		}
	}

	this.tracker[this.begin.row][this.begin.col].gScore = 0;
	this.tracker[this.begin.row][this.begin.col].fScore = this.heuristic(this.begin.row, this.begin.col);

	this.openSet.push({gridPos: this.begin, dist: this.tracker[this.begin.row][this.begin.col].fScore});
	this.totalPath = [];

	this.findPath = function() {
		if(this.openSet.size() <= 0) return false;

		let curr = this.openSet.pop();
		// console.log(curr);
		let row = curr.gridPos.row;
		let col = curr.gridPos.col;
		if(row == this.goal.row && col == this.goal.col) {
			// console.log("Found " + this.goal);
			return true;
		}
		// console.log("curr " + row + ", " + col + ", " + tracker[row][col].fScore);
		// mark this node as visited
		this.tracker[row][col].visited = true;

		// get & add neighbors
		for(var rowOff = -1; rowOff <= 1; rowOff++) {
			for(var colOff = -1; colOff <= 1; colOff++) {
				// if(Math.abs(rowOff) == Math.abs(colOff)) continue; // no diagonals: only (1, 0), (0, 1), (-1, 0), (0, -1)
				if(this.allowDiagonals) {
					if(rowOff == 0 && colOff == 0) continue;
				} else {
					if(Math.abs(rowOff) == Math.abs(colOff)) continue;// no diagonals: only (1, 0), (0, 1), (-1, 0), (0, -1)
				}
				let r = row + rowOff;
				let c = col + colOff;
				// console.log("neighbor " + r + ", " + c);
				if(gridInRange(r, c)) {
					if(!monsterCanWalk(r, c)) continue;
					if(this.tracker[r][c].visited) {
						// console.log("visited");
						continue;
					}
					let gScore = this.tracker[row][col].gScore - 1; // neighbors are always just 1 away
					if(this.openSet.contains(r, c) && gScore <= this.tracker[r][c].gScore) {
						// not a better path
						// console.log("have a better path");
						continue;
					} else {
						let totalDist = gScore + this.heuristic(r, c);
						// console.log("adding " + totalDist);
						this.openSet.push({gridPos: {row: r, col: c}, dist: totalDist});
						this.tracker[r][c] = {gScore: gScore, fScore: totalDist, cameFrom: {row: row, col: col}, visited: false};
					}
				}
			}
		}
		return false;
	}

	this.makePath = function() {
		// reconstruct path
	    this.totalPath = [this.goal];
	    let parent = this.tracker[this.goal.row][this.goal.col].cameFrom;
	    // console.log(parent);
	    while(parent != null) {
	    	// console.log(parent);
	    	this.totalPath.push(parent);
	    	parent = this.tracker[parent.row][parent.col].cameFrom;
	    }

	    // console.log(totalPath);
	    return this.totalPath;
	}
}


// heap-based priority queue: https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
	constructor(comparator = (a, b) => a.dist > b.dist) {
		this.heap = [];
		this.comparator = comparator;
		this.top = 0;
	}

	contains(row, col) {
		// returns true if heap contains given node
		for(var i = 0; i < this.heap.length; i++) {
			let curr = this.heap[i];
			if(curr.gridPos.row == row && curr.gridPos.col == col) {
				return true;
			}
		}
		return false;
	}

	size() {
		return this.heap.length;
	}

	isEmpty() {
		return this.size() == 0;
	}

	peek() {
		return this.heap[this.top];
	}

	push(...values) {
		values.forEach(value => {
			this.heap.push(value);
			this.siftUp();
		});
		return this.size();
	}

	pop() {
		const poppedValue = this.peek();
		const bottom = this.size() - 1;
		if (bottom > this.top) {
			this.swap(this.top, bottom);
		}
		this.heap.pop();
		this.siftDown();
		return poppedValue;
	}

	replace(value) {
		const replacedValue = this.peek();
		this.heap[this.top] = value;
		this.siftDown();
		return replacedValue;
	}

	greater(i, j) {
		return this.comparator(this.heap[i], this.heap[j]);
	}

	swap(i, j) {
		[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
	}

	siftUp() {
		let node = this.size() - 1;
		while (node > this.top && this.greater(node, parent(node))) {
			this.swap(node, parent(node));
			node = parent(node);
		}
	}

	siftDown() {
		let node = this.top;
		while (
			(left(node) < this.size() && this.greater(left(node), node)) ||
			(right(node) < this.size() && this.greater(right(node), node))
			) {
				let maxChild = (right(node) < this.size() && this.greater(right(node), left(node))) ? right(node) : left(node);
				this.swap(node, maxChild);
				node = maxChild;
		}
	}
}





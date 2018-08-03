const STARTING_LIVES = 1000;
const STARTING_GOLD = 5;

function PlayerClass() {
	this.lives = STARTING_LIVES;
	this.gold = STARTING_GOLD;

	this.loseLife = function() {
		if(--this.lives == 0) {
			// lost the game!
			gameLost = true;
		}
	}

	this.loseGold = function(value) {
		this.gold -= value;
		this.gold = Math.max(this.gold, 0);
	}

	this.reset = function() {
		this.lives = STARTING_LIVES;
		this.gold = STARTING_GOLD;
	}
}
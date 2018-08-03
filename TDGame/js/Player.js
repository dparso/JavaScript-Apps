const STARTING_LIVES = 5;
const STARTING_GOLD = 10;
const STARTING_INCOME = 1;

function PlayerClass() {
	this.lives = STARTING_LIVES;
	this.gold = STARTING_GOLD;
	this.income = STARTING_INCOME;

	this.loseLife = function() {
		if(--this.lives == 0) {
			// lost the game!
			gameLost = true;
		}
	}

	this.gainGold = function(value) {
		this.gold += value;
		this.gold = Math.max(this.gold, 0);
	}

	this.reset = function() {
		this.lives = STARTING_LIVES;
		this.gold = STARTING_GOLD;
	}

	this.buyTower = function(ofType) {
		this.gainGold(-towerCosts[ofType]);
	}

	this.sendMonster = function(ofType) {
		this.gainGold(-monsterCosts[ofType]);

		// income!
	}

	this.killedMonster = function(ofType) {
		this.gainGold(monsterValues[ofType]);
	}
}
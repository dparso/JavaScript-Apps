const STARTING_LIVES = 5;
const STARTING_GOLD = 50000000;
const STARTING_INCOME = 5;
const INCOME_RATE = 10; // interval is x seconds

function PlayerClass(context) {
	this.lives = STARTING_LIVES;
	this.gold = STARTING_GOLD;
	this.income = STARTING_INCOME;
	this.context = context;
	this.numTowers = 0;

	this.loseLife = function() {
		if(--this.lives == 0) {
			// lost the game!
			StateController.endGame(this.context);
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
		this.numTowers++;
	}

	this.sendMonster = function(ofType) {
		this.gainGold(-monsterCosts[ofType]);
		// earn income!
		this.income += monsterValues[ofType];
	}

	this.killedMonster = function(ofType) {
		this.gainGold(monsterValues[ofType]);
	}
}
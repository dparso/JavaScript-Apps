const STARTING_LIVES = 5;
const STARTING_GOLD = 100000000.0;
const STARTING_INCOME = 20.0;
const INCOME_RATE = 10; // interval is x seconds

function PlayerClass(context) {
	this.lives = STARTING_LIVES;
	this.gold = STARTING_GOLD;
	this.income = STARTING_INCOME;
	this.context = context;
	this.numTowers = 0;
	this.towerStrength = 0;
	this.monsterStrength = 0;

	this.loseLife = function() {
		if(--this.lives === 0) {
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
		this.gainGold(-monsterCosts[this.context][ofType]);
		// earn income!
		this.income += monsterCosts[this.context][ofType] * monster_send_ratio;
	}

	this.killedMonster = function(ofType) {
		this.gainGold(monsterCosts[otherPlayer(this.context)][ofType] * monster_kill_ratio);
	}
}
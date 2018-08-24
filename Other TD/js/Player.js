const STARTING_LIVES = 5;
const STARTING_GOLD = 1000000000.0;
const STARTING_INCOME = 20.0;
const WAVE_RATE = 2; // interval is x seconds

function PlayerClass(owner) {
	this.lives = STARTING_LIVES;
	this.gold = STARTING_GOLD;
	this.income = STARTING_INCOME;
	this.owner = owner;
	this.numTowers = 0;
	this.towerStrength = 0;
	this.monsterStrength = 0;

	this.loseLife = function() {
		if(--this.lives === 0) {
			// lost the game!
			StateController.endGame(this.owner);
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
		this.gainGold(-monsterCosts[this.owner][ofType]);
		// earn income!
		this.income += monsterCosts[this.owner][ofType] * monster_send_ratio;
	}

	this.killedMonster = function(ofType) {
		this.gainGold(monsterCosts[otherPlayer(this.owner)][ofType] * monster_kill_ratio);
	}
}
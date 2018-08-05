// handles enemy behaviour
const ENEMY_ACTION_RATE = 1.0;
var timeSinceAction = 0;
var enemyActionRate = ENEMY_ACTION_RATE; // one action every x seconds
var enemyActionProbability = 0.75; // likelihood enemy will perform an action when given the chance (greater is higher)
var enemyTowerProbability = 0.5; // likelihood to buy a tower instead of a monster
var enemyUpgradeProbability = 0.1;
var minTowerCost = Number.MAX_SAFE_INTEGER;
var minMonsterCost = Number.MAX_SAFE_INTEGER;

var availableTowerLocations = [];
var upgradeableTowers = []; // IDs

function prepareEnemy() {
	// set min costs
	for(var i = 0; i < monsterCosts.length; i++) {
		minMonsterCost = Math.min(minMonsterCost, monsterCosts[i]);
	}

	for (var i = 0; i < towerCosts.length; i++) {
		minTowerCost = Math.min(minTowerCost, towerCosts[i]);
	}
}

function enemyActions() {
	enemyActionRate = ENEMY_ACTION_RATE - (enemy.gold / 10000); // slightly increase with more gold -- don't sit around, spend money!

	if(StateController.state != STATE_PLAY) return;
	if(timeSinceAction > (1000 / fps) * enemyActionRate) {
		if(Math.random() < enemyActionProbability) {
			// performing an action: this means something will definitely happen if enough gold
			// an action can be buying & placing a tower or sending a monster at the player

			// upgrade or purchase?
			var purchaseFlag = true;
			if(Math.random() < enemyUpgradeProbability) {
				purchaseFlag = !buyUpgrade();
			}

			if(purchaseFlag) {
				var monsterFlag = true;
				if(Math.random() < enemyTowerProbability) {
					monsterFlag = !buyTower();
				}
				// at this point, monsterFlag is true either if tower wasn't chosen or tower failed
				// in either case, send a monster
				if(monsterFlag) {
					sendMonster();
				}
			}
		}

		timeSinceAction = 0; // time til next action opportunity is reset
	}

	timeSinceAction++;
}

function buyUpgrade() {
	// currently, this doesn't guarantee an upgrade if the chosen tower is too expensive
	// for which tower?
	var length = upgradeableTowers.length;
	if(length == 0) {
		return false;
	}

	var index = Math.floor(Math.random() * length);

	var towerId = upgradeableTowers[index];
	var type = Math.floor(Math.random() * upgrade_costs.length);
	var tower = towerList[ENEMY][towerId];

	for(var up = type; up < type + upgrade_costs.length; up++) {
		// try different upgrades
		if(StateController.upgradeTower(tower, type, false)) {
			return true;
		}
	}

	return false;
}


function buyTower() {
	// enough money?
	if(enemy.gold < minTowerCost) {
		return false;
	}
	// are there available positions?
	if(availableTowerLocations.length > 0) {
		// which one to buy?
		var type;
		// iterate until one is cheap enough
		var attempts = 1000;
		while(attempts--) {
			type = Math.floor(Math.random() * towerCosts.length);
			if(enemy.gold >= towerCosts[type]) {
				break;
			}
		}

		// where to put it?
		var index = Math.floor(Math.random() * availableTowerLocations.length);
		var tile = availableTowerLocations[index];

		StateController.placeTower(type, ENEMY, tile);
		availableTowerLocations.splice(index, 1); // remove this tile from available options

		return true;
	} else {
		return false;
	}
}

function sendMonster() {
	// enough money?
	if(enemy.gold < minMonsterCost) {
		return false;
	}
	// which type?
	var type;
	// iterate until one is cheap enough
	var attempts = 1000;
	while(attempts--) {
		type = Math.floor(Math.random() * monsterCosts.length);
		if(enemy.gold >= monsterCosts[type]) {
			break;
		}
	}

	StateController.sendMonster(type, PLAYER);
}
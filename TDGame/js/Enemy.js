// handles enemy behaviour
const ENEMY_ACTION_RATE = 1.0;
const ENEMY_TOWER_PROB = 0.5;
var timeSinceAction = 0;
var enemyActionRate = ENEMY_ACTION_RATE; // one action every x seconds
var enemyActionProbability = 0.75; // likelihood enemy will perform an action when given the chance (greater is higher)
var enemyTowerProbability = ENEMY_TOWER_PROB; // likelihood to buy a tower instead of a monster
var enemyUpgradeProbability = 0.3;
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

	// add some towers beforehand
	// careful, these are still in availableTowerLocations
	StateController.placeTower(CANNON, ENEMY, {row: 4, col: 6});
	StateController.placeTower(SHOOTER, ENEMY, {row: 6, col: 10});
}

function enemyActions() {
	return;
	enemyTowerProbability = ENEMY_TOWER_PROB * (1 - enemy.numTowers / 30.0); // 30 towers is enough!
	enemyActionRate = ENEMY_ACTION_RATE - (enemy.gold / 50000); // slightly increase with gold excess -- don't sit around, spend money!

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
	var type = Math.floor(Math.random() * tier_costs.length);
	var tower = towerList[ENEMY][towerId];

	if(StateController.upgradeTower(tower, type, false)) {
		return true;
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
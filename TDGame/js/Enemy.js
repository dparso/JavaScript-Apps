// handles enemy behaviour
var timeSinceAction = 0;
var enemyActionRate = 0.2; // one action every x seconds
var enemyActionProbability = 0.5; // likelihood enemy will perform an action when given the chance (greater is higher)
var enemyTowerProbability = 1.0; // likelihood to buy a tower instead of a monster
var minTowerCost = Number.MAX_SAFE_INTEGER;
var minMonsterCost = Number.MAX_SAFE_INTEGER;

var availableTowerLocations = [];

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
	if(StateController.state != STATE_PLAY) return;
	if(timeSinceAction > (1000 / fps) * enemyActionRate) {
		if(Math.random() < enemyActionProbability) {
			// performing an action: this means something will definitely happen if enough gold
			// an action can be buying & placing a tower or sending a monster at the player
			var canBuyTower = false;
			var canBuyMonster = false;

			if(enemy.gold >= minTowerCost) {
				canBuyTower = true;
			}
			if(enemy.gold >= minMonsterCost) {
				canBuyMonster = true;
			}

			var monsterFlag = false; // set to true if tower purchase failed

			if(canBuyMonster && canBuyTower) {
				// can buy either: choose
				if(Math.random() < enemyTowerProbability) {
					if(!buyTower()) {
						// couldn't buy tower, so definitely send monster
						monsterFlag = true;
					}
				} else {
					// chance chose monster: send it
					sendMonster();
					monsterFlag = false;
				}

				if(monsterFlag) {
					// this is true means chance chose tower but no space was available
					sendMonster();
				}
			} else if(canBuyMonster || canBuyTower) {
				// can do one or the other: do it!
				if(canBuyMonster) {
					sendMonster();
				} else {
					buyTower();
				}
			}
		}

		timeSinceAction = 0; // time til next action opportunity is reset
	}

	timeSinceAction++;
}


function buyTower() {
	// are there available positions?
	if(availableTowerLocations.length > 0) {
		// which one to buy?
		var type;
		// iterate until one is cheap enough
		while(true) {
			type = Math.floor(Math.random() * towerCosts.length);
			if(enemy.gold >= towerCosts[type]) {
				break;
			}
		}

		// where to put it?
		var index = Math.floor(Math.random() * availableTowerLocations.length);
		var tile = availableTowerLocations[index];

		StateController.placeTower(type, ENEMY, tile);
		return true;
	} else {
		return false;
	}
}

function sendMonster() {
	// which type?
	var type;
	// iterate until one is cheap enough
	while(true) {
		type = Math.floor(Math.random() * monsterCosts.length);
		if(enemy.gold >= monsterCosts[type]) {
			break;
		}
	}

	StateController.sendMonster(type, PLAYER);
}
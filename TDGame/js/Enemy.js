// handles computer enemy behaviour
const ENEMY_ACTION_RATE = 1.0;
const ENEMY_TOWER_PROB = 0.5;

var timeSinceAction = 0;
var enemyActionRate = ENEMY_ACTION_RATE; // one action every x seconds
var enemyActionProbability = 0.75; // likelihood enemy will perform an action when given the chance (greater is higher)
var enemyTowerProbability = ENEMY_TOWER_PROB; // likelihood to buy a tower instead of a monster
var enemyUpgradeProbability = 0.6;
var minTowerCost = Number.MAX_SAFE_INTEGER;
var minMonsterCost = Number.MAX_SAFE_INTEGER;
var enemyRandomMonsterProbability = 0.3;
var enemyRandomTowerProbability = 0.6;

var DEFENSIVE = -150;
var CAUTIOUS = -100;
var NEUTRAL = 0;
var CONFIDENT = 100;
var AGGRESSIVE = 150;

const RELAXED = 0.5;
const NORMAL = 1;
const URGENT = 5;
const RAPID = 10;
var ENEMY_URGENCY = NORMAL;
const ENEMY_EVALUATE_RATE = 1; // evaluate once per second

var availableTowerLocations = [];
var towerLocationQueue = [];
var upgradeableTowers = []; // IDs

function pathByTile(row, col) {
	// returns the number of path squares within 1 step of {row, col} (including diagonals)
	var pathCount = 0;
	for(var rowOff = -2; rowOff <= 2; rowOff++) {
		for(var colOff = -2; colOff <= 2; colOff++) {
			if(rowOff === 0 && colOff === 0 || !gridInRange(row + rowOff, col + colOff)) {
				continue;
			}
			if(StateController.currLevel.tiles[ENEMY][row + rowOff][col + colOff].type === TILE_PATH) {
				pathCount++;
			}
		}
	}

	return pathCount;
}

function processTilePriorities() {
	towerLocationQueue = [];

	// first, calculate the number of tile squares around each available tower locations
	for(var i = 0; i < availableTowerLocations.length; i++) {
		var tile = availableTowerLocations[i];
		var pathCount = pathByTile(tile.row, tile.col);
		towerLocationQueue.push({tile: tile, pathCount: pathCount});
	}

	// next, sort in increasing order of pathCount
	towerLocationQueue.sort(function(a, b) {
		return a.pathCount - b.pathCount;
	});
}

function prepareEnemy() {
	// set min costs
	for(var i = 0; i < monsterCosts[ENEMY].length; i++) {
		minMonsterCost = Math.min(minMonsterCost, monsterCosts[ENEMY][i]);
	}

	for (var i = 0; i < towerCosts.length; i++) {
		minTowerCost = Math.min(minTowerCost, towerCosts[i]);
	}

	// add some towers beforehand
	// careful, these are still in availableTowerLocations
	// StateController.placeTower(CANNON, ENEMY, {row: 4, col: 6});
	// StateController.placeTower(SHOOTER, ENEMY, {row: 4, col: 7});
	// enemy.gainGold(towerCosts[CANNON]);
	// enemy.gainGold(towerCosts[SHOOTER]);
	// StateController.placeTower(CONDUIT, ENEMY, {row: 3, col: 10});
	// StateController.placeTower(REAPER, ENEMY, {row: 6, col: 10});
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	// StateController.upgradeTower(towerList[ENEMY][3], 0, false);
	processTilePriorities();
}

/* Basic factors to consider:
	relative income
	relative tower strengths
	strength of monsters currently on enemy's side

	Advanced:
		player gold buildups (anticipate a rush)

	Slacking in income:
		Sending monsters overcomes
		But lower income means disadvantage, which means play defensively
		What to choose?
*/
var timeSinceEval = 0;
function evaluateComfort() {
	if(timeSinceEval > fps * ENEMY_EVALUATE_RATE) {

		var towerDiff = enemy.towerStrength - player.towerStrength;
		var monsterDiff = enemy.monsterStrength - player.monsterStrength;
		var incomeDiff = 100 * Math.log(enemy.income / player.income); // could swap to subtraction if complexity is too high
		// var goldCaution = (enemy.gold - player.gold) / 100; // just be aware of player's gold

		// income is a general indicator of the progress of a game
		var benchmark = enemy.income / 60;
		var CONFIDENT = benchmark;
		var CAUTIOUS = -CONFIDENT;

		var defensiveComfort = 10 * (enemy.towerStrength - player.monsterStrength) / benchmark;
		// var offensiveComfort = Math.log(enemy.monsterStrength - player.towerStrength + enemy.gold / 2);

		/*
			defensive 				   cautious 						neutral 						confident 				 aggressive
				     < -benchmark < ------------- < -benchmark / 2 < ------ 0 ------ < benchmark / 2 < ----------- < benchmark <
		*/
		// console.log(benchmark);
		// console.log(defensiveComfort);

		if(defensiveComfort < -benchmark) {
			if(defensiveComfort < -10 * benchmark) {
				// DEFENSIVE
				console.log("I'm DEFENSIVE");
				ENEMY_URGENCY = RAPID;
				enemyTowerProbability = 0.9;
				enemyUpgradeProbability = 0.9;
			} else {
				// CAUTIOUS
				console.log("I'm CAUTIOUS");
				ENEMY_URGENCY = URGENT;
				enemyTowerProbability = 0.7;
				enemyUpgradeProbability = 0.8;
			}
		} else if(defensiveComfort > benchmark) {
			if(defensiveComfort > 10 * benchmark) {
				// AGRESSIVE
				console.log("I'm AGGRESSIVE");
				ENEMY_URGENCY = RAPID;
				enemyTowerProbability = 0.1;
			} else {
				// CONFIDENT
				console.log("I'm CONFIDENT");
				ENEMY_URGENCY = URGENT;
				enemyTowerProbability = 0.3;
			}
		} else {
			// NEUTRAL
			// console.log("I'm NEUTRAL");
			// in the lack of impetus to build or send, choose based on income difference
			// better income means enemy can take the time to build up defenses
			// worse means you'd better catch up by sending monsters
			// (ordinarily this would be dangerous, but we know the monster situation is okay since it's neutral)
			if(enemy.income <= player.income) {
				// catch up!
				enemyTowerProbability = 0.1;
				ENEMY_URGENCY = URGENT;
			} else {
				if(enemy.income / player.income > 1.5 || player.monsterStrength === 0) {
					// press the attack!
					enemyTowerProbability = 0.1;
					ENEMY_URGENCY = RAPID;
				} else {
					// safe to bolster defenses
					enemyTowerProbability = 0.9;
					enemyUpgradeProbability = 0.9;
					ENEMY_URGENCY = NORMAL;
				}
			}
		}
		timeSinceEval = 0;
	}
	timeSinceEval++;
}

var startOfGame = 0;
function enemyActions() {
	return;
	if(StateController.state !== STATE_PLAY) return;

	evaluateComfort();

	// for the first 2 seconds of the game, buy some towers
	if(startOfGame < 2 * fps) {
		enemyTowerProbability = 1.0;
		enemyActionProbability = 1.0;
		startOfGame++;
	}

	// enemyTowerProbability = ENEMY_TOWER_PROB * (1 - enemy.numTowers / 30.0); // 30 towers is enough!
	// enemyActionRate = ENEMY_ACTION_RATE - (enemy.gold / 50000); // slightly increase with gold excess -- don't sit around, spend money!

	if(timeSinceAction > (1000 / fps) / ENEMY_URGENCY) {
		if(Math.random() < enemyActionProbability) {
			// performing an action: this means something will definitely happen if enough gold
			// an action can be buying & placing a tower or sending a monster at the player

			var monsterFlag = true;
			if(Math.random() < enemyTowerProbability) {
				// upgrade or purchase?
				var purchaseFlag = true;
				if(Math.random() < enemyUpgradeProbability) {
					purchaseFlag = !buyUpgrade();
				} else {
					buyTower();
				}

				// if(purchaseFlag) {
				// 	monsterFlag = !buyTower();
				// } else {
				// 	monsterFlag = false; // already upgraded
				// }
			} else {
				sendEnemyMonster();
			}
			// at this point, monsterFlag is true either if tower wasn't chosen or tower failed
			// in either case, send a monster
			// if(monsterFlag) {
			// 	sendEnemyMonster();
			// }
		}

		timeSinceAction = 0; // time til next action opportunity is reset
	}

	timeSinceAction++;
}

function buyUpgrade() {
	// currently, this doesn't guarantee an upgrade if the chosen tower is too expensive
	// for which tower?
	var length = upgradeableTowers.length;
	if(length === 0) {
		return false;
	}

	var index = Math.floor(Math.random() * length);

	var towerId = upgradeableTowers[index];
	var type = Math.floor(Math.random() * tier_costs.length);
	var tower = towerList[ENEMY][towerId];

	// walk through towers to find an upgrade
	for(var i = index; i < upgradeableTowers.length; i++) {
		var ind = i % upgradeableTowers.length;
		if(StateController.upgradeTower(towerList[ENEMY][upgradeableTowers[ind]], type, false)) {
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

	if(towerLocationQueue.length > 0) {
		// iterate until one is cheap enough
		var type;
		for(var t = towerCosts.length - 1; t >= 0; t--) {
			if(t === SOLAR_PRINCE && SOLAR_PRINCE_UNIQUE[ENEMY] || t === REAPER && REAPER_UNIQUE[ENEMY]) {
				continue; // don't keep trying to buy the unique towers
			}
			type = t;
			if(enemy.gold >= towerCosts[t]) {
				// tend towards buying the most expensive, but occasionally buy others
				if(Math.random() < enemyRandomTowerProbability) {
					var type = Math.floor(Math.random() * t);
				}
				break;
			}
		}

		// place somewhere random
		var pos, tile;
		if(Math.random() < enemyRandomTowerProbability) {
			pos = towerLocationQueue[towerLocationQueue.length - 1];
			tile = pos.tile;
		} else {
			var index = Math.floor(Math.random() * 3 * (towerLocationQueue.length - 1) / 4);
			pos = towerLocationQueue[index];
			towerLocationQueue.splice(index, 1);
			tile = pos.tile;			
		}

		if(StateController.placeTower(type, ENEMY, tile)) {
			towerLocationQueue.pop();
		}
	}
}

function sendEnemyMonster() {
	// enough money?
	if(enemy.gold < minMonsterCost) {
		return false;
	}

	// iterate until one is cheap enough
	for(var t = monsterCosts[ENEMY].length - 1; t >= 0; t--) {
		if(enemy.gold >= monsterCosts[ENEMY][t]) {
			// tend towards sending the most expensive, but occasionally send others
			if(Math.random() < enemyRandomMonsterProbability) {
				// buy a random monster cheaper than this one
				var type = Math.floor(Math.random() * t);
				StateController.sendMonster(type, PLAYER);
			} else {
				StateController.sendMonster(t, PLAYER);
			}
			break;
		}
	}
}


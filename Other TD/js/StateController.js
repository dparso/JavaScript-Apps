const EASY = 0;
const MEDIUM = 1;
const HARD = 2;
const INSANE = 3;

const LIGHT = 0;
const DARK = 1;


function StateControllerClass(startLevel) {
    this.state;
    this.currLevel = startLevel;
    this.levelNum = 0;

    this.monstersWaiting = [[], []];

    this.placeTower = function(ofType, onSide, atGrid) {
        var tower;

        switch(ofType) {
            case SHOOTER:
                tower = new ShooterClass(ofType, onSide);
                break;
            case CANNON:
                tower = new CannonClass(ofType, onSide);
                break;
            case GLAIVE:
                tower = new GlaiveClass(ofType, onSide);
                break;
            case WIZARD:
                tower = new WizardClass(ofType, onSide);
                break;
            case CONDUIT:
                tower = new ConduitClass(ofType, onSide);
                break;
            case JUROR:
                tower = new JurorClass(ofType, onSide);
                break;
            case REAPER:
                if(REAPER_UNIQUE[onSide]) {
                    if(onSide === PLAYER) queueMessage("Maximum reapers!", mouseX, mouseY, 1);
                    return false;
                }
                tower = new ReaperClass(ofType, onSide);
                break;
            case SOLAR_PRINCE:
                if(SOLAR_PRINCE_UNIQUE[onSide]) {
                    if(onSide === PLAYER) queueMessage("Maximum solar prince!", mouseX, mouseY, 1);
                    return false;
                }
                tower = new SolarPrinceClass(ofType, onSide);
                break;
            case AETHER:
                tower = new AetherClass(ofType, onSide);
                break;
            case GENERATOR:
                tower = new GeneratorClass(ofType, onSide);
                break;
            default:
                return false;
        }

        var pixelPos = gridToPixel(atGrid.row, atGrid.col);
        // snap to center of grid
        tower.x = pixelPos.x + TILE_W / 2;
        tower.y = pixelPos.y + TILE_H / 2;
        tower.currTile = atGrid;
        tower.active = true;
        tower.visible = true;
        tower.calculateTilesInRange();

        if(ofType === SOLAR_PRINCE) {
            tower.radialSort();
        }

        towerList[onSide][tower.id] = tower;

        // notify tile
        this.currLevel.tiles[atGrid.row][atGrid.col].notifyTowerPlaced(tower.id);

        // player pays for it (cost checks already occurred)
        if(onSide === PLAYER) {
            player.buyTower(tower.type);
            player.towerStrength += towerCosts[tower.type];
        } else {
            enemy.buyTower(tower.type);
            enemy.towerStrength += towerCosts[tower.type];
            upgradeableTowers.push(tower.id);
        }


        // display cost loss onscreen
        queueMessage("-" + towerCosts[tower.type].toLocaleString(), tower.x, tower.y, 1);

        this.mapChanged();        
        return true;
    }

    this.sendMonster = function(ofType, toSide, usedHotkey = false, fromBarracks = false) {
        toSide = PLAYER;
        // ofType = 6;
        var sender = otherPlayer(toSide);
        monsterCounts[sender][ofType]++;
        // level up
        // if(monsterCounts[sender][ofType] > 100 * monsterLevels[sender][ofType]) {
        //     monsterLevels[sender][ofType]++;
        //     monsterCounts[sender][ofType] = 0;

        //     monsterCosts[sender][ofType] *= 1.5;
        //     monsterHealths[sender][ofType] *= 2;
        //     monsterSpeeds[sender][ofType] += (1 / monsterLevels[sender][ofType]);
        //     queueMessage(monsterNames[ofType] + ": level " + monsterLevels[sender][ofType], canvas[sender].width / 2, canvas[sender].height / 2, sender, 'gold');
        // }

        var monster = new MonsterClass(ofType, toSide);
        StateController.monstersWaiting[toSide].push(monster);
        // toSide is the resulting side, but the opposite side sent it
        if(toSide === PLAYER) {
            if(!fromBarracks) {
                enemy.sendMonster(ofType);
            }
            enemy.monsterStrength += monsterCosts[sender][ofType] * 4;
        } else {
            
            if(!fromBarracks) {
                player.sendMonster(ofType);
                queueMessage("-" + (monsterCosts[sender][monster.type]).toLocaleString(), mouseX, mouseY, 1);
            }
            player.monsterStrength += monsterCosts[sender][ofType] * 4;
            // console.log(player.monsterStrength);
            // player sent: display message over the selection tile

            return true;
        }
    }

    // isPlayer = true if player is upgrading, in which case display error on fail (otherwise don't)
    this.upgradeTower = function(tower, upgradeType, isPlayer) {
        if(tower.tier + 1 >= tier_costs[tower.type].length) return false; // no more upgrades
        var obj = tower.owner === PLAYER ? player : enemy;

        if(obj.gold >= tier_costs[tower.type][tower.tier + 1]) {
            var xPos, yPos;
            if(isPlayer) {
                xPos = mouseX;
                yPos = mouseY;
            } else {
                xPos = tower.x;
                yPos = tower.y
            }
            queueMessage("-" + tier_costs[tower.type][tower.tier + 1].toLocaleString(), xPos, yPos, 1);
            tower.upgradeTier(upgradeType);
            obj.towerStrength += tier_costs[tower.type][tower.tier];
            obj.gainGold(-tier_costs[tower.type][tower.tier]);
            return true;
        } else {
            if(isPlayer) {
                queueMessage("Insufficient gold!", mouseX, mouseY, 1);
            } else {
                return false;
            }
        }
    }

    this.sellTower = function(towerId, owner) {
        var tower = towerList[owner][towerId];
        if(tower.type === REAPER) REAPER_UNIQUE[owner] = 0;
        if(tower.type === SOLAR_PRINCE) SOLAR_PRINCE_UNIQUE[owner] = 0;

        // remove from tile
        var tile = towerList[owner][towerId].currTile;
        this.currLevel.tiles[tile.row][tile.col].notifyTowerRemoved();
        // clear selection
        clearSelection();
        // grant gold
        var obj = owner === PLAYER ? player : enemy;
        obj.numTowers--;

        for(var i = tower.tier; i >= 0; i--) {
            obj.towerStrength -= tier_costs[tower.type][i];
        }
        obj.towerStrength -= towerCosts[tower.type];
        obj.gainGold(towerList[owner][towerId].value);

        queueMessage("+" + tower.value.toLocaleString(), tower.x, tower.y, true, 'green');
        delete towerList[owner][towerId];

        this.mapChanged();
    }

    this.changeState = function(newState, newLevel) {
        this.currLevel = newLevel;

    	switch(newState) {
    		case STATE_SELECT:
    			this.currLevel.load();
    			break;
    		case STATE_PLAY:
    			this.currLevel.load();
    			createMonsters();
                prepareEnemy();
    			break;
    		default:
    			break;
    	}

    	// this.prepareState(newState);
    	this.state = newState;
    }

    this.mapChanged = function() {
        // currently only prompted by selling or placing a tower
        calculateMonsterPathBFS();

        for(var owner = 0; owner <= 1; owner++) {
            for(tower in towerList[owner]) {
                towerList[owner][tower].calculateTilesInRange();
            }
        }
    }

    // these should be combined
 //   	this.prepareState = function(state) {
	//     switch(state) {
	//         case STATE_SELECT:
	//             break;
 //            case STATE_PLAY:
 //                break;
	//         default:
	//             return;
	//     }
	// }

    this.drawLevel = function() {
        this.currLevel.draw(this.currLevel);
    }

    this.notifyLifeLost = function(owner) {
        if(owner === PLAYER) {
            player.loseLife();
        } else if(owner === ENEMY) {
            enemy.loseLife();
        }
    }

    this.notifyTowerKilledMonster = function(towerId, owner, monsterType) {
        if(towerList[owner][towerId] !== undefined) { // tower could have been sold
            towerList[owner][towerId].notifyKilledMonster(monsterType);
        }
    }

    this.endGame = function(loser) {
        if(loser === PLAYER) {
            gameLost = true;
        } else {
            gameWon = true;
        }
    }

    this.hotkey = function(code, shift) {
        if(this.state !== STATE_PLAY) return;

        var type = code - KEY_NUM_OFFSET - 1;
        if(shift) {
            return;
            // monster
            if(type > 7) {
                console.log("Not yet!");
                return;
            }
            if(player.gold >= monsterCosts[PLAYER][type]) {
                this.sendMonster(type, ENEMY, true);
                // for(var i = 0; i < 10; i++) this.sendMonster(type, PLAYER, 1);
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, 1);
            }
        } else {
            // tower
            if(type > 9) {
                console.log("Not yet!");
                return;
            }

            if(type === REAPER && REAPER_UNIQUE[PLAYER]) {
                queueMessage("Maximum reapers!", mouseX, mouseY, 1);
                return false;
            } else if(type === SOLAR_PRINCE && SOLAR_PRINCE_UNIQUE[PLAYER]) {
                queueMessage("Maximum solar prince!", mouseX, mouseY, 1);
                return false;
            }

            if(dragObject !== null && type === dragObject.type - TOWER_OFFSET_NUM) {
                // cancel current selection
                dragObject = null;
            } else if(player.gold >= towerCosts[type]) {
                setDrag(type + TOWER_OFFSET_NUM, mouseX, mouseY, 1);
                dragDelay = dragWait; // don't wait to draw
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, 1);
            }
        }
    }
}



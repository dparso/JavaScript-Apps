
function StateControllerClass(startLevel) {
    this.state;
    this.currLevel = startLevel;
    this.levelNum = 0;

    this.monstersWaiting = [[], []];

    this.placeTower = function(ofType, onSide, atGrid) {
        var tower;
        switch(ofType) {
            case CANNON:
                tower = new CannonClass(ofType, onSide);
                break;
            case SHOOTER:
                tower = new ShooterClass(ofType, onSide);
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
                tower = new ReaperClass(ofType, onSide);
        }

        var pixelPos = gridToPixel(atGrid.row, atGrid.col);

        // snap to center of grid
        tower.x = pixelPos.x + TILE_W / 2;
        tower.y = pixelPos.y + TILE_H / 2;
        tower.currTile = atGrid;
        tower.active = true;
        tower.visible = true;
        tower.calculateTilesInRange();

        towerList[onSide][tower.id] = tower;

        // notify tile
        this.currLevel.tiles[onSide][atGrid.row][atGrid.col].notifyTowerPlaced(tower.id);

        // player pays for it (cost checks already occurred)
        if(onSide == PLAYER) {
            player.buyTower(tower.type);
            selection[PLAYER] = tower.id;
        } else {
            enemy.buyTower(tower.type);
            upgradeableTowers.push(tower.id);
        }


        // display cost loss onscreen
        queueMessage("-" + towerCosts[tower.type].toLocaleString(), tower.x, tower.y, onSide);
    }

    this.sendMonster = function(ofType, toSide, usedHotkey = false) {
        toSide = PLAYER;
        var monster = new MonsterClass(ofType, toSide);
        monster.reset();
        monsterList[toSide][monster.id] = monster;
        StateController.monstersWaiting[toSide].push(monster);
        // toSide is the resulting side, but the opposite side sent it
        if(toSide == PLAYER) {
            enemy.sendMonster(ofType);
        } else {
            player.sendMonster(ofType);
            // player sent: display message over the selection tile
            var side = toSide;
            if(usedHotkey) {
                side = currCanvas;
            }
            queueMessage("-" + monsterCosts[monster.type].toLocaleString(), mouseX, mouseY, side);
        }
    }

    // isPlayer = true if player is upgrading, in which case display error on fail (otherwise don't)
    this.upgradeTower = function(tower, upgradeType, isPlayer) {
        if(tower.tier + 1 >= tier_costs[tower.type].length) return false; // no more upgrades
        var object = tower.context == PLAYER ? player : enemy;

        if(object.gold >= tier_costs[tower.type][tower.tier + 1]) {
            var xPos, yPos;
            if(isPlayer) {
                xPos = mouseX;
                yPos = mouseY;
            } else {
                xPos = tower.x;
                yPos = tower.y
            }
            queueMessage("-" + tier_costs[tower.type][tower.tier + 1].toLocaleString(), xPos, yPos, tower.context);
            tower.upgradeTier(upgradeType);
            object.gainGold(-tier_costs[tower.type][tower.tier]);
            return true;
        } else {
            if(isPlayer) {
                queueMessage("Insufficient gold!", mouseX, mouseY, tower.context);
            } else {
                return false;
            }
        }
    }

    this.sellTower = function(towerId, context) {
        var tower = towerList[context][towerId];
        // remove from tile
        var tile = towerList[context][towerId].currTile;
        this.currLevel.tiles[context][tile.row][tile.col].notifyTowerRemoved();
        // clear selection
        clearSelection(context);
        // grant gold
        var obj = context == PLAYER ? player : enemy;
        obj.numTowers--;
        obj.gainGold(towerList[context][towerId].value);

        queueMessage("+" + tower.value.toLocaleString(), tower.x, tower.y, tower.context, 'green');

        delete towerList[context][towerId];
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

    this.drawLevel = function(context) {
        this.currLevel.draw(this.currLevel, context);
    }

    this.notifyLifeLost = function(context) {
        if(context == PLAYER) {
            player.loseLife();
        } else if(context == ENEMY) {
            enemy.loseLife();
        }
    }

    this.notifyTowerKilledMonster = function(towerId, context, monsterType) {
        if(towerList[context][towerId] != undefined) { // tower could have been sold
            towerList[context][towerId].notifyKilledMonster(monsterType);
        }
    }

    this.endGame = function(loser) {
        if(loser == PLAYER) {
            gameLost = true;
        } else {
            gameWon = true;
        }
    }

    this.hotkey = function(code, shift, context) {
        if(this.state != STATE_PLAY) return;

        var type = code - KEY_NUM_OFFSET - 1;
        if(shift) {
            // monster
            if(type > 7) {
                console.log("Not yet!");
                return;
            }
            if(player.gold >= monsterCosts[type]) {
                this.sendMonster(type, ENEMY, true);
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
            }
        } else if(context == PLAYER) {
            // tower
            if(type > 6) {
                console.log("Not yet!");
                return;
            }

            if(dragObject[PLAYER] != null && type == dragObject[PLAYER].type - TOWER_OFFSET_NUM) {
                // cancel current selection
                dragObject[PLAYER] = null;
            } else if(player.gold >= towerCosts[type]) {
                setDrag(type + TOWER_OFFSET_NUM, mouseX, mouseY, true);
                dragDelay = dragWait; // don't wait to draw
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
            }
        }
    }
}



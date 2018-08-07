
function StateControllerClass(startLevel) {
    this.state;
    this.currLevel = startLevel;

    this.monstersWaiting = [[], []];

    this.placeTower = function(ofType, onSide, atGrid) {
        var tower = new TowerClass(ofType, onSide);

        var pixelPos = gridToPixel(atGrid.row, atGrid.col);

        // snap to center of grid
        tower.x = pixelPos.x + TILE_W / 2;
        tower.y = pixelPos.y + TILE_H / 2;
        tower.currTile = atGrid;
        tower.active = true;
        tower.visible = true;

        towerList[onSide][tower.id] = tower;

        // notify tile
        this.currLevel.tiles[onSide][atGrid.row][atGrid.col].notifyTowerPlaced(tower.id);

        // player pays for it (cost checks already occurred)
        if(onSide == PLAYER) {
            player.buyTower(tower.type);
        } else {
            enemy.buyTower(tower.type);
            upgradeableTowers.push(tower.id);
        }

        // display cost loss onscreen
        queueMessage("-" + towerCosts[tower.type], tower.x, tower.y, onSide);
    }

    this.sendMonster = function(ofType, toSide) {
        var img = tilePics[ofType + MONSTER_OFFSET_NUM];
        var monster = new MonsterClass(ofType, img, toSide);
        monster.reset();
        monsterList[toSide][monster.id] = monster;
        StateController.monstersWaiting[toSide].push(monster);
        // toSide is the resulting side, but the opposite side sent it
        if(toSide == PLAYER) {
            enemy.sendMonster(ofType);
        } else {
            player.sendMonster(ofType);
            // player sent: display message over the selection tile
            queueMessage("-" + monsterCosts[monster.type], mouseX, mouseY, toSide);
        }
    }

    // isPlayer = true if player is upgrading, in which case display error on fail (otherwise don't)
    this.upgradeTower = function(tower, upgradeType, isPlayer) {
        if(tower.tier + 1 >= tier_costs.length) return false; // no more upgrades
        var object = tower.context == PLAYER ? player : enemy;

        if(object.gold >= tier_costs[tower.tier + 1]) {
            var xPos, yPos;
            if(isPlayer) {
                xPos = mouseX;
                yPos = mouseY;
            } else {
                xPos = tower.x;
                yPos = tower.y
            }
            queueMessage("-" + tier_costs[tower.tier + 1], xPos, yPos, tower.context);
            tower.upgradeTier(upgradeType);
            object.gainGold(-tier_costs[tower.tier]);
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
        // remove from tile
        var tile = towerList[context][towerId].currTile;
        this.currLevel.tiles[context][tile.row][tile.col].notifyTowerRemoved();
        // clear selection
        selection[context] = null;
        // grant gold
        var obj = context == PLAYER ? player : enemy;
        obj.gainGold(towerList[context][towerId].value);

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
    			break;
    		default:
    			break;
    	}

    	this.prepareState(newState);
    	this.state = newState;
    }

    // these should be combined
   	this.prepareState = function(state) {
	    switch(state) {
	        case STATE_SELECT:
	            for(var i = 0; i < NUM_MONSTERS; i++) {
	                monsterSelections[i + MONSTER_OFFSET_NUM] = 0;
	            }
	            break;
            case STATE_PLAY:
                infoPane.initButtons();
                break;
	        default:
	            return;
	    }
	}

    this.drawLevel = function(context) {
        this.currLevel.draw(context);
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
            if(type > 5) {
                console.log("Not yet!");
                return;
            }
            if(player.gold >= monsterCosts[type]) {
                this.sendMonster(type, ENEMY);
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
            }
        } else if(context == PLAYER) {
            // tower
            if(type > 3) {
                console.log("Not yet!");
                return;
            }
            if(player.gold >= towerCosts[type]) {
                setDrag(type + TOWER_OFFSET_NUM, mouseX, mouseY);
            } else {
                queueMessage("Insufficient gold!", mouseX, mouseY, currCanvas);
            }
        }
    }
}



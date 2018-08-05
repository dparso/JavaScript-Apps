
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

        if(toSide == PLAYER) {
            enemy.sendMonster(ofType);
        } else {
            player.sendMonster(ofType);
        }

        // display cost loss onscreen
        if(toSide == ENEMY) {
            // player sent: display message over the selection tile
            queueMessage("-" + monsterCosts[monster.type], mouseX, mouseY, toSide);

        }
    }

    // isPlayer = true if player is upgrading, in which case display error on fail (otherwise don't)
    this.upgradeTower = function(tower, upgradeType, isPlayer) {
        // some generalization to avoid having separate functions for each property
        var properties = [tower.damageUpgrade, tower.rangeUpgrade, tower.attackSpeedUpgrade];
        var property = properties[upgradeType];

        if(properties[upgradeType] + 1 >= upgrade_costs[upgradeType].length) return false; // no more upgrades
        var object = tower.context == PLAYER ? player : enemy;

        if(object.gold >= upgrade_costs[upgradeType][property + 1]) {
            var xPos, yPos;
            if(isPlayer) {
                xPos = mouseX;
                yPos = mouseY;
            } else {
                xPos = tower.x;
                yPos = tower.y
            }
            queueMessage("-" + upgrade_costs[upgradeType][property + 1], xPos, yPos, tower.context);
            tower.upgradeProperty(upgradeType);
            object.gainGold(-upgrade_costs[upgradeType][property + 1]);
            return true;
        } else {
            if(isPlayer) {
                queueMessage("Insufficient gold!", mouseX, mouseY, tower.context);
            } else {
                return false;
            }
        }
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

    this.endGame = function(loser) {
        if(loser == PLAYER) {
            gameLost = true;
        } else {
            gameWon = true;
        }
    }
}



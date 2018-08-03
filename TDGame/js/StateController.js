
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
        }
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
	        default:
	            return;
	    }
	}

    this.drawLevel = function(context) {
        console.log(context);
        this.currLevel.draw(context);
    }
}



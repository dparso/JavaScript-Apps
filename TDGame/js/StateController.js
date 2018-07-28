
function StateControllerClass() {
    this.state;

    this.monstersWaiting = [];

    this.changeState = function(newState) {
    	switch(newState) {
    		case STATE_SELECT:
    			loadLevel(selectScreen);
    			break;
    		case STATE_PLAY:
    			loadLevel(levelOne);
    			createMonsters();
                createTowers();
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
}



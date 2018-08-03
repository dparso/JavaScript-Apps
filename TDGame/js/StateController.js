
function StateControllerClass(startLevel) {
    this.state;
    this.currLevel = startLevel;

    this.monstersWaiting = [];

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

    this.drawLevel = function() {
        this.currLevel.draw();
    }
}



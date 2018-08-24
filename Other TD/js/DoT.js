// Damage over Time -- 'sticks' to a monster, dealing damage
var DOT_ID = [0, 0];

function DoTClass(monsterId, damage, rate, duration, parent, owner) {
	this.target = monsterList[owner][monsterId];
	this.damage = damage;
	this.rate = rate;
	this.owner = owner; // player
	this.timeSinceAttack = 0;
	this.parent = parent; // tower
	this.id = DOT_ID[owner]++;
	this.time = 0;

	this.move = function() {
		if(this.time > duration * fps) this.die();
		if(this.timeSinceAttack > (1000 / fps / rate)) {
			this.attack();
			this.timeSinceAttack = 0;
		}
		this.timeSinceAttack++;
		this.time++;
	}

	this.attack = function() {
		if(this.target !== undefined && this.target.alive) {
	        if(this.target.hitWithProjectile(this.damage)) {
	            StateController.notifyTowerKilledMonster(this.parent, this.owner, this.target.type);
	            this.die();
	        }
	    } else {
	    	this.die();
	    }
	}

	this.die = function() {
		this.target.removeDot(this.parent, this.id);
	}
}
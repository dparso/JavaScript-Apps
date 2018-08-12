// Damage over Time -- 'sticks' to a monster, dealing damage
var DOT_ID = [0, 0];

function DoTClass(monsterId, damage, rate, duration, parent, context) {
	this.target = monsterList[context][monsterId];
	this.damage = damage;
	this.rate = rate;
	this.context = context;
	this.timeSinceAttack = 0;
	this.parent = parent;
	this.id = DOT_ID[context]++;
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
		if(this.target.health > 0) {
	        if(this.target.hitWithProjectile(this.damage)) {
	            StateController.notifyTowerKilledMonster(this.parent, this.context, this.target.type);
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
var showAddText = false;

// info pane
function InfoPaneClass(context) {
	this.showing = false;
	this.context = context;

	this.show = function() {
		if(!this.showing) {
			if(this.context === PLAYER) {
				$('#userinfopane').fadeIn('fast');
			} else {
				$('#enemyinfopane').fadeIn('fast');
			}
		}
		this.showing = true;

		// update text of the HTML table
		var tower = towerList[context][selection[context]];
		var dmgText = "", rngText = "", atkText = "";

		if(showAddText && tower.tier < NUM_TIERS - 1) {
			// dmgText = "<font color='#12ad0f'>+" + (Math.floor(10 * (tower.properties[DAMAGE] * upgrade_effects[DAMAGE][tower.type][tower.tier + 1] - tower.properties[DAMAGE])) / 10) + "</font>";
			// rngText = "<font color='#12ad0f'>+" + upgrade_effects[RANGE][tower.type][tower.tier + 1] + "</font>";
			// atkText = "<font color='#12ad0f'>+" + (Math.floor(10 * (tower.properties[ATTACK_SPEED] * upgrade_effects[ATTACK_SPEED][tower.type][tower.tier + 1] - tower.properties[ATTACK_SPEED])) / 10) + "</font>";
			dmgText = "<font color='#12ad0f'>&times" + upgrade_effects[DAMAGE][tower.type][tower.tier + 1].toLocaleString() + "</font>";
			rngText = "<font color='#12ad0f'> +" + upgrade_effects[RANGE][tower.type][tower.tier + 1].toLocaleString() + "</font>";
			atkText = "<font color='#12ad0f'>&times" + upgrade_effects[ATTACK_SPEED][tower.type][tower.tier + 1].toLocaleString() + "</font>";
		}

		if(this.context === PLAYER) {
			document.getElementById('nametext').innerHTML = "Name: " + towerNames[tower.type];
			document.getElementById('costtext').innerHTML = "Cost: " + towerCosts[tower.type].toLocaleString();
			document.getElementById('rangetext').innerHTML = "Range: " + tower.properties[RANGE].toLocaleString() + rngText;
			document.getElementById('damagetext').innerHTML = "Damage: " + Math.floor(tower.properties[DAMAGE]).toLocaleString() + dmgText;
			document.getElementById('atktext').innerHTML = "Attack Speed: " + Math.floor(tower.properties[ATTACK_SPEED]).toLocaleString() + atkText;
			document.getElementById('killtext').innerHTML = "Kills: " + tower.killCount;
			document.getElementById('infopaneicon').src = "images/" + towerPicList[tower.type + TOWER_OFFSET_NUM];
			document.getElementById('tierbutton').innerHTML = "Tier (" + (tower.tier + 1) + "/" + tier_costs[tower.type].length + ") [u] <span class='tooltiptext tooltip-top' id='upgradecosttext'>Blank!</span>";
			document.getElementById('sellbutton').innerHTML = "Sell: " + tower.value.toLocaleString() + " [s]";
			document.getElementById('targetbutton').innerHTML = "Target: " + PRIORITY_NAMES[tower.targetPriority] + " [t]";
			
		} else {
			document.getElementById('enemynametext').innerHTML = "Name: " + towerNames[tower.type];
			document.getElementById('enemycosttext').innerHTML = "Cost: " + towerCosts[tower.type].toLocaleString().toLocaleString();
			document.getElementById('enemyrangetext').innerHTML = "Range: " + tower.properties[RANGE];
			document.getElementById('enemydamagetext').innerHTML = "Damage: " + Math.floor(tower.properties[DAMAGE]).toLocaleString();
			document.getElementById('enemyatktext').innerHTML = "Attack Speed: " + Math.floor(tower.properties[ATTACK_SPEED]).toLocaleString();
			document.getElementById('enemykilltext').innerHTML = "Kills: " + tower.killCount;
			document.getElementById('enemyinfopaneicon').src = "images/" + towerPicList[tower.type + TOWER_OFFSET_NUM];
			document.getElementById('enemytierbutton').innerHTML = "Tier (" + (tower.tier + 1) + "/" + tier_costs[tower.type].length + ")";
		}

		var text;
		if(tower.tier + 1 === tier_costs[tower.type].length) {
			text = "No more upgrades!";
		} else {
			text = "Cost: " + tier_costs[tower.type][tower.tier + 1].toLocaleString();
		}
		document.getElementById('upgradecosttext').innerHTML = text;
	}

	this.hide = function() {
		if(this.context === PLAYER) {
			$('#userinfopane').fadeOut('fast');
		} else {
			$('#enemyinfopane').fadeOut('fast');
		}
		this.showing = false;
	}
}

function showPlayerTierText() {
	if(selection[PLAYER] !== null) {
		if(towerList[PLAYER][selection[PLAYER]].tier < NUM_TIERS - 1) {
			showAddText = true;
		}
	}
}

function hidePlayerTierText() {
	showAddText = false;
}

function upgradePressed() {
	StateController.upgradeTower(towerList[PLAYER][selection[PLAYER]], 0, true);
}

function targetPressed() {
	towerList[PLAYER][selection[PLAYER]].cyclePriority();

}

function sellPressed() {
	StateController.sellTower(selection[PLAYER], PLAYER);
}
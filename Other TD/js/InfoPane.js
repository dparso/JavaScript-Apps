var showAddText = false;

// info pane
function InfoPaneClass() {
	this.showing = false;

	this.show = function() {
		if(!this.showing) {
			$('#userinfopane').fadeIn('fast');
		}
		this.showing = true;

		// update text of the HTML table
		var tower = towerList[PLAYER][selection];
		var dmgText = "", rngText = "", atkText = "";

		if(showAddText && tower.tier < NUM_TIERS - 1) {
			// dmgText = "<font color='#12ad0f'>+" + (Math.floor(10 * (tower.properties[DAMAGE] * upgrade_effects[DAMAGE][tower.type][tower.tier + 1] - tower.properties[DAMAGE])) / 10) + "</font>";
			// rngText = "<font color='#12ad0f'>+" + upgrade_effects[RANGE][tower.type][tower.tier + 1] + "</font>";
			// atkText = "<font color='#12ad0f'>+" + (Math.floor(10 * (tower.properties[ATTACK_SPEED] * upgrade_effects[ATTACK_SPEED][tower.type][tower.tier + 1] - tower.properties[ATTACK_SPEED])) / 10) + "</font>";
			dmgText = "<font color='#12ad0f'>&times" + upgrade_effects[DAMAGE][tower.type][tower.tier + 1].toLocaleString() + "</font>";
			rngText = "<font color='#12ad0f'> +" + upgrade_effects[RANGE][tower.type][tower.tier + 1].toLocaleString() + "</font>";
			atkText = "<font color='#12ad0f'>&times" + upgrade_effects[ATTACK_SPEED][tower.type][tower.tier + 1].toLocaleString() + "</font>";
		}

		document.getElementById('nametext').innerHTML = "Name: " + towerNames[tower.type];
		document.getElementById('costtext').innerHTML = "Cost: " + towerCosts[tower.type].toLocaleString();
		document.getElementById('rangetext').innerHTML = "Range: " + tower.properties[RANGE].toLocaleString() + rngText;
		document.getElementById('damagetext').innerHTML = "Damage: " + Math.floor(tower.properties[DAMAGE]).toLocaleString() + dmgText;
		document.getElementById('atktext').innerHTML = "Attack Speed: " + Math.floor(tower.properties[ATTACK_SPEED]).toLocaleString() + atkText;
		document.getElementById('killtext').innerHTML = "Kills: " + tower.killCount;
		document.getElementById('infopaneicon').src = "images/" + towerPicList[tower.type + TOWER_OFFSET_NUM];
		document.getElementById('tierbutton').innerHTML = "Tier (" + (tower.tier + 1) + "/" + tier_costs[tower.type].length + ") <span class='tooltiptext tooltip-top' id='upgradecosttext'>Blank!</span>";
		document.getElementById('sellbutton').innerHTML = "Sell: " + tower.value.toLocaleString() + "";
		document.getElementById('targetbutton').innerHTML = "Target: " + PRIORITY_NAMES[tower.targetPriority] + "";

		var text;
		if(tower.tier + 1 === tier_costs[tower.type].length) {
			text = "No more upgrades!";
		} else {
			text = "Cost: " + tier_costs[tower.type][tower.tier + 1].toLocaleString();
		}
		document.getElementById('upgradecosttext').innerHTML = text;
	}

	this.hide = function() {
		$('#userinfopane').fadeOut('fast');
		this.showing = false;
	}
}

function showPlayerTierText() {
	if(selection !== null) {
		if(towerList[PLAYER][selection].tier < NUM_TIERS - 1) {
			showAddText = true;
		}
	}
}

function hidePlayerTierText() {
	showAddText = false;
}

function upgradePressed() {
	StateController.upgradeTower(towerList[PLAYER][selection], 0, true);
}

function targetPressed() {
	towerList[PLAYER][selection].cyclePriority();

}

function sellPressed() {
	StateController.sellTower(selection, PLAYER);
}
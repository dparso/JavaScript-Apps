var TIER_BUTTON = 0;
var RNG_BUTTON = 1;
var ATK_BUTTON = 2;
var TAR_BUTTON = 3;
var SELL_BUTTON = 4;

// info pane
function InfoPaneClass() {
	this.x = 70;
	this.y = 540;
	this.width = 500;
	this.height = 100;
	this.background_color = "rgb(122, 68, 20)";
	this.padding = 5;
	this.col_width = 130;
	this.upgrade_button_width = 70;
	this.upgrade_button_height = 18;

	// panel buttons
	this.damageButton = [null, null];
	this.rangeButton = [null, null];
	this.attackSpeedButton = [null, null];
	this.sellButton = [null, null];
	this.changeTargetButton = [null, null];
	this.buttons = [this.damageButton, this.rangeButton, this.attackSpeedButton, this.changeTargetButton, this.sellButton];

	this.draw = function(objectId, context) {
		this.updateButtons(objectId, context);

	    var tower = towerList[context][objectId];

	    // draw background
	    drawRect(this.x, this.y, this.width, this.height, this.background_color, tower.context);

	    var nameText = "Name: " + towerNames[tower.type];
	    var costText = "Cost: " + towerCosts[tower.type];
	    var rangeText = "Range: " + tower.properties[RANGE];
	    var damageText = "Damage: " + Math.floor(tower.properties[DAMAGE] * 100) / 100; // round to 100th place
	    var attackSpeedText = "Attack Speed: " + Math.floor(tower.properties[ATTACK_SPEED] * 100) / 100;
	    var killText = "Kills: " + tower.killCount;
	    var upgradeText = "Upgrades:";

	    var cols = [[nameText, costText, rangeText, damageText], [attackSpeedText, killText], [upgradeText]];

	    ctx[tower.context].fillStyle = "white";
	    ctx[tower.context].font = "14px Helvetica";
	    
	    // draw info
	    var vertPadding = this.height / cols[0].length;
	    for(var col = 0; col < cols.length; col++) {
	        for(var row = 0; row < cols[col].length; row++) {
	            ctx[tower.context].fillText(cols[col][row], this.x + this.padding + this.col_width * col, this.y + this.padding + row * vertPadding);
	        }
	    }

	    // draw buttons
	    for(var button = 0; button < this.buttons.length; button++) {
	        this.buttons[button][context].draw();
	    }

	    // draw tower image in top right corner
	    ctx[tower.context].drawImage(tower.img, this.x + this.width - tower.img.width - this.padding, this.y + this.padding);
	}

	this.updateButtons = function(objectId, context) {
		// note: please convert these to adhere to new tower.upgrades property
		var tower = towerList[context][objectId];
		this.damageButton[context].text = "Tier (" + (tower.tier + 1) + "/" + tier_costs.length + ") [t]";
		// this.rangeButton[context].text = "Range (" + (tower.tier + 1) + "/" + rng_upgrade_costs.length + ")";
		// this.attackSpeedButton[context].text = "Fire Rate (" + (tower.tier + 1) + "/" + atk_upgrade_costs.length + ")";
		this.rangeButton[context].text = "Empty Button";
		this.attackSpeedButton[context].text = "Empty Button";
		this.sellButton[context].text = "Sell: " + tower.value + " [s]";
		this.changeTargetButton[context].text = "Target: " + PRIORITY_NAMES[tower.targetPriority];
	}

	this.initButtons = function() {
		var upgradeFn = function() { // parameter given in Input.js
			StateController.upgradeTower(towerList[this.context][selection[this.context]], 0, true);
		}; // note: this.context is NOT the info pane's, but the calling button's

		var sellFn = function() {
			StateController.sellTower(selection[this.context], this.context);
		};

		var changeTargetFn = function() {
			towerList[this.context][selection[this.context]].cyclePriority();
		};

		var blankFn = function(val) {

		};

		// var fxns = [upgradeFn, changeTargetFn, sellFn];
		var fxns = [upgradeFn, changeTargetFn, sellFn, blankFn];
		// var fxnChoices = [0, 1, 2];
		var fxnChoices = [0, 3, 3, 1, 2];
		// var buttonColors = ['rgb(196, 125, 45)', 'rgb(196, 125, 45)', 'rgb(210, 0, 0)'];
		var buttonColors = ['rgb(196, 125, 45)', 'rgb(196, 125, 45)', 'rgb(196, 125, 45)', 'rgb(196, 125, 45)', 'rgb(210, 0, 0)'];
		var buttonWidths = [this.col_width, this.col_width, this.col_width, 6 * this.col_width / 10, 6 * this.col_width / 10];

		var xPos, yPos;
		
		// for(var button = 0; button < this.buttons.length; button++) {
		// 	xPos = this.x + this.padding + this.col_width * 2;
		// 	yPos = this.y + this.padding * (1 + button) + this.upgrade_button_height * (button + 1); // reset y every 3

		// 	for(var who = 0; who <= 1; who++) {
		// 		var btn = new ButtonClass(xPos, yPos, this.col_width, this.upgrade_button_height, buttonColors[button], "", who);
		// 		btn.click = fxns[fxnChoices[button]];
		// 		this.buttons[button][who] = btn;
		// 	}
		// }

		for(var button = 0; button < this.buttons.length; button++) {
			var mult = Math.floor(button / 3);
			// some careful positioning
			xPos = this.x + this.padding * (1 + mult) + this.col_width * (2 + mult);
			yPos = this.y + this.padding * (1 + mult + button % 3) + this.upgrade_button_height * ((button % 3) + 1 + mult); // reset y every 3

			for(var who = 0; who <= 1; who++) {
				var btn = new ButtonClass(xPos, yPos, buttonWidths[button], this.upgrade_button_height, buttonColors[button], "", who);
				btn.click = fxns[fxnChoices[button]];
				this.buttons[button][who] = btn;
			}
		}
	}
}
// info pane
function InfoPaneClass() {
	this.x = 70;
	this.y = 540;
	this.width = 500;
	this.height = 100;
	this.background_color = "rgb(122, 68, 20)";
	this.padding = 5;
	this.col_width = 120;
	this.upgrade_button_width = 70;
	this.upgrade_button_height = 18;

	// panel buttons
	this.damageButton = [null, null];
	this.rangeButton = [null, null];
	this.attackSpeedButton = [null, null];
	this.buttons = [this.damageButton, this.rangeButton, this.attackSpeedButton];

	this.draw = function(objectId, context) {
		this.updateButtons(objectId, context);

	    var tower = towerList[context][objectId];

	    // draw background
	    drawRect(this.x, this.y, this.width, this.height, this.background_color, tower.context);

	    var nameText = "Name: " + towerNames[tower.type];
	    var costText = "Cost: " + towerCosts[tower.type];
	    var rangeText = "Range: " + tower.range;
	    var damageText = "Damage: " + Math.floor(tower.damage * 100) / 100; // round to 100th place
	    var attackSpeedText = "Attack Speed: " + tower.attackSpeed;
	    var killText = "Kills: " + tower.killCount;
	    var upgradeText = "Upgrades:";

	    var cols = [[nameText, costText, rangeText, damageText], [attackSpeedText, killText], [upgradeText]];

	    ctx[tower.context].fillStyle = "white";
	    ctx[tower.context].font = "14px Helvetica";
	    
	    var vertPadding = this.height / cols[0].length;
	    for(var col = 0; col < cols.length; col++) {
	        for(var row = 0; row < cols[col].length; row++) {
	            ctx[tower.context].fillText(cols[col][row], this.x + this.padding + this.col_width * col, this.y + this.padding + row * vertPadding);
	        }
	    }

	    // draw upgrade buttons
	    for(var button = 0; button < this.buttons.length; button++) {
	        this.buttons[button][context].draw();
	    }

	    // draw tower image in top right corner
	    ctx[tower.context].drawImage(tower.img, this.x + this.width - tower.img.width - this.padding, this.y + this.padding);
	}

	this.updateButtons = function(objectId, context) {
		this.damageButton[context].text = "Damage (" + (towerList[context][objectId].damageUpgrade + 1) + "/" + dmg_upgrade_costs.length + ")";
		this.rangeButton[context].text = "Range (" + (towerList[context][objectId].rangeUpgrade + 1) + "/" + rng_upgrade_costs.length + ")";
		this.attackSpeedButton[context].text = "Fire Rate (" + (towerList[context][objectId].attackSpeedUpgrade + 1) + "/" + atk_upgrade_costs.length + ")";
	}

	this.initButtons = function() {
		for(var button = 0; button < this.buttons.length; button++) {
			for(var who = 0; who <= 1; who++) {
				var btn = new ButtonClass(this.x + this.padding + this.col_width * 2, this.y + this.padding * (button + 1) + this.upgrade_button_height * (button + 1), this.col_width, this.upgrade_button_height, 'rgb(196, 125, 45)', "", who);
				btn.click = function(val) { // parameter given in Input.js
					StateController.upgradeTower(towerList[this.context][selection[this.context]], val, true);
				};
				this.buttons[button][who] = btn;
			}
		}
	}
}
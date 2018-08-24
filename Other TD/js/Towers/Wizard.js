// wizard
function WizardClass(type, owner) {
    TowerClass.call(this, type, owner);
}

WizardClass.prototype = Object.create(TowerClass.prototype);  
WizardClass.prototype.constructor = WizardClass; 

// override to allow multiple targeting
WizardClass.prototype.findTarget = function() {
    this.targets = [];

    this.getFirstTarget();
    // if(this.tier > 4) {
    //     for(var i = 0; i < (this.tier + 1) / 2; i++) {
    //         this.getRandomTarget();
    //     }
    // }
    if(this.tier > 3) {
        this.getLastTarget();
    }
}

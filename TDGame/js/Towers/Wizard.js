// wizard
function WizardClass(type, context) {
    TowerClass.call(this, type, context);
}

WizardClass.prototype = Object.create(TowerClass.prototype);  
WizardClass.prototype.constructor = WizardClass; 

// override to allow multiple targeting
WizardClass.prototype.findTarget = function() {
    this.targets = [];
    if(this.tier == tier_costs[this.type].length - 1) {
        // wizard: two targets!
        this.getFirstTarget(0);
        this.getLastTarget(1);
    } else if(this.targetPriority == TARGET_FIRST) {
        this.getFirstTarget(0);
    } else {
        this.getLastTarget(0);
    }
}

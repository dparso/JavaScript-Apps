

// monster generator
function GeneratorClass(type, context) {
    TowerClass.call(this, type, context);
    this.monsterType = 0;

    // console.log(this.monsterType + ", " + this.context);

    this.generationRate = 1.0;
    this.timeSinceGenerate = 0;
}

GeneratorClass.prototype = Object.create(TowerClass.prototype);  
GeneratorClass.prototype.constructor = GeneratorClass; 


GeneratorClass.prototype.move = function() {
    if(this.timeSinceGenerate > 1000.0 / fps / this.generationRate) {
        this.generateMonster();
        this.timeSinceGenerate = 0;
    }
    this.timeSinceGenerate++;
}

GeneratorClass.prototype.generateMonster = function() {
    StateController.sendMonster(this.monsterType, otherPlayer(this.context), false, true);
}
// monster generator
function GeneratorClass(type, owner) {
    TowerClass.call(this, type, owner);
    this.monsterType = 0;

    // console.log(this.monsterType + ", " + this.context);

    this.generationRate = 1.0; // one per wave
    this.timeSinceGenerate = 0;
}

GeneratorClass.prototype = Object.create(TowerClass.prototype);  
GeneratorClass.prototype.constructor = GeneratorClass; 


GeneratorClass.prototype.move = function() {
    if(this.timeSinceGenerate > 1000.0 / fps / this.generationRate * WAVE_RATE) {
        this.generateMonster();
        this.timeSinceGenerate = 0;
    }
    this.timeSinceGenerate++;
}

GeneratorClass.prototype.generateMonster = function() {
    StateController.sendMonster(this.monsterType, otherPlayer(this.owner), false, true);
}
const DAMAGE = 0;
const RANGE = 1;
const ATTACK_SPEED = 2;

var tier_costs = [100, 500, 1000, 2000, 10000];
var dmg_upgrade_effects = [1.5, 1.4, 1.4, 2.0, 3.0];
// var dmg_upgrade_costs = [10, 40, 100, 200, 1000];

var rng_upgrade_effects = [1, 1, 1, 2, 2];
// var rng_upgrade_costs = [30, 60, 120, 250, 500];

var atk_upgrade_effects = [1.5, 1.5, 1.5, 2.5, 2.5];
// var atk_upgrade_costs = [30, 60, 120, 250, 500];

var upgrade_effects = [dmg_upgrade_effects, rng_upgrade_effects, atk_upgrade_effects];

const ArmySheet_Author = "k3tw13z3l";
const ArmySheet_Version = "0.0.1";
const ArmySheet_LastUpdated = 1652226769; //Date.now().toString().substr(0, 10);

Hooks.on("ready", function() {
  console.log("-=> Army Sheet v" + ArmySheet_Version + " <=- [" + (new Date(ArmySheet_LastUpdated * 1000)) + "]");
});

class ArmySheet extends ActorSheet {
	get template() {
		return "modules/army-sheet/armyUnit.hbs";
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('dnd5e army-sheet');
		mergeObject(options, {width: 748, height: 641});
		return options;
	}
}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["character"],
	makeDefault: false
});

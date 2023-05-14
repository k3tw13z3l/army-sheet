const ArmySheet_Author = "k3tw13z3l";
const ArmySheet_Version = "0.0.1";
const ArmySheet_LastUpdated = 1652226769; //Date.now().toString().substr(0, 10);
const mName="armySheet"

Hooks.on("ready", function() {
  console.log("-=> Army Sheet v" + ArmySheet_Version + " <=- [" + (new Date(ArmySheet_LastUpdated * 1000)) + "]");
});

class ArmySheet extends ActorSheet {
	get template() {
		/* Maybe add a limited sheet, with just some fluff 'history' text...*/
		return "modules/army-sheet/armyUnit.hbs";
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('dnd5e army-sheet');
		mergeObject(options, {
			width: 748,
			height: 641
		});
		return options;
	}

	debugger;

  async getData(options) {
		const data = await super.getData(options);
		data.isGM = game.user.isGM;
		if (!data.actor.flags[mName]) {
			data.actor.flags[mName] = {
				'type': null,
				'ancestry': null,
				'equipment': null,
				'experience': null,
				'stats' : {
					'attack': {
						value: null,
						bonus: 0,
						advantage: 0,
						disadvantage: 0
					},
					'defense': {
						value: null,
						bonus: 0,
						advantage: 0,
						disadvantage: 0
					},
					'morale': {
						value: null,
						bonus: 0,
						advantage: 0,
						disadvantage: 0
					}
				}
			}
		}
	}

}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["character"],
	makeDefault: false
});

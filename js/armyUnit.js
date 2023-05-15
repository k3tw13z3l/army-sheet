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
		options.classes.push('dnd5e actor army-sheet');
		mergeObject(options, {
			width: 748,
			height: 641
		});
		return options;
	}

  async getData(options) {
		const data = await super.getData(options);
		data.isGM = game.user.isGM;
		if (!data.actor.flags[mName]) {
	  	data.actor.flags[mName] = {
		  	'unit': {
			  	'type': "[type]",
				  'ancestry': "[ancestry]",
			  	'equipment': "[equipment]",
		  		'experience': "[experience]",
			  	'commander': "[commander]",
			   	'tier': "I",
				 	'damage': "1",
					'numberOfAtk': 1,
					'special': {
						diminishable: 1
					},
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
						'power': {
							value: null,
							bonus: 0,
							advantage: 0,
							disadvantage: 0
						},
						'morale': {
							value: null,
							bonus: 0,
						}
					}
				}
			}
		}
  	data.army = data.actor.flags[mName].unit;
		data.army.traits = [];

	  for (const item of data.items) {
			data.army.traits.push({
				id: item._id,
				name: item.name,
				activation: item.data?.activation?.type ||'none',
				description: {
					expanded: this._traitIsExpanded(item),
					enriched: TextEditor.enrichHTML(item.data?.description?.value, {
						secrets: data.owner,
						entities: true,
							links: true,
						rolls: true,
						rollData: this.actor.getRollData()
					})
				}
			});
		}

		return data;
	}

}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["character"],
	makeDefault: false
});

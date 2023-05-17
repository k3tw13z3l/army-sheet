const ArmySheet_Author = "k3tw13z3l";
const ArmySheet_Version = "0.0.0";
const mName="armySheet";

class ArmySheet extends dnd5e.applications.actor.ActorSheet5eNPC {

	get template() {
		/* Maybe add a limited sheet, with just some fluff 'history' text...*/
		return "modules/army-sheet/armyUnit.hbs";
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('dnd5e actor npc army-sheet');
		mergeObject(options, {
			width: 748,
			height: 641
		});
		return options;
	}

  async getData(options) {
		const data = await super.getData(options);

		data.isGM = game.user.isGM;
		if (!data.actor.flags[mName]?.army) {
	  	data.actor.flags[mName] = {
		  	'army': {
			  	'type': "[type]",
				  'ancestry': "[ancestry]",
			  	'equipment': "[equipment]",
		  		'experience': "[experience]",
			  	'commander': "[commander]",
			   	'tier': "I",
				 	'damage': "1",
					'numberOfAtk': 1,
					'special': {
						'diminishable': 1
					},
					'traits': [],
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

	  for (const item of data.items) {
			data.actor.flags[mName]?.army?.traits.push({
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

	_traitIsExpanded(trait) {
		return !!trait.flags[mName]?.army_trait_expanded?.[game.user.id] ||
						!!game.user.getFlag(mName, `army_trait_expanded.${trait._id}`);
}

}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["npc"],
	makeDefault: true
});

Hooks.on("ready", function() {
  console.log("-=> Army Sheet v" + ArmySheet_Version + " <=-");
});

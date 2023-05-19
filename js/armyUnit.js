const ArmySheet_Author = "k3tw13z3l";
const ArmySheet_Version = "0.0.0";
const mName="armySheet";

const DEFAULT_UNIT_DATA = {
	type: "infantry",
	ancestry: "undead",
	equipment: "light",
	experience: "regular",
	commander: "Mathu'Gar",
	tier: "I",
	damage: 1,
	numberOfAtk: 1,
	special: {
		diminishable: 1
	},
	traits: [],
	stats: {
		attack: {
			value: null,
			bonus: 0,
			advantage: 0,
			disadvantage: 0
		},
		defense: {
			value: null,
			bonus: 0,
			advantage: 0,
			disadvantage: 0
		},
		power: {
			value: null,
			bonus: 0,
			advantage: 0,
			disadvantage: 0
		},
		toughness: {
      value: null,
			bonus: 0
		},
		morale: {
			value: null,
			bonus: 0,
		}
	}
};



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
		const mycontext = await super.getData(options);

		mycontext.isGM = game.user.isGM;
		// if (!mycontext.actor.flags[mName]?.army) {
	  // 	mycontext.actor.flags[mName] = {
		mycontext.army = duplicate(this.actor.flags[mName].army || DEFAULT_UNIT_DATA);

	  for (const item of mycontext.items) {
			mycontext.actor.flags[mName]?.army?.traits.push({
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
    console.log(mycontext)
		return mycontext;
	}

	_traitIsExpanded(trait) {
		return !!trait.flags['armySheet']?.army_trait_expanded?.[game.user.id] ||
						!!game.user.getFlag('armySheet', `army_trait_expanded.${trait._id}`);
  }

	async _onTraitNameClicked(evt) {
					const item = this.actor.items.get(evt.currentTarget.closest('.onetraitbox').dataset.itemId);
					if (item.testUserPermission(game.user, 3)) {
									const isExpanded = !!item.getFlag('armySheet', `army_trait_expanded.${game.user.id}`);
									item.setFlag('armySheet', `army_trait_expanded.${game.user.id}`, !isExpanded);
					} else if (item.testUserPermission(game.user, 2)) {
									const isExpanded = !!game.user.getFlag('armySheet', `army_trait_expanded.${item.id}`);
									await game.user.setFlag('armySheet', `army_trait_expanded.${item.id}`, !isExpanded);
									this.render();
					}
	}

}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["npc"],
	makeDefault: true
});

Hooks.on("ready", function() {
  console.log("-=> Army Sheet v" + ArmySheet_Version + " <=-");
});

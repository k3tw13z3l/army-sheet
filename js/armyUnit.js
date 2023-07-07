const ArmySheet_Author = "k3tw13z3l";
const ArmySheet_Version = "0.0.0";
const mName="army-sheet";

const DEFAULT_UNIT_DATA = {
	army: {
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
			power: {
				value: null,
				bonus: 0,
				advantage: 0,
				disadvantage: 0
			},
			command: {
				value: null,
				bonus: 0,
				advantage: 0,
				disadvantage: 0
			},
			defense: {
				value: null,
				bonus: 0,
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
			height: 576
		});
		return options;
	}

  async getData(options) {
		const mycontext = await super.getData(options);

		mycontext.isGM = game.user.isGM;
    // if (!mycontext.actor.flags[mName]) {
		//   mycontext.actor.flags[mName] = DEFAULT_UNIT_DATA;
		// }
    mycontext.army = duplicate(this.actor.getFlag(mName,"army") || DEFAULT_UNIT_DATA);

		console.log("mycontext 0: ", mycontext.actor.flags[mName]);
		// console.log("mycontext 1: ", mycontext.actor.flags[mName].army);
		// mycontext.army = mycontext.actor.flags[mName].army;
		console.log("mycontext 2: ", mycontext.army);

    mycontext.army.traits = [];

		for (const item of mycontext.items) {
			const requirements = item.system.requirements;
			if (requirements) {
				if (requirements === "Ancestry") {
					mycontext.army.ancestry = item.name;
					continue;
				} else if (requirements === "Experience") {
					mycontext.army.experience = item.name;
					continue
				} else if (requirements === "Type") {
					mycontext.army.type = item.name;
					continue;
				} else if (requirements === "Equipment") {
					mycontext.army.equipment = item.name;
					continue;
				}
			}
			mycontext.army.traits.push({
				id: item._id,
				name: item.name,
				activation: item.system?.activation?.type || 'none',
				description: {
					expanded: this._traitIsExpanded(item),
					enriched: await TextEditor.enrichHTML(item.system?.description?.value, {
            async: true,
						secrets: mycontext.owner,
						entities: true,
						links: true,
						rolls: true,
						rollData: this.actor.getRollData()
					})
				}
			});
		}
    console.log("mycontext 3: ", mycontext)

		return mycontext;
	}

  activateListeners(html) {
	  super.activateListeners(html);

		html.click(this._onWindowClick.bind(this));

		html.find('.armyUnit-addTrait').click(this._onAddTrait.bind(this));
		html.find('.armyUnit-delTrait').click(this._onDelTrait.bind(this));
		html.find('.traitname').mousedown(async (event) => {
			if (event.which === 2) {
				const item = this.actor.items.get(event.currentTarget.closest('.onetraitbox').dataset.itemId);
		    item.sheet.render(true);
			}
		});
    html.find(".traitname").click(this._onTraitNameClicked.bind(this));
		html.find('armyUnit-roll').click(this._onRollAttribute.bind(this));
		html.find('armyUnit-lock').click(this._onConfigClicked.bind(this));
  }

	_traitIsExpanded(trait) {
		console.log("first :",trait);
		return !!trait.flags[mName]?.expanded?.[game.user.id] ||
						!!game.user.getFlag(mName, `expanded?.${trait._id}`);
  }

	// async _onTraitNameClicked(evt) {
	// 	const item = this.actor.items.get(evt.currentTarget.closest('.onetraitbox').dataset.itemId);
  //   const traits = this.actor.flags[mName]?.army.traits;

	// 	for (var i=0; i<traits.length; i++) {
	// 		const cTrait = traits[i];
	// 	  console.log("before :",cTrait.description.expanded);
	// 		const isExpanded = !!item.getFlag(mName, `expanded.${game.user.id}`);
	// 	  console.log("before 2:", isExpanded);
	// 		if (cTrait.id === item.id){
	// 			 cTrait.description.expanded = !cTrait.description.expanded;
	// 			 console.log("if :", cTrait.description.expanded)
	// 		}
	// 		window.MidiQOL.showItemInfo.bind(item)(); // To chat
	// 		console.log("after :",cTrait.description.expanded)
	// 	}
	// 	return;
	// }

	async _onTraitNameClicked(evt) {
		const item = this.actor.items.get(evt.currentTarget.closest('.onetraitbox').dataset.itemId);
		if (item.testUserPermission(game.user, 3)) {
						const isExpanded = !!item.getFlag(mName, `expanded.${game.user.id}`);
						item.setFlag(mName, `expanded.${game.user.id}`, !isExpanded);
						console.log("onclick user-3: ", item);
		} else if (item.testUserPermission(game.user, 2)) {
						const isExpanded = !!game.user.getFlag(mName, `expanded.${item.id}`);
						await game.user.setFlag(mName, `expanded.${item.id}`, !isExpanded);
						console.log("onclick user-2: ", item);
						this.render();
		}
  }

  async _onConfigClicked(evt) {
		const currentStatus = !!this.actor.getFlag(mName, 'sheet.config');
		this.actor.setFlag(mName, 'sheet.config', !currentStatus);
	}

	_onAddTrait(evt) {
		const dataset = evt.currentTarget.dataset;
		console.log("dataset: ", dataset);
		const data = {
			activation: {
				cost: dataset.cost ? Number(dataset.cost) : null,
				type: dataset.type || ""
			}
		};

		this.actor.createEmbeddedDocuments('Item', [{
			type: 'feat',
			name: "NewTrait",
			data: data
		}], {renderSheet: true});
  }

  _onDelTrait(evt) {
	  const target = evt.currentTarget;
	  if (!target.classList.contains('armyUnit-alert')) {
			target.classList.add('armyUnit-alert');
			return;
	  }

	  const parent = target.closest('.onetraitbox');
  	let itemId = parent.dataset.itemId;
	  if (itemId && this.actor.items.get(itemId)) {
			this.actor.deleteEmbeddedDocuments('Item', [itemId]);
	  }
  }

	_onWindowClick(evt) {
		const rmItem = evt.target.closest('.onetraitbox');

		if (!rmItem) {
						$('.armyUnit-alert').removeClass('armyUnit-alert');
		}
  }

  _onRollAttribute(evt) {
    this.actor.rollKWUnitAttribute(evt.currentTarget.dataset['kwRoll'], {event: evt});
  }

}

Actors.registerSheet("dnd5e", ArmySheet, {
	types: ["npc"],
	makeDefault: true
});

Hooks.on("ready", function() {
  console.log("-=> Army Sheet v" + ArmySheet_Version + " <=-");
});

Hooks.on("dropActorSheetData", (actor, sheet, itemInfo) =>{
	if(itemInfo.type === 'Actor') {
		dropActor.call(actor, itemInfo, sheet);
		return false;
	}
});

function dropActor(itemInfo, armySheet) {
	console.log("drop it:", itemInfo)
	//set commander
	const droppedActor = game.actors.get(itemInfo.uuid);

console.log("drop :",droppedActor);

	this.setFlag(mName, 'army.commander', droppedActor.system.name);

	//Only set permissions when dragging PCs.
	if (droppedActor.type !== 'character') {
					return;
	}

	const existingPermissions = this.data.permission;
	const updatedPermissions = {}

	//Remove other owners (not GMs, default or observers)
	Object.entries(existingPermissions)
					.map(e => {
									if (e[0] !== 'default' && !game.users.get(e[0])?.isGM && e[1] === OWNER) {
													return [e[0], CONST.ENTITY_PERMISSIONS.NONE];
									}
									return e;
					})
					.forEach(e => updatedPermissions[e[0]] = e[1]);

	//Add owner of the dropped actor as the owner of the warfare unit
	Object.entries(droppedActor.permission)
					.filter(e => e[0] !== 'default' && !game.users.get(e[0])?.isGM && e[1] === OWNER)
					.map(e => e[0])
					.forEach(id => {
									updatedPermissions[id] = OWNER;
					});

	this.update({permission: updatedPermissions});

	//set unit disposition to friendly if a pc is dropped
	armySheet.token.update({disposition: 1});
}


Handlebars.registerHelper('armyUnit-number-format', function (n, options) {
	if (n == null) {
					return '';
	}

	const places = options.hash.decimals || 0;
	const sign = !!options.hash.sign;
	n = parseFloat(n).toFixed(places);
	return sign && n >= 0 ? '+' + n : n;
});

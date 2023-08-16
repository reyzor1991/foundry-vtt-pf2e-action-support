function huntedShotWeapons(actor) {
    return actor.system.actions
        .filter( h => h.visible && h.item?.isRanged)
        .filter( h => "0" === h?.item?.reload);
};

async function huntedShot(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actorAction(actor, "hunted-shot") && !actorFeat(actor, "hunted-shot" ) ) {
        ui.notifications.warn(`${actor.name} does not have Hunted Shot!`);
        return;
    }

    const DamageRoll = CONFIG.Dice.rolls.find( r => r.name === "DamageRoll" );
    const critRule = game.settings.get("pf2e", "critRule");

    const weapons = huntedShotWeapons(actor)
    if (weapons.length === 0) {
        ui.notifications.warn(`${actor.name} doesn't have correct weapon'`);
        return;
    }

    let weaponOptions = '';
    for ( const w of weapons ) {
        weaponOptions += `<option value=${w.item.id}>${w.item.name}</option>`
    }

    const { currentWeapon, map, dos} = await Dialog.wait({
        title:"Hunted Shot",
        content: `
            <div class="row-hunted-shot"><div class="column-hunted-shot first-hunted-shot"><h3>First Attack</h3><select id="fob1" autofocus>
                ${weaponOptions}
            </select></div></div><hr><h3>Multiple Attack Penalty</h3>
                <select id="map">
                <option value=0>No MAP</option>
                <option value=1>MAP -5(-4 for agile)</option>
                <option value=2>MAP -10(-8 for agile)</option>
            </select><hr>
        `,
        buttons: {
                ok: {
                    label: "Attack",
                    icon: "<i class='fa-solid fa-hand-fist'></i>",
                    callback: (html) => { return { currentWeapon: [html[0].querySelector("#fob1").value], map: parseInt(html[0].querySelector("#map").value)} }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
        },
        render: (html) => {
            html.parent().parent()[0].style.cssText += 'box-shadow: 0 0 30px green;';
        },
        default: "ok"
    });

    const map2 = map === 2 ? map : map + 1;
    if ( currentWeapon === undefined ) { return; }

    const primary = weapons.find( w => w.item.id === currentWeapon[0] );
    const secondary = weapons.find( w => w.item.id === currentWeapon[0] );

    let options = [];

    const damages = [];
    function PD(cm) {
        if ( cm.user.id === game.userId && cm.isDamageRoll ) {
            damages.push(cm);
            return false;
        }
    }

    Hooks.on('preCreateChatMessage', PD);

    const altUsage = null;
    const ev = new KeyboardEvent('keydown', {'shiftKey': true});
    const primaryMessage = await primary.variants[map].roll({ event:ev, altUsage });
    const primaryDegreeOfSuccess = primaryMessage.degreeOfSuccess;
    const secondaryMessage = await secondary.variants[map2].roll({ event:ev, altUsage });
    const secondaryDegreeOfSuccess = secondaryMessage.degreeOfSuccess;

    let pd,sd;
    if ( primaryDegreeOfSuccess === 2 ) { pd = await primary.damage({event,options}); }
    if ( primaryDegreeOfSuccess === 3 ) { pd = await primary.critical({event,options}); }
    if ( secondaryDegreeOfSuccess === 2 ) { sd = await secondary.damage({event,options}); }
    if ( secondaryDegreeOfSuccess === 3 ) { sd = await secondary.critical({event,options}); }

    Hooks.off('preCreateChatMessage', PD);

    if (damages.length === 0) {
        ChatMessage.create({
            type: CONST.CHAT_MESSAGE_TYPES.OOC,
            content: "Both attacks missed"
        });
        return;
    }


    if ( (primaryDegreeOfSuccess <= 1 && secondaryDegreeOfSuccess >= 2) || (secondaryDegreeOfSuccess <= 1 && primaryDegreeOfSuccess >= 2)) {
        ChatMessage.createDocuments(damages);
        return;
    }
    await new Promise( (resolve) => {
        setTimeout(resolve,0);
    });

    const flavor = `<strong>Hunted Shot Total Damage</strong><p>${damages[0].flavor}</p><hr>`

    const damageRolls = damages.map(a=>a.rolls).flat().map(a=>a.terms).flat().map(a=>a.rolls).flat();
    const data = {};
    for ( const dr of damageRolls ) {
        if (dr.options.flavor in data) {
            data[dr.options.flavor].push(dr.head.expression);
        } else {
            data[dr.options.flavor] = [dr.head.expression]
        }
    }
    const formulas = [];
    Object.keys(data).forEach(k=>{
        console.log(k);
        console.log(data[k]);
         formulas.push(`(${data[k].join('+')})[${k}]`);
    })

    const rolls = [await new DamageRoll(formulas.join(',')).evaluate( {async: true} )];
    const opts = damages[0].flags.pf2e.context.options.concat(damages[1].flags.pf2e.context.options);
    await ChatMessage.create({
        flags: {
            pf2e: {
                context: {
                    options: [...new Set(opts)]
                }
            }
        },
        rolls,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        flavor,
        speaker: ChatMessage.getSpeaker(),
    });
}

async function rangerLink(actor) {
    if (!game.user.isGM) {
        ui.notifications.info(`Only GM can run script`);
        return
    }
    if (!actor) {
        ui.notifications.info(`Need to select Actor`);
        return
    }
    if ("ranger" != actor?.class?.slug) {
        ui.notifications.info(`Actor should be Ranger`);
        return
    }
    if (game.user.targets.size != 1) {
        ui.notifications.info(`Need to select 1 token of animal companion as target`);
        return
    }
    const target = game.user.targets.first().actor;
    if ("animal-companion" != target?.class?.slug) {
        ui.notifications.info(`Need to select 1 token of animal companion as target`);
        return
    }

    target.setFlag(moduleName, "ranger", actor.id);
    actor.setFlag(moduleName, "animalCompanion", target.uuid);

    ui.notifications.info(`Ranger and Animal Companion were linked`);
}

Hooks.once("init", () => {

    const originGetRollContext = CONFIG.Actor.documentClass.prototype.getRollContext;
    CONFIG.Actor.documentClass.prototype.getRollContext = async function(prefix) {
        const r = await originGetRollContext.call(this, prefix);
        if (r.options.has("first-attack")) {
            const ranger=this.getFlag(moduleName, "ranger");
            if (ranger) {
                if (!r.options.has(`target:effect:hunt-prey-${ranger}`)) {
                    r.options.delete("first-attack");
                }
            } else if (!r.options.has(`target:effect:hunt-prey-${this.id}`)) {
                r.options.delete("first-attack");
            }
        }
        return r;
    }

    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "huntedShot": huntedShot,
        "rangerLink": rangerLink,
    })
});
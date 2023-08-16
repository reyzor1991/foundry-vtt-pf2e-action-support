function flurryOfBlowsWeapons(actor) {
    let weapons = actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") );

    if ( actor.system.actions.some( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ) ) {
        weapons = actor.system.actions.filter( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ).concat(actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") && h.origin?.type !== "effect" ));
    }

    if ( actor.itemTypes.feat.some( s => s.slug === "monastic-weaponry" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.system?.traits?.value.includes("monk") ) ) {
        weapons = actor.system.actions.filter( h => h.item?.isHeld && h.ready && h.item?.system?.traits?.value.includes("monk") ).concat(weapons)
    }

    if ( actor.itemTypes.effect.some( s => s.slug === "stance-monastic-archer-stance" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) ) {
        weapons.unshift( actor.system.actions.find( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) )
    }

    return weapons;
};

async function flurryOfBlows(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actorAction(actor, "flurry-of-blows") && !actorFeat(actor, "flurry-of-blows" ) ) {
        ui.notifications.warn(`${actor.name} does not have Flurry of Blows!`);
        return;
    }

    const DamageRoll = CONFIG.Dice.rolls.find( r => r.name === "DamageRoll" );
    const critRule = game.settings.get("pf2e", "critRule");

    const weapons = flurryOfBlowsWeapons(actor)
    if (weapons.length === 0) {
        ui.notifications.warn(`${actor.name} doesn't have correct weapon'`);
        return;
    }

    let weaponOptions = '';
    for ( const w of weapons ) {
        weaponOptions += `<option value=${w.item.id}>${w.item.name}</option>`
    }

    const { currentWeapon, map, dos} = await Dialog.wait({
        title:"Flurry of Blows",
        content: `
            <div class="row-flurry"><div class="column-flurry first-flurry"><h3>First Attack</h3><select id="fob1" autofocus>
                ${weaponOptions}
            </select></div><div class="column-flurry second-flurry"><h3>Second Attack</h3>
            <select id="fob2">
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
                    callback: (html) => { return { currentWeapon: [html[0].querySelector("#fob1").value,html[0].querySelector("#fob2").value], map: parseInt(html[0].querySelector("#map").value)} }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
        },
        render: (html) => {
            html.parent().parent()[0].style.cssText += 'box-shadow: 0 0 30px red;';
            for (const child of html.parent().parent().children()) {
                child.style.cssText += 'box-shadow: 0 0 15px yellow;';
            }
        },
        default: "ok"
    });

    const map2 = map === 2 ? map : map + 1;
    if ( currentWeapon === undefined ) { return; }

    const primary = weapons.find( w => w.item.id === currentWeapon[0] );
    const secondary = weapons.find( w => w.item.id === currentWeapon[1] );

    const options = actorFeat(actor, "stunning-fist") ? ["stunning-fist"] : [];

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

    let flavor = '<strong>Flurry Of Blows Total Damage</strong>'
    const color = (primaryDegreeOfSuccess || secondaryDegreeOfSuccess) === 2 ? `<span style="color:rgb(0, 0, 255)">Success</span>` : `<span style="color:rgb(0, 128, 0)">Critical Success</span>`
    if (damages[0].flavor === damages[1].flavor) {
        flavor += `<p>Same Weapon (${color})<hr>${damages[0].flavor}</p><hr>`;
    } else {
        flavor += `<hr>${damages[0].flavor}<hr>${damages[1].flavor}`;
    }

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

Hooks.once("init", () => {
    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "flurryOfBlows": flurryOfBlows,
    })
});
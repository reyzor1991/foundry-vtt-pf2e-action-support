function doubleSliceWeapons(actor) {
    return actor.system.actions
        .filter( h => h.ready && (h.item?.isMelee || (h.item?.isThrown && actorFeat(actor, "double-slice"))) && h.item?.isHeld && h.item?.hands === "1" && h.item?.handsHeld === 1 && !h.item?.system?.traits?.value?.includes("unarmed") );
};


async function doubleSlice(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actorFeat(actor, "double-slice" ) ) {
        ui.notifications.warn(`${actor.name} does not have Double Slice!`);
        return;
    }

    const weapons = doubleSliceWeapons(actor);
    if (weapons.length != 2) {
        ui.notifications.warn(`${actor.name} needs only 2 one-handed melee weapons can be equipped at a time.'`);
        return;
    }

    const { map } = await Dialog.wait({
        title:"Double Slice",
        content: `
            <h3>Multiple Attack Penalty</h3>
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
                    callback: (html) => { return { map: parseInt(html[0].querySelector("#map").value)} }
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

    if ( map === undefined ) { return; }

    let primary =  actor.system.actions.find( w => w.item.id === weapons[0].item.id );
    let secondary =  actor.system.actions.find( w => w.item.id === weapons[1].item.id );
    if (primary.item.system.traits.value.includes("agile")) {
        primary =  actor.system.actions.find( w => w.item.id === weapons[1].item.id );
        secondary =  actor.system.actions.find( w => w.item.id === weapons[0].item.id );
    }

    combinedDamage("Double Slice", primary, secondary, ["double-slice-second"], map, map);
}



function knockdownWeapons(actor) {
    return actor.system.actions.filter( h => h.ready && h.visible && h.item?.isMelee && h.item?.isHeld && !h.item?.system?.traits?.value?.includes("unarmed")  );
};

async function knockdown(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actor?.itemTypes?.feat?.find(c => "knockdown" === c.slug) && !actor?.itemTypes?.feat?.find(c => "slam-down" === c.slug) ) {
        ui.notifications.warn(`${actor.name} does not have Knockdown/Slam Down!`);
        return;
    }

    const weapons = knockdownWeapons(actor);

    let weaponOptions = '';
    for ( const w of weapons ) {
        weaponOptions += `<option value=${w.item.id}>${w.item.name}</option>`
    }

    const { currentWeapon, map } = await Dialog.wait({
        title:"Knockdown/Slam Down",
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

    if ( currentWeapon === undefined || map === undefined ) { return; }
    let primary =  actor.system.actions.find( w => w.item.id === currentWeapon[0] );

    const ev = game.settings.get(moduleName, "skipRollDialogMacro")
        ? new KeyboardEvent('keydown', {'shiftKey': game.user.flags.pf2e.settings.showRollDialogs})
        : event;

    const primaryMessage = await primary.variants[map].roll({ event:ev });
    const primaryDegreeOfSuccess = primaryMessage.degreeOfSuccess;

    let pd;
    if (game.settings.settings.has('xdy-pf2e-workbench.autoRollDamageForStrike') && game.settings.get('xdy-pf2e-workbench', 'autoRollDamageForStrike')) {
        pd = true;
    } else {
        if ( primaryDegreeOfSuccess === 2 ) { pd = await primary.damage({event}); }
        if ( primaryDegreeOfSuccess === 3 ) { pd = await primary.critical({event}); }
    }

    if (pd) {
        if (actor?.itemTypes?.feat?.find(c => "improved-knockdown" === c.slug) || actor?.itemTypes?.feat?.find(c => "crashing-slam" === c.slug) ) {
            increaseConditionForActor(game.user.targets.first().actor, "prone");

            let formula = "1d6[bludgeoning]";
            if (primary.item.hands === '2') {
                formula = `${primary.item.system.damage.die}[bludgeoning]`
            }
            applyDamage(game.user.targets.first().actor, game.user.targets.first(), formula);
        } else {
            let modifiers = [new game.pf2e.Modifier({ label: "PF2E.MultipleAttackPenalty", modifier: map > 0 ? Math.min(2, map) * -5 : map })]
            game.pf2e.actions.trip({modifiers, event: ev });
        }
    }
}

Hooks.once("init", () => {
    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "doubleSlice": doubleSlice,
        "knockdown": knockdown,
    })
});
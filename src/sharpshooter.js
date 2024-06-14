function accidentalShotWeapons(actor) {
    return actor.system.actions
        .filter( h => h.visible && h.item?.isRanged && h.item?.ammo && h.ready);
};

async function accidentalShot(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if (!actor?.itemTypes?.action?.find(c => "accidental-shot" === c.slug)) {
        ui.notifications.warn(`${actor.name} does not have Accidental Shot!`);
        return;
    }

    const weapons = accidentalShotWeapons(actor);
    if (weapons.length === 0) {
        ui.notifications.warn(`${actor.name} doesn't have correct weapon`);
        return;
    }

    let weaponOptions = weapons.map(w=>`<option value=${w.item.id}>${w.item.name}</option>`).join('');

    const { currentWeapon, map } = await Dialog.wait({
        title:"Accidental Shot",
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

    if ( map === undefined ) { return; }
    if ( currentWeapon === undefined || map === undefined ) { return; }

    await setEffectToActor(actor, 'Compendium.pf2e.spell-effects.Item.fpGDAz2v5PG0zUSl')

    const primary =  actor.system.actions.find( w => w.item.id === currentWeapon[0] );

    const damages = [];
    function PD(cm) {
        if ( cm.user.id === game.userId && cm.isDamageRoll) {
            damages.push(cm);
            return false;
        }
    }
    Hooks.on('preCreateChatMessage', PD);
    const ev = game.settings.get(moduleName, "skipRollDialogMacro")
        ? new KeyboardEvent('keydown', {'shiftKey': game.user.flags.pf2e.settings.showRollDialogs})
        : event;

    const primaryRoll = await primary.variants[map].roll({ event:ev });
    const primaryDegreeOfSuccess = primaryRoll?.degreeOfSuccess;
    if ( !primaryDegreeOfSuccess || primaryDegreeOfSuccess === 0 || primaryDegreeOfSuccess === 1 ) {
        Hooks.off('preCreateChatMessage', PD);
        return;
    }


    const isWorkbench = game.settings.settings.has('xdy-pf2e-workbench.autoRollDamageForStrike') && game.settings.get('xdy-pf2e-workbench', 'autoRollDamageForStrike');

    const options = ["skip-handling-message"];
    if ( primaryDegreeOfSuccess === 2 ) {
        await primary.damage({event, options});
    } else {
        await primary.critical({event, options});
    }

    if (!isWorkbench) {
        if ( primaryDegreeOfSuccess === 2 ) {
            await primary.damage({event});
        } else {
            await primary.critical({event});
        }
    }

    Hooks.off('preCreateChatMessage', PD);

    if (damages[0].rolls[0].total > damages[1].rolls[0].total) {
        ChatMessage.createDocuments([damages[0]]);
    } else {
        ChatMessage.createDocuments([damages[1]]);
    }
}

Hooks.once("init", () => {
    game.actionsupport = foundry.utils.mergeObject(game.actionsupport ?? {}, {
        "accidentalShot": accidentalShot,
    })
});
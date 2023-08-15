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
    const hits = [];
    function PD(cm) {
        if ( cm.user.id === game.userId && cm.isDamageRoll ) {
            damages.push(cm);
            return false;
        } else if ( cm.user.id === game.userId && cm.isCheckRoll ) {
            hits.push(cm);
            return false;
        }
    }

    Hooks.on('preCreateChatMessage', PD);

    const primaryMessage = await primary.variants[map].roll();
    const primaryDegreeOfSuccess = primaryMessage.degreeOfSuccess;
    const secondaryMessage = await secondary.variants[map2].roll();
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

    console.log(damages);

    let flavor = '<strong>Hunted Shot Total Damage</strong>'
    const color = (primaryDegreeOfSuccess || secondaryDegreeOfSuccess) === 2 ? `<span style="color:rgb(0, 0, 255)">Success</span>` : `<span style="color:rgb(0, 128, 0)">Critical Success</span>`
    if (damages[0].flavor === damages[1].flavor) {
        flavor += `<p>Same Weapon (${color})<hr>${damages[0].flavor}</p><hr>`;
    } else {
        flavor += `<hr>${damages[0].flavor}<hr>${damages[1].flavor}`;
    }

    const opts = damages[0].flags.pf2e.context.options.concat(damages[1].flags.pf2e.context.options);
    const rolls = [await new DamageRoll(damages.map(a=>a.rolls).flat().map(a=>a._formula.replace("{","").replace("}","")).join(",")).evaluate( {async: true} )];
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
        "huntedShot": huntedShot,
    })
});
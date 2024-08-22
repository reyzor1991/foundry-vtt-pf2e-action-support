function pairedShotsWeapons(actor) {
    return actor.system.actions
        .filter( h => h.ready && h.item?.isRanged && h.item?.ammo)
        .filter( h => h.item?.isHeld && h.item?.hands === "1" && h.item?.handsHeld === 1)
        .filter( h => ["firearm", "crossbow"].includes(h.item?.group));
};


async function pairedShots(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actorFeat(actor, "paired-shots" ) ) {
        ui.notifications.warn(`${actor.name} does not have Paired Shots!`);
        return;
    }

    const weapons = pairedShotsWeapons(actor);
    if (weapons.length != 2) {
        ui.notifications.warn(`${actor.name} needs only 2 one-handed weapons,  firearm or crossbow.'`);
        return;
    }

    const { map } = await Dialog.wait({
        title:"Paired Shots",
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

    combinedDamage("Paired Shots", primary, secondary, ["paired-shots"], map, map);
}

async function rootToLife(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    const feat = actorFeat(actor, "root-to-life");
    if ( !feat ) {
        ui.notifications.warn(`${actor.name} does not have Root to Life!`);
        return;
    }
    if (game.user.targets.size !== 1) { ui.notifications.info(`Need to select 1 token as target`);return; }
    if (!distanceIsCorrect(_token, game.user.targets.first(), 5)) { ui.notifications.info(`Target should be adjacent`);return; }

    const { action } = await Dialog.wait({
        title:"Root to Life",
        content: `
            <h3>Actions</h3>
            <select id="map">
                <option value=1>1 Action</option>
                <option value=2>2 Action</option>
            </select><hr>
        `,
        buttons: {
            ok: {
                label: "Use",
                icon: "<i class='fa-solid fa-hand-fist'></i>",
                callback: (html) => { return { action: parseInt(html[0].querySelector("#map").value)} }
            },
            cancel: {
                label: "Cancel",
                icon: "<i class='fa-solid fa-ban'></i>",
            }
        },
        default: "ok"
    });
    if ( action === undefined ) { return; }

    await removeConditionFromActor(game.user.targets.first().actor, 'dying', true)

    if (action === 2) {
        setEffectToActor(game.user.targets.first().actor, `Compendium.${moduleName}.action-support.Item.MyxzXA8wHHs6rxGj`, 1, {origin:{actor: actor?.uuid, item:feat?.uuid}})
            .then(async ()=> {
                await rollAllRecovery(game.user.targets.first().actor)
                const eff = hasEffectBySourceId(game.user.targets.first().actor, `Compendium.${moduleName}.action-support.Item.MyxzXA8wHHs6rxGj`)
                if (eff) {
                    await deleteItem(eff)
                }
            })

    }
}
Hooks.once("init", () => {
    game.actionsupport = foundry.utils.mergeObject(game.actionsupport ?? {}, {
        "pairedShots": pairedShots,
        "rootToLife": rootToLife,
    })
});
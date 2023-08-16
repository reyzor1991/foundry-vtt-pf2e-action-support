async function inspireHeroics(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}

    if (!actor.itemTypes.spell.find(a=>a.slug === "inspire-courage")) {
        ui.notifications.warn(`${actor.name} does not have Inspire Courage spell!`);
        return;
    }

    const { dc, spell } = await Dialog.wait({
        title:"Use spell",
        content: `
            <h3>DC of performance check</h3>
            <input id="spell-dc" type="number" min="0" value="0"/>
            <hr><h3>Spell for aura effect</h3><select id="spells">
                <option value=0>Inspire Courage</option>
                <option value=1>Inspire Defense</option>
            </select><hr>
        `,
        buttons: {
                ok: {
                    label: "Cast",
                    icon: "<i class='fa-solid fa-magic'></i>",
                    callback: (html) => { return { dc: parseInt(html[0].querySelector("#spell-dc").value), spell: parseInt(html[0].querySelector("#spells").value)} }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
        },
        render: (html) => {
            html.parent().parent()[0].style.cssText += 'box-shadow: 0 0 10px yellow;';
        },
        default: "ok"
    });

    const degreeOfSuccess = (await actor.skills.performance.roll({dc, skipDialog: true})).degreeOfSuccess;
    console.log(degreeOfSuccess)


    const aura = (await fromUuid("Compendium.pf2e-action-support.action-support.Item.mGQMqBoTFRz3or4D")).toObject();
    let idOfEffect='';
    if (spell === 0) {
        if (degreeOfSuccess === 3) {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.VFereWC1agrwgzPL";
        } else if (degreeOfSuccess === 2) {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.kZ39XWJA3RBDTnqG";
        } else {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.beReeFroAx24hj83";
        }
    } else {
        if (degreeOfSuccess === 3) {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.BKam63zT98iWMJH7";
        } else if (degreeOfSuccess === 2) {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.Chol7ExtoN2T36mP";
        } else {
            idOfEffect = "Compendium.pf2e.spell-effects.Item.DLwTvjjnqs2sNGuG";
        }
    }

    aura.system.rules[0].effects[0].uuid = idOfEffect;
    await actor.createEmbeddedDocuments("Item", [aura]);
}

Hooks.once("init", () => {

    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "inspireHeroics": inspireHeroics,
    })
});
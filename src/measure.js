function getAllCoordinates(x, y, width) {
    var startY = y;
    var arr = [];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            arr.push(`${x}.${y}`);
            y += 100;
        }
        y = startY;
        x += 100;
    }
    return arr
}

Hooks.on('drawMeasuredTemplate', async (measuredTemplate)=>{
    if (!game.user.isGM) {return;}
    if (!game?.combats?.active) {return;}
    if (!game.settings.get(moduleName, "handleMeasuredTemplate")) {return;}
    if (measuredTemplate?.scene?.uuid != game.scenes?.active?.uuid) {return;}
    if (measuredTemplate.document?.flags?.pf2e?.origin?.type != 'spell') {return;}
    if (!measuredTemplate.document._id) {return;}
    if (measuredTemplate.document.getFlag(moduleName, "end")) {return;}


    const spell = await fromUuid(measuredTemplate.document.flags.pf2e.origin.uuid);
    let duration = 0;
    if (spell && spell.system.duration?.value) {
        const regex = /([0-9]{1,}) ([a-z]{1,})/g;
        const array = [...spell.system.duration.value.matchAll(regex)];
        if (array?.length === 1) {
            const digit = parseInt(array[0][1])
            const type = array[0][2].slice(-1) === 's' ? array[0][2] : array[0][2] + 's'
            duration = digit * (DURATION_UNITS[type] ?? 0);
        }
    }
    await measuredTemplate.document.setFlag(moduleName, "end", { value: game.time.worldTime + duration, initiative: game.combat?.combatant?.initiative });
});


Hooks.on('pf2e.endTurn', async (combatant, encounter, id) => {
    const forDelete = []
    game.scenes.active.templates.filter(a=>a.getFlag("pf2e-action-support", "end")).forEach(async (a) => {
        if ((a.getFlag("pf2e-action-support", "end").value - game.time.worldTime) <= 0 ) {
            if (!a.getFlag("pf2e-action-support", "end").initiative ||  combatant.initiative <= a.getFlag("pf2e-action-support", "end").initiative) {
                forDelete.push(a.id)
            }
        }
    })
    if (forDelete.length > 0) {
        await canvas.scene?.deleteEmbeddedDocuments("MeasuredTemplate", forDelete);
    }
});

Hooks.on('refreshMeasuredTemplate', async (measuredTemplate)=>{
    if (!game.user.isGM) {return;}
    if (!game?.combats?.active) {return;}
    if (!game.settings.get(moduleName, "handleMeasuredTemplate")) {return;}
    if (measuredTemplate?.scene?.uuid != game.scenes?.active?.uuid) {return;}
    if (!measuredTemplate.document?.flags?.pf2e?.origin?.slug){return;}

    const gridHL = canvas.grid.getHighlightLayer(`MeasuredTemplate.${measuredTemplate.id}`);
    if (!gridHL || !gridHL.positions || !gridHL.positions.size===0){return;}

    const {turns} = game.combat;
    const actorsInTemplate = [];

    turns.forEach(combatant => {
        const coos = getAllCoordinates(combatant.token.x,combatant.token.y,combatant.token.width);

        if (coos.some(bb=>gridHL.positions.has(bb))) {
            actorsInTemplate.push(combatant.actor);
        }
    })
    if (actorsInTemplate) {
        const slug = measuredTemplate.document.flags.pf2e.origin.slug;
        const spell = await fromUuid(measuredTemplate.document.flags.pf2e.origin.uuid);
        const owner = spell.actor;
        if (slug === 'rejuvenating-flames') {
            const actorsForUpdate = isActorCharacter(owner)
                ? actorsInTemplate.filter(a=>isActorCharacter(a))
                : actorsInTemplate.filter(a=>!isActorCharacter(a));

            actorsForUpdate.forEach(a => {
                if (!hasEffect(a, "spell-effect-rejuvenating-flames")) {
                    setEffectToActor(a, "Compendium.pf2e.spell-effects.Item.06zdFoxzuTpPPGyJ")
                }
            })
        }
    }
});
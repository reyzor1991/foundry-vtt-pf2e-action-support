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

Hooks.on('refreshMeasuredTemplate', async (measuredTemplate)=>{
    if (!game.user.isGM) {return;}
    if (!game?.combats?.active) {return;}
    if (!game.settings.get(moduleName, "handleMeasuredTemplate")) {return;}
    if (measuredTemplate?.scene?.uuid != game.scenes?.active?.uuid) {return;}
    if (!measuredTemplate.document?.flags?.pf2e?.origin?.slug){return;}

    const gridHL = canvas.grid.getHighlightLayer(`MeasuredTemplate.${measuredTemplate.id}`);
    if (!gridHL || !gridHL.positions|| !gridHL.positions.size===0){return;}

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
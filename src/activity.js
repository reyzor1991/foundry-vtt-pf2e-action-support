function handleActivityAction(actor, _obj) {
    if (_obj.slug === "scout") {
        const sc = actorFeat(actor, "incredible-scout");

        const party = game.actors.filter(a=>a.isOfType("party")).find(a=>a.members.find(b=>b.id===actor.id));
        if (party) {
            party.members.forEach(tt => {
                if (!hasEffectBySourceId(tt, sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")) {
                    setEffectToActor(tt, sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
                }
            })
        } else if (sc && !hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6")) {
            setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6")
        } else if (!hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")) {
            setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
        }
    } else if (_obj.slug === "follow-the-expert") {
        if (!hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3")) {
            setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3")
        }
    }
}


Hooks.on('preUpdateActor', async (actor, data, diff, id) => {
    if (!data?.system?.exploration) {return;}

    data?.system?.exploration.forEach(async (b) => {
        let act = actor.itemTypes.action.find(a => a.id === b);
        if (act) {
            handleActivityAction(actor, act);
        }
    })
});
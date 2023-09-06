const activityExplorationEffects = {
    'avoid-notice': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.N8vpuGy4TzU10y8E',
    'cover-tracks': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.F6vJYLZTWDpnrnCZ',
    'defend': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.GYOyFj4ziZX060rZ',
    'detect-magic': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.OjRHL0B4WAUUQc13',
    'follow-the-expert': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.V347nnVBGDrVWh7k',
    'hustle': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.vNUrKvoOSvEnqzhM',
    'investigate': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.tDsgl8YmhZbx2May',
    'repeat-a-spell': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.kh1QdKkvbNZ0qBsQ',
    'scout': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.mGFBHM1lvHNZ9BsH',
    'search': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.XiVLHjg5lQVMX8Fj',
    'track': 'Compendium.pf2e-exploration-effects.exploration-effects.Item.OcCXjJab7rSR3mDf',
}

function handleActivityAction(actor, _obj) {
    if (_obj.slug === "scout") {
        const sc = actorFeat(actor, "incredible-scout");
        const ded = actorFeat(actor, "scout-dedication");

        const party = game.actors.filter(a=>a.isOfType("party")).find(a=>a.members.find(b=>b.id===actor.id));
        if (party) {
            party.members.filter(a=>a.uuid != actor.uuid).forEach(tt => {
                if (!hasEffectBySourceId(tt, ded ? 'Compendium.pf2e-action-support.action-support.Item.U7tuKcRePhSu2C2P' : sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")) {
                    setEffectToActor(tt, ded ? 'Compendium.pf2e-action-support.action-support.Item.U7tuKcRePhSu2C2P' : sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
                }
            })
        }
        if (!hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")) {
            setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
        }
    } else if (_obj.slug === "follow-the-expert") {
        if (!hasEffectBySourceId(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3")) {
            setEffectToActor(actor, "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3")
        }
    }

    if (game.modules.get("pf2e-exploration-effects")?.active) {
        if (activityExplorationEffects[_obj.slug]) {

            if (!hasEffectBySourceId(actor, activityExplorationEffects[_obj.slug])) {
                setEffectToActor(actor, activityExplorationEffects[_obj.slug])
            }
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
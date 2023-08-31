Hooks.on('preCreateChatMessage', async (message, user, _options, userId)=>{
    if (!game.settings.get(moduleName, "barbariansPlus")) {return}

    if (message?.flags?.pf2e?.origin?.type) {
        if (!messageType(message, undefined) && !messageType(message, "spell-cast")) {return}
        const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
        if (_obj?.slug === "destined-kill" && !hasEffect(message.actor, "stance-destined-kill")) {
            setEffectToActor(message.actor, "Compendium.barbarians.barbarians-effects.Item.XW10hiejiCwDC2yh")
        } else if (_obj?.slug === "die-another-day" && hasCondition(message.actor, "wounded")) {
            setEffectToActor(message.actor, "Compendium.barbarians.barbarians-effects.Item.2G111qeLqCZJAJy4")
        } else if (_obj?.slug === "forever-furious") {
            setEffectToActor(message.actor, "Compendium.barbarians.barbarians-effects.Item.1V7iyS0OrmEaVcJv")
        }
    }
});

Hooks.on('preCreateChatMessage', async (message, user, _options, userId)=>{
    if (!game.settings.get(moduleName, "barbariansPlus")) {return}
    const mType = message?.flags?.pf2e?.context?.type;
    if (mType != "saving-throw") {return};

    if (eqMessageDCLabel(message, "Gory Finish DC")) {
        if (successMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 1);
        } else if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 2);
        } else if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 3);
        }
    } else if (eqMessageDCLabel(message, "Furious Anatomy DC") && anyFailureMessageOutcome(message)) {
        let ff = message.flags.pf2e.origin.type === "feat" ? await fromUuid(message.flags.pf2e.origin.uuid) : null;
        if (!ff) {return}
        ff = actorFeat(ff?.actor, "flesh-instinct");
        if (!ff) {return}

        if (ff.name.includes('Billowing Orifice')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.DqspZqJJu4v3k4Zv");//Stupefied
        } else if (ff.name.includes('Gibbering Mouths')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.7roTkQ4QHWDWZkJM");//Deafened
        } else if (ff.name.includes('Tongue Proboscis')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.NKue7w68dX1yH4bA");//Enfeebled
        } else if (ff.name.includes('Tentacle Strands')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.qzjX5A17McTdDHFx");//Clumsy
        } else if (ff.name.includes('Unblinking Eyes')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.1u4ZAmfeWKyN3uKK");//Dazzled
        } else if (ff.name.includes('Warp Spasm')) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.HrHzFVcdcBdG2nv8");//Fascinated
        }
    }
});
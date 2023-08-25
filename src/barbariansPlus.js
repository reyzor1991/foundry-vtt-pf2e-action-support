Hooks.on('createChatMessage', async (message, user, _options, userId)=>{
    if (!game.user.isGM) {return;}
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

Hooks.on('createChatMessage', async (message, user, _options, userId)=>{
    if (!game.user.isGM) {return;}
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
    }
});
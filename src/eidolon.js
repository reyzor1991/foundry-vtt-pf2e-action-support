async function setSummonerHP(actor) {
    if (!game.user.isGM) {
        ui.notifications.info(`Only GM can run script`);
        return
    }
    if (!actor) {
        ui.notifications.info(`Need to select Actor`);
        return
    }
    if ("summoner" != actor?.class?.slug) {
        ui.notifications.info(`Actor should be Summoner`);
        return
    }
    if (game.user.targets.size != 1) {
        ui.notifications.info(`Need to select 1 token of eidolon as target to set HP of summoner`);
        return
    }
    const target = game.user.targets.first().actor;
    if ("eidolon" != target?.class?.slug) {
        ui.notifications.info(`Need to select 1 token of eidolon as target to set HP of summoner`);
        return
    }

    const sHP = actor.system.attributes.hp.max;
    const feat = (await fromUuid("Compendium.pf2e-action-support.action-support.Item.LnCPBh2F5tiDprR0")).toObject();
    feat.system.rules[0].value = sHP;
    feat.flags.summoner = actor.uuid

    const curFeat = actorFeat(target, "summoner-hp");
    if (curFeat) {
        curFeat.delete()
    }

    await target.createEmbeddedDocuments("Item", [feat]);
    actor.setFlag(moduleName, "eidolon", target.uuid);

    target.update({
        "system.attributes.hp.value": actor.system.attributes.hp.value,
        "system.attributes.hp.temp": actor.system.attributes.hp.temp,
    }, { "noHook": true })
}

Hooks.once("init", () => {

    if (game.settings.get(moduleName, "eidolonSpell")) {

        const originGetChatData = CONFIG.PF2E.Item.documentClasses.spell.prototype.getChatData;
        CONFIG.PF2E.Item.documentClasses.spell.prototype.getChatData = async function(htmlOptions={}, _rollOptions2={}) {
            const r = await originGetChatData.call(this, htmlOptions, _rollOptions2);
            if ("character" === this.actor?.type && "eidolon" === this.actor?.class?.slug) {
                const f = actorFeat(this.actor, "summoner-hp")
                if (f && f?.flags?.summoner) {
                    const summoner = await fromUuid(f.flags.summoner);

                    const originStatistic = this.trickData?.statistic ?? this.spellcasting?.statistic;
                    const summonerStatistic = summoner?.spellcasting?.find(a=>a.attribute === originStatistic.ability)

                    if (summonerStatistic && r?.isSave) {
                        const saveKey = this.system.save.basic ? "PF2E.SaveDCLabelBasic" : "PF2E.SaveDCLabel";

                        r['save']['label'] = game.i18n.format(saveKey, { dc: summonerStatistic.statistic.dc.value, type: r.save.type });
                        r['save']['breakdown'] = summonerStatistic.statistic.dc.breakdown;
                        r['save']['value'] = summonerStatistic.statistic.dc.value;
                    }

                    if (summonerStatistic && r?.isAttack) {
                        r['check']['mod'] = summonerStatistic.statistic.check.mod
                        r['check']['breakdown'] = summonerStatistic.statistic.check.breakdown
                    }
                }
            }
            return r;
        }

    }

    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "setSummonerHP": setSummonerHP,
    })
});


Hooks.on('pf2e.startTurn', async (combatant, encounter, user_id) => {
    if (!game.settings.get(moduleName, "eidolonCondition")) {return}
    const actor = combatant.actor;
    if ("character" === actor?.type && "summoner" === actor?.class?.slug) {
        let ei = actor.getFlag(moduleName, "eidolon");
        if (ei) {
            ei = await fromUuid(ei);

            const stunned = ei.getCondition("stunned") ?? ei.getCondition("slowed");
            if (stunned && !stunned.isLocked) {
                const actionCount = (3 + (ei.hasCondition("quickened") ? 1 : 0));
                let lastAction = 0;
                if (actionCount >= stunned.value) {
                    ei.decreaseCondition(ei.getCondition("stunned") ? "stunned" : "slowed", {forceRemove: true})
                    lastAction = actionCount - stunned.value;
                } else {
                    await game.pf2e.ConditionManager.updateConditionValue(stunned.id, ei, stunned.value - actionCount)
                }
                 ui.notifications.info(`${ei.name} has only ${lastAction} action${lastAction <= 1?"":"s"}`);
            }

            for (const effect of ei.itemTypes.effect) {
                effect.prepareBaseData();
                await effect.onTurnStart();
            }
        }
    }
})

Hooks.on('pf2e.endTurn', async (combatant, encounter, user_id) => {
    if (!game.settings.get(moduleName, "eidolonCondition")) {return}
    const actor = combatant.actor;
    if ("character" === actor?.type && "summoner" === actor?.class?.slug) {
        let ei = actor.getFlag(moduleName, "eidolon");
        if (ei) {
            ei = await fromUuid(ei);
            const frightened = ei.getCondition("frightened")
            if (frightened && !frightened.isLocked) {
                await ei.decreaseCondition("frightened");
            }
            const token = game.canvas.scene.tokens.find(a=>a.actorId===ei.id);
            for (const condition of ei.conditions.active) {
                await condition.onEndTurn({ token });
            }
            for (const effect of ei.itemTypes.effect) {
                effect.prepareBaseData();
                await effect.onTurnStart();
            }
        }
    }
});


Hooks.on('pf2e.restForTheNight', async (actor) => {
    if ("character" === actor?.type && "summoner" === actor?.class?.slug) {
        const ei = actor.getFlag(moduleName, "eidolon");
        if (ei) {
            (await fromUuid(ei)).update({
                "system.attributes.hp.value": actor.system.attributes.hp.value
            }, { "noHook": true });
        }
    }
});


Hooks.on('preUpdateActor', async (actor, data, diff, id) => {
    if (!game.settings.get(moduleName, "sharedHP")) {
        return
    }
    if (data?.system?.attributes?.hp) {
        if ("character" === actor?.type && "eidolon" === actor?.class?.slug) {
            const f = actorFeat(actor, "summoner-hp")
            if (f && f?.flags?.summoner) {
                const as = await fromUuid(f.flags.summoner);

                const hp = as.system.attributes.hp;
                hp.value = data?.system?.attributes?.hp?.value;
                hp.temp = data?.system?.attributes?.hp?.temp;

                await as.update({
                    "system.attributes.hp": hp
                }, { "noHook": true })
            }
        } else if ("character" === actor?.type && "summoner" === actor?.class?.slug) {
            const ei = actor.getFlag(moduleName, "eidolon");
            if (ei) {
                const as = await fromUuid(ei);

                const hp = as.system.attributes.hp;
                hp.value = data?.system?.attributes?.hp?.value;
                hp.temp = data?.system?.attributes?.hp?.temp;

                as.update({
                    "system.attributes.hp": hp
                }, { "noHook": true });
            }
        }
    }
});
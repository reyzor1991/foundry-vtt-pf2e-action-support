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
    ui.notifications.info(`Summoner and Eidolon were linked`);
};

Hooks.on("preCreateItem", (item, data) => {
    if ("condition" === data.type && data.system.slug === "drained") {
        if ("character" === item.actor?.type && "eidolon" === item.actor?.class?.slug) {
            addDrainedToSummoner(item.actor, actorFeat(item.actor, "summoner-hp"), data);
            return false;
        }
    }
});

Hooks.on("preCreateItem", async (item, data) => {
    if ("character" === item.actor?.type && "eidolon" === item.actor?.class?.slug) {
        if ("condition" === data.type && item.actor?.system?.attributes?.hp?.value === 0) {
            if ("dying" === item.slug) {
                const f = actorFeat(item.actor, "summoner-hp")
                if (f && f?.flags?.summoner) {
                    const as = await fromUuid(f.flags.summoner);
                    as.increaseCondition('dying')
                }
            }
        }
    }
});

Hooks.on("preCreateItem", (item, data) => {
    if ("character" === item.actor?.type && "eidolon" === item.actor?.class?.slug) {
        if ("condition" === data.type && item.actor?.system?.attributes?.hp?.value === 0) {
            return false;
        }
    }
});

async function addDrainedToSummoner(eidolon, feat, data) {
    if (!feat) {return;}
    const summoner = await fromUuid(feat.flags.summoner);
    const sumDrained = summoner.hasCondition(data.system.slug)
    if (!sumDrained) {
        await summoner.createEmbeddedDocuments("Item", [data]);
    }
}

Hooks.on("updateItem", async (item) => {
    if ("condition" === item.type && item.system.slug === "drained") {
        if ("character" === item.actor?.type && "summoner" === item.actor?.class?.slug) {

            let ei = item.actor.getFlag(moduleName, "eidolon");
            if (ei) {
                const eidolon = await fromUuid(ei);

                let eff = hasEffect(eidolon, "drained-eidolon");
                if (eff) {
                    eff = eff.toObject();
                    eff.system.rules[0].value = -(item.system.value.value ?? 1) * item.actor.level;
                    await eidolon.updateEmbeddedDocuments("Item", [eff]);
                }
            }

        }
    }
});

Hooks.on("createItem", async (item) => {
    if ("condition" === item.type && item.slug === "drained") {
        if ("character" === item.actor?.type && "summoner" === item.actor?.class?.slug) {
            let ei = item.actor.getFlag(moduleName, "eidolon");
            if (ei) {
                const eidolon = await fromUuid(ei);

                let eff = hasEffect(eidolon, "drained-eidolon");
                if (!eff) {
                    eff = effectDrainEil();
                    eff.system.rules[0].value = -(item.system.value.value ?? 1) * item.actor.level;
                    await eidolon.createEmbeddedDocuments("Item", [eff]);
                }
            }
        }
    }
});

function effectDrainEil() {
    return {
      "name": "Drained Eidolon",
      "type": "effect",
      "system": {
        "rules": [
          {
            "key": "FlatModifier",
            "label": "drainedEidolon",
            "selector": "hp",
            "value": 0,
            "type": "status"
          }
        ],
        "slug": "drained-eidolon",
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "sustained": false,
          "expiry": "turn-start"
        },
        "start": {
          "value": 0,
          "initiative": null
        }
      },
      "img": "systems/pf2e/icons/conditions/drained.webp",
      "_id": randomID()
    };
}

Hooks.on("deleteItem", async (item) => {
    if ("condition" === item.type && item.slug === "drained") {
        if ("character" === item.actor?.type && "summoner" === item.actor?.class?.slug) {
            let ei = item.actor.getFlag(moduleName, "eidolon");
            if (ei) {
                const eidolon = await fromUuid(ei);
                const eff = hasEffect(eidolon, "drained-eidolon");
                if (eff) {
                    await eff.delete();
                }
            }
        }
    } else if ("character" === item.actor?.type && "eidolon" === item.actor?.class?.slug && item.slug === "drained-eidolon") {
        const curFeat = actorFeat(item.actor, "summoner-hp");
        if (curFeat) {
            const summoner = await fromUuid(curFeat.flags.summoner);
            await summoner.decreaseCondition("drained", {forceRemove: true})
        }
    }
});

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
            if (data?.system?.attributes?.hp?.value === 0) {
                dismissEidolon(actor.id);
            }
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
                if (hp.value === 0) {
                    dismissEidolon(as.id);
                }
            }
        }
    }
});

async function dismissEidolon(actorId) {
    game.scenes.current.tokens.filter(a=>a?.actor.id === actorId)
        .forEach(t=>{
            t.actor.itemTypes.effect.forEach(e=>e.delete());
            window?.warpgate?.dismiss(t.id)
        });
}
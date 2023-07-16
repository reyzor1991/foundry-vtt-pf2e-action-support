import "./const.js";

export var socketlibSocket = undefined;

Hooks.once("init", () => {
    game.settings.register("pf2e-action-support", "decreaseFrequency", {
        name: "Decrease Frequency of Action",
        hint: "Decrease frequency of actions when posted in chat (useful for actions that have a once per day/turn/round)",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register("pf2e-action-support", "useSocket", {
        name: "Use socket",
        hint: "Enable this setting to be able to drop effects on creatures they dont own",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
});


Hooks.on('deleteItem', async (effect, data, id) => {
    if (effect.slug == "spell-effect-guidance") {
        setEffectToActor(effect.actor, "Compendium.pf2e.spell-effects.Item.3LyOkV25p7wA181H");
    }
});

async function createEffects(data) {
    let actor = await fromUuid(data.actorUuid);
    let source = (await fromUuid(data.eff)).toObject();
    source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: data.eff } });
    if (data.objData) {
        source.flags = mergeObject(source.flags, data.objData);
    }
    await actor.createEmbeddedDocuments("Item", [source]);
}

async function deleteEffects(data) {
    let actor = await fromUuid(data.actorUuid);
    let effect = actor.itemTypes.effect.find(c => data.eff === c.slug)
    actor.deleteEmbeddedDocuments("Item", [effect._id])
}

async function updateObjects(data) {
    var _obj = await fromUuid(data.id);
    _obj.update(data.data);
}

async function deleteEffectsById(data) {
    let actor = await fromUuid(data.actorUuid);
    let effect = actor.itemTypes.effect.find(c => data.effId === c.id)
    actor.deleteEmbeddedDocuments("Item", [effect._id])
}

async function increaseConditions(data) {
    let actor = await fromUuid(data.actorUuid);
    let valueObj = data?.value ? {'value': data?.value } : {}

    actor.increaseCondition(data.condition, valueObj);
}

async function applyDamages(data) {
    let actor = await fromUuid(data.actorUuid);
    let token = await fromUuid(data.tokenUuid);

    applyDamage(actor, token, data.formula);
}

function isActorHeldEquipment(actor, item) {
    return actor?.itemTypes?.equipment?.find(a=>a.isHeld && a.slug == item)
}

Hooks.once('setup', function () {
  socketlibSocket = globalThis.socketlib.registerModule("pf2e-action-support");
  socketlibSocket.register("createEffects", createEffects);
  socketlibSocket.register("deleteEffects", deleteEffects);
  socketlibSocket.register("deleteEffectsById", deleteEffectsById);
  socketlibSocket.register("updateObjects", updateObjects);
  socketlibSocket.register("increaseConditions", increaseConditions);
  socketlibSocket.register("applyDamages", applyDamages);
  socketlibSocket.register("createFeintEffectOnTarget", _socketCreateFeintEffectOnTarget);
})

async function _socketCreateFeintEffectOnTarget(effect, targetId) {
    let target = await fromUuid(targetId);
    await target.createEmbeddedDocuments("Item", [effect]);
}

function failureMessageOutcome(message) {
    return "failure" == message?.flags?.pf2e?.context?.outcome;
}

function criticalFailureMessageOutcome(message) {
    return "criticalFailure" == message?.flags?.pf2e?.context?.outcome;
}

function successMessageOutcome(message) {
    return "success" == message?.flags?.pf2e?.context?.outcome;
}

function criticalSuccessMessageOutcome(message) {
    return "criticalSuccess" == message?.flags?.pf2e?.context?.outcome;
}

function anyFailureMessageOutcome(message) {
    return failureMessageOutcome(message) || criticalFailureMessageOutcome(message);
}

function anySuccessMessageOutcome(message) {
    return successMessageOutcome(message) || criticalSuccessMessageOutcome(message);
}

function actorFeat(actor, feat) {
    return actor?.itemTypes?.feat?.find((c => feat === c.slug))
}

function messageType(message, type) {
    return type == message?.flags?.pf2e?.context?.type;
}

function hasOption(message, opt) {
    return message?.flags?.pf2e?.context?.options?.includes(opt);
}

function hasEffectStart(actor, eff) {
    return actor?.itemTypes?.effect?.find((c => c.slug.startsWith(eff)))
}

function hasEffect(actor, eff) {
    return actor?.itemTypes?.effect?.find((c => eff === c.slug))
}

function hasEffects(actor, eff) {
    return actor?.itemTypes?.effect?.filter((c => eff === c.slug))
}

function actorsWithEffect(eff) {
    return game.combat.turns.filter(cc=>hasEffect(cc.actor, eff)).map(cc=>cc.actor);
}

async function treatWounds(actor, target) {
    if (actorFeat(actor, "continual-recovery")) {//10 min
        setEffectToActor(target, effect_treat_wounds_immunity_minutes)
    } else {
        setEffectToActor(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")
    }
}

function sendNotificationChatMessage(actor, content) {
    var whispers = ChatMessage.getWhisperRecipients("GM").map((u) => u.id).concat(game.user.id);

    ChatMessage.create({
        type: CONST.CHAT_MESSAGE_TYPES.OOC,
        content: content,
        whisper: whispers
    });
}

function deleteEffectFromActor(actor, eff) {
    let effect = actor.itemTypes.effect.find(c => eff === c.slug)
    if (!effect) {return}
    if (3 == actor.ownership[game.user.id]) {
        actor.deleteEmbeddedDocuments("Item", [effect._id])
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("deleteEffects", [{'actorUuid': actor.uuid, 'eff': eff}], 0)
    } else {
        sendNotificationChatMessage(actor, `Need delete ${effect.name} effect from ${actor.name}`);
    }
}

function deleteEffectById(actor, effId) {
    if (3 == actor.ownership[game.user.id]) {
        actor.deleteEmbeddedDocuments("Item", [effId])
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("deleteEffectsById", [{'actorUuid': actor.uuid, 'effId': effId}], 0)
    } else {
        sendNotificationChatMessage(actor, `Need delete effect with id ${effId} from ${actor.name}`);
    }
}

async function setFeintEffect(message, isCrit=false) {
    let actor = message.actor;
    let target = message.target.actor;

    let effect = (await fromUuid(isCrit?effect_feint_critical_success:effect_feint_success)).toObject();
    effect.flags = mergeObject(effect.flags ?? {}, { core: { sourceId: effect.id } });
    effect.system.slug = effect.system.slug.replace("attacker", actor.id)
    effect.name += ` ${actor.name}`
    effect.system.context = mergeObject(effect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        },
        "roll": null,
        "target": null
    });

    let aEffect = (await fromUuid(isCrit?effect_feint_crit_success_attacker_target:effect_feint_success_attacker_target)).toObject();
    aEffect.system.slug = aEffect.system.slug.replace("attacker", actor.id).replace("target", target.id)

    aEffect.system.rules[0].predicate[0] = aEffect.system.rules[0].predicate[0].replace("attacker", actor.id);
    aEffect.system.rules[0].predicate[1] = aEffect.system.rules[0].predicate[1].replace("attacker", actor.id).replace("target", target.id)
    aEffect.name += ` ${target.name}`

    if (3 == actor.ownership[game.user.id]) {
        await actor.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, actor.id], 0)
    }

    if (3 == target.ownership[game.user.id]) {
        await target.createEmbeddedDocuments("Item", [effect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [effect, target.id], 0)
    }
}

async function setEffectToActor(actor, eff, objData=undefined) {
    if (3 == actor.ownership[game.user.id]) {
        let source = (await fromUuid(eff)).toObject();
        source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: eff } });
        if (objData) {
            source.flags = mergeObject(source.flags, objData);
        }
        await actor.createEmbeddedDocuments("Item", [source]);
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("createEffects", [{'actorUuid': actor.uuid, 'eff': eff, "objData": objData}], 0)
    } else {
        sendNotificationChatMessage(actor, `Need add @UUID[${eff}] effect to ${actor.name}`);
    }
}

async function increaseConditionForTarget(message, condition, value=undefined) {
    let valueObj = value ? {'value': value } : {}

    if (3 == message.target.actor.ownership[game.user.id]) {
        message.target.actor.increaseCondition(condition, valueObj);
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("increaseConditions", [{'actorUuid': message.target.actor.uuid, 'value': value, 'condition': condition}], 0)
    } else {
        sendNotificationChatMessage(message.target.actor, `Set condition ${condition} ${value??''} to ${message.target.actor.name}`);
    }
}

function deleteEffectUntilAttackerEnd(actor, eff, attackerId, isFinal=false) {
    actor.itemTypes.effect.filter(c => eff === c.slug)
    .forEach(effect => {
        if (effect?.flags?.attacker == attackerId) {
            if (effect.flags["attacker-turn"] == 1 || isFinal) {
                deleteEffectById(actor, effect.id)
            } else {
                let data = {"flags.attacker-turn": effect.flags["attacker-turn"] - 1};
                if (3 == actor.ownership[game.user.id]) {
                    effect.update(data);
                }else {
                    socketlibSocket._sendRequest("updateObjects", [{id: effect.uuid, data:data}], 0)
                }
            }
        }
    })
}

async function applyDamage(actor, token, formula) {
    if (3 == actor.ownership[game.user.id]) {
        let DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll")
        let roll = new DamageRoll(formula);
        await roll.evaluate({async: true});
        actor.applyDamage({damage:roll, token:token})
        roll.toMessage({speaker: {alias: actor.prototypeToken.name}});
    } else {
        socketlibSocket._sendRequest("applyDamages", [{actorUuid: actor.uuid, tokenUuid: token.uuid, formula: formula}], 0)
    }
}

Hooks.on('preCreateChatMessage',async (message, user, _options, userId)=>{
    if (game?.combats?.active) {
        if (messageType(message, 'skill-check')) {

            if (message?.target) {
                if (hasOption(message, "action:tumble-through")) {
                    if (anySuccessMessageOutcome(message)) {
                        if (actorFeat(message?.actor, "tumble-behind-rogue") && !hasEffect(message.target.actor, "effect-flat-footed-tumble-behind")) {
                            effectWithActorNextTurn(message, message.target.actor, effect_flat_footed)
                        }
                        if (actorFeat(message?.actor, "panache") && !hasEffect(message.actor, "effect-panache")) {
                            setEffectToActor(message.actor, effect_panache)
                        }
                    }
                }

                if (hasOption(message, "action:demoralize") && !hasEffect(message?.target?.actor, "effect-demoralize-immunity-minutes")) {
                    if (successMessageOutcome(message)) {
                        increaseConditionForTarget(message, "frightened", 1);
                    } else if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "frightened", 2);
                    }
                    if (anySuccessMessageOutcome(message) && actorFeat(message.actor, "braggart")) {
                        if (!hasEffect(message.actor, "effect-panache")) {
                            setEffectToActor(message.actor, effect_panache)
                        }
                    }
                    setEffectToActor(message?.target?.actor, effect_demoralize_immunity_minutes)
                }

                if (hasOption(message, "action:perform") && actorFeat(message?.actor, "battledancer") && !hasEffect(message.actor, "effect-panache")) {
                    setEffectToActor(message.actor, effect_panache)
                }

                if (hasOption(message, "action:disarm")) {
                    if (successMessageOutcome(message)) {
                        setEffectToActor(message.target.actor, effect_disarm_success)
                    } else if (criticalFailureMessageOutcome(message)) {
                        setEffectToActor(message.actor, effect_flat_footed_start_turn)
                    }
                }

                if (hasOption(message, "action:feint")) {
                    if (anySuccessMessageOutcome(message) && message?.target) {
                        if (criticalSuccessMessageOutcome(message)) {
                            setFeintEffect(message, true)
                        } else {
                            setFeintEffect(message)
                        }
                        if (actorFeat(message?.actor, "fencer") && !hasEffect(message.actor, "effect-panache")){
                            setEffectToActor(message.actor, effect_panache)
                        }
                    } else if (criticalFailureMessageOutcome(message)) {
                        message.actor.increaseCondition("flat-footed");
                    }
                }

                if (hasOption(message, "action:create-a-diversion")) {
                    if (anySuccessMessageOutcome(message)) {
                        if (actorFeat(message?.actor, "fencer") && !hasEffect(message.actor, "effect-panache")){
                            setEffectToActor(message.actor, effect_panache)
                        }
                    }
                }

                if (hasOption(message, "action:grapple")) {
                    if (criticalSuccessMessageOutcome(message) && message?.target) {
                        effectWithActorNextTurn(message, message.target.actor, effect_restrained_end_attacker_next_turn)
                    } else if (successMessageOutcome(message) && message?.target) {
                        effectWithActorNextTurn(message, message.target.actor, effect_grabbed_end_attacker_next_turn)
                    }
                    if (anySuccessMessageOutcome(message) && actorFeat(message?.actor, "gymnast") && !hasEffect(message.actor, "effect-panache")) {
                        setEffectToActor(message.actor, effect_panache)
                    }
                }

                if (hasOption(message, "action:shove")) {
                    if (anySuccessMessageOutcome(message) && actorFeat(message?.actor, "gymnast") && !hasEffect(message.actor, "effect-panache")) {
                        setEffectToActor(message.actor, effect_panache)
                    }
                }

                if (hasOption(message, "action:bon-mot")) {
                    if (anySuccessMessageOutcome(message)) {
                        if (actorFeat(message?.actor, "wit") && !hasEffect(message.actor, "effect-panache")) {
                            setEffectToActor(message.actor, effect_panache)
                        }
                        if (successMessageOutcome(message)) {
                            setEffectToActor(message.target.actor, "Compendium.pf2e.feat-effects.Item.GoSls6SKCFmSoDxT")
                        } else {
                            setEffectToActor(message.target.actor, "Compendium.pf2e.feat-effects.Item.CtrZFI3RV0yPNzTv")
                        }
                    } else if (criticalFailureMessageOutcome(message)) {
                        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.GoSls6SKCFmSoDxT")
                    }
                }

                if (hasOption(message, "action:escape") && anySuccessMessageOutcome(message)) {
                    let rest = hasEffects(message.actor, "effect-restrained-until-end-of-attacker-next-turn")
                    let grab = hasEffects(message.actor, "effect-grabbed-until-end-of-attacker-next-turn")
                    rest.filter(a=>a?.flags?.attacker == message.target.actor.id).forEach(a => {
                        deleteEffectById(message.actor, a.id)
                    });
                    grab.filter(a=>a?.flags?.attacker == message.target.actor.id).forEach(a => {
                        deleteEffectById(message.actor, a.id)
                    });
                }

                if (hasOption(message, "action:trip")) {
                    if (anySuccessMessageOutcome(message)) {
                        if (actorFeat(message?.actor, "gymnast") && !hasEffect(message.actor, "effect-panache")) {
                            setEffectToActor(message.actor, effect_panache)
                        }
                        increaseConditionForTarget(message, "prone");
                        if (criticalSuccessMessageOutcome(message)) {
                            applyDamage(message?.target?.actor,message?.target?.token, `1d6[bludgeoning]`)
                        }
                    }
                }
            } else if (hasOption(message, "action:treat-wounds") && hasOption(message, "feat:battle-medicine") && message?.flavor == message?.flags?.pf2e?.unsafe) {
                if (game.user.targets.size == 1) {
                    let [first] = game.user.targets;
                    if (isActorHeldEquipment(message.actor, "battle-medics-baton") || actorFeat(message.actor, "forensic-medicine-methodology")) {//1 hour
                        setEffectToActor(first.actor, effect_battle_medicine_immunity_hour)
                    } else {
                        setEffectToActor(first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6")
                    }
                }
            }

            if (hasOption(message, "action:high-jump") || hasOption(message, "action:long-jump")
                || hasOption(message, "action:shove") || hasOption(message, "action:climb") || hasOption(message, "action:trip")
            ) {
                if (criticalFailureMessageOutcome(message)) {
                    message.actor.increaseCondition("prone");
                }
            }
            if (hasOption(message, "action:subsist")) {
                if (criticalFailureMessageOutcome(message)) {
                    setEffectToActor(message.actor, effect_adverse_subsist_situation)
                } else if (failureMessageOutcome(message)) {
                    message.actor.increaseCondition("fatigued");
                }
            }
            if (hasOption(message, "action:tamper")) {
                if (criticalFailureMessageOutcome(message)) {
                    applyDamage(message.actor, message.token, `${message.actor.level}[fire]`)
                }
            }
        } else if (messageType(message, "attack-roll") && message?.item?.isMelee) {
            let cqq = hasEffectStart(message?.target?.actor, "effect-feint-critical-success");
            if (cqq) {
                deleteEffectUntilAttackerEnd(message?.target?.actor, cqq.slug, message.actor.id, true)
                if (hasEffect(message.actor, `effect-feint-critical-success-${message.actor.id}-${message?.target?.actor.id}`)) {
                    deleteEffectFromActor(message.actor, `effect-feint-critical-success-${message.actor.id}-${message?.target?.actor.id}`)
                }
            }

            let qq = hasEffectStart(message?.target?.actor, "effect-feint-success");
            if (qq) {
                deleteEffectFromActor(message?.target?.actor, qq.slug, message.actor.id, true)
                if (hasEffect(message.actor, `effect-feint-success-${message.actor.id}-${message?.target?.actor.id}`)) {
                    deleteEffectFromActor(message.actor, `effect-feint-success-${message.actor.id}-${message?.target?.actor.id}`)
                }
            }
        } else if (messageType(message, "damage-roll")) {
            if (message?.item?.isMelee && hasEffect(message.actor, "effect-panache") && hasOption(message, "finisher")
                && (hasOption(message, "agile") || hasOption(message, "finesse"))
            ) {
                deleteEffectFromActor(message.actor, "effect-panache")
            }
        }

        if (messageType(message, "attack-roll") && message?.target?.actor && hasEffect(message.target.actor, "effect-flat-footed-tumble-behind")) {
            deleteEffectFromActor(message.target.actor, "effect-flat-footed-tumble-behind");
        }

        if (message?.flags?.pf2e?.origin?.type == "action") {
            let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

            let eff = actionEffectMap[_obj.slug]
            if (eff) {
                setEffectToActor(message.actor, eff)
            }

            if (_obj.slug == "drop-prone" || _obj.slug == "crawl") {
                message.actor.increaseCondition("prone");
            } else if (_obj.slug == "stand") {
                message.actor.decreaseCondition("prone");
            }
        } else if (message?.flags?.pf2e?.origin?.type == "spell") {
            let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

            let effs = spellEffectMap[_obj.slug] ?? []
            effs.forEach(eff => {
                setEffectToActor(message.actor, eff)
            })
        }
    } else {
        if (messageType(message, 'skill-check') && hasOption(message, "action:treat-wounds") && message?.flavor == message?.flags?.pf2e?.unsafe) {
            if (game.user.targets.size == 1) {
                let [first] = game.user.targets;
                treatWounds(message.actor, first.actor);
            } else if (actorFeat(message.actor, "ward-medic")) {
                game.user.targets.forEach(a => {
                    treatWounds(message.actor, a.actor);
                });
            }
        }
    }

    if (messageType(message, "saving-throw")) {
        if (hasOption(message, 'action:jinx')) {
            if (anySuccessMessageOutcome(message)) {
                setEffectToActor(message.actor, effect_jinx_immunity)
            } else if (criticalFailureMessageOutcome(message) && !hasEffect(message.actor, "effect-jinx-immunity")) {
                setEffectToActor(message.actor, effect_jinx_clumsy2)
            } else if (failureMessageOutcome(message) && !hasEffect(message.actor, "effect-jinx-immunity")) {
                setEffectToActor(message.actor, effect_jinx_clumsy1)
            }
        }
    }

    if (game.settings.get("pf2e-action-support", "decreaseFrequency")) {
        if (message?.actor) {
            let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
            if (_obj?.system?.frequency?.value > 0) {
                _obj.update({
                    "system.frequency.value": _obj?.system?.frequency?.value - 1
                });
            } else if (_obj?.system?.frequency?.value == 0) {
               sendNotificationChatMessage(message.actor, `Action sent to chat with 0 uses left.`);
            }
        }
    }


    if (message?.flags?.pf2e?.origin?.type == "action") {
        let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
        if (_obj.slug == "scout") {
            let sc = actorFeat(message.actor, "incredible-scout");
            if (sc) {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6")
            } else {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
            }

            game.user.targets.forEach(tt => {
                setEffectToActor(tt.actor, sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
            })

        } else if (_obj.slug == "accept-echo") {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.2ca1ZuqQ7VkunAh3")
        }
    } else if (message?.flags?.pf2e?.origin?.type == "spell") {
        let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

        if (_obj.slug == "guidance") {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, "effect-guidance-immunity")) {
                    guidanceEffect(message, tt.actor)
                }
            });
        } else if  (_obj.slug == "stabilize") {
            game.user.targets.forEach(tt => {
                tt.actor.toggleCondition("dying")
            });
        }
    }

    if (message?.flags?.pf2e?.modifiers?.find(a=>a.slug == "guidance" && a.enabled)) {
        deleteEffectFromActor(message.actor, "spell-effect-guidance")
    }
});

async function guidanceEffect(message, target) {
    let aEffect = (await fromUuid("Compendium.pf2e.spell-effects.Item.3qHKBDF7lrHw8jFK")).toObject();

    aEffect.system.context = mergeObject(aEffect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message.item.uuid,
            "token": message.token.uuid
        },
        "roll": null,
        "target": null
    });
    aEffect.system.start.initiative = null;


    if (3 == target.ownership[game.user.id]) {
        target.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, target.id], 0)
    }
}

async function effectWithActorNextTurn(message, target, uuid) {
    let aEffect = (await fromUuid(uuid)).toObject();

    aEffect.system.context = mergeObject(aEffect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message.token.uuid
        },
        "roll": null,
        "target": null
    });
    aEffect.system.start.initiative = null;


    if (3 == target.ownership[game.user.id]) {
        target.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, target.id], 0)
    }
}

Hooks.on("deleteCombat", function (combat, delta) {
    combat.turns.forEach(cc => {
        deleteEffectFromActor(cc.actor, "effect-scouting")
        deleteEffectFromActor(cc.actor, "effect-scouting-incredible-scout")
    })
})

Hooks.on('combatRound', async (combat, updateData, updateOptions) => {
    game.combat.turns.map(cc=>cc.actor)
        .forEach(a => {
            Object.values(a?.itemTypes).flat(1).forEach(i => {
                if (i?.system?.frequency?.per == "round" || i?.system?.frequency?.per == "turn") {
                    i.update({
                        "system.frequency.value": i.system.frequency.max
                    });
                }
            })
        })
});
import "./const.js";

export var socketlibSocket = undefined;

async function setSummonerHP(actor) {
    if (!game.user.isGM) {
        ui.notifications.info(`Only GM can run script`);
        return
    }
    if (!actor) {
        ui.notifications.info(`Need to select Actor`);
        return
    }
    if (game.user.targets.size != 1) {
        ui.notifications.info(`Need to select 1 token of eidolon as target to set HP of summoner`);
        return
    }
    let sHP = actor.system.attributes.hp.max;
    let feat = (await fromUuid("Compendium.pf2e-action-support.action-support.Item.LnCPBh2F5tiDprR0")).toObject();
    feat.system.rules[0].value = sHP;
    feat.flags.summoner = actor.uuid

    let curFeat = actorFeat(game.user.targets.first().actor, "summoner-hp");
    if (curFeat) {
        curFeat.delete()
    }

    await game.user.targets.first().actor.createEmbeddedDocuments("Item", [feat]);
    actor.setFlag("pf2e-action-support", "eidolon", game.user.targets.first().actor.uuid);
}

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
    game.settings.register("pf2e-action-support", "deleteScouting", {
        name: "Delete Scouting effect when combat ends",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register("pf2e-action-support", "sharedHP", {
        name: "Summoner-Eidolon shared HP",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    let originGetRollContext = CONFIG.Actor.documentClass.prototype.getRollContext;
    CONFIG.Actor.documentClass.prototype.getRollContext = async function(prefix) {
        let r = await originGetRollContext.call(this, prefix);
        if (r.options.has("first-attack") && !r.options.has(`target:effect:hunt-prey-${this.id}`)) {
            r.options.delete("first-attack");
        }
        return r;
    }

    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "setSummonerHP": setSummonerHP
    })
});


Hooks.on('deleteItem', async (effect, data, id) => {
    if (game.user.isGM) {
        if (effect.slug == "spell-effect-guidance" && !hasEffect(effect.actor, "effect-guidance-immunity")) {
            setEffectToActor(effect.actor, "Compendium.pf2e.spell-effects.Item.3LyOkV25p7wA181H");
        }
    }
});

async function createEffects(data) {
    let actor = await fromUuid(data.actorUuid);
    let source = (await fromUuid(data.eff)).toObject();
    source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: data.eff } });
    if (data.level) {
        source.system.level = {'value': data.level};
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

function hasPermissions(item) {
    return 3 == item.ownership[game.user.id] || game.user.isGM;
}

function hasCondition(actor, con) {
    return actor?.itemTypes?.condition?.find((c => c.type == "condition" && con === c.slug))
}

function isActorHeldEquipment(actor, item) {
    return actor?.itemTypes?.equipment?.find(a=>a.isHeld && a.slug == item)
}

let setupSocket = () => {
  if (globalThis.socketlib) {
      socketlibSocket = globalThis.socketlib.registerModule("pf2e-action-support");
      socketlibSocket.register("createEffects", createEffects);
      socketlibSocket.register("deleteEffects", deleteEffects);
      socketlibSocket.register("deleteEffectsById", deleteEffectsById);
      socketlibSocket.register("updateObjects", updateObjects);
      socketlibSocket.register("increaseConditions", increaseConditions);
      socketlibSocket.register("applyDamages", applyDamages);
      socketlibSocket.register("createFeintEffectOnTarget", _socketCreateFeintEffectOnTarget);
      socketlibSocket.register("deleteEffect", _socketDeleteEffect);
      socketlibSocket.register("sendGMNotification", sendGMNotification);
  }
  return !!globalThis.socketlib
}

Hooks.once('setup', function () {
    if (!setupSocket()) console.error('Error: Unable to set up socket lib for PF2e Action Support')
})

async function _socketDeleteEffect(targetId) {
    let target = await fromUuid(targetId);
    target.delete()
}

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

function hasDomain(message, opt) {
    return message?.flags?.pf2e?.context?.domains?.includes(opt);
}

function hasEffectStart(actor, eff) {
    return actor?.itemTypes?.effect?.find((c => c?.slug?.startsWith(eff)))
}

function hasEffect(actor, eff) {
    return actor?.itemTypes?.effect?.find((c => eff === c.slug))
}

function hasEffectBySourceId(actor, eff) {
    return actor?.itemTypes?.effect?.find((c => eff === c.sourceId))
}

function hasAnyEffects(actor, effs) {
    return actor?.itemTypes?.effect?.filter((c => effs.includes(c.slug)))
}

function hasEffects(actor, eff) {
    return actor?.itemTypes?.effect?.filter((c => eff === c.slug))
}

function actorsWithEffect(eff) {
    return game.combat.turns.filter(cc=>hasEffect(cc.actor, eff)).map(cc=>cc.actor);
}

function distanceIsCorrect(firstT, secondT, distance) {
    return (firstT instanceof Token ? firstT : firstT.object).distanceTo((secondT instanceof Token ? secondT : secondT.object)) <= distance
}

function spellRange(spell) {
    let s = spell?.system?.range?.value?.match(/\d+/g)
    return s ? parseInt(s[0]) : 0;
}

function getSpellRange(actor, spell) {
    let s = spellRange(spell)
    if (hasEffect(actor, "effect-spectral-hand")) {
        s = s > 120 ? s : 120;
    } else if (hasEffect(actor, "effect-reach-spell")) {
        s += 30;
    }
    return s == 0 ? 5 : s;
}

async function treatWounds(message, target) {
    let _bm = hasEffect(target, "effect-treat-wounds-immunity-minutes")
    let _bm1 = hasEffect(target, "effect-treat-wounds-immunity")

    let applyTreatWoundsImmunity = _bm || _bm1 ? false : true;

    if (applyTreatWoundsImmunity) {
        if (actorFeat(message.actor, "continual-recovery")) {//10 min
            setEffectToActor(target, effect_treat_wounds_immunity_minutes)
        } else {
            setEffectToActor(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")
        }
    } else {
        ui.notifications.info(`${target.name} has Treat Wounds Immunity`);
    }
}

function sendNotificationChatMessage(content) {
    var whispers = ChatMessage.getWhisperRecipients("GM").map((u) => u.id).concat(game.user.id);

    ChatMessage.create({
        type: CONST.CHAT_MESSAGE_TYPES.OOC,
        content: content,
        whisper: whispers
    });
}

function sendGMNotification(content) {
    if (game.user.isGM) {
        ui.notifications.info(content);
    } else {
        socketlibSocket._sendRequest("sendGMNotification", [content], 0)
    }
}

function deleteEffectFromActor(actor, eff) {
    let effect = actor.itemTypes.effect.find(c => eff === c.slug)
    if (!effect) {return}
    if (hasPermissions(actor)) {
        actor.deleteEmbeddedDocuments("Item", [effect._id])
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("deleteEffects", [{'actorUuid': actor.uuid, 'eff': eff}], 0)
    } else {
        sendNotificationChatMessage(`Need delete ${effect.name} effect from ${actor.name}`);
    }
}

function deleteEffectById(actor, effId) {
    if (hasPermissions(actor)) {
        actor.deleteEmbeddedDocuments("Item", [effId])
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("deleteEffectsById", [{'actorUuid': actor.uuid, 'effId': effId}], 0)
    } else {
        sendNotificationChatMessage(`Need delete effect with id ${effId} from ${actor.name}`);
    }
}

async function setFeintEffect(message, isCrit=false, isCritFail=false) {
    let actor = isCritFail?message.target.actor:message.actor;
    let target = isCritFail?message.actor:message.target.actor;

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
    effect.system.start.initiative = null;

    let aEffect = (await fromUuid(isCrit?effect_feint_crit_success_attacker_target:effect_feint_success_attacker_target)).toObject();
    aEffect.system.slug = aEffect.system.slug.replace("attacker", actor.id).replace("target", target.id)

    aEffect.system.rules[0].predicate[0] = aEffect.system.rules[0].predicate[0].replace("attacker", actor.id);
    aEffect.system.rules[0].predicate[1] = aEffect.system.rules[0].predicate[1].replace("attacker", actor.id).replace("target", target.id)
    aEffect.system.rules[1].predicate[1] = aEffect.system.rules[1].predicate[1].replace("attacker", actor.id);
    aEffect.system.rules[1].predicate[2] = aEffect.system.rules[1].predicate[2].replace("attacker", actor.id).replace("target", target.id)
    aEffect.name += ` ${target.name}`

    if (hasPermissions(actor)) {
        await actor.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, actor.uuid], 0)
    }

    if (hasPermissions(target)) {
        await target.createEmbeddedDocuments("Item", [effect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [effect, target.uuid], 0)
    }

    if (isCrit) {
        let qq = hasEffect(actor, "effect-pistol-twirl")
        if (qq) {
            deleteEffectById(actor, qq.id)

            qq = qq.toObject()
            qq.system.duration.unit = "rounds"
            qq.system.duration.value = 1

            if (hasPermissions(actor)) {
                await actor.createEmbeddedDocuments("Item", [qq]);
            } else {
                socketlibSocket._sendRequest("createFeintEffectOnTarget", [qq, actor.uuid], 0)
            }
        }
    }
}

async function setEffectToActor(actor, eff, level=undefined) {
    if (hasPermissions(actor)) {
        let source = await fromUuid(eff)
        let withBa = hasEffectBySourceId(actor, eff);
        if (withBa && withBa.system.badge) {
            withBa.update({
                "system.badge.value": withBa.system.badge.value += 1
            })
        } else {
            source = source.toObject();
            source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: eff } });
            if (level) {
                source.system.level = {'value': level};
            }
            await actor.createEmbeddedDocuments("Item", [source]);
        }
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("createEffects", [{'actorUuid': actor.uuid, 'eff': eff, "level": level}], 0)
    } else {
        sendNotificationChatMessage(`Need add @UUID[${eff}] effect to ${actor.name}`);
    }
}

async function increaseConditionForActor(message, condition, value=undefined) {
    let valueObj = value ? {'value': value } : {}

    if (hasPermissions(message.actor)) {
        message.actor.increaseCondition(condition, valueObj);
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("increaseConditions", [{'actorUuid': message.actor.uuid, 'value': value, 'condition': condition}], 0)
    } else {
        sendNotificationChatMessage(`Set condition ${condition} ${value??''} to ${message.actor.name}`);
    }
}

async function increaseConditionForTarget(message, condition, value=undefined) {
    let valueObj = value ? {'value': value } : {}

    if (hasPermissions(message.target.actor)) {
        message.target.actor.increaseCondition(condition, valueObj);
    } else if (game.settings.get("pf2e-action-support", "useSocket")) {
        socketlibSocket._sendRequest("increaseConditions", [{'actorUuid': message.target.actor.uuid, 'value': value, 'condition': condition}], 0)
    } else {
        sendNotificationChatMessage(`Set condition ${condition} ${value??''} to ${message.target.actor.name}`);
    }
}

async function setEffectToActorOrTarget(message, effectUUID, spellName, spellRange, onlyTarget=false) {
    if (game.user.targets.size == 0 && !onlyTarget) {
        setEffectToActor(message.actor, effectUUID, message?.item?.level)
    } else if (game.user.targets.size == 1) {
        if (distanceIsCorrect(message.token, game.user.targets.first(), spellRange)) {
            setEffectToActor(game.user.targets.first().actor, effectUUID, message?.item?.level)
        } else {
            ui.notifications.info(`${message.actor.name} chose target that not in range for ${spellName} spell`);
        }
    } else {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for ${spellName} spell`);
    }
}

async function setEffectToTarget(message, effectUUID) {
    if (game.user.targets.size == 1) {
        setEffectToActor(game.user.targets.first().actor, effectUUID)
    } else {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
    }
}

function deleteMorphEffects(message) {
    ui.notifications.info(`${message.actor.name} fails saving-throw. Need to delete morph/polymorph effects from actor`);

    let pol = ["spell-effect-wild-morph", "spell-effect-juvenile-companion",
        "spell-effect-pest-form", "spell-effect-wild-shape", "spell-effect-enlarge", "spell-effect-enlarge-heightened-4th",
         "spell-effect-shrink", "spell-effect-summoners-visage", "spell-effect-ooze-form-ochre-jelly", "spell-effect-elephant-form",
         "spell-effect-gaseous-form", "spell-effect-swarm-form", "spell-effect-unusual-anatomy",
         "spell-effect-righteous-might", "spell-effect-corrosive-body", "spell-effect-corrosive-body-heightened-9th",
         "spell-effect-cosmic-form-moon", "spell-effect-cosmic-form-sun", "spell-effect-fiery-body",
         "spell-effect-fiery-body-9th-level", "spell-effect-ki-form", "spell-effect-apex-companion",
         "spell-effect-nature-incarnate-kaiju", "spell-effect-nature-incarnate-green-man", "spell-effect-dragon-claws",
         "spell-effect-evolution-surge", "spell-effect-gluttons-jaw", "spell-effect-embrace-the-pit", "spell-effect-moon-frenzy",
         "spell-effect-divine-vessel", "spell-effect-divine-vessel-9th-level"];

    let polAnim = ["spell-effect-aberrant-form-", "spell-effect-animal-form-", "spell-effect-insect-form-",
     "spell-effect-ooze-form-", "spell-effect-aerial-form-", "spell-effect-bestial-curse-", "spell-effect-dinosaur-form-",
     "spell-effect-fey-form-", "spell-effect-elemental-form-", "spell-effect-plant-form-", "spell-effect-daemon-form-",
     "spell-effect-devil-form-", "spell-effect-dragon-form-", "spell-effect-tempest-form-", "spell-effect-angel-form-",
     "spell-effect-monstrosity-form-", "spell-effect-element-embodied-",
     "spell-effect-animal-feature-", "spell-effect-adapt-self-", "spell-effect-shifting-form-", "spell-effect-dragon-wings-",
     "spell-effect-mantle-of-the-frozen-heart-", "spell-effect-mantle-of-the-magma-heart-"]

    message.actor.itemTypes.effect.filter(c => pol.includes(c.slug) || polAnim.find(qq=>c.slug.startsWith(qq)))
        .forEach(effect => {
            deleteEffectById(message.actor, effect.id)
        })
}

function deleteEffectUntilAttackerEnd(actor, eff, attackerId, isFinal=false) {
    actor.itemTypes.effect.filter(c => eff === c.slug)
    .forEach(effect => {
        if (effect?.flags?.attacker == attackerId) {
            if (effect.flags["attacker-turn"] == 1 || isFinal) {
                deleteEffectById(actor, effect.id)
            } else {
                let data = {"flags.attacker-turn": effect.flags["attacker-turn"] - 1};
                if (hasPermissions(actor)) {
                    effect.update(data);
                }else {
                    socketlibSocket._sendRequest("updateObjects", [{id: effect.uuid, data:data}], 0)
                }
            }
        }
    })
}

function immunities(actor) {
    return actor?.attributes?.immunities?.map(a=>a.type) ?? []
}

async function applyDamage(actor, token, formula) {
    if (hasPermissions(actor)) {
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
        // maybe delete shield because it was used?
        if ("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing) {
            //maybe absorb
            //shield absorb
            let shieldEff = hasEffect(message.actor, "spell-effect-shield");
            if (shieldEff) {
                if (message?.content.includes("shield") && message?.content.includes("absorb")) {
                    if (hasPermissions(shieldEff)) {
                        shieldEff.delete()
                    } else {
                        socketlibSocket._sendRequest("deleteEffect", [shieldEff.uuid], 0)
                    }
                    setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.QF6RDlCoTvkVHRo4")
                }
            }
        }

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

                if (hasOption(message, "action:demoralize")) {
                    let dd = hasEffects(message?.target?.actor, "effect-demoralize-immunity-minutes");
                    if (dd.length == 0 || !dd.some(d=>d.system?.context?.origin?.actor == message.actor.uuid)) {
                        let i = immunities(message?.target?.actor);
                        if (i.some(d=>["mental", "fear-effects", "emotion"].includes(d))) {
                            sendGMNotification(`${message.target.actor.name} has Immunity to Demoralize action. Has mental, fear or emotion immunity`);
                        } else {
                            if (successMessageOutcome(message)) {
                                increaseConditionForTarget(message, "frightened", 1);
                            } else if (criticalSuccessMessageOutcome(message)) {
                                increaseConditionForTarget(message, "frightened", 2);
                            }
                        }
                        if (anySuccessMessageOutcome(message) && actorFeat(message.actor, "braggart")) {
                            if (!hasEffect(message.actor, "effect-panache")) {
                                setEffectToActor(message.actor, effect_panache)
                            }
                        }
                        effectWithActorNextTurn(message, message?.target?.actor, effect_demoralize_immunity_minutes, `(${message.actor.name})`, true)
                    }
                }

                if (anySuccessMessageOutcome(message) && hasOption(message, "action:perform")
                    && actorFeat(message?.actor, "battledancer") && !hasEffect(message.actor, "effect-panache")
                ) {
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
                            setFeintEffect(message, false)
                        }
                        if (actorFeat(message?.actor, "fencer") && !hasEffect(message.actor, "effect-panache")){
                            setEffectToActor(message.actor, effect_panache)
                        }
                    } else if (criticalFailureMessageOutcome(message)) {
                        setFeintEffect(message, true, true)
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
                    rest.filter(a=>a?.system?.context?.origin?.actor == message.target.actor.uuid).forEach(a => {
                        deleteEffectById(message.actor, a.id)
                    });
                    grab.filter(a=>a?.system?.context?.origin?.actor == message.target.actor.uuid).forEach(a => {
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

                    let _bm = hasEffect(first.actor, "effect-battle-medicine-immunity")
                    let _bm1 = hasEffect(first.actor, "effect-battle-medicine-immunity-hour")

                    _bm = _bm?.system?.context?.origin?.actor == message.actor.uuid ? true : false;
                    _bm1 = _bm1?.system?.context?.origin?.actor == message.actor.uuid ? true : false;

                    let applyTreatWoundsImmunity = true;

                    if (_bm || _bm1) {
                        if (actorFeat(message.actor, "medic-dedication")) {
                            let immuns = hasAnyEffects(first.actor, ["effect-battle-medicine-immunity", "effect-battle-medicine-immunity-hour"]);
                            if (immuns.length > 1) {
                                applyTreatWoundsImmunity = false;
                                if (message.actor.system.skills.med.rank >= 3) {
                                    let minV = Math.min(...immuns.map(a=>game.time.worldTime - a.system.start.value))
                                    if (minV >= 3600) {
                                        applyTreatWoundsImmunity = true;
                                    }
                                }
                            }
                        } else {
                            applyTreatWoundsImmunity = false;
                        }
                    }

                    if (applyTreatWoundsImmunity) {
                        let optName = `(${message.actor.name})`;
                        if (isActorHeldEquipment(message.actor, "battle-medics-baton") || actorFeat(message.actor, "forensic-medicine-methodology")) {//1 hour
                            effectWithActorNextTurn(message, first.actor, effect_battle_medicine_immunity_hour, optName, true)
                        } else {
                            effectWithActorNextTurn(message, first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", optName, true)
                        }
                    } else {
                        ui.notifications.info(`${first.actor.name} has Battle Medicine Immunity`);
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
        } else if (messageType(message, "perception-check")) {
            if (hasOption(message, "action:sense-motive")) {
                if (actorFeat(message?.actor, "predictable")) {
                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.I4Ozf6mTnd3X0Oax")
                    } else if (successMessageOutcome(message)) {
                        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.5v0ndPPMfZwhiVZF")
                    } else if (criticalFailureMessageOutcome(message)) {
                        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.KgR1myc4OLzVxfxn")
                    }
                }
            }
        } else if (messageType(message, "spell-attack-roll")) {
            if (hasOption(message, "item:slug:aqueous-blast") && criticalSuccessMessageOutcome(message)) {
                increaseConditionForTarget(message, "prone");
            }
        } else if (messageType(message, "attack-roll")) {
            if (anySuccessMessageOutcome(message)) {
                if (message?.item?.isMelee) {
                    let is = hasEffect(message?.actor, "effect-intimidating-strike")
                    if (is) {
                        if (criticalSuccessMessageOutcome(message)) {
                            increaseConditionForTarget(message, "frightened", 2)
                        } else {
                            increaseConditionForTarget(message, "frightened", 1)
                        }
                        deleteEffectById(message.actor, is.id)
                    }
                }

                if (
                    hasOption(message, "item:dread-ampoule-lesser")
                    || hasOption(message, "item:dread-ampoule-moderate")
                    || hasOption(message, "item:dread-ampoule-greater")
                    || hasOption(message, "item:dread-ampoule-major")
                ) {
                    if (successMessageOutcome(message)) {
                        increaseConditionForTarget(message, "frightened", 1);
                    } else {
                        increaseConditionForTarget(message, "frightened", 2);
                    }
                } else if (hasOption(message, "item:tanglefoot-bag-lesser")) {
                    setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.fYZIanbYu0Vc4JEL")
                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(message.target.actor, effect_immobilized1_round)
                    }
                } else if (hasOption(message, "item:tanglefoot-bag-moderate")) {
                    setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.MEreOgnjoRiXPEuq")
                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(message.target.actor, effect_immobilized1_round)
                    }
                } else if (hasOption(message, "item:tanglefoot-bag-greater")) {
                    setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.csA4UAD2tQq7RjT8")
                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(message.target.actor, effect_immobilized1_round)
                    }
                } else if (hasOption(message, "item:tanglefoot-bag-major")) {
                    setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.ITAFsW3dQPupJ3DW")
                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(message.target.actor, effect_immobilized1_round)
                    }
                } else if (hasOption(message, "item:necrotic-bomb-lesser")) {
                    if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "sickened", 1);
                    }
                } else if (hasOption(message, "item:necrotic-bomb-moderate")) {
                    if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "sickened", 2);
                    }
                } else if (hasOption(message, "item:necrotic-bomb-greater")) {
                    if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "sickened", 3);
                    }
                } else if (hasOption(message, "item:necrotic-bomb-major")) {
                    if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "sickened", 4);
                    }
                } else if (
                    hasOption(message, "item:boulder-seed")
                    || hasOption(message, "item:boulder-seed-greater")
                ) {
                    if (criticalSuccessMessageOutcome(message)) {
                        increaseConditionForTarget(message, "prone");
                    }
                }
            }

            if (anyFailureMessageOutcome(message)) {
                if (message?.item?.isMelee) {
                    deleteFeintEffects(message);
                }
            }

        } else if (messageType(message, "damage-roll")) {
            if (hasOption(message, "first-attack")
                && hasDomain(message, "strike-damage")
                && actorFeat(message.actor, "precision")
            ) {
                let dd = hasEffects(message?.target?.actor, `effect-hunt-prey-${message.actor.id}`);
                if (dd.some(d=>d.system?.context?.origin?.actor == message.actor.uuid)) {
                    message.actor.toggleRollOption("all", "first-attack")
                }
            }
            if (hasOption(message, "gravity-weapon")
                && !hasOption(message, "item:category:unarmed")
            ) {
                message.actor.toggleRollOption("damage-roll", "gravity-weapon")
            }
            if (message?.item?.isMelee && hasEffect(message.actor, "effect-panache") && hasOption(message, "finisher")
                && (hasOption(message, "agile") || hasOption(message, "finesse"))
            ) {
                deleteEffectFromActor(message.actor, "effect-panache")
            }
            if (message?.item.isMelee) {
                deleteFeintEffects(message);
            }

            if (hasOption(message, "target:effect:flat-footed-tumble-behind")) {
                deleteEffectFromActor(message.target.actor, "effect-flat-footed-tumble-behind");
            }

            if (
                hasOption(message, "item:bottled-lightning-lesser")
                || hasOption(message, "item:bottled-lightning-moderate")
                || hasOption(message, "item:bottled-lightning-greater")
                || hasOption(message, "item:bottled-lightning-major")
            ) {
                effectWithActorNextTurn(message, message.target.actor, effect_flat_footed_start_turn)
            } else if (hasOption(message, "item:frost-vial-lesser")) {
                setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.RLsdvhmTh64Mmty9")
            } else if (hasOption(message, "item:frost-vial-moderate")) {
                setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.dv0IKm5syOdP759w")
            } else if (hasOption(message, "item:frost-vial-greater")) {
                setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.nJRoiSyd67eQ1dYj")
            } else if (hasOption(message, "item:frost-vial-major")) {
                setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.4G9qnI0oRyL6eKFQ")
            } else if (
                hasOption(message, "item:ghost-charge-lesser")
                || hasOption(message, "item:ghost-charge-moderate")
            ) {
                effectWithActorNextTurn(message, message.target.actor, effect_enfeebled1_start_turn)
            } else if (
                hasOption(message, "item:ghost-charge-greater")
                || hasOption(message, "item:ghost-charge-major")
            ) {
                effectWithActorNextTurn(message, message.target.actor, effect_enfeebled2_start_turn)
            } else if (hasOption(message, "item:slug:lay-on-hands")) {
                if (game.user.targets.first()?.actor?.type == "character") {
                    setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.lyLMiauxIVUM3oF1", "Lay on hands", getSpellRange(message.actor, message.item), true)
                }
            }
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
            } else if (_obj.slug == "grab") {
                game.user.targets.forEach(a => {
                    effectWithActorNextTurn(message, a.actor, effect_grabbed_end_attacker_next_turn)
                });
            } else if (_obj?.sourceId == "Item.hqsDRpzHAWEagLDO") {
                setEffectToActor(message.actor, "Compendium.botanical-bestiary.effects.AwLeak2GPIH6E4b5")
            } else if (_obj?.sourceId ==  "Item.PUAigKSydzY9Ii10") {
                setEffectToActor(message.actor, "Compendium.botanical-bestiary.effects.DwxpHXwlTPuXq2wT")
            } else if (_obj?.slug ==  "retributive-strike") {
                setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.DawVHfoPKbPJsz4k")
            } else if (_obj?.slug ==  "liberating-step") {
                if (game.user.targets.size == 1) {
                    setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.DawVHfoPKbPJsz4k")
                } else {
                    ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
                }
            }
        } else if (message?.flags?.pf2e?.origin?.type == "spell") {
            let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

            let effs = spellEffectMap[_obj.slug] ?? []
            effs.forEach(eff => {
                setEffectToActor(message.actor, eff, message?.item?.level)
            })

            if (_obj.slug == "inspire-courage") {
                let aura = await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.MRmGlGAFd3tSJioo")
                if (aura) {
                    setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.MRmGlGAFd3tSJioo")
                } else {
                    game.user.targets.forEach(tt => {
                        if (!hasEffect(tt.actor, 'spell-effect-inspire-courage')) {
                            setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.beReeFroAx24hj83")
                        }
                    });
                }
            } else if (_obj.slug == "inspire-defense") {
                let aura = await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.89T07EBAgn78RBbJ")
                if (aura) {
                    setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.89T07EBAgn78RBbJ")
                } else {
                    game.user.targets.forEach(tt => {
                        if (!hasEffect(tt.actor, 'spell-effect-inspire-courage')) {
                            setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.DLwTvjjnqs2sNGuG")
                        }
                    });
                }
            } else if (_obj.slug == "allegro") {
                setEffectToActorOrTarget(message, effect_allegro, "Allegro", getSpellRange(message.actor, _obj))
            }
        }
    } else {
        if (messageType(message, 'skill-check')) {
            if (hasOption(message, "action:treat-wounds") && message?.flavor == message?.flags?.pf2e?.unsafe) {
                if (game.user.targets.size == 1) {
                    let [first] = game.user.targets;
                    treatWounds(message, first.actor);
                } else if (actorFeat(message.actor, "ward-medic")) {
                    game.user.targets.forEach(a => {
                        treatWounds(message, a.actor);
                    });
                }
            } else if (hasOption(message, "action:treat-disease") && message?.flavor == message?.flags?.pf2e?.unsafe) {
                if (game.user.targets.size > 1) {
                    let [first] = game.user.targets;

                    if (criticalSuccessMessageOutcome(message)) {
                        setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.id20P4pj7zDKeLmy")
                    } else if (successMessageOutcome(message)) {
                        setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.Ee2xfKX1yyqGIDZj")
                    } else if (criticalFailureMessageOutcome(message)) {
                        setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.5oYKYXAexr0vhx84")
                    }
                }
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
        } else if (hasOption(message, 'item:slug:agonizing-despair')) {
            if (anySuccessMessageOutcome(message)) {
                increaseConditionForActor(message, "frightened", 1);
            } else if (failureMessageOutcome(message)) {
                increaseConditionForActor(message, "frightened", 2);
            } else if (criticalFailureMessageOutcome(message)) {
                increaseConditionForActor(message, "frightened", 3);
            }
        } else if (hasOption(message, 'item:slug:ancestral-touch')) {
            if (failureMessageOutcome(message)) {
                increaseConditionForActor(message, "frightened", 1);
            } else if (criticalFailureMessageOutcome(message)) {
                increaseConditionForActor(message, "frightened", 2);
            }
        } else if (hasOption(message, 'item:slug:animus-mine')) {
            if (anyFailureMessageOutcome(message)) {
                increaseConditionForActor(message, "stunned", 1);
            }
        } else if (hasOption(message, "item:slug:aberrant-whispers") && !hasEffect(message.actor, "effect-aberrant-whispers-immunity")) {
            if (failureMessageOutcome(message)) {
                increaseConditionForActor(message, "stupefied", 2);
            } else if (criticalFailureMessageOutcome(message)) {
                increaseConditionForActor(message, "confused");
            }
            setEffectToActor(message.actor, effect_aberrant_whispers_immunity)
        } else if (hasOption(message, "item:slug:lay-on-hands") && hasOption(message, "self:trait:undead")) {
            if (anyFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.JhihziXQuoteftdd")
            }
        } else if (
            hasOption(message, "action:thunderstone-lesser")
            || hasOption(message, "action:thunderstone-moderate")
            || hasOption(message, "action:thunderstone-greater")
            || hasOption(message, "action:thunderstone-major")
            || hasOption(message, "item:slug:thunderstone-lesser")
            || hasOption(message, "item:slug:thunderstone-moderate")
            || hasOption(message, "item:slug:thunderstone-greater")
            || hasOption(message, "item:slug:thunderstone-major")
        ) {
            if (anyFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
            }
        } else if (hasOption(message, "item:slug:ray-of-enfeeblement")) {
            let isCrit=false;
            let lastMsgs = game.messages.contents.slice(-10).reverse();
            for (var m in lastMsgs) {
                if (messageType(lastMsgs[m], "spell-attack-roll")
                    && criticalSuccessMessageOutcome(lastMsgs[m])
                    && hasOption(lastMsgs[m], "item:slug:ray-of-enfeeblement")
                    && lastMsgs[m]?.target?.actor?.id == message?.actor?.id) {
                    isCrit = true;
                }
            }
            if (criticalFailureMessageOutcome(message) || (failureMessageOutcome(message) && isCrit)) {
                increaseConditionForActor(message, "enfeebled", 3);
            } else if (failureMessageOutcome(message) || (successMessageOutcome(message) && isCrit)) {
                increaseConditionForActor(message, "enfeebled", 2);
            } else if (successMessageOutcome(message) || (criticalSuccessMessageOutcome(message) && isCrit)) {
                increaseConditionForActor(message, "enfeebled", 1);
            }
        }  else if (
            hasOption(message, "action:skunk-bomb-lesser")
            || hasOption(message, "action:skunk-bomb-moderate")
            || hasOption(message, "action:skunk-bomb-greater")
            || hasOption(message, "action:skunk-bomb-major")
            || hasOption(message, "item:slug:skunk-bomb-lesser")
            || hasOption(message, "item:slug:skunk-bomb-moderate")
            || hasOption(message, "item:slug:skunk-bomb-greater")
            || hasOption(message, "item:slug:skunk-bomb-major")
        ) {
            if (successMessageOutcome(message)) {
                increaseConditionForActor(message, "sickened", 1);
            } else if (failureMessageOutcome(message)) {
                setEffectToActor(message.actor, effect_skunk_bomb_fail)
            } else if (criticalFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, effect_skunk_bomb_cfail)
                setEffectToActor(message.actor, effect_blinded1_round)
            }
        } else if (
            hasOption(message, "action:shatterstone")
            || hasOption(message, "action:shatterstone-greater")
            || hasOption(message, "item:slug:shatterstone")
            || hasOption(message, "item:slug:shatterstone-greater")
        ) {
            if (anyFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
            }
        } else if (
            hasOption(message, "action:trueshape-bomb")
            || hasOption(message, "action:trueshape-bomb-greater")
            || hasOption(message, "item:slug:trueshape-bomb")
            || hasOption(message, "item:slug:trueshape-bomb-greater")
        ) {
            if (anyFailureMessageOutcome(message)) {
                deleteMorphEffects(message);
            }
        } else if (hasOption(message, "alchemical") && hasOption(message, "bomb")) {
            if (message?.flags?.pf2e?.context?.dc?.label == "Thunderstone (Lesser) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Thunderstone (Moderate) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Thunderstone (Greater) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Thunderstone (Major) DC"
            ) {
                if (anyFailureMessageOutcome(message)) {
                    setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
                }
            } else if (message?.flags?.pf2e?.context?.dc?.label == "Skunk Bomb (Lesser) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Skunk Bomb (Moderate) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Skunk Bomb (Greater) DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Skunk Bomb (Major) DC"
            ) {
                if (successMessageOutcome(message)) {
                    increaseConditionForActor(message, "sickened", 1);
                } else if (failureMessageOutcome(message)) {
                    setEffectToActor(message.actor, effect_skunk_bomb_fail)
                } else if (criticalFailureMessageOutcome(message)) {
                    setEffectToActor(message.actor, effect_skunk_bomb_cfail)
                    setEffectToActor(message.actor, effect_blinded1_round)
                }
            } else if (message?.flags?.pf2e?.context?.dc?.label == "Shatterstone DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Shatterstone (Greater) DC"
            ) {
                if (anyFailureMessageOutcome(message)) {
                    setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
                }
            } else if (message?.flags?.pf2e?.context?.dc?.label == "Trueshape Bomb DC"
                || message?.flags?.pf2e?.context?.dc?.label == "Trueshape Bomb (Greater) DC"
            ) {
                if (anyFailureMessageOutcome(message)) {
                    deleteMorphEffects(message);
                }
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
               sendNotificationChatMessage(`Action sent to chat with 0 uses left.`);
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
        }  else if (_obj.slug == "hunt-prey") {
            game.combat.turns.map(cc=>cc.actor).forEach(a => {
                let qq = hasEffects(a, `effect-hunt-prey-${message.actor.id}`)
                .forEach(eff => {
                    deleteEffectById(a, eff.id)
                })
            })

            huntedPreyEffect(message, _obj);
        } else if (_obj.slug == "devise-a-stratagem") {
            if (actorFeat(message.actor, "didactic-strike")) {
                if (game.user.targets.size == 0) {
                    ui.notifications.info(`${message.actor.name} forgot to choose up to 10 allies`);
                } else {
                    game.user.targets.forEach(tt => {
                        if (!hasEffect(tt.actor, 'effect-didactic-strike')) {
                            setEffectToActor(tt.actor, "Compendium.pf2e.feat-effects.Item.72THfaqak0F4XnON")
                        }
                    });
                }
            }
        }
    } else if (message?.flags?.pf2e?.origin?.type == "feat") {
        let feat = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

        if (feat.slug == "rage" && !hasCondition(message.actor, "fatigued") && !hasEffect(message.actor, "effect-rage")) {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr")
        } else if (feat.slug == "reactive-shield") {
            (await fromUuid("Compendium.pf2e.action-macros.4hfQEMiEOBbqelAh")).execute()
        } else if (feat.slug == "pistol-twirl") {
            let w = message.actor.itemTypes.weapon.find(a=>a.isRanged && a.handsHeld >= 1 && parseInt(a.hands) == 1)

            if (w) {
                if (w.ammo) {
                    setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.VQlbBXSi4o6xZ9XM")
                } else {
                    ui.notifications.info(`${message.actor.name} not wielding a loaded one-handed ranged weapon.`);
                }
            } else {
                ui.notifications.info(`${message.actor.name} not wielding a one-handed ranged weapon.`);
            }
        }

        let effs = featEffectMap[feat.slug] ?? undefined;
        if (effs) {
            setEffectToActor(message.actor, effs)
        }


    } else if (message?.flags?.pf2e?.origin?.type == "spell") {
        let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));

        if (_obj.slug == "guidance") {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, "effect-guidance-immunity") && !hasEffect(tt.actor, "spell-effect-guidance")) {
                    guidanceEffect(message, tt.actor)
                }
            });
        } else if  (_obj.slug == "vital-beacon" && !hasEffect(message.actor, "spell-effect-vital-beacon")) {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.WWtSEJGwKY4bQpUn", message?.item?.level)
        } else if  (_obj.slug == "shield" && !hasEffect(message.actor, "effect-shield-immunity")) {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.Jemq5UknGdMO7b73", message?.item?.level)
        } else if  (_obj.slug == "stabilize") {
            game.user.targets.forEach(tt => {
                if (hasCondition(tt.actor, "dying")) {
                    tt.actor.toggleCondition("dying")
                }
            });
        } else if  (_obj.slug == "blur") {
            if (game.user.targets.size == 0) {
                increaseConditionForActor(message, "concealed");
            } else if (game.user.targets.size == 1) {
                if (distanceIsCorrect(message.token, game.user.targets.first(), getSpellRange(message.actor, _obj))) {
                    increaseConditionForActor({'actor': game.user.targets.first().actor}, "concealed");
                } else {
                    ui.notifications.info(`${message.actor.name} chose target that not in touch range for Blur spell`);
                }
            } else {
                ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Blur spell`);
            }

        } else if  (_obj.slug == "death-ward") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.s6CwkSsMDGfUmotn", "Blur", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "fly") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.MuRBCiZn5IKeaoxi", "Fly", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "protection") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.RawLEPwyT5CtCZ4D", "Protection", getSpellRange(message.actor, _obj))
        }  else if  (_obj.slug == "stoneskin") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.JHpYudY14g0H4VWU", "Stoneskin", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "energy-aegis") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.4Lo2qb5PmavSsLNk", "Energy Aegis", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "regenerate") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.dXq7z633ve4E0nlX", "Regenerate", getSpellRange(message.actor, _obj))
        }  else if  (_obj.slug == "ant-haul") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.5yCL7InrJDHpaQjz", "Ant Haul", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "heroism") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.l9HRQggofFGIxEse", "Heroism", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "soothe") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.nkk4O5fyzrC0057i", "Soothe", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "life-boost") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.NQZ88IoKeMBsfjp7", "Life Boost", getSpellRange(message.actor, _obj))
        } else if  (_obj.slug == "apex-companion") {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.NXzo2kdgVixIZ2T1", "Apex Companion", getSpellRange(message.actor, _obj), true)
        } else if  (_obj.slug == "aberrant-form") {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.iOBUgipEjgu7jA5k", message?.item?.level)
        } else if  (_obj.slug == "adapt-self") {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.39ZPxVV3WYb54951", message?.item?.level)
        } else if  (_obj.slug == "aerial-form") {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.bgOAblEI21XV8Pg3", message?.item?.level)
        }  else if  (_obj.slug == "angel-form") {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.3Hd6ZtQYlel5fYIC", message?.item?.level)
        }  else if  (_obj.slug == "animal-form") {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.h68Fr3fht1319txv", message?.item?.level)
        }   else if  (_obj.slug == "animal-feature") {
            if (message?.item?.level >= 4) {
                setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.A61YUZctL5D1e351", message?.item?.level)
            } else {
                setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.pzPqJbOvHdgtIzH1", message?.item?.level)
            }
        }  else if  (_obj.slug == "dimension-door") {
            if (message?.item?.level >= 5) {
                setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.YUY4TqQQrxs6qLKT", message?.item?.level)
            }
        } else if  (_obj.slug == "haste") {
            if (game.user.targets.size == 0) {
                setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.U6JZ3NYNtxjXeVdE", message?.item?.level)
            } else if (game.user.targets.size == 1 || (game.user.targets.size <= 6 && message?.item?.level >= 7) ) {
                let spellRange = getSpellRange(message.actor, _obj);
                game.user.targets.forEach(tt => {
                    if (distanceIsCorrect(message.token, tt, spellRange)) {
                        setEffectToActor(tt.actor, "Compendium.pf2e-action-support.action-support.Item.U6JZ3NYNtxjXeVdE", message?.item?.level)
                    } else {
                        ui.notifications.info(`${message.actor.name} chose target that not in range for Haste spell`);
                    }
                })
            } else {
                ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Haste spell`);
            }
        } else if  (_obj.slug == "resist-energy") {
            if (game.user.targets.size == 0) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.con2Hzt47JjpuUej", message?.item?.level)
            } else if (game.user.targets.size == 1 || (game.user.targets.size == 2 && message?.item?.level >= 4) || (game.user.targets.size <= 5 && message?.item?.level >= 7) ) {
                let spellRange = getSpellRange(message.actor, _obj);
                game.user.targets.forEach(tt => {
                    if (distanceIsCorrect(message.token, tt, spellRange)) {
                        setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.con2Hzt47JjpuUej", message?.item?.level)
                    } else {
                        ui.notifications.info(`${message.actor.name} chose target that not in range for Life Boost spell`);
                    }
                })
            } else {
                ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Life Boost spell`);
            }
        } else if  (_obj.slug == "anticipate-peril") {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-anticipate-peril')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.4ag0OHKfjROmR4Pm", message?.item?.level)
                }
            });
        } else if  (_obj.slug == "arcane-countermeasure") {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-arcane-countermeasure')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.14m4s0FeRSqRlHwL")
                }
            });
        } else if  (_obj.slug == "augment-summoning") {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-augment-summoning')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.UtIOWubq7akdHMOh")
                }
            });
        } else if (_obj.slug == "protective-ward") {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.5p3bKvWsJgo83FS1")
        } else if (_obj.slug == "bane") {
            let aura = await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.YcyN7BDbL0Nt3CFN")
            if (aura) {
                setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.YcyN7BDbL0Nt3CFN")
            } else {
                game.user.targets.forEach(tt => {
                    if (!hasEffect(tt.actor, 'spell-effect-bane')) {
                        setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.UTLp7omqsiC36bso")
                    }
                });
            }
        } else if (_obj.slug == "bless") {
            let aura = await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.BqkDxiAi0q6Uaar4")
            if (aura) {
                setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.BqkDxiAi0q6Uaar4")
            } else {
                game.user.targets.forEach(tt => {
                    if (!hasEffect(tt.actor, 'spell-effect-bless')) {
                        setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.Gqy7K6FnbLtwGpud")
                    }
                });
            }
        } else if (_obj.slug == "mirror-image") {
            if (!hasEffect(message.actor, 'spell-effect-mirror-image')) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.0PO5mFRhh9HxGAtv")
            }
        } else if (_obj.slug == "see-invisibility") {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.T5bk6UH7yuYog1Fp", message?.item?.level)
        } else if (_obj.slug == "mage-armor") {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.qkwb5DD3zmKwvbk0", message?.item?.level)
        } else if (_obj.slug == "darkvision") {
            if (message?.item?.level >= 5) {
                if (game.user.targets.size == 0) {
                    setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.inNfTmtWpsxeGBI9", message?.item?.level)
                } else if (game.user.targets.size == 1) {
                    if (distanceIsCorrect(message.token, game.user.targets.first(), getSpellRange(message.actor, _obj))) {
                        setEffectToActor(game.user.targets.first().actor, "Compendium.pf2e.spell-effects.Item.inNfTmtWpsxeGBI9", message?.item?.level)
                    } else {
                        ui.notifications.info(`${message.actor.name} chose target that not in touch range for Darkvision spell`);
                    }
                } else {
                    ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Darkvision spell`);
                }
            } else if (message?.item?.level >= 3) {
                if (game.user.targets.size == 0) {
                    setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.IXS15IQXYCZ8vsmX", message?.item?.level)
                } else if (game.user.targets.size == 1) {
                    if (distanceIsCorrect(message.token, game.user.targets.first(), getSpellRange(message.actor, _obj))) {
                        setEffectToActor(game.user.targets.first().actor, "Compendium.pf2e.spell-effects.Item.IXS15IQXYCZ8vsmX", message?.item?.level)
                    } else {
                        ui.notifications.info(`${message.actor.name} chose target that not in touch range for Darkvision spell`);
                    }
                } else {
                    ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Darkvision spell`);
                }
            } else {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.IXS15IQXYCZ8vsmX", message?.item?.level)
            }
        } else if (_obj.slug == "longstrider") {
            if (message?.item?.level >= 2) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.7vIUF5zbvHzVcJA0", message?.item?.level)
            } else {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.PQHP7Oph3BQX1GhF", message?.item?.level)
            }
        } else if (_obj.slug == "spectral-hand") {
            setEffectToActor(message.actor, effect_spectral_hand)
        }
    }

    if (message?.flags?.pf2e?.modifiers?.find(a=>a.slug == "guidance" && a.enabled)) {
        deleteEffectFromActor(message.actor, "spell-effect-guidance")
    }
});

async function deleteFeintEffects(message) {
    let aef = hasEffect(message.actor, `effect-feint-success-${message.actor.id}-${message?.target?.actor.id}`)
    let tef = hasEffect(message?.target?.actor, `effect-feint-success-${message.actor.id}`)
    if (aef && tef) {
        deleteEffectFromActor(message.actor, "effect-pistol-twirl")
        if (hasPermissions(aef)) {
            aef.delete()
        } else {
            socketlibSocket._sendRequest("deleteEffect", [aef.uuid], 0)
        }
        if (hasPermissions(tef)) {
            tef.delete()
        } else {
            socketlibSocket._sendRequest("deleteEffect", [tef.uuid], 0)
        }
    }
}

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
    if (message?.item?.level) {
        aEffect.system.level = {'value': message?.item?.level};
    }
    if (hasPermissions(target)) {
        target.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, target.uuid], 0)
    }
}

async function effectWithActorNextTurn(message, target, uuid, optionalName=undefined, ownerIcon=false) {
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
    if (optionalName) {
        aEffect.name += ` ${optionalName}`
    }
    if (ownerIcon) {
        aEffect.img = message.token.texture.src
    }

    if (hasPermissions(target)) {
        target.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, target.uuid], 0)
    }
}

async function huntedPreyEffect(message, _obj) {
    if (game.user.targets.size == 1) {
        let aEffect = (await fromUuid(effect_hunt_prey)).toObject();
        aEffect.name = aEffect.name.replace("Actor", message.actor.name)
        aEffect.img = message.token.texture.src
        aEffect.system.context = mergeObject(aEffect.system.context ?? {}, {
            "origin": {
                "actor": message.actor.uuid,
                "item": message?.item?.uuid,
                "token": message.token.uuid
            },
            "roll": null,
            "target": null
        });
        aEffect.system.slug = aEffect.system.slug.replace("actor", message?.actor?.id)


        let target = game.user.targets.first().actor;
        if (hasPermissions(target)) {
            target.createEmbeddedDocuments("Item", [aEffect]);
        } else {
            socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, target.uuid], 0)
        }
    } else {
        ui.notifications.info(`${message.actor.name} need to chose target for ${_obj.name}`);
    }
}

Hooks.on("deleteCombat", function (combat, delta) {
    if (game.settings.get("pf2e-action-support", "deleteScouting")) {
        combat.turns.forEach(cc => {
            deleteEffectFromActor(cc.actor, "effect-scouting")
            deleteEffectFromActor(cc.actor, "effect-scouting-incredible-scout")
        })
    }
})

Hooks.on('combatRound', async (combat, updateData, updateOptions) => {
    game.combat.turns.map(cc=>cc.actor)
        .forEach(a => {
            if (hasEffect(a.actor, "effect-flat-footed-tumble-behind")) {
                deleteEffectFromActor(cc.actor, "effect-flat-footed-tumble-behind")
            }
            let qq = hasEffectStart(a.actor, "effect-feint-success");
            if (qq) {
                deleteEffectFromActor(a.actor, qq.slug)
                deleteEffectFromActor(cc.actor, "effect-pistol-twirl")
            }
            Object.values(a?.itemTypes).flat(1).forEach(i => {
                if (i?.system?.frequency?.per == "round" || i?.system?.frequency?.per == "turn") {
                    i.update({
                        "system.frequency.value": i.system.frequency.max
                    });
                }
            })
        })

    precision(game.combat.turns[0].actor)
    gravityWeapon(game.combat.turns[0].actor)
});

Hooks.on('combatTurn', async (combat, updateData, updateOptions) => {
     game.combat.turns.forEach(cc => {
        if (hasEffect(cc.actor, "effect-flat-footed-tumble-behind")) {
            deleteEffectFromActor(cc.actor, "effect-flat-footed-tumble-behind")
        }
        let qq = hasEffectStart(cc.actor, "effect-feint-success");
        if (qq) {
            deleteEffectFromActor(cc.actor, qq.slug)
            deleteEffectFromActor(cc.actor, "effect-pistol-twirl")
        }
    })

    precision(combat?.nextCombatant.actor)
    gravityWeapon(combat?.nextCombatant.actor)
});

Hooks.on('pf2e.restForTheNight', async (actor) => {
    if ("character" == actor?.type && "summoner" == actor?.class?.slug) {
        let ei = actor.getFlag("pf2e-action-support", "eidolon");
        if (ei) {
            (await fromUuid(ei)).update({
                "system.attributes.hp.value": actor.system.attributes.hp.value
            }, { "noHook": true });
        } else {
            game.scenes.current.tokens.filter(a=>a?.actor?.class?.slug == "eidolon").map(a=>a.actor)
            .forEach(a => {
                let f = actorFeat(a, "summoner-hp")
                if (f && f.flags.summoner == actor.uuid) {
                    a.update({
                        "system.attributes.hp.value": actor.system.attributes.hp.value
                    }, { "noHook": true })
                }
            })
        }
    }
})

Hooks.on('preUpdateActor', async (actor, data, diff, id) => {
    if (!game.settings.get("pf2e-action-support", "sharedHP")) {
        return
    }
    if (diff?.damageTaken) {
        if ("character" == actor?.type && "eidolon" == actor?.class?.slug) {
            let f = actorFeat(actor, "summoner-hp")
            if (f && f?.flags?.summoner) {
                let as = await fromUuid(f.flags.summoner);
                await as.update({
                    "system.attributes.hp.value": data.system.attributes.hp.value
                }, { "noHook": true })
            }
        } else if ("character" == actor?.type && "summoner" == actor?.class?.slug) {
            let ei = actor.getFlag("pf2e-action-support", "eidolon");
            if (ei) {
                (await fromUuid(ei)).update({
                    "system.attributes.hp.value": data.system.attributes.hp.value
                }, { "noHook": true });
            } else {
                game.scenes.current.tokens.filter(a=>a?.actor?.class?.slug == "eidolon").map(a=>a.actor)
                .forEach(a => {
                    let f = actorFeat(a, "summoner-hp")
                    if (f && f.flags.summoner == actor.uuid) {
                        a.update({
                            "system.attributes.hp.value": data.system.attributes.hp.value
                        }, { "noHook": true });
                    }
                })
            }

        }
    }
})

function gravityWeapon(actor) {
    if (!actor) {return}
    if (hasEffect(actor, "spell-effect-gravity-weapon")) {
        if (!actor.rollOptions?.["damage-roll"]?.["gravity-weapon"]) {
            actor.toggleRollOption("damage-roll", "gravity-weapon")
        }
    }
}

function precision(actor) {
    if (!actor) {return}
    if (actorFeat(actor, "precision")) {
        if (!actor.rollOptions?.["all"]?.["first-attack"]) {
            actor.toggleRollOption("all", "first-attack")
        }
    }
}
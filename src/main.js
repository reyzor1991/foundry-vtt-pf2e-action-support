import "./const.js";

Hooks.once("init", () => {
    game.settings.register("pf2e-action-support", "decreaseFrequency", {
        name: "Decrease Frequency of Action",
        hint: "Decrease Frequency of Action when action post in chat",
        scope: "world",
        config: false,
        default: 5,
        type: Number,
    });
});


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

function hasEffect(actor, eff) {
    return actor && actor?.itemTypes?.effect?.find((c => eff === c.slug))
}

function actorsWithEffect(eff) {
    return game.combat.turns.filter(cc=>hasEffect(cc.actor, eff)).map(cc=>cc.actor);
}

function deleteEffectFromActor(a, eff) {
    let eff_id = a.itemTypes.effect.find(c => eff === c.slug)._id
    a.deleteEmbeddedDocuments("Item", [eff_id])
}

function deleteFlatFootedTumbleBehindFromActor(a) {
    let eff_id = a.itemTypes.effect.find(c => "effect-flat-footed-tumble-behind" === c.slug)._id
    a.deleteEmbeddedDocuments("Item", [eff_id])
}

function deleteFlatFootedTumbleBehind() {
    actorsWithEffect("effect-flat-footed-tumble-behind")
    .forEach(a => deleteFlatFootedTumbleBehindFromActor(a));
}

async function setEffectToActor(actor, eff) {
    const source = (await fromUuid(eff)).toObject();
    source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: eff } });

    await actor.createEmbeddedDocuments("Item", [source]);
}

async function applyDamage(actor, token, formula) {
    const DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll")
    let roll = new DamageRoll(formula);
    await roll.evaluate({async: true});
    actor.applyDamage({damage:roll, token:token})
    roll.toMessage({speaker: {alias: actor.prototypeToken.name}});
}

Hooks.on('preCreateChatMessage',async (message, user, _options, userId)=>{
    if (game?.combats?.active) {
        if (messageType(message, 'skill-check') && message?.target?.actor) {
            if (hasOption(message, "action:tumble-through")) {
                if (anySuccessMessageOutcome(message)) {
                    if (actorFeat(message?.actor, "tumble-behind-rogue") && !hasEffect(message.target.actor, "effect-flat-footed-tumble-behind")) {
                        setEffectToActor(message.target.actor, effect_flat_footed)
                    }
                    if (actorFeat(message?.actor, "panache") && !hasEffect(message.actor, "effect-panache")) {
                        setEffectToActor(message.actor, effect_panache)
                    }
                }
            }
            if (hasOption(message, "action:demoralize")) {
                if (successMessageOutcome(message)) {
                    message.target.actor.increaseCondition("frightened", {value: 1 });
                } else if (criticalSuccessMessageOutcome(message)) {
                    message.target.actor.increaseCondition("frightened", {value: 2 });
                }
                if (anySuccessMessageOutcome(message)) {
                    if (actorFeat(message?.actor, "panache") && !hasEffect(message.actor, "effect-panache")) {
                        setEffectToActor(message.actor, effect_panache)
                    }
                }
            }
            if (hasOption(message, "action:disarm")) {
                if (successMessageOutcome(message) && message?.target) {
                    setEffectToActor(message.target.actor, effect_panache)
                } else if (criticalFailureMessageOutcome(message)) {
                    message.actor.increaseCondition("flat-footed");
                }
            }
            if (hasOption(message, "action:feint")) {
                if (anySuccessMessageOutcome(message) && message?.target) {
                    message.target.actor.increaseCondition("flat-footed");
                } else if (criticalFailureMessageOutcome(message)) {
                    message.actor.increaseCondition("flat-footed");
                }
            }
            if (hasOption(message, "action:high-jump") || hasOption(message, "action:long-jump") || hasOption(message, "action:shove")) {
                if (criticalFailureMessageOutcome(message)) {
                    message.actor.increaseCondition("prone");
                }
            }
            if (hasOption(message, "action:subsist")) {
                if (criticalFailureMessageOutcome(message)) {
                    setEffectToActor(message.actor, effect_adverse_subsist_situation)
                }
            }
            if (hasOption(message, "action:tamper")) {
                if (criticalFailureMessageOutcome(message)) {
                    applyDamage(message.actor, message.token, `${message.actor.level}[fire]`)
                }
            }
            if (hasOption(message, "action:grapple")) {
                if (criticalSuccessMessageOutcome(message) && message?.target) {
                    message.target.actor.increaseCondition("restrained");
                } else if (successMessageOutcome(message) && message?.target) {
                    message.target.actor.increaseCondition("grabbed");
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
            deleteFlatFootedTumbleBehindFromActor(message.target.actor);
        }
    }

    if (game.settings.get("pf2e-action-support", "decreaseFrequency")) {
        if (message?.actor) {
            let _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
            if (_obj?.system?.frequency?.value > 0) {
                _obj.update({
                    "system.frequency.value": _obj?.system?.frequency?.value - 1
                });
            }
        }
    }
});

Hooks.on('combatTurn', async (combat, updateData, updateOptions) => {
    deleteFlatFootedTumbleBehind();
});

Hooks.on('combatRound', async (combat, updateData, updateOptions) => {
    deleteFlatFootedTumbleBehind();
});
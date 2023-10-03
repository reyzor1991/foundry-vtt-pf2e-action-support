const selfEffectMap = {
    //action
    "daydream-trance": effect_daydream_trance,
    "entitys-resurgence": effect_entitys_resurgence,
    "follow-the-expert": effect_follow_the_expert,
    "call-upon-the-brightness": "Compendium.pf2e.feat-effects.Item.xPg5wzzKNxJy18rU",
    "clue-in": "Compendium.pf2e.feat-effects.Item.vhSYlQiAQMLuXqoc",
    "bullet-dancer-stance": "Compendium.pf2e.feat-effects.Item.6ctQFQfSZ6o1uyyZ",
    "change-shape-beastkin": "Compendium.pf2e.feat-effects.Item.qIOEe4kUN7FOBifb",
    //feat
    "impassable-wall-stance": "Compendium.pf2e.feat-effects.Item.zzC2qZwEKf4Ja3xD",
    "ricochet-stance-fighter": "Compendium.pf2e.feat-effects.Item.Unfl4QQURWaX2zfd",
    "mobile-shot-stance": "Compendium.pf2e.feat-effects.Item.NWOmJ6WJFheaGhho",
    "disruptive-stance": "Compendium.pf2e.feat-effects.Item.qBR3kqGCeKp3T2Be",
    "lunging-stance": "Compendium.pf2e.feat-effects.Item.W8CKuADdbODpBh6O",
    "graceful-poise": "Compendium.pf2e.feat-effects.Item.mark4VEQoynfYNBF",
    "twinned-defense-fighter": "Compendium.pf2e.feat-effects.Item.3eHMqVx30JGiJqtM",
    "fanes-fourberie": "Compendium.pf2e.feat-effects.Item.GvqB4M8LrHpzYEvl",
    "ricochet-stance-rogue": "Compendium.pf2e.feat-effects.Item.Unfl4QQURWaX2zfd",
    "buckler-dance": "Compendium.pf2e.feat-effects.Item.PS17dsXkTdQmOv7w",
    "twinned-defense-swashbuckler": "Compendium.pf2e.feat-effects.Item.3eHMqVx30JGiJqtM",
    "bone-spikes": "Compendium.pf2e.feat-effects.Item.ZsO5juyylVoxUkXh",
    "avenge-in-glory": "Compendium.pf2e.feat-effects.Item.JQUoBlZKT5N5zO5k",
    "cat-nap": "Compendium.pf2e.feat-effects.Item.l3S9i2UWGhSO58YX",
    "radiant-circuitry": "Compendium.pf2e.feat-effects.Item.263Cd5JMj8Lgc9yz",
    "saoc-astrology": "Compendium.pf2e.feat-effects.Item.6ACbQIpmmemxmoBJ",
    "elementalist-dedication": "Compendium.pf2e.feat-effects.Item.O8qithYQCv3e7DUQ",
    "emblazon-armament": "Compendium.pf2e.feat-effects.Item.U1MpMtRnFqEDBJwd",
    "eye-of-the-arclords": "Compendium.pf2e.feat-effects.Item.5IGz4iheaiUWm5KR",
    "harrower-dedication": "Compendium.pf2e.feat-effects.Item.rp6hA52dWVwtuu5F",
    "marshal-dedication": "Compendium.pf2e.feat-effects.Item.Ru4BNABCZ0hUbX7S",
    "monster-warden": "Compendium.pf2e.feat-effects.Item.nlaxROgSSLVHZ1hx",
    "ursine-avenger-form": "Compendium.pf2e.feat-effects.Item.m5xWMaDfV0PiTE6u",
    "consolidated-overlay-panopticon": "Compendium.pf2e.feat-effects.Item.qSKVcw6brzrvfhUM",
    //spell
    "false-life": "Compendium.pf2e.spell-effects.Item.PANUWN5xXC20WBg2",
    "unusual-anatomy": "Compendium.pf2e.spell-effects.Item.LMzFBnOEPzDGzHg4",
};
const elixirEffectMap = {
    "eagle-eye-elixir-lesser": "Compendium.pf2e.equipment-effects.Item.VCypzSu659eC6jNi",
    "eagle-eye-elixir-major": "Compendium.pf2e.equipment-effects.Item.wyLEew86nhNUXASu",
    "eagle-eye-elixir-moderate": "Compendium.pf2e.equipment-effects.Item.Wa4317cqU4lJ8vAQ",
    "eagle-eye-elixir-moderate": "Compendium.pf2e.equipment-effects.Item.Wa4317cqU4lJ8vAQ",

    "elixir-of-life-minor": "Compendium.pf2e.equipment-effects.Item.lPRuIRbu0rHBkoKY",
    "elixir-of-life-lesser": "Compendium.pf2e.equipment-effects.Item.EpB7yJPEuG6ez4z3",
    "elixir-of-life-moderate": "Compendium.pf2e.equipment-effects.Item.Yxssrnh9UZJAM0V7",
    "elixir-of-life-greater": "Compendium.pf2e.equipment-effects.Item.Z9oPh462q82IYIZ6",
    "elixir-of-life-major": "Compendium.pf2e.equipment-effects.Item.PpLxndUSgzgs6dd0",
};

function handleTreatWounds(message) {
    if (!game.combat && hasOption(message, "action:treat-wounds") && message.isRoll && message.rolls[0] instanceof CheckRoll) {
        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;
            treatWounds(message, first.actor);
        } else if (actorFeat(message.actor, "ward-medic")) {
            game.user.targets.forEach(a => {
                treatWounds(message, a.actor);
            });
        } else {
            ui.notifications.info(`Need to select 1 token as target`);
        }
    }
}

function handleTreatDisease(message) {
    if (hasOption(message, "action:treat-disease")
        && message?.flavor === message?.flags?.pf2e?.unsafe
        && game.user.targets.size == 1
    ) {
        const [first] = game.user.targets;
        if (criticalSuccessMessageOutcome(message)) {
            setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.id20P4pj7zDKeLmy")
        } else if (successMessageOutcome(message)) {
            setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.Ee2xfKX1yyqGIDZj")
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(first, "Compendium.pf2e.equipment-effects.Item.5oYKYXAexr0vhx84")
        }
    }
}

function overdrive(message) {
    if (hasOption(message, "action:overdrive")) {
        if (anySuccessMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.1XlJ9xLzL19GHoOL")
        } else if (criticalFailureMessageOutcome(message)) {
            applyDamage(message.actor, message.token, `${message.actor.level}[fire]`)
        }
    }
}

function skillCheck(message) {
    handleTreatWounds(message)
    handleTreatDisease(message)
    overdrive(message);
}

function jinx(message) {
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

function agonizingDespair(message) {
    if (hasOption(message, 'item:slug:agonizing-despair')) {
        if (anySuccessMessageOutcome(message)) {
            increaseConditionForActor(message, "frightened", 1);
        } else if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "frightened", 2);
        } else if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "frightened", 3);
        }
    }
}

function ancestralTouch(message) {
    if (hasOption(message, 'item:slug:ancestral-touch')) {
        if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "frightened", 1);
        } else if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "frightened", 2);
        }
    }
}

function aberrantWhispers(message) {
    if (hasOption(message, "item:slug:aberrant-whispers") && !hasEffect(message.actor, "effect-aberrant-whispers-immunity")) {
        if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "stupefied", 2);
        } else if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "confused");
        }
        setEffectToActor(message.actor, effect_aberrant_whispers_immunity)
    }
}

function saveLayOnHands(message) {
    if (hasOption(message, "item:slug:lay-on-hands")
        && hasOption(message, "self:trait:undead")
        && anyFailureMessageOutcome(message)
    ) {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.JhihziXQuoteftdd")
    }
}

function thunderStone(message) {
    if (
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
    }
}

function rayOfEnfeeblement(message) {
    if (hasOption(message, "item:slug:ray-of-enfeeblement")) {
        let isCrit = false;
        const lastMsgs = game.messages.contents.slice(-10).reverse();
        for (const m in lastMsgs) {
            if (messageType(lastMsgs[m], "spell-attack-roll")
                && criticalSuccessMessageOutcome(lastMsgs[m])
                && hasOption(lastMsgs[m], "item:slug:ray-of-enfeeblement")
                && lastMsgs[m]?.target?.actor?.id === message?.actor?.id) {
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
    }
}

function skunkBomb(message) {
    if (
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
    }
}

function shatterStone(message) {
    if (
        hasOption(message, "action:shatterstone")
        || hasOption(message, "action:shatterstone-greater")
        || hasOption(message, "item:slug:shatterstone")
        || hasOption(message, "item:slug:shatterstone-greater")
    ) {
        if (anyFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
        }
    }
}

function trueShapeBomb(message) {
    if (
        hasOption(message, "action:trueshape-bomb")
        || hasOption(message, "action:trueshape-bomb-greater")
        || hasOption(message, "item:slug:trueshape-bomb")
        || hasOption(message, "item:slug:trueshape-bomb-greater")
    ) {
        if (anyFailureMessageOutcome(message)) {
            deleteMorphEffects(message);
        }
    }
}

function saveBombs(message) {
    if (hasOption(message, "alchemical") && hasOption(message, "bomb")) {
        if (eqMessageDCLabel(message, "Thunderstone (Lesser) DC")
            || eqMessageDCLabel(message, "Thunderstone (Moderate) DC")
            || eqMessageDCLabel(message, "Thunderstone (Greater) DC")
            || eqMessageDCLabel(message, "Thunderstone (Major) DC")
        ) {
            if (anyFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
            }
        } else if (eqMessageDCLabel(message, "Skunk Bomb (Lesser) DC")
            || eqMessageDCLabel(message, "Skunk Bomb (Moderate) DC")
            || eqMessageDCLabel(message, "Skunk Bomb (Greater) DC")
            || eqMessageDCLabel(message, "Skunk Bomb (Major) DC")
        ) {
            if (successMessageOutcome(message)) {
                increaseConditionForActor(message, "sickened", 1);
            } else if (failureMessageOutcome(message)) {
                setEffectToActor(message.actor, effect_skunk_bomb_fail)
            } else if (criticalFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, effect_skunk_bomb_cfail)
                setEffectToActor(message.actor, effect_blinded1_round)
            }
        } else if (eqMessageDCLabel(message, "Shatterstone DC")
            || eqMessageDCLabel(message, "Shatterstone (Greater) DC")
        ) {
            if (anyFailureMessageOutcome(message)) {
                setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.W2OF7VeLHqc7p3DO")
            }
        } else if (eqMessageDCLabel(message, "Trueshape Bomb DC")
            || eqMessageDCLabel(message, "Trueshape Bomb (Greater) DC")
        ) {
            if (anyFailureMessageOutcome(message)) {
                deleteMorphEffects(message);
            }
        }
    }
}

function saveAffliction(message) {
    if (!game.settings.get(moduleName, "affliction")) {return}
    if (anySuccessMessageOutcome(message)) {return}

    for (const label in afflictionMap) {
        if (eqMessageDCLabel(message, label)) {
            const uuid = afflictionMap[label];
            if (!hasAfflictionBySourceId(message.actor, uuid)) {
                if (criticalFailureMessageOutcome(message)) {
                    afflictionEffect(message, uuid, true);
                } else {
                    afflictionEffect(message, uuid);
                }
            }
        }
    }
}

async function afflictionEffect(message, eff, crit=false) {
    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.flags = mergeObject(aEffect.flags ?? {}, { core: { sourceId: eff } });
    if (crit) {
        aEffect.system.stage = 2
    }

    if (hasPermissions(message.actor)) {
        message.actor.createEmbeddedDocuments("Item", [aEffect]);
    } else {
        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, message.actor.uuid], 0)
    }
}

function saveBane(message) {
    if (hasOption(message, 'item:slug:bane') && anySuccessMessageOutcome(message)) {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.kLpCaiCZjenXCebV")
        deleteEffectFromActor(message.actor, "spell-effect-bane")
    }
}

function savingThrow(message) {
    jinx(message)
    agonizingDespair(message)
    ancestralTouch(message)
    aberrantWhispers(message)
    saveLayOnHands(message)
    thunderStone(message)
    rayOfEnfeeblement(message)
    skunkBomb(message)
    shatterStone(message)
    trueShapeBomb(message)
    saveBombs(message)
    saveAffliction(message)
    saveBane(message)
}

function scout(message, _obj) {
    if (_obj.slug === "scout") {
        const sc = actorFeat(message.actor, "incredible-scout");
        const ded = actorFeat(actor, "scout-dedication");

        setEffectToActor(message.actor, "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")

        game.user.targets.forEach(tt => {
            setEffectToActor(tt.actor, ded ? 'Compendium.pf2e-action-support.action-support.Item.U7tuKcRePhSu2C2P' : sc ? "Compendium.pf2e.other-effects.Item.la8rWwUtReElgTS6" : "Compendium.pf2e.other-effects.Item.EMqGwUi3VMhCjTlF")
        })
    }
}

function acceptEcho(message, _obj) {
    if (_obj.slug === "accept-echo") {
        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.2ca1ZuqQ7VkunAh3")
    }
}

function huntPrey(message, _obj) {
    if (_obj.slug === "hunt-prey") {
        game.combat?.turns?.map(cc=>cc.actor)?.forEach(a => {
            const qq = hasEffects(a, `effect-hunt-prey-${message.actor.id}`)
            .forEach(eff => {
                deleteEffectById(a, eff.id)
            })
        })

        huntedPreyEffect(message, _obj);
    }
}

function deviseStratagem(message, _obj) {
    if (_obj.slug === "devise-a-stratagem") {
        if (actorFeat(message.actor, "didactic-strike")) {
            if (game.user.targets.size === 0) {
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
}

function aid(message, _obj) {
    if (_obj.slug === "aid") {
        if (game.user.targets.size != 1) {
            ui.notifications.info(`${message.actor.name} forgot to choose 1 ally`);
        } else  if (!hasEffect(game.user.targets.first().actor, 'effect-aid')) {
            setEffectToActor(game.user.targets.first().actor, "Compendium.pf2e.other-effects.Item.AHMUpMbaVkZ5A1KX")
        }
    }
}

function handleActions(message, _obj) {
    scout(message, _obj);
    acceptEcho(message, _obj);
    huntPrey(message, _obj);
    deviseStratagem(message, _obj);
    aid(message, _obj);
}

function rage(message, _obj) {
    if (_obj.slug === "rage" && !hasCondition(message.actor, "fatigued") && !hasEffect(message.actor, "effect-rage")) {
        setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.z3uyCMBddrPK5umr")
    }
}

async function reactiveShield(message, _obj) {
    if (_obj.slug === "reactive-shield") {
        (await fromUuid("Compendium.pf2e.action-macros.4hfQEMiEOBbqelAh")).execute()
    }
}

function kipUp(message, _obj) {
    if (_obj.slug === "kip-up") {
        message.actor.decreaseCondition("prone");
    }
}

function pistolTwirl(message, _obj) {
    if (_obj.slug === "pistol-twirl") {
        const w = message.actor.itemTypes.weapon.find(a=>a.isRanged && a.handsHeld >= 1 && parseInt(a.hands) === 1)

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
}

function rootMagic(message, _obj) {
    if (_obj.slug === "root-magic") {
        setEffectToActorOrTarget(
            message,
            "Compendium.pf2e.feat-effects.Item.jO7wMhnjT7yoAtQg",
            "Root Magic",
            500,
            true
        )
    }
}

function anointAlly(message, _obj) {
    if  (_obj.slug === "anoint-ally") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.feat-effects.Item.nnF7RSVlC6swbSw8", "Anoint Ally", 5, true)
    }
}

function dragonslayerOathLiberator(message, _obj) {
    if (_obj.slug === "dragonslayer-oath-liberator") {
        setEffectToActorOrTarget(
            message,
            "Compendium.pf2e.feat-effects.Item.iyONT1qgeRgoYHsZ",
            "Dragonslayer Oath (Liberator)",
            500,
            true
        )
    }
}

function esotericOathLiberator(message, _obj) {
    if (_obj.slug === "esoteric-oath-liberator") {
        setEffectToActorOrTarget(
            message,
            "Compendium.pf2e.feat-effects.Item.tAsFXMzNkpj964X4",
            "Esoteric Oath (Liberator)",
            500,
            true
        )
    }
}

function fiendsbaneOathLiberator(message, _obj) {
    if (_obj.slug === "fiendsbane-oath-liberator") {
        setEffectToActorOrTarget(
            message,
            "Compendium.pf2e.feat-effects.Item.9dCt0asv0kt7DR4q",
            "Fiendsbane Oath (Liberator)",
            500,
            true
        )
    }
}

function shiningOathLiberator(message, _obj) {
    if (_obj.slug === "shining-oath-liberator") {
        setEffectToActorOrTarget(
            message,
            "Compendium.pf2e.feat-effects.Item.ZnKnOPPq3cG54PlG",
            "Shining Oath (Liberator)",
            500,
            true
        )
    }
}

function handleFeats(message, _obj) {
    rage(message, _obj);
    reactiveShield(message, _obj);
    kipUp(message, _obj);
    pistolTwirl(message, _obj);
    rootMagic(message, _obj);
    anointAlly(message, _obj);
    dragonslayerOathLiberator(message, _obj);
    esotericOathLiberator(message, _obj);
    fiendsbaneOathLiberator(message, _obj);
    shiningOathLiberator(message, _obj);
}

function guidance(message, _obj) {
    if (_obj.slug === "guidance") {
        game.user.targets.forEach(tt => {
            if (!hasEffect(tt.actor, "effect-guidance-immunity") && !hasEffect(tt.actor, "spell-effect-guidance")) {
                guidanceEffect(message, tt.actor)
            }
        });
    }
}

function vitalBeacon(message, _obj) {
    if  (_obj.slug === "vital-beacon" && !hasEffect(message.actor, "spell-effect-vital-beacon")) {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.WWtSEJGwKY4bQpUn", message?.item?.level)
    }
}

function shieldSpell(message, _obj) {
    if  (_obj.slug === "shield" && !hasEffect(message.actor, "effect-shield-immunity")) {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.Jemq5UknGdMO7b73", message?.item?.level)
    }
}

function stabilize(message, _obj) {
    if  (_obj.slug === "stabilize") {
        game.user.targets.forEach(tt => {
            if (hasCondition(tt.actor, "dying")) {
                if (hasPermissions(tt.actor)) {
                    tt.actor.toggleCondition("dying")
                } else {
                    socketlibSocket._sendRequest("toggleConditions", [tt.actor.uuid, "dying"], 0)
                }
            }
        });
    }
}

function blur(message, _obj) {
    if  (_obj.slug === "blur") {
        if (game.user.targets.size === 0) {
            increaseConditionForActor(message, "concealed");
        } else if (game.user.targets.size === 1) {
            if (distanceIsCorrect(message.token, game.user.targets.first(), getSpellRange(message.actor, _obj))) {
                increaseConditionForActor({'actor': game.user.targets.first().actor}, "concealed");
            } else {
                ui.notifications.info(`${message.actor.name} chose target that not in touch range for Blur spell`);
            }
        } else {
            ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Blur spell`);
        }

    }
}

function deathWard(message, _obj) {
    if  (_obj.slug === "death-ward") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.s6CwkSsMDGfUmotn", "Blur", getSpellRange(message.actor, _obj))
    }
}

function animalFeature(message, _obj) {
    if  (_obj.slug === "animal-feature") {
        if (message?.item?.level >= 4) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.A61YUZctL5D1e351", message?.item?.level)
        } else {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.pzPqJbOvHdgtIzH1", message?.item?.level)
        }
    }
}

function dimensionDoor(message, _obj) {
    if  (_obj.slug === "dimension-door" && message?.item?.level >= 5) {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.YUY4TqQQrxs6qLKT", message?.item?.level)
    }
}

function haste(message, _obj) {
    if  (_obj.slug === "haste") {
        if (game.user.targets.size === 0) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.U6JZ3NYNtxjXeVdE", message?.item?.level)
        } else if (game.user.targets.size === 1 || (game.user.targets.size <= 6 && message?.item?.level >= 7) ) {
            const spellRange = getSpellRange(message.actor, _obj);
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
    }
}

function resistEnergy(message, _obj) {
    if  (_obj.slug === "resist-energy") {
        if (game.user.targets.size === 0) {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.con2Hzt47JjpuUej", message?.item?.level)
        } else if (game.user.targets.size === 1 || (game.user.targets.size === 2 && message?.item?.level >= 4) || (game.user.targets.size <= 5 && message?.item?.level >= 7) ) {
            const spellRange = getSpellRange(message.actor, _obj);
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
    }
}

function anticipatePeril(message, _obj) {
    if  (_obj.slug === "anticipate-peril") {
        game.user.targets.forEach(tt => {
            if (!hasEffect(tt.actor, 'spell-effect-anticipate-peril')) {
                setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.4ag0OHKfjROmR4Pm", message?.item?.level)
            }
        });
    }
}

function arcaneCountermeasure(message, _obj) {
    if  (_obj.slug === "arcane-countermeasure") {
        game.user.targets.forEach(tt => {
            if (!hasEffect(tt.actor, 'spell-effect-arcane-countermeasure')) {
                setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.14m4s0FeRSqRlHwL")
            }
        });
    }
}

function augmentSummoning(message, _obj) {
    if  (_obj.slug === "augment-summoning") {
        game.user.targets.forEach(tt => {
            if (!hasEffect(tt.actor, 'spell-effect-augment-summoning')) {
                setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.UtIOWubq7akdHMOh")
            }
        });
    }
}

async function rollDCBane(combatants,dc,item, origin) {
    combatants.forEach(c=>{
        c.actor.saves.will.roll({skipDialog:true, dc:{value: dc}, item, origin})
    })
}

async function bane(message, _obj) {
    if (_obj.slug === "bane") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.FcUe8TT7bhqlURIf").then(()=> {
            if (_obj.spellcasting.statistic.dc.value) {
                const dc = _obj.spellcasting.statistic.dc.value;
                const baneLevel = hasEffect(message.actor, "effect-aura-bane")?.system?.badge?.value ?? 1;
                const all = (isActorCharacter(message.actor) ? enemyCombatant() :allyCombatant())
                    .filter(a=>!hasEffect(a.actor, "spell-effect-bane"))
                    .filter(a=>!hasEffect(a.actor, "effect-bane-immunity"))
                    .filter(a=>distanceIsCorrect(message.token, a.token, 5 * baneLevel))

                setTimeout(function() {
                    rollDCBane(all, dc, _obj, _obj?.actor ?? message.actor);
                }, 1000)
            }
        });
    }
}

async function bless(message, _obj) {
    if (_obj.slug === "bless") {
        const aura = await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.BqkDxiAi0q6Uaar4")
        if (aura) {
            setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.BqkDxiAi0q6Uaar4")
        } else {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-bless')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.Gqy7K6FnbLtwGpud")
                }
            });
        }
    }
}

function darkvision(message, _obj) {
    if (_obj.slug === "darkvision") {
        if (message?.item?.level >= 5) {
            if (game.user.targets.size === 0) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.inNfTmtWpsxeGBI9", message?.item?.level)
            } else if (game.user.targets.size === 1) {
                if (distanceIsCorrect(message.token, game.user.targets.first(), getSpellRange(message.actor, _obj))) {
                    setEffectToActor(game.user.targets.first().actor, "Compendium.pf2e.spell-effects.Item.inNfTmtWpsxeGBI9", message?.item?.level)
                } else {
                    ui.notifications.info(`${message.actor.name} chose target that not in touch range for Darkvision spell`);
                }
            } else {
                ui.notifications.info(`${message.actor.name} chose incorrect count of targets for Darkvision spell`);
            }
        } else if (message?.item?.level >= 3) {
            if (game.user.targets.size === 0) {
                setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.IXS15IQXYCZ8vsmX", message?.item?.level)
            } else if (game.user.targets.size === 1) {
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
    }
}

function longstrider(message, _obj) {
    if (_obj.slug === "longstrider") {
        if (message?.item?.level >= 2) {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.7vIUF5zbvHzVcJA0", message?.item?.level)
        } else {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.PQHP7Oph3BQX1GhF", message?.item?.level)
        }
    }
}

function enlarge(message, _obj) {
    if (_obj.slug === "enlarge") {
        if (message?.item?.level < 4) {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.sPCWrhUHqlbGhYSD", "Enlarge", getSpellRange(message.actor, _obj))
        } else if (message?.item?.level < 6) {
            setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.41WThj17MZBXTO2X", "Enlarge", getSpellRange(message.actor, _obj))
        }
    }
}

function handleSpells(message, _obj) {
    guidance(message, _obj);
    vitalBeacon(message, _obj);
    shieldSpell(message, _obj);
    stabilize(message, _obj);
    blur(message, _obj);
    deathWard(message, _obj);
    animalFeature(message, _obj);
    dimensionDoor(message, _obj);
    haste(message, _obj);
    resistEnergy(message, _obj);
    anticipatePeril(message, _obj);
    arcaneCountermeasure(message, _obj);
    augmentSummoning(message, _obj);
    bane(message, _obj);
    bless(message, _obj);
    darkvision(message, _obj);
    longstrider(message, _obj);
    enlarge(message, _obj);

    if  (_obj.slug === "fly") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.MuRBCiZn5IKeaoxi", "Fly", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "protection") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.RawLEPwyT5CtCZ4D", "Protection", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "stoneskin") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.JHpYudY14g0H4VWU", "Stoneskin", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "energy-aegis") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.4Lo2qb5PmavSsLNk", "Energy Aegis", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "regenerate") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.dXq7z633ve4E0nlX", "Regenerate", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "ant-haul") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.5yCL7InrJDHpaQjz", "Ant Haul", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "heroism") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.l9HRQggofFGIxEse", "Heroism", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "soothe") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.nkk4O5fyzrC0057i", "Soothe", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "life-boost") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.NQZ88IoKeMBsfjp7", "Life Boost", getSpellRange(message.actor, _obj))
    } else if  (_obj.slug === "apex-companion") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.NXzo2kdgVixIZ2T1", "Apex Companion", getSpellRange(message.actor, _obj), true)
    } else if  (_obj.slug === "light") {
        setEffectToActorOrTarget(message, "Compendium.pf2e.spell-effects.Item.cVVZXNbV0nElVOPZ", "Light", getSpellRange(message.actor, _obj))
    }

    if (_obj.slug === "aberrant-form") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.iOBUgipEjgu7jA5k", message?.item?.level)
    } else if  (_obj.slug === "adapt-self") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.39ZPxVV3WYb54951", message?.item?.level)
    } else if  (_obj.slug === "aerial-form") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.bgOAblEI21XV8Pg3", message?.item?.level)
    } else if  (_obj.slug === "angel-form") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.3Hd6ZtQYlel5fYIC", message?.item?.level)
    } else if  (_obj.slug === "animal-form") {
        setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.h68Fr3fht1319txv", message?.item?.level)
    } else if (_obj.slug === "protective-ward") {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.5p3bKvWsJgo83FS1", message?.item?.level);
    } else if (_obj.slug === "see-invisibility") {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.T5bk6UH7yuYog1Fp", message?.item?.level)
    } else if (_obj.slug === "mage-armor") {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.qkwb5DD3zmKwvbk0", message?.item?.level)
    } else if (_obj.slug === "mirror-image" && !hasEffect(message.actor, 'spell-effect-mirror-image')) {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.0PO5mFRhh9HxGAtv", message?.item?.level)
    } else if (_obj.slug === "spectral-hand") {
        setEffectToActor(message.actor, effect_spectral_hand, message?.item?.level)
    } else if (_obj.slug === "see-the-unseen") {
        if (message?.item?.level >= 5) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.ToBOvG7N8cNxa8uX", message?.item?.level)
        } else {
            setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.T5bk6UH7yuYog1Fp", message?.item?.level)
        }
    }
}

async function handleSelfAssignedEffects(message) {
    if (message?.flags?.pf2e?.origin?.type) {
        if (!messageType(message, undefined) && !messageType(message, "spell-cast")) {return}
        const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
        if (!_obj) {return}
        const eff = selfEffectMap[_obj.slug]
        if (eff && !hasEffectBySourceId(message.actor, eff)) {
            setEffectToActor(message.actor, eff, message?.item?.level)
        }
        handleActions(message, _obj);
        handleFeats(message, _obj);
        handleSpells(message, _obj);
    }
}

async function handleElixirEffects(message) {
    if (message?.flags?.pf2e?.origin?.type != "consumable") { return;}
    if (!message?.flags?.pf2e?.origin?.sourceId) {return}
    const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (!_obj) {return}
    const elix = elixirEffectMap[_obj.slug]
    if (elix) {
        setEffectToActorOrTarget(message, elix, message?.item?.name, 5000)
    }
}

function handleGeneralMessage(message) {
    const mType = message?.flags?.pf2e?.context?.type;
    switch (mType) {
        case 'skill-check':
            skillCheck(message);
            break;
        case 'saving-throw':
            savingThrow(message);
            break;
    }

    handleSelfAssignedEffects(message);
    handleElixirEffects(message);
}
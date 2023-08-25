const battleSelfEffectMap = {
    //action
    "conduct-energy": effect_conduct_energy,
    "energy-shot": effect_energy_shot,
    "fade-into-daydreams": effect_concealed_start_turn,
    "anadi-venom": "Compendium.pf2e.feat-effects.Item.gN1LbKYQgi8Fx98V",
    "arcane-cascade": "Compendium.pf2e.feat-effects.Item.fsjO5oTKttsbpaKl",
    "bend-time": effect_bend_time,
    "blizzard-evasion": "Compendium.pf2e.feat-effects.Item.JF2xCqL6t4UJZtUi",
    "calculate-threats": "Compendium.pf2e.feat-effects.Item.P6druSuWIVoLrXJR",
    "catharsis": "Compendium.pf2e.feat-effects.Item.JysvElDwGZ5ABQ6x",
    "harrow-the-fiend": "Compendium.pf2e.feat-effects.Item.MSkspeBsbXm6LQ19",
    "recall-under-pressure": "Compendium.pf2e.feat-effects.Item.CW4zphOOpeaLJIWc",
    "tail-toxin": "Compendium.pf2e.feat-effects.Item.Q0DKJRnDuuUnLpvn",
    "tenacious-stance": "Compendium.pf2e.feat-effects.Item.Ms6WPXRWfXb2KpG2",
    //spell
    'adaptive-ablation': 'Compendium.pf2e.spell-effects.Item.6GAztnHuQSwAp1k1',//?maybe general
    'agile-feet': 'Compendium.pf2e.spell-effects.Item.y9PJdDYFemhk6Z5o',
    'ancestral-form': 'Compendium.pf2e.spell-effects.Item.l8HkOKfiUqd3BUwT',//?maybe general
    'angelic-wings': 'Compendium.pf2e.spell-effects.Item.iZYjxY0qYvg5yPP3',
    'armor-of-bones': 'Compendium.pf2e.spell-effects.Item.6BjslHgY01cNbKp5',//?maybe general
    'athletic-rush': 'Compendium.pf2e.spell-effects.Item.57lnrCzGUcNUBP2O',
    'true-strike': 'Compendium.pf2e.spell-effects.Item.fpGDAz2v5PG0zUSl',
    'gravity-weapon': 'Compendium.pf2e.spell-effects.Item.tNjimcyUwn8afeH6',//?maybe general
    //feat
    "smite-evil":"Compendium.pf2e.feat-effects.Item.AlnxieIRjqNqsdVu",
    "heavens-thunder":"Compendium.pf2e.feat-effects.Item.L9g3EMCT3imX650b",
    "intimidating-strike":effect_intimidating_strike,
    "reach-spell":effect_reach_spell,
    "crane-stance":"Compendium.pf2e.feat-effects.Item.nwkYZs6YwXYAJ4ps",
    "dragon-stance":"Compendium.pf2e.feat-effects.Item.qUowHpn79Dpt1hVn",
    "gorilla-stance":"Compendium.pf2e.feat-effects.Item.RozqjLocahvQWERr",
    "monastic-archer-stance":"Compendium.pf2e.feat-effects.Item.1dxD3xsTzak6GNj5",
    "mountain-stance":"Compendium.pf2e.feat-effects.Item.gYpy9XBPScIlY93p",
    "rain-of-embers-stance":"Compendium.pf2e.feat-effects.Item.Im5JBInybWFbHEYS",
    "tiger-stance":"Compendium.pf2e.feat-effects.Item.pf9yvKNg6jZLrE30",
    "wolf-stance":"Compendium.pf2e.feat-effects.Item.b2kWJuCPj1rDMdwz",
    "reflective-ripple-stance":"Compendium.pf2e.feat-effects.Item.QDQwHxNowRwzUx9R",
    "stoked-flame-stance":"Compendium.pf2e.feat-effects.Item.rp1YauUSULuqW8rs",
    "stumbling-stance":"Compendium.pf2e.feat-effects.Item.BCyGDKcplkJiSAKJ",
    "shooting-stars-stance":"Compendium.pf2e.feat-effects.Item.RXbfq6oqzVnW6xOV",
    "cobra-stance":"Compendium.pf2e.feat-effects.Item.CgxYa0lrLUjS2ZhI",
    "peafowl-stance":"Compendium.pf2e.feat-effects.Item.vjvcccAwdkOLA1Fc",
    "ironblood":"Compendium.pf2e.feat-effects.Item.tPKXLtDJ3bzJcXlv",
    "jellyfish-stance":"Compendium.pf2e.feat-effects.Item.pkcr9w5x6bKzl3om",
    "tangled-forest-stance":"Compendium.pf2e.feat-effects.Item.PMHwCrnh9W4sMu5b",
    "whirling-blade-stance":"Compendium.pf2e.feat-effects.Item.JefXqvhzUeBArkAP",
    "vitality-manipulating-stance":"Compendium.pf2e.feat-effects.Item.h45sUZFs5jhuQdCE",
    "everstand-stance": "Compendium.pf2e.feat-effects.Item.GGebXpRPyONZB3eS",
    "point-blank-shot": "Compendium.pf2e.feat-effects.Item.9HPxAKpP3WJmICBx",
    "disarming-stance": "Compendium.pf2e.feat-effects.Item.LxSev4GNKv26DbZw",
    "dueling-dance-fighter": "Compendium.pf2e.feat-effects.Item.1nCwQErK6hpkNvfw",
    "dueling-dance-swashbuckler": "Compendium.pf2e.feat-effects.Item.1nCwQErK6hpkNvfw",
    "paragons-guard": "Compendium.pf2e.feat-effects.Item.6EDoy3OSFZ4L3Vs7",
    "multishot-stance": "Compendium.pf2e.feat-effects.Item.l4QUaedYofnfXig0",
    "masquerade-of-seasons-stance": "Compendium.pf2e.feat-effects.Item.6IsZQpwRJQWIzdGx",
    "replenishment-of-war": "Compendium.pf2e.feat-effects.Item.BJc494USeyM011p3",
    "watchful-gaze": "Compendium.pf2e.feat-effects.Item.a7qiSYdlaIRPe57i",
    "striking-retribution": "Compendium.pf2e.feat-effects.Item.EzgW32MCOGov9h5C",
    "ceremony-of-protection": "Compendium.pf2e.feat-effects.Item.9kNbiZPOM2wy60ao",
    "clans-edge": "Compendium.pf2e.equipment-effects.Item.fRlvmul3LbLo2xvR",
    "dualborn": "Compendium.pf2e.feat-effects.Item.XaZdQHF9GvaJINqH",
    "elemental-assault": "Compendium.pf2e.feat-effects.Item.XaZdQHF9GvaJINqH",
    "hydraulic-deflection": "Compendium.pf2e.feat-effects.Item.IfsglZ7fdegwem0E",
    "life-giving-magic": "Compendium.pf2e.feat-effects.Item.YKJhjkerCW0Jl6HP",
    "maidens-mending": "Compendium.pf2e.feat-effects.Item.FIgud5jqZgIjwkRE",
    "nanite-surge": "Compendium.pf2e.feat-effects.Item.ErLweSmVAN57QIpp",
    "psychic-rapport": "Compendium.pf2e.feat-effects.Item.Dbr5hInQXH904Ca7",
    "divine-aegis": "Compendium.pf2e.feat-effects.Item.K1IgNCf3Hh2EJwQ9",
    "sniping-duo-dedication": "Compendium.pf2e.feat-effects.Item.zQHF2kkhZRAcrQvR",
    "aldori-parry": "Compendium.pf2e.feat-effects.Item.aEuDaQY1GnrrnDRA",
};

function tumbleThrough(message) {
    if (message?.target && hasOption(message, "action:tumble-through")) {
        if (anySuccessMessageOutcome(message)) {
            if (actorFeat(message?.actor, "tumble-behind-rogue") && !hasEffect(message.target.actor, "effect-off-guard-tumble-behind")) {
                effectWithActorNextTurn(message, message.target.actor, effect_off_guard)
            }
            if (actorFeat(message?.actor, "panache") && !hasEffect(message.actor, "effect-panache")) {
                setEffectToActor(message.actor, effect_panache)
            }
        }
    }
}

function demoralize(message) {
    if (message?.target && hasOption(message, "action:demoralize")) {
        const dd = hasEffects(message?.target?.actor, "effect-demoralize-immunity-minutes");
        if (dd.length === 0 || !dd.some(d=>d.system?.context?.origin?.actor === message.actor.uuid)) {
            const i = immunities(message?.target?.actor);
            if (i.some(d=>["mental", "fear-effects", "emotion"].includes(d))) {
                sendGMNotification(`${message.target.actor.name} has Immunity to Demoralize action. Has mental, fear or emotion immunity`);
            } else {
                const decryThief = actorFeat(message.actor, "decry-thief");
                if (successMessageOutcome(message)) {
                    increaseConditionForTarget(message, "frightened", 1);
                    if (decryThief) {
                        setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.FyaekbWsazkJhJda");
                    }
                } else if (criticalSuccessMessageOutcome(message)) {
                    increaseConditionForTarget(message, "frightened", 2);
                    if (decryThief) {
                        setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.kAgUld9PcI4XkHbq");
                    }
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
}

function perform(message) {
    if (message?.target
        && anySuccessMessageOutcome(message)
        && hasOption(message, "action:perform")
        && actorFeat(message?.actor, "battledancer")
        && !hasEffect(message.actor, "effect-panache")
    ) {
        setEffectToActor(message.actor, effect_panache)
    }
}

function disarm(message) {
    if (message?.target && hasOption(message, "action:disarm")) {
        if (successMessageOutcome(message)) {
            setEffectToActor(message.target.actor, effect_disarm_success)
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_off_guard_start_turn)
        }
    }
}

function feint(message) {
    if (message?.target && hasOption(message, "action:feint")) {
        if (anySuccessMessageOutcome(message) && message?.target) {
            if (criticalSuccessMessageOutcome(message)) {
                setFeintEffect(message, true)
                if (actorFeat(message.actor, "distracting-feint")) {
                    effectWithActorNextTurn(message, message.target.actor, "Compendium.pf2e.feat-effects.Item.7hRgBo0fRQBxMK7g")
                }
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
}

function createDiversion(message) {
    if (message?.target && hasOption(message, "action:create-a-diversion")) {
        if (anySuccessMessageOutcome(message)) {
            if (actorFeat(message?.actor, "fencer") && !hasEffect(message.actor, "effect-panache")){
                setEffectToActor(message.actor, effect_panache)
            }
        }
    }
}

function grapple(message) {
    if (message?.target && hasOption(message, "action:grapple")) {
        if (criticalSuccessMessageOutcome(message) && message?.target) {
            effectWithActorNextTurn(message, message.target.actor, effect_restrained_end_attacker_next_turn)
        } else if (successMessageOutcome(message) && message?.target) {
            effectWithActorNextTurn(message, message.target.actor, effect_grabbed_end_attacker_next_turn)
        }
        if (anySuccessMessageOutcome(message) && actorFeat(message?.actor, "gymnast") && !hasEffect(message.actor, "effect-panache")) {
            setEffectToActor(message.actor, effect_panache)
        }
    }
}

function shove(message) {
    if (message?.target && hasOption(message, "action:shove")) {
        if (anySuccessMessageOutcome(message) && actorFeat(message?.actor, "gymnast") && !hasEffect(message.actor, "effect-panache")) {
            setEffectToActor(message.actor, effect_panache)
        }
    }
}

function bonMot(message) {
    if (message?.target && hasOption(message, "action:bon-mot")) {
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
}

function escape(message) {
    if (message?.target && hasOption(message, "action:escape") && anySuccessMessageOutcome(message)) {
        const rest = hasEffects(message.actor, "effect-restrained-until-end-of-attacker-next-turn")
        const grab = hasEffects(message.actor, "effect-grabbed-until-end-of-attacker-next-turn")
        rest.filter(a=>a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(a => {
            deleteEffectById(message.actor, a.id)
        });
        grab.filter(a=>a?.system?.context?.origin?.actor === message.target.actor.uuid).forEach(a => {
            deleteEffectById(message.actor, a.id)
        });
    }
}

function trip(message) {
    if (message?.target && hasOption(message, "action:trip")) {
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
}

function battleMedicine(message) {
    if (game.combat && hasOption(message, "action:treat-wounds")
        && message.isRoll && message.roll instanceof DamageRoll) {
        if (!hasOption(message, "feat:battle-medicine")) {
            ui.notifications.info(`${message.actor.name} hasn't Battle Medicine Feat`);
            return;
        }

        if (game.user.targets.size === 1) {
            const [first] = game.user.targets;

            let _bm = hasEffect(first.actor, "effect-battle-medicine-immunity")
            let _bm1 = hasEffect(first.actor, "effect-battle-medicine-immunity-hour")

            _bm = _bm?.system?.context?.origin?.actor === message.actor.uuid ? true : false;
            _bm1 = _bm1?.system?.context?.origin?.actor === message.actor.uuid ? true : false;

            let applyTreatWoundsImmunity = true;

            if (_bm || _bm1) {
                if (actorFeat(message.actor, "medic-dedication")) {
                    const immuns = hasAnyEffects(first.actor, ["effect-battle-medicine-immunity", "effect-battle-medicine-immunity-hour"]);
                    if (immuns.length > 1) {
                        applyTreatWoundsImmunity = false;
                        if (message.actor.system.skills.med.rank >= 3) {
                            const minV = Math.min(...immuns.map(a=>game.time.worldTime - a.system.start.value))
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
                const optName = `(${message.actor.name})`;
                if (isActorHeldEquipment(message.actor, "battle-medics-baton")
                    || actorFeat(message.actor, "forensic-medicine-methodology")
                    || actorFeat(first.actor, "godless-healing")
                ) {//1 hour
                    effectWithActorNextTurn(message, first.actor, effect_battle_medicine_immunity_hour, optName, true)
                } else {
                    effectWithActorNextTurn(message, first.actor, "Compendium.pf2e.feat-effects.Item.2XEYQNZTCGpdkyR6", optName, true)
                }
            } else {
                ui.notifications.info(`${first.actor.name} has Battle Medicine Immunity`);
            }
        }
    }
}

function acrobaticFailProne(message) {
    if (hasOption(message, "action:high-jump")
        || hasOption(message, "action:long-jump")
        || hasOption(message, "action:shove")
        || hasOption(message, "action:climb")
        || hasOption(message, "action:trip")
    ) {
        if (criticalFailureMessageOutcome(message)) {
            message.actor.increaseCondition("prone");
        }
    }
}

function subsist(message) {
    if (hasOption(message, "action:subsist")) {
        if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_adverse_subsist_situation)
        } else if (failureMessageOutcome(message)) {
            message.actor.increaseCondition("fatigued");
        }
    }
}

function tamper(message) {
    if (hasOption(message, "action:tamper")) {
        if (criticalFailureMessageOutcome(message)) {
            applyDamage(message.actor, message.token, `${message.actor.level}[fire]`)
        }
    }
}

function catfolkDance(message) {
    if (hasOption(message, "action:catfolk-dance")) {
        if (anySuccessMessageOutcome(message)) {
            setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.5bEnBqVOgdp4gROP")
        }
        if (criticalSuccessMessageOutcome(message)) {
            setEffectToTarget(message, effect_off_guard_start_turn);
        }
    }
}

function battleSkillCheck(message) {
    tumbleThrough(message);
    demoralize(message);
    perform(message);
    disarm(message);
    feint(message);
    createDiversion(message);
    grapple(message);
    shove(message);
    bonMot(message);
    escape(message);
    trip(message);
    battleMedicine(message);
    acrobaticFailProne(message);
    subsist(message);
    tamper(message);
    catfolkDance(message);
}

function battlePerceptionCheck(message) {
    if (hasOption(message, "action:sense-motive") && actorFeat(message?.actor, "predictable")) {
        if (criticalSuccessMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.I4Ozf6mTnd3X0Oax")
        } else if (successMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.5v0ndPPMfZwhiVZF")
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e.feat-effects.Item.KgR1myc4OLzVxfxn")
        }
    }
}

function battleSpellAttackRoll(message) {
    if (hasOption(message, "item:slug:aqueous-blast") && criticalSuccessMessageOutcome(message)) {
        increaseConditionForTarget(message, "prone");
    }
}

function meleeStrike(message) {
    if (message?.item?.isMelee) {
        const is = hasEffect(message?.actor, "effect-intimidating-strike")
        if (is) {
            if (criticalSuccessMessageOutcome(message)) {
                increaseConditionForTarget(message, "frightened", 2)
            } else {
                increaseConditionForTarget(message, "frightened", 1)
            }
            deleteEffectById(message.actor, is.id)
        }

        if (hasOption(message, "item:slug:wolf-jaws") && hasOption(message, "wolf-drag")) {
            increaseConditionForTarget(message, "prone");
        }
    }
}

function dreadAmpoule(message) {
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
    }
}

function tangleFootBagLesser(message) {
    const isCrit = criticalSuccessMessageOutcome(message);
    let effectWasSet = false;
    if (hasOption(message, "item:tanglefoot-bag-lesser")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.fYZIanbYu0Vc4JEL")
        effectWasSet = true;
    } else if (hasOption(message, "item:tanglefoot-bag-moderate")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.MEreOgnjoRiXPEuq")
        effectWasSet = true;
    } else if (hasOption(message, "item:tanglefoot-bag-greater")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.csA4UAD2tQq7RjT8")
        effectWasSet = true;
    } else if (hasOption(message, "item:tanglefoot-bag-major")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.ITAFsW3dQPupJ3DW")
        effectWasSet = true;
    }
    if (isCrit && effectWasSet) {
        setEffectToActor(message.target.actor, effect_immobilized1_round)
    }
}

function necroticBomb(message) {
    if (criticalSuccessMessageOutcome(message)) {
        if (hasOption(message, "item:necrotic-bomb-lesser")) {
            increaseConditionForTarget(message, "sickened", 1);
        } else if (hasOption(message, "item:necrotic-bomb-moderate")) {
            increaseConditionForTarget(message, "sickened", 2);
        } else if (hasOption(message, "item:necrotic-bomb-greater")) {
            increaseConditionForTarget(message, "sickened", 3);
        } else if (hasOption(message, "item:necrotic-bomb-major")) {
            increaseConditionForTarget(message, "sickened", 4);
        }
    }
}

function boulderSeed(message) {
    if (
        hasOption(message, "item:boulder-seed")
        || hasOption(message, "item:boulder-seed-greater")
    ) {
        if (criticalSuccessMessageOutcome(message)) {
            increaseConditionForTarget(message, "prone");
        }
    }
}

function runes(message) {
    if (message.item) {
        if (message.item.system?.runes?.property?.includes("crushing")) {
            setEffectToActor(message.target?.actor, "Compendium.pf2e.equipment-effects.Item.zNHvhwHsC8ckhKVp")
        } else if (message.item.system?.runes?.property?.includes("bloodthirsty")) {
            increaseConditionForTarget(message, "drained", 1);
        } else if (message.item.system?.runes?.property?.includes("disrupting") && message?.target?.actor?.traits?.has("undead")) {
            effectWithActorNextTurn(message, message.target.actor, effect_enfeebled1_start_turn)
        } else if (message.item.system?.runes?.property?.includes("fearsome")) {
            increaseConditionForTarget(message, "frightened", 1);
        }
    }
}

function battleAttackRoll(message) {
    if (anySuccessMessageOutcome(message)) {
        meleeStrike(message);
        dreadAmpoule(message);
        tangleFootBagLesser(message);
        necroticBomb(message);
        boulderSeed(message);

        if (criticalSuccessMessageOutcome(message)) {
            runes(message)
        }
    } else if (anyFailureMessageOutcome(message)) {
        if (message?.item?.isMelee) {
            deleteFeintEffects(message);
        }
    }
}

async function firstAttack(message) {
    if (hasOption(message, "first-attack")
        && hasDomain(message, "strike-damage")
        && actorFeat(message.actor, "precision")
    ) {
        const ranger = message.actor.getFlag(moduleName, "ranger");
        if (ranger && hasEffect(message?.target?.actor, `effect-hunt-prey-${ranger}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        } else if (hasEffect(message?.target?.actor, `effect-hunt-prey-${message.actor.id}`) && message.actor.rollOptions?.["all"]?.["first-attack"]) {
            await message.actor.toggleRollOption("all", "first-attack")
        }
    }
}

async function gravityWeapon(message) {
    if (message.actor.rollOptions?.["damage-roll"]?.["gravity-weapon"] && !hasOption(message, "item:category:unarmed")) {
        await message.actor.toggleRollOption("damage-roll", "gravity-weapon")
    }
}

function deleteEffectsAfterDamage(message) {
    if (message?.item?.isMelee) {
        deleteFeintEffects(message);

        if (hasEffect(message.actor, "effect-panache")
            && hasOption(message, "finisher")
            && (hasOption(message, "agile") || hasOption(message, "finesse"))
        ) {
            deleteEffectFromActor(message.actor, "effect-panache")
        }
    }
    if (hasOption(message, "target:effect:off-guard-tumble-behind")) {
        deleteEffectFromActor(message.target.actor, "effect-off-guard-tumble-behind");
    }
}

function bottledLightning(message) {
    if (
        hasOption(message, "item:bottled-lightning-lesser")
        || hasOption(message, "item:bottled-lightning-moderate")
        || hasOption(message, "item:bottled-lightning-greater")
        || hasOption(message, "item:bottled-lightning-major")
    ) {
        effectWithActorNextTurn(message, message.target.actor, effect_off_guard_start_turn)
    }
}

function frostVial(message) {
    if (hasOption(message, "item:frost-vial-lesser")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.RLsdvhmTh64Mmty9")
    } else if (hasOption(message, "item:frost-vial-moderate")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.dv0IKm5syOdP759w")
    } else if (hasOption(message, "item:frost-vial-greater")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.nJRoiSyd67eQ1dYj")
    } else if (hasOption(message, "item:frost-vial-major")) {
        setEffectToActor(message.target.actor, "Compendium.pf2e.equipment-effects.Item.4G9qnI0oRyL6eKFQ")
    }
}

function ghostCharge(message) {
    if (hasOption(message, "item:ghost-charge-lesser") || hasOption(message, "item:ghost-charge-moderate")) {
        effectWithActorNextTurn(message, message.target.actor, effect_enfeebled1_start_turn)
    } else if (hasOption(message, "item:ghost-charge-greater") || hasOption(message, "item:ghost-charge-major")) {
        effectWithActorNextTurn(message, message.target.actor, effect_enfeebled2_start_turn)
    }
}

function layOnHands(message) {
    if (hasOption(message, "item:slug:lay-on-hands") && game.user.targets.first()?.actor?.type === "character") {
        setEffectToActorOrTarget(
            message,
            actorFeat(message.actor, "accelerating-touch")
                ? "Compendium.pf2e.spell-effects.Item.alyNtkHLNnt98Ewz"
                : "Compendium.pf2e.spell-effects.Item.lyLMiauxIVUM3oF1",
            "Lay on hands",
            getSpellRange(message.actor, message.item),
             true
        )
    }
}

function seedpod(message) {
    if (hasDomain(message, "seedpod-damage") && hasOption(message, "check:outcome:critical-success")) {
        setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.wQDHpOKY3GZqvS2v")
    }
}

function criticalSpecialization(message) {
    if (!game.settings.get(moduleName, "criticalSpecialization")){return;}
    if (!criticalSuccessMessageOutcome(message)) {return;}
    if (!message.actor || !message.item?.group || !message.target?.actor) {return;}
    if (["dart","knife","pick"].includes(message.item.group)) {return;}
    if (
        !message.actor.synthetics.criticalSpecalizations.standard.some(b=>b(message.item, message.flags.pf2e?.context?.options))
        && !message.actor.synthetics.criticalSpecalizations.alternate.some(b=>b(message.item, message.flags.pf2e?.context?.options))
    ) {
        return;
    }

    if (message.item.group === "sword") {
       effectWithActorNextTurn(message, message.target.actor, effect_off_guard_start_turn)
    } else if (message.item.group === "hammer" || message.item.group === "flail") {
        increaseConditionForTarget(message, "prone");
    } else if (message.item.group === "spear") {
       effectWithActorNextTurn(message, message.target.actor, effect_clumsy_start_turn)
    } else if (message.item.group === "bow") {
        if (message.target.token.elevation === 0) {
            increaseConditionForTarget(message, "immobilized");
        }
    } else if (["brawling", "firearm", "sling"].includes(message.item.group) && game.settings.get(moduleName, "criticalSpecializationRoll")) {
        message.target.actor.saves.fortitude.roll({
            skipDialog:true,
            dc: { label: `${message.item.group.capitalize()} Critical Specialization DC`, value: message.actor.attributes.classDC.value },
            origin:message.actor
        })
    }
}

async function battleDamageRoll(message) {
    await firstAttack(message);
    await gravityWeapon(message);
    deleteEffectsAfterDamage(message);
    bottledLightning(message);
    frostVial(message);
    ghostCharge(message);
    layOnHands(message);
    seedpod(message);

    criticalSpecialization(message);
}

function deleteShieldEffect(message) {
    // maybe delete shield because it was used?
    if ("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing) {
        //maybe absorb
        //shield absorb
        const shieldEff = hasEffect(message.actor, "spell-effect-shield");
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
}

function handleBattleActions(message, _obj) {
    if (_obj.slug === "drop-prone" || _obj.slug === "crawl") {
        message.actor.increaseCondition("prone");
    } else if (_obj.slug === "stand") {
        message.actor.decreaseCondition("prone");
    } else if (_obj.slug === "grab") {
        game.user.targets.forEach(a => {
            effectWithActorNextTurn(message, a.actor, effect_grabbed_end_attacker_next_turn)
        });
    } else if (_obj?.sourceId === "Item.hqsDRpzHAWEagLDO") {
        setEffectToActor(message.actor, "Compendium.botanical-bestiary.effects.AwLeak2GPIH6E4b5")
    } else if (_obj?.sourceId ===  "Item.PUAigKSydzY9Ii10") {
        setEffectToActor(message.actor, "Compendium.botanical-bestiary.effects.DwxpHXwlTPuXq2wT")
    } else if (_obj?.slug ===  "retributive-strike") {
        setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.DawVHfoPKbPJsz4k")
    } else if (_obj?.slug ===  "spin-tale") {
        setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.UzIamWcEJTOjwfoA")
    } else if (_obj?.slug ===  "screaming-skull") {
        setEffectToActor(message.actor, effect_blinded1_round)
    } else if (_obj?.slug ===  "liberating-step") {
        if (game.user.targets.size === 1) {
            setEffectToTarget(message, "Compendium.pf2e.feat-effects.Item.DawVHfoPKbPJsz4k")
        } else {
            ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
        }
    }
}

async function handleBattleFeats(message, _obj) {
    if (_obj.slug === "combat-grab") {
        if (hasFreeHand(message.actor)) {
            setEffectToTarget(message, effect_grabbed_end_attacker_next_turn)
        } else {
            ui.notifications.info(`${message.actor.name} heeds to have free hand to grab`);
        }
    } else if (_obj.slug === "known-weaknesses") {
        game.user.targets.forEach(tt => {
            if (!hasEffect(tt.actor, 'effect-known-weakness')) {
                effectWithActorNextTurn(message, tt.actor, "Compendium.pf2e.feat-effects.Item.DvyyA11a63FBwV7x")
            }
        });
    } else if (_obj.slug === "wolf-drag") {
        if (hasEffect(message.actor, "stance-wolf-stance") && !message.actor.rollOptions?.["all"]?.["wolf-drag"]) {
            await message.actor.toggleRollOption("all", "wolf-drag")
        }
    }
};

async function handleBattleSpells(message, _obj) {
    if (_obj.slug === "inspire-courage") {
        if (await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.MRmGlGAFd3tSJioo")) {
            setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.MRmGlGAFd3tSJioo")
        } else {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-inspire-courage')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.beReeFroAx24hj83")
                }
            });
        }
    } else if (_obj.slug === "inspire-defense") {
        if (await fromUuid("Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.89T07EBAgn78RBbJ")) {
            setEffectToActor(message.actor, "Compendium.xdy-pf2e-workbench.xdy-pf2e-workbench-items.Item.89T07EBAgn78RBbJ")
        } else {
            game.user.targets.forEach(tt => {
                if (!hasEffect(tt.actor, 'spell-effect-inspire-courage')) {
                    setEffectToActor(tt.actor, "Compendium.pf2e.spell-effects.Item.DLwTvjjnqs2sNGuG")
                }
            });
        }
    } else if (_obj.slug === "allegro") {
        setEffectToActorOrTarget(message, effect_allegro, "Allegro", getSpellRange(message.actor, _obj))
    } else if (_obj.slug === "ki-strike") {
        setEffectToActor(message.actor, "Compendium.pf2e.spell-effects.Item.8olfnTmWh0GGPDqX")
    } else if (_obj.slug === "boost-eidolon") {
        const ei = await fromUuid(message.actor.getFlag(moduleName, "eidolon"));
        if (ei) {
            setEffectToActor(ei, "Compendium.pf2e.spell-effects.Item.h0CKGrgjGNSg21BW")
        }
    } else if (_obj.slug === "reinforce-eidolon") {
        const ei = await fromUuid(message.actor.getFlag(moduleName, "eidolon"));
        if (ei) {
            setEffectToActor(ei, "Compendium.pf2e.spell-effects.Item.UVrEe0nukiSmiwfF")
        }
    } else if (_obj.slug === "lingering-composition") {
        const macLC = await fromUuid('Compendium.xdy-pf2e-workbench.asymonous-benefactor-macros-internal.Macro.5CLSiG3QPj5xbhBk');
        if (macLC) {
            macLC.execute();
        }
    }
}

async function handleBattleSelfAssignedEffects(message) {
    if (message?.flags?.pf2e?.origin?.type) {
        if (!messageType(message, undefined) && !messageType(message, "spell-cast")){return}
        const _obj = message.item ?? (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
        if (!_obj) {return}
        const eff = battleSelfEffectMap[_obj.slug]
        if (eff && !hasEffectBySourceId(message.actor, eff)) {
            setEffectToActor(message.actor, eff, message?.item?.level)
        }
        handleBattleActions(message, _obj);
        handleBattleFeats(message, _obj);
        handleBattleSpells(message, _obj);
    }
}

function animusMine(message) {
    if (hasOption(message, 'item:slug:animus-mine') && anyFailureMessageOutcome(message)) {
        increaseConditionForActor(message, "stunned", 1);
    }
}

function daze(message) {
    if (hasOption(message, 'item:slug:daze') && criticalFailureMessageOutcome(message)) {
        increaseConditionForActor(message, "stunned", 1);
    }
}

function saveRunes(message) {
    if (!anyFailureMessageOutcome(message)) {return}
    if (eqMessageDCLabel(message, "Brilliant DC") || eqMessageDCLabel(message, "Brilliant (Greater) DC")) {
        setEffectToActor(message.actor, effect_blinded1_round)
    } else if (eqMessageDCLabel(message, "Frost Rune DC")) {
        setEffectToActor(message.actor, effect_slowed1_round)
    } else if (eqMessageDCLabel(message, "Greater Thundering DC")) {
        increaseConditionForActor(message, "deafened");
    } else if (eqMessageDCLabel(message, "Thundering DC")) {
        if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_deafened_hour)
        } else if (failureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_deafened_minute)
        }
    }
}

function ashenWind(message) {
    if (hasOption(message, 'item:slug:ashen-wind')) {
        if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 2);
        } else if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 1);
        }
    }
}

function acknowledgeFan(message) {
    if (hasOption(message, 'item:slug:acknowledge-fan')) {
        if (criticalFailureMessageOutcome(message)) {
            effectWithActorNextTurnST(message, effect_paralyzed_next_turn)
        } else if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "stunned", 2);
        } else if (successMessageOutcome(message)) {
            increaseConditionForActor(message, "stunned", 1);
        }
    }
}

function tremor(message) {
    if (hasOption(message, 'item:slug:tremor') && criticalFailureMessageOutcome(message)) {
        increaseConditionForActor(message, "prone");
    }
}

function painfulVibrations(message) {
    if (hasOption(message, 'item:slug:painful-vibrations')) {
        if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 1);
            setEffectToActor(message.actor, effect_deafened_round)
        } else if (criticalFailureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 2);
            setEffectToActor(message.actor, effect_deafened_minute)
        }
    }
}

function divineWrath(message) {
    if (hasOption(message, 'item:slug:divine-wrath')) {
        if (failureMessageOutcome(message)) {
            increaseConditionForActor(message, "sickened", 1);
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_skunk_bomb_cfail)
        }
    }
}

function ashCloud(message) {
    if (hasOption(message, 'item:slug:ash-cloud')) {
        if (failureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_dazzled1_round)
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, effect_blinded1_round)
        }
    }
}

function aromaticLure(message) {
    if (hasOption(message, 'item:slug:aromatic-lure')) {
        if (successMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.KQ0TqKFPn64tkzkt")
        } else if (failureMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.gp7QMc2Nw9LoXu64")
        } else if (criticalFailureMessageOutcome(message)) {
            setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.ubBrL0lNSrpAHO6G")
        }
    }
}

function saveCriticalSpecialization(message) {
    if (!game.settings.get(moduleName, "criticalSpecialization")){return;}
    if (!anyFailureMessageOutcome(message)) {return}

    if (eqMessageDCLabel(message, "Firearm Critical Specialization DC")) {
        increaseConditionForActor(message, "stunned", 1);
    } else if (eqMessageDCLabel(message, "Sling Critical Specialization DC")) {
        increaseConditionForActor(message, "stunned", 1);
    } else if (eqMessageDCLabel(message, "Brawling Critical Specialization DC")) {
        increaseConditionForActor(message, "slowed", 1);
    }
}

function battleSavingThrow(message) {
    animusMine(message)
    daze(message)
    saveRunes(message);
    ashenWind(message);
    acknowledgeFan(message);
    tremor(message);
    painfulVibrations(message);
    divineWrath(message);
    ashCloud(message);
    aromaticLure(message);
    saveCriticalSpecialization(message);
}

function handleEncounterMessage(message) {
    deleteShieldEffect(message);

    const mType = message?.flags?.pf2e?.context?.type;
    switch (mType) {
        case 'skill-check':
            battleSkillCheck(message);
            break;
        case 'perception-check':
            battlePerceptionCheck(message);
            break;
        case 'spell-attack-roll':
            battleSpellAttackRoll(message);
            break;
        case 'attack-roll':
            battleAttackRoll(message);
            break;
        case 'damage-roll':
            battleDamageRoll(message);
            break;
        case 'saving-throw':
            battleSavingThrow(message);
            break;
    }

    handleBattleSelfAssignedEffects(message);
}
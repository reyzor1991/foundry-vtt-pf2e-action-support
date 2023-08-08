let socketlibSocket = undefined;

//async function flurryOfBlows(actor) {
//    if ( !actor ) { return ui.notifications.info("Please select 1 token") }
//    if ( game.user.targets.size !== 1 ) { return ui.notifications.info("Please select 1 target for Flurry of Blows") }
//
//    if ( !actorAction(actor, "flurry-of-blows") && !actorFeat(actor, "flurry-of-blows" ) ) {
//        return ui.notifications.warn(`${token.name} does not have Flurry of Blows!`)
//    }
//
//    const DamageRoll = CONFIG.Dice.rolls.find( r => r.name === "DamageRoll" );
//    const critRule = game.settings.get("pf2e", "critRule");
//
//    let weapons = actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") );
//
//    if ( actor.system.actions.some( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ) ) {
//        weapons = actor.system.actions.filter( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ).concat(actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") && h.origin?.type !== "effect" ));
//    }
//
//    if ( actor.itemTypes.feat.some( s => s.slug === "monastic-weaponry" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.system?.traits?.value.includes("monk") ) ) { weapons = actor.system.actions.filter( h => h.item?.isHeld && h.ready && h.item?.system?.traits?.value.includes("monk") ).concat(weapons) }
//
//    if ( actor.itemTypes.effect.some( s => s.slug === "stance-monastic-archer-stance" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) ) { weapons.unshift( actor.system.actions.find( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) ) }
//
//    let wtcf = '';
//    for ( const w of weapons ) {
//        wtcf += `<option value=${w.item.id}>${w.item.name}</option>`
//    }
//
//    const { cWeapon, map, dos} = await Dialog.wait({
//        title:"Flurry of Blows",
//        content: `
//            <div class="row-flurry"><div class="column-flurry"><h3>First Attack</h2><select id="fob1" autofocus>
//                ${wtcf}
//            </select></div><div class="column-flurry"><h3>Second Attack</h2>
//            <select id="fob2">
//                ${wtcf}
//            </select></div></div><hr><h3>Multiple Attack Penalty</h2>
//                <select id="map">
//                <option value=0>No MAP</option>
//                <option value=1>MAP -5(-4 for agile)</option>
//                <option value=2>MAP -10(-8 for agile)</option>
//            </select><hr>
//        `,
//        buttons: {
//                ok: {
//                    label: "Attack",
//                    icon: "<i class='fa-solid fa-hand-fist'></i>",
//                    callback: (html) => { return { cWeapon: [html[0].querySelector("#fob1").value,html[0].querySelector("#fob2").value], map: parseInt(html[0].querySelector("#map").value)} }
//                },
//                cancel: {
//                    label: "Cancel",
//                    icon: "<i class='fa-solid fa-ban'></i>",
//                }
//        },
//        default: "ok"
//    },{width:"300"});
//
//    const map2 = map === 2 ? map : map + 1;
//    if ( cWeapon === undefined ) { return; }
//
//    const primary = weapons.find( w => w.item.id === cWeapon[0] );
//    const secondary = weapons.find( w => w.item.id === cWeapon[1] );
//
//    let options = actor.itemTypes.feat.some(s => s.slug === "stunning-fist") ? ["stunning-fist"] : [];
//
//    const cM = [];
//    function PD(cm) {
//        if ( cm.user.id === game.userId && cm.isDamageRoll ) {
//            if ( !cM.map(f => f.flavor).includes(cm.flavor) ) {
//                cM.push(cm);
//            }
//            return false;
//        }
//    }
//
//    Hooks.on('preCreateChatMessage', PD);
//
//    const pdos = (await primary.variants[map].roll({ event, createMessage: false, skipDialog: true    })).degreeOfSuccess;
//    const sdos = (await secondary.variants[map2].roll({ event, createMessage: false, skipDialog: true    })).degreeOfSuccess;
//
//    let pd,sd;
//    if ( pdos === 2 ) { pd = await primary.damage({event,options}); }
//    if ( pdos === 3 ) { pd = await primary.critical({event,options}); }
//    if ( sdos === 2 ) { sd = await secondary.damage({event,options}); }
//    if ( sdos === 3 ) { sd = await secondary.critical({event,options}); }
//
//    Hooks.off('preCreateChatMessage', PD);
//
//    if ( sdos <= 1 ) {
//        if ( pdos === 2) {
//            await primary.damage({event,options});
//            return;
//        }
//        if ( pdos === 3 ) {
//            await primary.critical({event,options});
//            return;
//        }
//    }
//
//    if ( pdos <= 1 ) {
//        if ( sdos === 2) {
//            await secondary.damage({event,options});
//            return;
//        }
//        if ( sdos === 3 ) {
//            await secondary.critical({event,options});
//            return;
//        }
//    }
//
//    await new Promise( (resolve) => {
//        setTimeout(resolve,0);
//    });
//
//    if ( pdos <=0 && sdos <= 1 ) {
//        return;
//    } else {
//        const terms = pd.terms[0].terms.concat(sd.terms[0].terms);
//        const type = pd.terms[0].rolls.map(t => t.type).concat(sd.terms[0].rolls.map(t => t.type));
//        const persistent = pd.terms[0].rolls.map(t => t.persistent).concat(sd.terms[0].rolls.map(t => t.persistent));
//
//        let preCombinedDamage = [];
//        let combinedDamage = '{';
//        let i = 0;
//        for ( const t of terms ) {
//            if ( persistent[i] && !preCombinedDamage.find( p => p.persistent && p.terms.includes(t) ) ) {
//                preCombinedDamage.push({ terms: [t], type: type[i], persistent: persistent[i] });
//            }
//            if ( !preCombinedDamage.some(pre => pre.type === type[i]) && !persistent[i] ) {
//                preCombinedDamage.push({ terms: [terms[i]], type: type[i], persistent: persistent[i] });
//            }
//            else if ( !persistent[i] ) {
//                preCombinedDamage.find( pre => pre.type === type[i] ).terms.push(t);
//            }
//            i++;
//        }
//
//        for ( const p of preCombinedDamage ) {
//            if ( p.persistent ) {
//            combinedDamage += `, ${p.terms.join(",")}`;
//            }
//            else{
//                if ( combinedDamage === "{" ) {
//                    if ( p.terms.length > 1 ){
//                        combinedDamage += `(${p.terms.join(" + ")})[${p.type}]`;
//
//                    }
//                    else {
//                        combinedDamage += p.terms[0];
//                    }
//                }
//                else if ( p.terms.length === 1 ) {
//                    combinedDamage += `, ${p.terms[0]}`;
//                }
//                else {
//                    combinedDamage += `, (${p.terms.join(" + ")})[${p.type}]`;
//                }
//            }
//        }
//
//        combinedDamage += "}";
//
//        const rolls = [await new DamageRoll(combinedDamage).evaluate({ async: true })]
//        let flavor = `<strong>Flurry of Blows Total Damage</strong>`;
//        const color = (pdos || sdos) === 2 ? `<span style="color:rgb(0, 0, 255)">Success</span>` : `<span style="color:rgb(0, 128, 0)">Critical Success</span>`
//        if ( cM.length === 1 ) { flavor += `<p>Same Weapon (${color})<hr>${cM[0].flavor}</p><hr>`; }
//        else { flavor += `<hr>${cM[0].flavor}<hr>${cM[1].flavor}`; }
//        if ( pdos === 3 || sdos === 3 ) {
//            flavor += `<hr><strong>TOP DAMAGE USED FOR CREATURES IMMUNE TO CRITICALS`;
//            if ( critRule === "doubledamage" ) {
//                rolls.unshift(await new DamageRoll(combinedDamage.replaceAll("2 * ", "")).evaluate({ async: true }));
//            }
//            else if ( critRule === "doubledice" ) {
//                const splitValues = combinedDamage.replaceAll("2 * ", "").replaceAll(/([\{\}])/g,"").split(" ");
//                const toJoinVAlues = [];
//                for ( const sv of splitValues ) {
//                    if ( sv.includes("[doubled])") ) {
//                        const sV = sv.replaceAll("[doubled])","");
//                        if ( !sV.includes("d") ) {
//                                toJoinVAlues.push("sV");
//                                continue;
//                        }
//                        else {
//                            const n = sV.split(/(d\d)/g);
//                            if ( n[0].charAt(1) !== "(") {
//                                n[0] = `${parseInt(n[0].charAt(1) / 2)}`;
//                                toJoinVAlues.push(n.join(""));
//                                continue;
//                            }
//                            else if ( n[0].charAt(2) !== "(") {
//                                n[0] = `(${parseInt(n[0].charAt(2)) / 2}`;
//                                toJoinVAlues.push(n.join(""));
//                                continue;
//                            }
//                            else {
//                                n[0] = `((${parseInt(n[0].charAt(3)) / 2}`;
//                                toJoinVAlues.push(n.join(""));
//                                continue;
//                            }
//                        }
//                    }
//                    else {
//                    toJoinVAlues.push(sv);
//                    continue;
//                    }
//                }
//                rolls.unshift(await new DamageRoll(`{${toJoinVAlues.join(" ")}}`).evaluate( {async: true} ));
//            }
//        }
//        if ( cM.length === 1) {
//            options = cM[0].flags.pf2e.context.options;
//        }
//        else { options = [...new Set(cM[0].flags.pf2e.context.options.concat(cM[1].flags.pf2e.context.options))]; }
//
//        await ChatMessage.create({
//            flags: {
//                pf2e: {
//                    context: {
//                        options
//                    }
//                }
//            },
//            rolls,
//            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
//            flavor,
//            speaker: ChatMessage.getSpeaker(),
//        });
//    }
//}

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
    game.settings.register(moduleName, "useHomebrew", {
        name: "Use Homebrew",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "decreaseFrequency", {
        name: "Decrease Frequency of Action",
        hint: "Decrease frequency of actions when posted in chat (useful for actions that have a once per day/turn/round)",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "useSocket", {
        name: "Use socket",
        hint: "Enable this setting to be able to drop effects on creatures they dont own",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "deleteScouting", {
        name: "Delete Scouting effect when combat ends",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
    game.settings.register(moduleName, "sharedHP", {
        name: "Summoner-Eidolon shared HP",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "ignoreEncounterCheck", {
        name: "Ignore encounter check to apply effect and etc.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "affliction", {
        name: "Handle afflictions",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });
    game.settings.register(moduleName, "useBloodline", {
        name: "Handle Bloodlines ",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    PF2eActionSupportHomebrewSettings.init()

    const originGetRollContext = CONFIG.Actor.documentClass.prototype.getRollContext;
    CONFIG.Actor.documentClass.prototype.getRollContext = async function(prefix) {
        const r = await originGetRollContext.call(this, prefix);
        if (r.options.has("first-attack") && !r.options.has(`target:effect:hunt-prey-${this.id}`)) {
            r.options.delete("first-attack");
        }
        return r;
    }

    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "setSummonerHP": setSummonerHP,
//        "flurryOfBlows": flurryOfBlows,
    })
});

Hooks.on('deleteItem', async (effect, data, id) => {
    if (game.user.isGM) {
        if (effect.slug === "spell-effect-guidance" && !hasEffect(effect.actor, "effect-guidance-immunity")) {
            setEffectToActor(effect.actor, "Compendium.pf2e.spell-effects.Item.3LyOkV25p7wA181H");
        }
    }
});

async function createEffects(data) {
    const actor = await fromUuid(data.actorUuid);
    const source = (await fromUuid(data.eff)).toObject();
    source.flags = mergeObject(source.flags ?? {}, { core: { sourceId: data.eff } });
    if (data.level) {
        source.system.level = {'value': data.level};
    }
    await actor.createEmbeddedDocuments("Item", [source]);
}

async function deleteEffects(data) {
    const actor = await fromUuid(data.actorUuid);
    const effect = actor.itemTypes.effect.find(c => data.eff === c.slug)
    actor.deleteEmbeddedDocuments("Item", [effect._id])
}

async function updateObjects(data) {
    const _obj = await fromUuid(data.id);
    _obj.update(data.data);
}

async function deleteEffectsById(data) {
    const actor = await fromUuid(data.actorUuid);
    const effect = actor.itemTypes.effect.find(c => data.effId === c.id)
    actor.deleteEmbeddedDocuments("Item", [effect._id])
}

async function increaseConditions(data) {
    const actor = await fromUuid(data.actorUuid);
    const valueObj = data?.value ? {'value': data?.value } : {}

    actor.increaseCondition(data.condition, valueObj);
}

async function applyDamages(data) {
    const actor = await fromUuid(data.actorUuid);
    const token = await fromUuid(data.tokenUuid);

    applyDamage(actor, token, data.formula);
}

function hasPermissions(item) {
    return 3 === item.ownership[game.user.id] || game.user.isGM;
}

function heldItems(actor) {
    if (!actor) return []
    return Object.values(actor?.itemTypes).flat(1).filter(a=>a.handsHeld > 0);
}

function hasFreeHand(actor) {
    return heldItems(actor).map(a=>a.handsHeld).reduce((a, b) => a + b, 0) < 2;
}

function hasCondition(actor, con) {
    return actor?.itemTypes?.condition?.find((c => c.type === "condition" && con === c.slug))
}

function isActorHeldEquipment(actor, item) {
    return actor?.itemTypes?.equipment?.find(a=>a.isHeld && a.slug === item)
}

const setupSocket = () => {
  if (globalThis.socketlib) {
      socketlibSocket = globalThis.socketlib.registerModule(moduleName);
      socketlibSocket.register("createEffects", createEffects);
      socketlibSocket.register("deleteEffects", deleteEffects);
      socketlibSocket.register("deleteEffectsById", deleteEffectsById);
      socketlibSocket.register("updateObjects", updateObjects);
      socketlibSocket.register("increaseConditions", increaseConditions);
      socketlibSocket.register("applyDamages", applyDamages);
      socketlibSocket.register("createFeintEffectOnTarget", _socketCreateFeintEffectOnTarget);
      socketlibSocket.register("deleteEffect", _socketDeleteEffect);
      socketlibSocket.register("sendGMNotification", sendGMNotification);
      socketlibSocket.register("bloodlineDemonic", bloodlineDemonic);
  }
  return !!globalThis.socketlib
}

Hooks.once('setup', function () {
    if (!setupSocket()) console.error('Error: Unable to set up socket lib for PF2e Action Support')
})

async function _socketDeleteEffect(targetId) {
    (await fromUuid(targetId)).delete()
}

async function _socketCreateFeintEffectOnTarget(effect, targetId) {
    await (await fromUuid(targetId)).createEmbeddedDocuments("Item", [effect]);
}

function failureMessageOutcome(message) {
    return "failure" === message?.flags?.pf2e?.context?.outcome;
}

function criticalFailureMessageOutcome(message) {
    return "criticalFailure" === message?.flags?.pf2e?.context?.outcome;
}

function successMessageOutcome(message) {
    return "success" === message?.flags?.pf2e?.context?.outcome;
}

function criticalSuccessMessageOutcome(message) {
    return "criticalSuccess" === message?.flags?.pf2e?.context?.outcome;
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

function actorAction(actor, action) {
    return actor?.itemTypes?.action?.find((c => action === c.slug))
}

function messageType(message, type) {
    return type === message?.flags?.pf2e?.context?.type;
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

function hasAfflictionBySourceId(actor, uuid) {
    return actor?.itemTypes?.affliction?.find((c => uuid === c.sourceId))
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
    const s = spell?.system?.range?.value?.match(/\d+/g)
    return s ? parseInt(s[0]) : 0;
}

function getSpellRange(actor, spell) {
    let s = spellRange(spell)
    if (hasEffect(actor, "effect-spectral-hand")) {
        s = s > 120 ? s : 120;
    } else if (hasEffect(actor, "effect-reach-spell")) {
        s += 30;
    }
    return s === 0 ? 5 : s;
}

async function treatWounds(message, target) {
    const _bm = hasEffect(target, "effect-treat-wounds-immunity-minutes")
    const _bm1 = hasEffect(target, "effect-treat-wounds-immunity")

    const applyTreatWoundsImmunity = _bm || _bm1 ? false : true;

    if (applyTreatWoundsImmunity) {
        if (actorFeat(message.actor, "continual-recovery")) {//10 min
// setEffectToActor(target, effect_treat_wounds_immunity_minutes)
// don't need to apply because immunity 10 min - treat_wounds 10 min and immunity applied at start of process
        } else {
            setEffectToActor(target, "Compendium.pf2e.feat-effects.Lb4q2bBAgxamtix5")
        }
    } else {
        ui.notifications.info(`${target.name} has Treat Wounds Immunity`);
    }
}

function sendNotificationChatMessage(content) {
    const whispers = ChatMessage.getWhisperRecipients("GM").map((u) => u.id).concat(game.user.id);

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
    const effect = actor.itemTypes.effect.find(c => eff === c.slug)
    if (!effect) {return}
    if (hasPermissions(actor)) {
        actor.deleteEmbeddedDocuments("Item", [effect._id])
    } else if (game.settings.get(moduleName, "useSocket")) {
        socketlibSocket._sendRequest("deleteEffects", [{'actorUuid': actor.uuid, 'eff': eff}], 0)
    } else {
        sendNotificationChatMessage(`Need delete ${effect.name} effect from ${actor.name}`);
    }
}

function deleteEffectById(actor, effId) {
    if (hasPermissions(actor)) {
        actor.deleteEmbeddedDocuments("Item", [effId])
    } else if (game.settings.get(moduleName, "useSocket")) {
        socketlibSocket._sendRequest("deleteEffectsById", [{'actorUuid': actor.uuid, 'effId': effId}], 0)
    } else {
        sendNotificationChatMessage(`Need delete effect with id ${effId} from ${actor.name}`);
    }
}

async function setFeintEffect(message, isCrit=false, isCritFail=false) {
    const actor = isCritFail?message.target.actor:message.actor;
    const target = isCritFail?message.actor:message.target.actor;

    const effect = (await fromUuid(isCrit?effect_feint_critical_success:effect_feint_success)).toObject();
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

    const aEffect = (await fromUuid(isCrit?effect_feint_crit_success_attacker_target:effect_feint_success_attacker_target)).toObject();
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
    } else if (game.settings.get(moduleName, "useSocket")) {
        socketlibSocket._sendRequest("createEffects", [{'actorUuid': actor.uuid, 'eff': eff, "level": level}], 0)
    } else {
        sendNotificationChatMessage(`Need add @UUID[${eff}] effect to ${actor.name}`);
    }
}

async function increaseConditionForActor(message, condition, value=undefined) {
    const valueObj = value ? {'value': value } : {}

    if (hasPermissions(message.actor)) {
        message.actor.increaseCondition(condition, valueObj);
    } else if (game.settings.get(moduleName, "useSocket")) {
        socketlibSocket._sendRequest("increaseConditions", [{'actorUuid': message.actor.uuid, 'value': value, 'condition': condition}], 0)
    } else {
        sendNotificationChatMessage(`Set condition ${condition} ${value??''} to ${message.actor.name}`);
    }
}

async function increaseConditionForTarget(message, condition, value=undefined) {
    const valueObj = value ? {'value': value } : {}
    if (value) {
        const activeCondition = hasCondition(message.target.actor, condition);
        if (activeCondition?.value >= value) {
            return
        }
    }

    if (hasPermissions(message.target.actor)) {
        message.target.actor.increaseCondition(condition, valueObj);
    } else if (game.settings.get(moduleName, "useSocket")) {
        socketlibSocket._sendRequest("increaseConditions", [{'actorUuid': message.target.actor.uuid, 'value': value, 'condition': condition}], 0)
    } else {
        sendNotificationChatMessage(`Set condition ${condition} ${value??''} to ${message.target.actor.name}`);
    }
}

async function setEffectToActorOrTarget(message, effectUUID, spellName, spellRange, onlyTarget=false) {
    if (game.user.targets.size === 0 && !onlyTarget) {
        setEffectToActor(message.actor, effectUUID, message?.item?.level)
    } else if (game.user.targets.size === 1) {
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
    if (game.user.targets.size === 1) {
        setEffectToActor(game.user.targets.first().actor, effectUUID)
    } else {
        ui.notifications.info(`${message.actor.name} chose incorrect count of targets for effect`);
    }
}

function deleteMorphEffects(message) {
    ui.notifications.info(`${message.actor.name} fails saving-throw. Need to delete morph/polymorph effects from actor`);

    message.actor.itemTypes.effect.filter(c => pol.includes(c.slug) || polAnim.find(qq=>c.slug.startsWith(qq)))
        .forEach(effect => {
            deleteEffectById(message.actor, effect.id)
        })
}

function deleteEffectUntilAttackerEnd(actor, eff, attackerId, isFinal=false) {
    actor.itemTypes.effect.filter(c => eff === c.slug)
    .forEach(effect => {
        if (effect?.flags?.attacker === attackerId) {
            if (effect.flags["attacker-turn"] === 1 || isFinal) {
                deleteEffectById(actor, effect.id)
            } else {
                const data = {"flags.attacker-turn": effect.flags["attacker-turn"] - 1};
                if (hasPermissions(actor)) {
                    effect.update(data);
                } else {
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
        const DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll")
        const roll = new DamageRoll(formula);
        await roll.evaluate({async: true});
        actor.applyDamage({damage:roll, token:token})
        roll.toMessage({speaker: {alias: actor.prototypeToken.name}});
    } else {
        socketlibSocket._sendRequest("applyDamages", [{actorUuid: actor.uuid, tokenUuid: token.uuid, formula: formula}], 0)
    }
}

Hooks.on('preCreateChatMessage', async (message, user, _options, userId)=>{
    if (game?.combats?.active || game.settings.get(moduleName, "ignoreEncounterCheck")) {
        handleEncounterMessage(message);
    }
    handleGeneralMessage(message);

    if (game.settings.get(moduleName, "decreaseFrequency")) {
        if (message?.actor) {
            const _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
            if (_obj?.system?.frequency?.value > 0) {
                _obj.update({
                    "system.frequency.value": _obj?.system?.frequency?.value - 1
                });
            } else if (_obj?.system?.frequency?.value === 0) {
               sendNotificationChatMessage(`Action sent to chat with 0 uses left.`);
            }
        }
    }

    if (message?.flags?.pf2e?.modifiers?.find(a=>a.slug === "guidance" && a.enabled)) {
        deleteEffectFromActor(message.actor, "spell-effect-guidance")
    }
});

async function deleteFeintEffects(message) {
    const aef = hasEffect(message.actor, `effect-feint-success-${message.actor.id}-${message?.target?.actor.id}`)
    const tef = hasEffect(message?.target?.actor, `effect-feint-success-${message.actor.id}`)
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

async function handleAffection(message, eff_uuid) {
    const affectionObj = hasAfflictionBySourceId(message.actor, eff_uuid);
    if (affectionObj) {
        if (criticalSuccessMessageOutcome(message)) {
            await affectionObj.decrease(true);
        } else if (successMessageOutcome(message)) {
            await affectionObj.decrease();
        } else if (criticalFailureMessageOutcome(message)) {
            await affectionObj.increase(true);
        } else {
            await affectionObj.increase();
        }
    } else if (failureMessageOutcome(message)) {
        afflictionEffect(message, eff_uuid)
    } else if (criticalFailureMessageOutcome(message)) {
        afflictionEffect(message, eff_uuid, true)
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

async function guidanceEffect(message, target) {
    const aEffect = (await fromUuid("Compendium.pf2e.spell-effects.Item.3qHKBDF7lrHw8jFK")).toObject();

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

async function effectWithActorNextTurnST(message, uuid) {
    let actor = {}
    let item = {}
    const feat = await fromUuid(message?.flags?.pf2e?.origin?.uuid);
    if (feat) {
        item = feat
        actor = feat.actor
    }

    effectWithActorNextTurn({actor, item}, message.actor, uuid)
}

async function effectWithActorNextTurn(message, target, uuid, optionalName=undefined, ownerIcon=false) {
    const aEffect = (await fromUuid(uuid)).toObject();

    aEffect.system.context = mergeObject(aEffect.system.context ?? {}, {
        "origin": {
            "actor": message.actor.uuid,
            "item": message?.item?.uuid,
            "token": message?.token?.uuid
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
    if (game.user.targets.size === 1) {
        const aEffect = (await fromUuid(effect_hunt_prey)).toObject();
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


        const target = game.user.targets.first().actor;
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
    if (game.settings.get(moduleName, "deleteScouting")) {
        combat.turns.forEach(cc => {
            deleteEffectFromActor(cc.actor, "effect-scouting")
            deleteEffectFromActor(cc.actor, "effect-scouting-incredible-scout")
        })
    }
})

Hooks.on('combatRound', async (combat, updateData, updateOptions) => {
    game.combat.turns.map(cc=>cc.actor)
        .forEach(a => {
            if (hasEffect(a.actor, "effect-off-guard-tumble-behind")) {
                deleteEffectFromActor(cc.actor, "effect-off-guard-tumble-behind")
            }
            const qq = hasEffectStart(a.actor, "effect-feint-success");
            if (qq) {
                deleteEffectFromActor(a.actor, qq.slug)
                deleteEffectFromActor(cc.actor, "effect-pistol-twirl")
            }
            Object.values(a?.itemTypes).flat(1).forEach(i => {
                if (i?.system?.frequency?.per === "round" || i?.system?.frequency?.per === "turn") {
                    i.update({
                        "system.frequency.value": i.system.frequency.max
                    });
                }
            })
        })

    precisionTurn(game.combat.turns[0]?.actor)
    gravityWeaponTurn(game.combat.turns[0]?.actor)
});

Hooks.on('combatTurn', async (combat, updateData, updateOptions) => {
     game.combat.turns.forEach(cc => {
        if (hasEffect(cc.actor, "effect-off-guard-tumble-behind")) {
            deleteEffectFromActor(cc.actor, "effect-off-guard-tumble-behind")
        }
        const qq = hasEffectStart(cc.actor, "effect-feint-success");
        if (qq) {
            deleteEffectFromActor(cc.actor, qq.slug)
            deleteEffectFromActor(cc.actor, "effect-pistol-twirl")
        }
    })

    precisionTurn(combat?.nextCombatant?.actor)
    gravityWeaponTurn(combat?.nextCombatant?.actor)
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
})

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
})

function gravityWeaponTurn(actor) {
    if (!actor) {return}
    if (hasEffect(actor, "spell-effect-gravity-weapon")) {
        if (!actor.rollOptions?.["damage-roll"]?.["gravity-weapon"]) {
            actor.toggleRollOption("damage-roll", "gravity-weapon")
        }
    }
}

function eqMessageDCLabel(message, l) {
    return message?.flags?.pf2e?.context?.dc?.label?.includes(l);
}

function precisionTurn(actor) {
    if (!actor) {return}
    if (actorFeat(actor, "precision")) {
        if (!actor.rollOptions?.["all"]?.["first-attack"]) {
            actor.toggleRollOption("all", "first-attack")
        }
    }
}
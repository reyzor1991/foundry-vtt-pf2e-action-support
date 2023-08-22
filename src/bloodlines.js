const bloodlineAberrantSpells = [
    "daze",
    "spider-sting",
    "touch-of-idiocy",
    "vampiric-touch",
    "vampiric-touch",
    "confusion",
    "black-tentacles",
    "feeblemind",
    "warp-mind",
    "uncontrollable-dance",
    "spirit-song",
    "tentacular-limbs",
    "aberrant-whispers",
    "unusual-anatomy",
];

const bloodlineAngelicSpells = [
    "light",
    "heal",
    "spiritual-weapon",
    "searing-light",
    "divine-wrath",
    "flame-strike",
    "blade-barrier",
    "divine-decree",
    "divine-aura",
    "foresight",
    "angelic-halo",
    "angelic-wings",
    "celestial-brand",
];

const bloodlineDemonicSpells = [
    "acid-splash",
    "fear",
    "enlarge",
    "slow",
    "divine-wrath",
    "abyssal-plague",
    "disintegrate",
    "divine-decree",
    "divine-aura",
    "implosion",
    "gluttons-jaw",
    "swamp-of-sloth",
    "abyssal-wrath",
];

const bloodlineDiabolicSpells = [
    "produce-flame",
    "charm",
    "flaming-sphere",
    "enthrall",
    "suggestion",
    "crushing-despair",
    "true-seeing",
    "divine-decree",
    "divine-aura",
    "falling-stars",
    "diabolic-edict",
    "embrace-the-pit",
    "hellfire-plume",
];

const bloodlineDraconicSpells = [
    "shield",
    "true-strike",
    "resist-energy",
    "haste",
    "spell-immunity",
    "chromatic-wall",
    "dragon-form",
    "mask-of-terror",
    "prismatic-wall",
    "overwhelming-presence",
    "dragon-claws",
    "dragon-breath",
    "dragon-wings",
];

const bloodlineElementalSpells = [
    "produce-flame",
    "breathe-fire",
    "resist-energy",
    "fireball",
    "freedom-of-movement",
    "elemental-form",
    "repulsion",
    "energy-aegis",
    "prismatic-wall",
    "storm-of-vengeance",
    "elemental-toss",
    "elemental-motion",
    "elemental-blast",
];

const elementalistSpells = [
    "combustion",
    "crushing-ground",
    "powerful-inhalation",
    "pulverizing-cascade",
    "rising-surf",
    "stone-lance",
    "updraft",
    "wildfire",
];

const bloodlineFeySpells = [
    "ghost-sound",
    "charm",
    "hideous-laughter",
    "enthrall",
    "suggestion",
    "cloak-of-colors",
    "mislead",
    "visions-of-danger",
    "uncontrollable-dance",
    "resplendent-mansion",
    "faerie-dust",
    "fey-disappearance",
    "fey-glamour",
];

const bloodlineGenieSpells = [
    "detect-magic",
    "illusory-disguise",
    "variable",
    "enthrall",
    "creation",
    "variable",
    "true-seeing",
    "energy-aegis",
    "variable",
    "resplendent-mansion",
    "genies-veil",
    "hearts-desire",
    "wish-twisted-form",
];

const bloodlineHagSpells = [
    "daze",
    "illusory-disguise",
    "touch-of-idiocy",
    "blindness",
    "outcasts-curse",
    "mariners-curse",
    "baleful-polymorph",
    "warp-mind",
    "spiritual-epidemic",
    "natures-enmity",
    "jealous-hex",
    "horrific-visage",
    "youre-mine",
];

const bloodlineHarrowSpells = [
    "detect-magic",
    "ill-omen",
    "augury",
    "wanderers-guide",
    "suggestion",
    "shadow-siphon",
    "true-seeing",
    "retrocognition",
    "unrelenting-observation",
    "weird",
    "unraveling-blast",
    "invoke-the-harrow",
    "rewrite-possibility",
];

const bloodlineImperialSpells = [
    "detect-magic",
    "magic-missile",
    "dispel-magic",
    "haste",
    "translocate",
    "prying-eye",
    "disintegrate",
    "prismatic-spray",
    "maze",
    "prismatic-sphere",
    "ancestral-memories",
    "extend-spell",
    "arcane-countermeasure",
];

const bloodlineNymphSpells = [
    "tangle-vine",
    "charm",
    "calm",
    "animal-vision",
    "vital-beacon",
    "crushing-despair",
    "repulsion",
    "unfettered-pack",
    "moment-of-renewal",
    "overwhelming-presence",
    "nymphs-token",
    "blinding-beauty",
    "establish-ward",
];

const bloodlinePhoenixSpells = [
    "detect-magic",
    "breathe-fire",
    "see-the-unseen",
    "fireball",
    "remove-curse",
    "breath-of-life",
    "disintegrate",
    "contingency",
    "moment-of-renewal",
    "falling-stars",
    "rejuvenating-flames",
    "shroud-of-flame",
    "cleansing-flames",
];

const bloodlinePsychopompSpells = [
    "disrupt-undead",
    "heal",
    "calm",
    "searing-light",
    "dimensional-anchor",
    "death-ward",
    "spirit-blast",
    "finger-of-death",
    "spirit-song",
    "massacre",
    "sepulchral-mask",
    "spirit-veil",
    "shepherd-of-souls",
];

const bloodlineShadowSpells = [
    "chill-touch",
    "grim-tendrils",
    "darkness",
    "chilling-darkness",
    "phantasmal-killer",
    "shadow-siphon",
    "collective-transposition",
    "duplicate-foe",
    "disappearance",
    "weird",
    "dim-the-light",
    "steal-shadow",
    "consuming-darkness",
];

const bloodlineUndeadSpells = [
    "chill-touch",
    "harm",
    "false-life",
    "bind-undead",
    "talking-corpse",
    "cloudkill",
    "vampiric-exsanguination",
    "finger-of-death",
    "horrid-wilting",
    "wail-of-the-banshee",
    "undeaths-blessing",
    "drain-life",
    "grasping-grave",
];

const bloodlineWyrmblessedSpells = [
    "read-aura",
    "mystic-armor",
    "resist-energy",
    "haste",
    "reflective-scales",
    "cloak-of-colors",
    "repulsion",
    "mask-of-terror",
    "divine-inspiration",
    "overwhelming-presence",
    "dragon-claws",
    "dragon-breath",
    "dragon-wings",
];

async function createDialog(actorId, selfEffect, targets, targetEffect) {
    const options = targets.map(a => {
        return `<option value="${a.uuid}" data-effect="${targetEffect}">${a.name}</option>`
    })

    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">
                <option value="${actorId}" data-effect="${selfEffect}">Self</option>
                ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "<span class='pf2-icon'>1</span> Apply effect",
                callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = await fromUuid(eId);

                    if (game.user.isGM) {
                        await (await fromUuid(tId)).createEmbeddedDocuments("Item", [aEffect]);
                    } else {
                        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, tId], 0)
                    }
                }
            },
            cancel: {
                label: "<span class='pf2-icon'>R</span> Cancel"
            }
        },
        default: "cancel",
    }).render(true);
}

async function createDialogDamageOrTempHP(message, spell, damageEff, selfSpells, allySpells, comboSpells) {
    //self apply
    const eff = "Compendium.pf2e-action-support.action-support.Item.yYvPtdlew2YctMgt";

    const aEffect = (await fromUuid(eff)).toObject();
    aEffect.flags = mergeObject(aEffect.flags ?? {}, { core: { sourceId: eff } });

    aEffect.system.rules[0].value = message?.item?.level ?? 0;

    createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect)
}

async function createDialogDamageOrSelfEffect(message, spell, damageEff, selfSpells, allySpells, comboSpells, aEffect) {
    const eff = aEffect.flags.core.sourceId;
    if (selfSpells.includes(spell.slug)) {
        if (game.user.isGM) {
            await message.actor.createEmbeddedDocuments("Item", [aEffect]);
        } else {
            socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, message.actor.uuid], 0)
        }
        return
    }

    let options = []
    if (allySpells.includes(spell.slug)) {
        options = targetCharacters(message.actor.uuid).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
    } else if (comboSpells.includes(spell.slug)) {
        options = targetCharacters(message.actor.uuid).map(a => {
            return `<option value="${a.uuid}" data-effect="${eff}">${a.name}</option>`
        })
        options.push(`<option value="${message.actor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    } else {
        options.push(`<option value="${message.actor.uuid}" data-effect="${damageEff}">Add damage to target</option>`)
    }


    const content = `<form>
        <div class="form-group">
            <label>Target:</label>
            <select name="bloodline-selector">
                <option value="${message.actor.uuid}" data-effect="${eff}">Self</option>
                ${options}
            </select>
        </div>
    </form>`

    new Dialog({
        title: "Bloodline Target Selector",
        content,
        buttons: {
            ok: {
                label: "<span class='pf2-icon'>1</span> Apply effect",
                callback: async (html) => {
                    const tId = html.find("[name=bloodline-selector]").val();
                    const eId = html.find("[name=bloodline-selector]").find(':selected').data('effect');
                    const aEffect = (await fromUuid(eId)).toObject();
                    aEffect.system.rules[0].value = message?.item?.level ?? 0;
                    if (aEffect.system.rules.length > 1) {
                        aEffect.system.rules[1].value = message?.item?.level ?? 0;
                    }

                    if (game.user.isGM) {
                        await (await fromUuid(tId)).createEmbeddedDocuments("Item", [aEffect]);
                    } else {
                        socketlibSocket._sendRequest("createFeintEffectOnTarget", [aEffect, tId], 0)
                    }
                }
            },
            cancel: {
                label: "<span class='pf2-icon'>R</span> Cancel"
            }
        },
        default: "cancel",
    }).render(true);
}


async function bloodlineAberrant(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A");
}

async function bloodlineAngelic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd");
}

async function bloodlineDemonic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli");
}

async function bloodlineDiabolic(message, spell) {
    const damageEff = "Compendium.pf2e-action-support.action-support.Item.2yWSBNLWWYXXSfKZ";
    createDialogDamageOrSelfEffect(
        message,
        spell,
        damageEff,
        ["true-seeing", "divine-aura", "embrace-the-pit"],//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.n1vhmOd7aNiuR3nk")).toObject()
    )
}

async function bloodlineDraconic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq");
}

async function bloodlineElemental(message, spell, isElem=false) {
    const damageEff = "Compendium.pf2e-action-support.action-support.Item.2yWSBNLWWYXXSfKZ";
    const bludDamageEff = "Compendium.pf2e-action-support.action-support.Item.KFoh6XzV382S9DDr";

    let ee = damageEff;
    const ff = actorFeat(message.actor, "bloodline-elemental")
    if (ff && ff?.flags?.pf2e?.rulesSelections?.bloodlineElemental != 'fire') {
        ee = bludDamageEff;
    }

    const selfE = ["resist-energy", "freedom-of-movement", "elemental-form", "repulsion", "energy-aegis", "elemental-motion"];
    if (isElem) {
        selfE.push("rising-surf")
    }

    createDialogDamageOrSelfEffect(
        message,
        spell,
        ee,
        selfE,//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.3gGBZHcUFsHLJeQH")).toObject()
    )
}

async function bloodlineFey(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse");
}

async function bloodlineGenie(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6");
}

async function bloodlineHag(message) {
    const effect = (await fromUuid("Compendium.pf2e.feat-effects.Item.6fb15XuSV4TNuVAT")).toObject();
    effect.system.level = {value: message?.item?.level ?? 1};

    message.actor.createEmbeddedDocuments("Item", [effect]);
}

async function bloodlineHarrow(message) {
    setEffectToActor(message.actor, "Compendium.pf2e-action-support.action-support.Item.SbYoI8G8Ze6oE4we")
}

async function bloodlineImperial(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.vguxP8ukwVTWWWaA");
}

async function bloodlineNymph(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.SVGW8CLKwixFlnTv", targetNpcs(), "Compendium.pf2e.feat-effects.Item.ruRAfGJnik7lRavk");
}

async function bloodlinePhoenix(message, spell) {
    const damageEff = "Compendium.pf2e-action-support.action-support.Item.2yWSBNLWWYXXSfKZ";
    createDialogDamageOrTempHP(
        message,
        spell,
        damageEff,
        ["detect-magic", "see-the-unseen", "contingency", "shroud-of-flame"],
        ["remove-curse","breath-of-life","moment-of-renewal"],
        ["rejuvenating-flames"]
    )
}

async function bloodlinePsychopomp(message, spell) {
    const damageEff = "Compendium.pf2e-action-support.action-support.Item.CUMpeosjhqDpj4KK";
    createDialogDamageOrSelfEffect(
        message,
        spell,
        damageEff,
        ["heal", "death-ward"],//self
        [],//ally
        [],//combo
        (await fromUuid("Compendium.pf2e.feat-effects.Item.7BFd8A9HFrmg6vwL")).toObject()
    )
}

async function bloodlineShadow(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.OqH6IaeOwRWkGPrk", targetNpcs(), "Compendium.pf2e.feat-effects.Item.Nv70aqcQgCBpDYp8");
}

async function bloodlineUndead(message, spell) {
    const damageEff = "Compendium.pf2e-action-support.action-support.Item.UQEqBomwGFkTOomK";
    createDialogDamageOrTempHP(
        message,
        spell,
        damageEff,
        ["false-life", "bind-undead", "talking-corpse"],
        ["remove-curse"],
        ["harm", "undeaths-blessing"]
    )
}

async function bloodlineWyrmblessed(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.fILVhS5NuCtGXfri", targetNpcs(), "Compendium.pf2e.feat-effects.Item.aqnx6IDcB7ARLxS5");
}

const bloodlineFeatMap = {
    "bloodline-aberrant": {spells: bloodlineAberrantSpells, handler: bloodlineAberrant},
    "bloodline-angelic": {spells: bloodlineAngelicSpells, handler: bloodlineAngelic},
    "bloodline-demonic": {spells: bloodlineDemonicSpells, handler: bloodlineDemonic},
    "bloodline-diabolic": {spells: bloodlineDiabolicSpells, handler: bloodlineDiabolic},
    "bloodline-draconic": {spells: bloodlineDraconicSpells, handler: bloodlineDraconic},
    "bloodline-elemental": {spells: bloodlineElementalSpells, handler: bloodlineElemental},
    "bloodline-fey": {spells: bloodlineFeySpells, handler: bloodlineFey},
    "bloodline-genie": {spells: bloodlineGenieSpells, handler: bloodlineGenie},
    "bloodline-hag": {spells: bloodlineHagSpells, handler: bloodlineHag},
    "bloodline-imperial": {spells: bloodlineImperialSpells, handler: bloodlineImperial},
    "bloodline-nymph": {spells: bloodlineNymphSpells, handler: bloodlineNymph},
    "bloodline-phoenix": {spells: bloodlinePhoenixSpells, handler: bloodlinePhoenix},
    "bloodline-psychopomp": {spells: bloodlinePsychopompSpells, handler: bloodlinePsychopomp},
    "bloodline-shadow": {spells: bloodlineShadowSpells, handler: bloodlineShadow},
    "bloodline-undead": {spells: bloodlineUndeadSpells, handler: bloodlineUndead},
    "bloodline-wyrmblessed": {spells: bloodlineWyrmblessedSpells, handler: bloodlineWyrmblessed},
}

function targetNpcs() {
    return game.combat ? game.combat.turns.filter(a=>!isActorCharacter(a.actor)).map(a=>a.actor) : [];
}

function targetCharacters(self) {
    return game.combat ? game.combat.turns.filter(a=>isActorCharacter(a.actor) && a.actor.uuid != self).map(a=>a.actor) : [];
}

function enemyCombatant() {
    return game.combat ? game.combat.turns.filter(a=>!isActorCharacter(a.actor)) : [];
}

function allyCombatant() {
    return game.combat ? game.combat.turns.filter(a=>isActorCharacter(a.actor)) : [];
}

Hooks.on('createChatMessage', async (message)=>{
    if (!game.user.isGM) {return;}
    if (!game.settings.get(moduleName, "useBloodline")) {return}
    if (!messageType(message, undefined) && !messageType(message, "spell-cast")){return}
    if (!game?.combats?.active && !game.settings.get(moduleName, "ignoreEncounterCheck")) {return}

    const _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.type !== "spell") {return}

    if (actorFeat(message.actor, "bloodline-elemental") && actorFeat(message.actor, "elementalist-dedication")) {
        if (bloodlineFeatMap["bloodline-elemental"].spells.includes(_obj.slug)
            || elementalistSpells.includes(_obj.slug)
        ) {
            bloodlineFeatMap["bloodline-elemental"].handler.call(this, message, _obj, true)
            return;
        }
    }

    for (const featName in bloodlineFeatMap) {
        if (actorFeat(message.actor, featName) && bloodlineFeatMap[featName].spells.includes(_obj.slug)) {
            bloodlineFeatMap[featName].handler.call(this, message, _obj);
            return;
        }
    }

});

Hooks.on('createChatMessage', async (message)=>{
    if (!game.user.isGM) {return;}
    if (!game.settings.get(moduleName, "useBloodline")) {return}
    if ("appliedDamage" in message?.flags?.pf2e && !message?.flags?.pf2e?.appliedDamage?.isHealing) {
        const eff = hasEffect(message.actor, "effect-hag-blood-magic");
        if (!eff) {
            return;
        }

        ui.notifications.info(`${message.actor.name} has Effect: Hag Blood Magic. Attack should take ${eff.system.level.value} damage`);
        if (hasPermissions(eff)) {
            eff.delete()
        } else {
            socketlibSocket._sendRequest("deleteEffect", [eff.uuid], 0)
        }
    }
})

function isActorCharacter(actor) {
    return ["character", "npc"].includes(actor?.type) && actor?.alliance === "party";
}
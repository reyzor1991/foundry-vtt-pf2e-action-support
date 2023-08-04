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
    "burning-hands",
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
        title: "Bloodline Demonic Selector",
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

async function bloodlineAberrant(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.UQ7vZgmfK0VSFS8A");
}

async function bloodlineAngelic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.s1tulrmW6teTFjVd");
}

async function bloodlineDemonic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.aKRo5TIhUtu0kyEr", targetNpcs(), "Compendium.pf2e.feat-effects.Item.yfbP64r4a9e5oyli");
}

async function bloodlineDiabolic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.n1vhmOd7aNiuR3nk", [], "");
}

async function bloodlineDraconic(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.FNTTeJHiK6iOjrSq");
}

async function bloodlineElemental(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.3gGBZHcUFsHLJeQH", [], "");
}

async function bloodlineFey(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse", targetCharacters(message.actor.uuid), "Compendium.pf2e.feat-effects.Item.rJpkKaPRGaH0pLse");
}

async function bloodlineGenie(message) {
    createDialog(message.actor.uuid, "Compendium.pf2e.feat-effects.Item.9AUcoY48H5LrVZiF", targetNpcs(), "Compendium.pf2e.feat-effects.Item.KVbS7AbhQdeuA0J6");
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
}

function targetNpcs() {
    return game.combat.turns.filter(a=>!isActorCharacter(a.actor)).map(a=>a.actor)
}

function targetCharacters(self) {
    return game.combat.turns.filter(a=>isActorCharacter(a.actor) && a.actor.uuid != self).map(a=>a.actor)
}

Hooks.on('preCreateChatMessage', async (message)=>{
    if (!game.settings.get(moduleName, "useBloodline")) {return}
    if (messageType(message, "saving-throw")) {return}
    if (!game?.combats?.active) {return}

    const _obj = (await fromUuid(message?.flags?.pf2e?.origin?.uuid));
    if (_obj?.type !== "spell") {return}

    for (const featName in bloodlineFeatMap) {
        if (actorFeat(message.actor, featName) && bloodlineFeatMap[featName].spells.includes(_obj.slug)) {
            bloodlineFeatMap[featName].handler.call(this, message)
        }
    }
});

function isActorCharacter(actor) {
    return "character" === actor?.type || (actor?.type === "npc" && actor?.alliance === "party");
}
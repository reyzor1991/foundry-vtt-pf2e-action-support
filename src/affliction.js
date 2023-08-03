Hooks.once("init", () => {
    const origin_advance = game.time.advance;
    game.time.advance = async function(seconds, options) {
        const r =  await origin_advance.call(this, seconds, options);

        game.canvas.scene.tokens.forEach(token=>checkAffectionsStage(token, token.actor.itemTypes.affliction))

        return r;
    }
})

async function checkAffectionsStage(token, afflictions) {
    if (!game.settings.get(moduleName, "affliction")) {return}
    afflictions.forEach(aff=>checkAffectionStage(token, aff))
}

async function checkAffectionStage(token, aff) {
    aff.prepareBaseData()
    if (aff.isExpired) {
        await aff.delete()
    } else {
        if (aff.isStageExpired) {
            aff.toMessage();
        }
        if (aff.system.onset && game.time.worldTime >= aff.system.stageStart.value) {
            await aff.createStageMessage();
            await aff.update({ "system.onset": null });
        }
    }
};
const DURATION_UNITS  = {
    rounds: 6,
    minutes: 60,
    hours: 3600,
    days: 86400,
}

function totalDuration(_obj)  {
    const { duration } = _obj.system;
    if (["unlimited", "encounter"].includes(duration.unit)) {
        return Infinity;
    } else {
        return duration.value * (DURATION_UNITS[duration.unit] ?? 0);
    }
}

function remainingDuration(_obj) {
    const duration = totalDuration(_obj);
    if (_obj.system.duration.unit === "encounter") {
        const isExpired = _obj.system.expired;
        return { expired: isExpired, remaining: isExpired ? 0 : Infinity };
    } else if (duration === Infinity) {
        return { expired: false, remaining: Infinity };
    } else {
        const start = _obj.system.start.value;
        const remaining = start + duration - game.time.worldTime;
        const result = { remaining, expired: remaining <= 0 };
        const { combatant } = game.combat ?? {};
        if (remaining === 0 && combatant) {
            const startInitiative = _obj.system.start.initiative ?? 0;
            const currentInitiative = combatant.initiative ?? 0;
            const isEffectTurnStart =
                startInitiative === currentInitiative && combatant.actor === (_obj.origin ?? _obj.actor);
            result.expired = isEffectTurnStart
                ? _obj.system.duration.expiry === "turn-start"
                : currentInitiative < startInitiative;
        }

        return result;
    }
}


Hooks.on("createItem", async function (item, changed) {
    if (!game.settings.get(moduleName, "affliction")) {return}
    if (item?.type != "affliction") {return}

    const durations = item?.getFlag(moduleName, "durations");
    if (durations) {
        let curDur = durations[item?.stage - 1];
        if (item.system.onset) {
            if (item.system.onset.unit === curDur.unit) {
                curDur.value += item.system.onset.value
            } else {
                curDur.unit = "minutes"
                curDur.value = (curDur.value * (DURATION_UNITS[curDur.unit] ?? 0) + item.system.onset.value * (DURATION_UNITS[item.system.onset.unit] ?? 0))/60
            }
        }
        item.system.duration = curDur
    }

    if (item.isOwned) {
        const initiative = item.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;
        item.system.start = { value: game.time.worldTime, initiative };
        item.flags[moduleName]["startForMaximum"] = { value: game.time.worldTime, initiative };
    }
});

Hooks.on("preUpdateItem", async function (item, changed) {
    if (!game.settings.get(moduleName, "affliction")) {return}
    if (item?.type != "affliction") {return}

    if (changed?.system?.stage) {
        const durations = item?.getFlag(moduleName, "durations");
        if (durations) {
            const initiative = item?.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;

            await item.update({
                "system.duration": durations[changed?.system?.stage - 1],
                "system.start": { value: game.time.worldTime, initiative },
                "flags.pf2e-action-support.startForMaximum": item.flags[moduleName]?.startForMaximum,
                "flags.pf2e-action-support.onsetUsed": item.flags[moduleName]?.onsetUsed
            })
        }
    }
});

Hooks.once("init", () => {
    const origin_advance = game.time.advance;
    game.time.advance = async function(seconds, options) {
        const r =  await origin_advance.call(this, seconds, options);

        game.actors.filter(a=>a.itemTypes.affliction.length > 0).flatMap(a=>a.itemTypes.affliction)
        .forEach(aff=>{
            if (["days", "hours", "minutes"].includes(aff.system.duration.unit)) {
                const rem = remainingDuration(aff);
                if (rem.expired || rem.remaining === 0) {
                    aff.toMessage();
                }
                if (aff.system.onset && !aff.getFlag(moduleName, "onsetUsed")) {
                    if (
                        (aff.getFlag(moduleName, "startForMaximum").value
                            + (aff.system.onset.value * (DURATION_UNITS[aff.system.onset.unit] ?? 0))
                        ) <= game.time.worldTime
                    ) {
                        aff.createStageMessage();

                        updateAffFlagsData(aff);
                    }
                }
            }
        })

        return r;
    }
})

function updateAffFlagsData(item,duration,initiative) {
    item.update({
        "system.duration": item.system.duration,
        "system.start": item.system.start,
        "flags.pf2e-action-support.startForMaximum": item.flags[moduleName]?.startForMaximum,
        "flags.pf2e-action-support.onsetUsed": true
    })
}
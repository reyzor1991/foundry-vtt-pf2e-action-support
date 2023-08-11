function flurryOfBlowsWeapons(actor) {
    let weapons = actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") );

    if ( actor.system.actions.some( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ) ) {
        weapons = actor.system.actions.filter( e => e.visible && e.origin?.type === "effect" && e.origin?.slug.includes("stance") ).concat(actor.system.actions.filter( h => h.visible && h.item?.isMelee && h.item?.system?.traits?.value?.includes("unarmed") && h.origin?.type !== "effect" ));
    }

    if ( actor.itemTypes.feat.some( s => s.slug === "monastic-weaponry" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.system?.traits?.value.includes("monk") ) ) {
        weapons = actor.system.actions.filter( h => h.item?.isHeld && h.ready && h.item?.system?.traits?.value.includes("monk") ).concat(weapons)
    }

    if ( actor.itemTypes.effect.some( s => s.slug === "stance-monastic-archer-stance" ) && actor.system.actions.some( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) ) {
        weapons.unshift( actor.system.actions.find( h => h.item?.isHeld && h.item?.group === "bow" && h.item?.reload === "0" ) )
    }

    return weapons;
};

async function flurryOfBlows(actor) {
    if ( !actor ) { ui.notifications.info("Please select 1 token"); return;}
    if (game.user.targets.size != 1) { ui.notifications.info(`Need to select 1 token as target`);return; }

    if ( !actorAction(actor, "flurry-of-blows") && !actorFeat(actor, "flurry-of-blows" ) ) {
        ui.notifications.warn(`${token.name} does not have Flurry of Blows!`);
        return;
    }

    const DamageRoll = CONFIG.Dice.rolls.find( r => r.name === "DamageRoll" );
    const critRule = game.settings.get("pf2e", "critRule");

    const weapons = flurryOfBlowsWeapons(actor)
    if (weapons.length === 0) {
        ui.notifications.warn(`${token.name} doesn't have correct weapon'`);
        return;
    }

    let weaponOptions = '';
    for ( const w of weapons ) {
        weaponOptions += `<option value=${w.item.id}>${w.item.name}</option>`
    }

    const { currentWeapon, map, dos} = await Dialog.wait({
        title:"Flurry of Blows",
        content: `
            <div class="row-flurry"><div class="column-flurry first-flurry"><h3>First Attack</h2><select id="fob1" autofocus>
                ${weaponOptions}
            </select></div><div class="column-flurry second-flurry"><h3>Second Attack</h2>
            <select id="fob2">
                ${weaponOptions}
            </select></div></div><hr><h3>Multiple Attack Penalty</h2>
                <select id="map">
                <option value=0>No MAP</option>
                <option value=1>MAP -5(-4 for agile)</option>
                <option value=2>MAP -10(-8 for agile)</option>
            </select><hr>
        `,
        buttons: {
                ok: {
                    label: "Attack",
                    icon: "<i class='fa-solid fa-hand-fist'></i>",
                    callback: (html) => { return { currentWeapon: [html[0].querySelector("#fob1").value,html[0].querySelector("#fob2").value], map: parseInt(html[0].querySelector("#map").value)} }
                },
                cancel: {
                    label: "Cancel",
                    icon: "<i class='fa-solid fa-ban'></i>",
                }
        },
        render: (html) => {
            html.parent().parent()[0].style.cssText += 'box-shadow: 0 0 30px red;';
            for (const child of html.parent().parent().children()) {
                child.style.cssText += 'box-shadow: 0 0 15px yellow;';
            }

        },
        default: "ok"
    },{width:"300"});

    const map2 = map === 2 ? map : map + 1;
    if ( currentWeapon === undefined ) { return; }

    const primary = weapons.find( w => w.item.id === currentWeapon[0] );
    const secondary = weapons.find( w => w.item.id === currentWeapon[1] );

    let options = actor.itemTypes.feat.some(s => s.slug === "stunning-fist") ? ["stunning-fist"] : [];

    const cM = [];
    function PD(cm) {
        if ( cm.user.id === game.userId && cm.isDamageRoll ) {
            if ( !cM.map(f => f.flavor).includes(cm.flavor) ) {
                cM.push(cm);
            }
            return false;
        }
    }

    Hooks.on('preCreateChatMessage', PD);

    const pdos = (await primary.variants[map].roll({ event, createMessage: false, skipDialog: true    })).degreeOfSuccess;
    const sdos = (await secondary.variants[map2].roll({ event, createMessage: false, skipDialog: true    })).degreeOfSuccess;

    let pd,sd;
    if ( pdos === 2 ) { pd = await primary.damage({event,options}); }
    if ( pdos === 3 ) { pd = await primary.critical({event,options}); }
    if ( sdos === 2 ) { sd = await secondary.damage({event,options}); }
    if ( sdos === 3 ) { sd = await secondary.critical({event,options}); }

    Hooks.off('preCreateChatMessage', PD);

    if ( sdos <= 1 ) {
        if ( pdos === 2) {
            await primary.damage({event,options});
            return;
        }
        if ( pdos === 3 ) {
            await primary.critical({event,options});
            return;
        }
    }

    if ( pdos <= 1 ) {
        if ( sdos === 2) {
            await secondary.damage({event,options});
            return;
        }
        if ( sdos === 3 ) {
            await secondary.critical({event,options});
            return;
        }
    }

    await new Promise( (resolve) => {
        setTimeout(resolve,0);
    });

    if ( pdos <=0 && sdos <= 1 ) {
        return;
    } else {
        const terms = pd.terms[0].terms.concat(sd.terms[0].terms);
        const type = pd.terms[0].rolls.map(t => t.type).concat(sd.terms[0].rolls.map(t => t.type));
        const persistent = pd.terms[0].rolls.map(t => t.persistent).concat(sd.terms[0].rolls.map(t => t.persistent));

        let preCombinedDamage = [];
        let combinedDamage = '{';
        let i = 0;
        for ( const t of terms ) {
            if ( persistent[i] && !preCombinedDamage.find( p => p.persistent && p.terms.includes(t) ) ) {
                preCombinedDamage.push({ terms: [t], type: type[i], persistent: persistent[i] });
            }
            if ( !preCombinedDamage.some(pre => pre.type === type[i]) && !persistent[i] ) {
                preCombinedDamage.push({ terms: [terms[i]], type: type[i], persistent: persistent[i] });
            }
            else if ( !persistent[i] ) {
                preCombinedDamage.find( pre => pre.type === type[i] ).terms.push(t);
            }
            i++;
        }

        for ( const p of preCombinedDamage ) {
            if ( p.persistent ) {
            combinedDamage += `, ${p.terms.join(",")}`;
            }
            else{
                if ( combinedDamage === "{" ) {
                    if ( p.terms.length > 1 ){
                        combinedDamage += `(${p.terms.join(" + ")})[${p.type}]`;

                    }
                    else {
                        combinedDamage += p.terms[0];
                    }
                }
                else if ( p.terms.length === 1 ) {
                    combinedDamage += `, ${p.terms[0]}`;
                }
                else {
                    combinedDamage += `, (${p.terms.join(" + ")})[${p.type}]`;
                }
            }
        }

        combinedDamage += "}";

        const rolls = [await new DamageRoll(combinedDamage).evaluate({ async: true })]
        let flavor = `<strong>Flurry of Blows Total Damage</strong>`;
        const color = (pdos || sdos) === 2 ? `<span style="color:rgb(0, 0, 255)">Success</span>` : `<span style="color:rgb(0, 128, 0)">Critical Success</span>`
        if ( cM.length === 1 ) { flavor += `<p>Same Weapon (${color})<hr>${cM[0].flavor}</p><hr>`; }
        else { flavor += `<hr>${cM[0].flavor}<hr>${cM[1].flavor}`; }
        if ( pdos === 3 || sdos === 3 ) {
            flavor += `<hr><strong>TOP DAMAGE USED FOR CREATURES IMMUNE TO CRITICALS`;
            if ( critRule === "doubledamage" ) {
                rolls.unshift(await new DamageRoll(combinedDamage.replaceAll("2 * ", "")).evaluate({ async: true }));
            }
            else if ( critRule === "doubledice" ) {
                const splitValues = combinedDamage.replaceAll("2 * ", "").replaceAll(/([\{\}])/g,"").split(" ");
                const toJoinVAlues = [];
                for ( const sv of splitValues ) {
                    if ( sv.includes("[doubled])") ) {
                        const sV = sv.replaceAll("[doubled])","");
                        if ( !sV.includes("d") ) {
                                toJoinVAlues.push("sV");
                                continue;
                        }
                        else {
                            const n = sV.split(/(d\d)/g);
                            if ( n[0].charAt(1) !== "(") {
                                n[0] = `${parseInt(n[0].charAt(1) / 2)}`;
                                toJoinVAlues.push(n.join(""));
                                continue;
                            }
                            else if ( n[0].charAt(2) !== "(") {
                                n[0] = `(${parseInt(n[0].charAt(2)) / 2}`;
                                toJoinVAlues.push(n.join(""));
                                continue;
                            }
                            else {
                                n[0] = `((${parseInt(n[0].charAt(3)) / 2}`;
                                toJoinVAlues.push(n.join(""));
                                continue;
                            }
                        }
                    }
                    else {
                    toJoinVAlues.push(sv);
                    continue;
                    }
                }
                rolls.unshift(await new DamageRoll(`{${toJoinVAlues.join(" ")}}`).evaluate( {async: true} ));
            }
        }
        if ( cM.length === 1) {
            options = cM[0].flags.pf2e.context.options;
        } else {
            options = [...new Set(cM[0].flags.pf2e.context.options.concat(cM[1].flags.pf2e.context.options))];
        }

        await ChatMessage.create({
            flags: {
                pf2e: {
                    context: {
                        options
                    }
                }
            },
            rolls,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor,
            speaker: ChatMessage.getSpeaker(),
        });
    }
}

Hooks.once("init", () => {
    game.actionsupport = mergeObject(game.actionsupport ?? {}, {
        "flurryOfBlows": flurryOfBlows,
    })
});
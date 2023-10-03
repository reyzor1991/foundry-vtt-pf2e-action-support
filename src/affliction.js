const DEGREE_OF_SUCCESS_STRINGS = ["criticalFailure", "failure", "success", "criticalSuccess"] ;

function createHTMLElement(
    nodeName,
    { classes = [], dataset = {}, children = [], innerHTML } = {}
){
    const element = document.createElement(nodeName);
    if (classes.length > 0) element.classList.add(...classes);

    for (const [key, value] of Object.entries(dataset).filter(([, v]) => !R.isNil(v))) {
        element.dataset[key] = String(value);
    }

    if (innerHTML) {
        element.innerHTML = innerHTML;
    } else {
        for (const child of children) {
            const childElement = child instanceof HTMLElement ? child : new Text(child);
            element.appendChild(childElement);
        }
    }

    return element;
}

class RollNotePF2e {
    /** The selector used to determine on which rolls the note will be shown for. */
    selector;
    /** An optional title for the note */
    title;
    /** The text content of this note. */
    text;
    /** If true, these dice are user-provided/custom. */
    predicate;
    /** List of outcomes to show this note for; or all outcomes if none are specified */
    outcome;
    /** An optional visibility restriction for the note */
    visibility;
    /** The originating rule element of this modifier, if any: used to retrieve "parent" item roll options */
    rule;

    constructor(params ) {
        this.selector = params.selector;
        this.title = params.title ?? null;
        this.text = params.text;
        this.predicate = new PredicatePF2e(params.predicate ?? []);
        this.outcome = [...(params.outcome ?? [])];
        this.visibility = params.visibility ?? null;
        this.rule = params.rule ?? null;
    }

    static notesToHTML(notes)  {
        return createHTMLElement("ul", {
            classes: ["notes"],
            children: notes.flatMap((n) => ["\n", n.toHTML()]).slice(1),
        });
    }

    toHTML()  {
        const element = createHTMLElement("li", {
            classes: ["roll-note"],
            dataset: {
                itemId: this.rule?.item.id,
                visibility: this.visibility,
            },
            innerHTML: game.i18n.localize(this.text),
        });

        // Remove wrapping elements, such as from item descriptions
        if (element.childNodes.length === 1 && element.firstChild instanceof HTMLElement) {
            element.innerHTML = element.firstChild.innerHTML;
        }

        if (this.title) {
            const strong = createHTMLElement("strong", { innerHTML: game.i18n.localize(this.title) });
            element.prepend(strong, " ");
        }

        return element;
    }

    clone()  {
        return new RollNotePF2e({ ...this.toObject(), rule: this.rule });
    }

    toObject()  {
        return {
            selector: this.selector,
            title: this.title,
            text: this.text,
            predicate: this.predicate.toObject(),
            outcome: this.outcome,
            visibility: this.visibility,
        };
    }
}

class DamagePF2e {
    static async roll(
        data,
        context,
        callback
    ) {
        const outcome = context.outcome ?? null;

        context.rollMode ??= (context.secret ? "blindroll" : undefined) ?? game.settings.get("core", "rollMode");
        context.createMessage ??= true;

        // Change default roll mode to blind GM roll if the "secret" option is specified
        if (context.options.has("secret")) {
            context.secret = true;
        }

        const subtitle = outcome
            ? context.sourceType === "attack"
                ? game.i18n.localize(`PF2E.Check.Result.Degree.Attack.${outcome}`)
                : game.i18n.localize(`PF2E.Check.Result.Degree.Check.${outcome}`)
            : null;
        let flavor = await renderTemplate("systems/pf2e/templates/chat/action/header.hbs", {
            title: data.name,
            subtitle,
        });

        if (data.traits) {
            const toTags = (
                slugs,
                { labels = {}, descriptions = {}, cssClass, dataAttr }
            ) =>
                slugs
                    .map((s) => ({ value: s, label: game.i18n.localize(labels[s] ?? "") }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((tag) => {
                        const description = descriptions[tag.value] ?? "";

                        const span = document.createElement("span");
                        span.className = "tag";
                        if (cssClass) span.classList.add(cssClass);
                        span.dataset[dataAttr] = tag.value;
                        span.dataset.description = description;
                        span.innerText = tag.label;

                        return span.outerHTML;
                    })
                    .join("");

            const traits = toTags(data.traits, {
                labels: CONFIG.PF2E.actionTraits,
                descriptions: CONFIG.PF2E.traitsDescriptions,
                cssClass: null,
                dataAttr: "trait",
            });

            const item = context.self?.item;
            const itemTraits = item?.isOfType("weapon", "melee", "spell")
                ? toTags(
                      // Materials are listed in a separate group of tags
                      Array.from(item.traits).filter((t) => !(t in CONFIG.PF2E.materialDamageEffects)),
                      {
                          labels: item.isOfType("spell") ? CONFIG.PF2E.spellTraits : CONFIG.PF2E.npcAttackTraits,
                          descriptions: CONFIG.PF2E.traitsDescriptions,
                          cssClass: "tag_alt",
                          dataAttr: "trait",
                      }
                  )
                : "";

            const properties = (() => {
                const range = item?.isOfType("action", "melee", "weapon") ? item.range : null;
                const label = createActionRangeLabel(range);
                if (label && (range?.increment || range?.max)) {
                    // Show the range increment or max range as a tag
                    const slug = range.increment ? `range-increment-${range.increment}` : `range-${range.max}`;
                    return toTags([slug], {
                        labels: { [slug]: label },
                        descriptions: { [slug]: "PF2E.Item.Weapon.RangeIncrementN.Hint" },
                        cssClass: "tag_secondary",
                        dataAttr: "slug",
                    });
                } else {
                    return "";
                }
            })();

            const materialEffects = toTags(data.materials, {
                labels: CONFIG.PF2E.preciousMaterials,
                descriptions: CONFIG.PF2E.traitsDescriptions,
                cssClass: "tag_material",
                dataAttr: "material",
            });

            const otherTags = [itemTraits, properties, materialEffects].join("");

            flavor +=
                otherTags.length > 0
                    ? `<div class="tags">${traits}<hr class="vr" />${otherTags}</div><hr>`
                    : `<div class="tags">${traits}</div><hr>`;
        }

        // Add breakdown to flavor
        const breakdown = Array.isArray(data.damage.breakdown)
            ? data.damage.breakdown
            : data.damage.breakdown[outcome ?? "success"];
        const breakdownTags = breakdown.map((b) => `<span class="tag tag_transparent">${b}</span>`);
        flavor += `<div class="tags">${breakdownTags.join("")}</div>`;

        // Create the damage roll and evaluate. If already created, evalute the one we've been given instead
        const roll = await (() => {
            const damage = data.damage;
            if ("roll" in damage) {
                return damage.roll.evaluate({ async: true });
            }

            const formula = deepClone(damage.formula[outcome ?? "success"]);
            if (!formula) {
                ui.notifications.error(game.i18n.format("PF2E.UI.noDamageInfoForOutcome", { outcome }));
                return null;
            }

            const rollerId = game.userId;
            const degreeOfSuccess = outcome ? (DEGREE_OF_SUCCESS_STRINGS.indexOf(outcome) ) : null;
            const critRule = game.settings.get("pf2e", "critRule") === "doubledamage" ? "double-damage" : "double-dice";

            const options = {
                rollerId,
                damage: data,
                degreeOfSuccess,
                ignoredResistances: damage.ignoredResistances,
                critRule,
            };
            return new DamageRoll(formula, {}, options).evaluate({ async: true });
        })();

        if (roll === null) return null;

        const syntheticNotes = context.self?.actor
            ? extractNotes(context.self?.actor.synthetics.rollNotes, context.domains ?? [])
            : [];
        const notes = [...syntheticNotes, ...data.notes].filter(
            (n) =>
                (n.outcome.length === 0 || (outcome && n.outcome.includes(outcome))) &&
                n.predicate.test(context.options)
        );
        const notesList = RollNotePF2e.notesToHTML(notes);
        flavor += notesList.outerHTML;

        const { self, target } = context;
        const item = self?.item ?? null;
        const targetFlag = target ? { actor: target.actor.uuid, token: target.token.uuid } : null;

        // Retrieve strike flags. Strikes need refactoring to use ids before we can do better
        const strike = (() => {
            const isStrike = item?.isOfType("melee", "weapon");
            if (isStrike && item && self?.actor?.isOfType("character", "npc")) {
                const strikes = self.actor.system.actions;
                const strike = strikes.find(
                    (a)=>
                        a.item?.id === item.id && a.item.slug === item.slug
                );

                if (strike) {
                    return {
                        actor: self.actor.uuid,
                        index: strikes.indexOf(strike),
                        damaging: true,
                        name: strike.item.name,
                        altUsage: item.isOfType("weapon") ? item.altUsageType : null,
                    };
                }
            }

            return null;
        })();

        const rollMode = context.rollMode ?? "roll";
        const contextFlag  = {
            type: context.type,
            sourceType: context.sourceType,
            actor: context.self?.actor.id ?? null,
            token: context.self?.token?.id ?? null,
            target: targetFlag,
            domains: context.domains ?? [],
            options: Array.from(context.options).sort(),
            mapIncreases: context.mapIncreases,
            notes: notes.map((n) => n.toObject()),
            secret: context.secret ?? false,
            rollMode,
            traits: context.traits ?? [],
            skipDialog: context.skipDialog ?? !game.user.settings.showRollDialogs,
            outcome,
            unadjustedOutcome: context.unadjustedOutcome ?? null,
        };

        const messageData =
            await roll.toMessage(
                {
                    speaker: ChatMessage.getSpeaker({ actor: self?.actor, token: self?.token }),
                    flavor,
                    flags: {
                        pf2e: {
                            context: contextFlag,
                            target: targetFlag,
                            modifiers: data.modifiers?.map((m) => m.toObject()) ?? [],
                            origin: item?.getOriginData(),
                            strike,
                            preformatted: "both",
                        },
                    },
                },
                { create: false }
            );

        // If there is splash damage, include it as an additional roll for separate application
        const splashRolls = await (async () => {
            const splashInstances = roll.instances
                .map((i) => ({ damageType: i.type, total: i.componentTotal("splash") }))
                .filter((s) => s.total > 0);
            const rolls = [];
            for (const splash of splashInstances) {
                const formula = `(${splash.total}[splash])[${splash.damageType}]`;
                const roll = await new DamageRoll(formula).evaluate({ async: true });
                roll.options.splashOnly = true;
                rolls.push(roll.toJSON());
            }

            return rolls;
        })();

        if (context.createMessage) {
            messageData.rolls.push(...splashRolls);
            await ChatMessage.create(messageData, { rollMode });
        }

        Hooks.callAll(`pf2e.damageRoll`, roll);
        if (callback) callback(roll);

        return roll;
    }
}

const DEGREE_OF_SUCCESS = {
    CRITICAL_SUCCESS: 3,
    SUCCESS: 2,
    FAILURE: 1,
    CRITICAL_FAILURE: 0,
};

const CRITICAL_INCLUSION = {
    DOUBLE_ON_CRIT: null,
    CRITICAL_ONLY: true,
    DONT_DOUBLE_ON_CRIT: false,
};

const EXPIRING_CONDITIONS = new Set([
    "frightened",
    "sickened",
    "drained",
    "doomed",
    "stunned",
    "unconscious",
]);

function maxBy(array, iteratee) {
  let result
  if (array == null) {
    return result
  }
  let computed
  for (const value of array) {
    const current = iteratee(value)

    if (current != null && (computed === undefined
      ? (current === current && !isSymbol(current))
      : (current > computed)
    )) {
      computed = current
      result = value
    }
  }
  return result
}

function createPartialFormulas(
    partials,
    { criticalInclusion, doubleDice = false }
) {
    const categories = [null, "persistent", "precision", "splash"];
    return categories.flatMap((category) => {
        const requestedPartials = (partials.get(category) ?? []).filter((p) => criticalInclusion.includes(p.critical));
        const term = (()  => {
            const expression = createSimpleFormula(requestedPartials, { doubleDice });
            if (expression === "0") {
                return "";
            }
            return ["precision", "splash"].includes(category ?? "") && hasOperators(expression)
                ? `(${expression})`
                : expression;
        })();
        const flavored = term && category && category !== "persistent" ? `${term}[${category}]` : term;
        return flavored || [];
    });
}

/** Creates a sorting comparator that sorts by the numerical result of a mapping function */
function sortBy(mapping) {
    return (a, b)  => {
        const value1 = mapping(a);
        const value2 = mapping(b);
        return value1 < value2 ? -1 : value1 === value2 ? 0 : 1;
    };
}

function compact(items) {
  return items.filter(a=>!!a);
}

/** Combines damage dice and modifiers into a simplified list of terms */
function combinePartialTerms(terms) {
    const modifier = terms.reduce((total, p) => total + p.modifier, 0);
    const constantTerm = modifier ? { dice: null, modifier } : null;

    // Group dice by number of faces
    const dice = terms
        .filter((p) => !!p.dice && p.dice.number > 0)
        .sort(sortBy((t) => -t.dice.faces));

    const byFace = [...groupBy(dice, (t) => t.dice.faces).values()];
    const combinedDice = byFace.map((terms) => ({
        modifier: 0,
        dice: { ...terms[0].dice, number: sum(terms.map((d) => d.dice.number)) },
    }));

    const combined = compact([...combinedDice, constantTerm]);
    return combined.length ? combined : [{ dice: null, modifier: 0 }];
}

function sum(values) {
    return values.reduce((a, b) => a + b, 0);
}

/** Combines damage dice and modifiers into a single formula, ignoring the damage type and category. */
function createSimpleFormula(terms, { doubleDice } = {})  {
    terms = combinePartialTerms(terms);
    const constant = terms.find((t) => !!t.modifier)?.modifier ?? 0;
    const positiveDice = terms.filter(
        (t)=> !!t.dice && t.dice.number > 0
    );

    const diceTerms = positiveDice.map((term) => {
        const number = doubleDice ? term.dice.number * 2 : term.dice.number;
        const faces = term.dice.faces;
        return doubleDice ? `(${number}d${faces}[doubled])` : `${number}d${faces}`;
    });

    // Create the final term. Double the modifier here if dice doubling is enabled
    const result = [diceTerms.join(" + "), Math.abs(constant)]
        .filter((e) => !!e)
        .map((e) => (typeof e === "number" && doubleDice ? `2 * ${e}` : e))
        .join(constant > 0 ? " + " : " - ");
    return result || "0"; // Empty string is an invalid formula
}

function sumExpression(terms, data) {
    if (terms.every((t) => !t)) return null;
    let double = data?.double ?? false;
    const summed = terms.filter((p) => !!p).join(" + ") || null;
    const enclosed = double && hasOperators(summed) ? `(${summed})` : summed;

    return double ? `2 * ${enclosed}` : enclosed;
}

/** Ensures the formula is valid as a damage instance formula before flavor is attached */
function ensureValidFormulaHead(formula) {
    if (!formula) return null;
    const isWrapped = /^\(.*\)$/.test(formula);
    const isSimple = /^\d+(d\d+)?$/.test(formula);
    return isWrapped || isSimple ? formula : `(${formula})`;
}

/** Helper for helpers */
function hasOperators(formula) {
    return /[-+*/]/.test(formula ?? "");
}

function parseTermsFromSimpleFormula(
    formula,
    options
) {
    const roll = formula instanceof CheckRoll ? formula : new CheckRoll(formula, options?.rollData);

    // Parse from right to left so that when we hit an operator, we already have the term.
    return roll.terms.reduceRight((result, term) => {
        // Ignore + terms, we assume + by default
        if (term.expression === " + ") return result;

        // - terms modify the last term we parsed
        if (term.expression === " - ") {
            const termToModify = result[0];
            if (termToModify) {
                if (termToModify.modifier) termToModify.modifier *= -1;
                if (termToModify.dice) termToModify.dice.number *= -1;
            }
            return result;
        }

        result.unshift({
            modifier: term instanceof NumericTerm ? term.number : 0,
            dice: term instanceof Die ? { faces: term.faces, number: term.number } : null,
        });

        return result;
    });
}

function createDamageFormula(
    damage,
    degree
) {
    damage = deepClone(damage);

    // Handle critical failure not dealing damage, and splash still applying on a failure
    // These are still couched on weapon/melee assumptions. They'll need to be adjusted later
    if (degree === DEGREE_OF_SUCCESS.CRITICAL_FAILURE) {
        return null;
    } else if (degree === DEGREE_OF_SUCCESS.FAILURE) {
        damage.dice = damage.dice.filter((d) => d.category === "splash");
        damage.modifiers = damage.modifiers.filter((m) => m.damageCategory === "splash");
    }

    const critical = degree === DEGREE_OF_SUCCESS.CRITICAL_SUCCESS;
    if (!damage.base.length) {
        return null;
    }

    // Group dice by damage type
    const typeMap = new Map();
    for (const baseEntry of damage.base) {
        const list = typeMap.get(baseEntry.damageType) ?? [];
        typeMap.set(baseEntry.damageType, list);

        if (baseEntry.terms && baseEntry.terms instanceof Array) {
            list.push(...baseEntry.terms.map((t) => ({ ...baseEntry, ...t, label: null, critical: null })));
        } else if (baseEntry.terms && baseEntry.terms.faces && baseEntry.terms.number) {
            const { number, faces} = baseEntry.terms;

            list.push({
                label: baseEntry.terms.formula,
                dice: number && faces ? { number, faces } : null,
                modifier: 0,
                critical: null,
                damageType: baseEntry.baseEntry,
                category: baseEntry.category,
                materials: baseEntry.materials ?? [],
            });

        } else if ((baseEntry.diceNumber && baseEntry.dieSize) || baseEntry.modifier) {
            const { diceNumber, dieSize, damageType } = baseEntry;
            const modifier = baseEntry.modifier ?? 0;
            const label = (() => {
                const diceSection = diceNumber ? `${diceNumber}${dieSize}` : null;
                if (!diceSection) return String(modifier);

                const displayedModifier = modifier ? Math.abs(modifier) : null;
                const operator = modifier < 0 ? " - " : " + ";
                return [diceSection, displayedModifier].filter((p) => p !== null).join(operator);
            })();

            list.push({
                label,
                dice: diceNumber && dieSize ? { number: diceNumber, faces: Number(dieSize.replace("d", "")) } : null,
                modifier,
                critical: null,
                damageType,
                category: baseEntry.category,
                materials: baseEntry.materials ?? [],
            });
        }
    }

    // Sometimes a weapon may add base damage as bonus modifiers or dice. We need to auto-generate these
    const BONUS_BASE_LABELS = ["PF2E.ConditionTypePersistent"].map((l) => game.i18n.localize(l));

    // Test that a damage modifier or dice partial is compatible with the prior check result
    const outcomeMatches = (m) => critical || m.critical !== true;

    // Add damage dice. Dice always stack
    for (const dice of damage.dice.filter((d) => d.enabled && outcomeMatches(d))) {
        const matchingBase = damage.base.find((b) => b.damageType === dice.damageType) ?? damage.base[0];
        const baseDieSize = Number(matchingBase.dieSize?.replace("d", "")) || matchingBase.terms?.[0].dice?.faces;
        const faces = Number(dice.dieSize?.replace("d", "")) || baseDieSize || null;
        const damageType = dice.damageType ?? matchingBase.damageType;
        if (dice.diceNumber > 0 && faces) {
            const list = typeMap.get(damageType) ?? [];
            list.push({
                label: BONUS_BASE_LABELS.includes(dice.label) ? null : `${dice.label} +${dice.diceNumber}d${faces}`,
                dice: { number: dice.diceNumber, faces },
                modifier: 0,
                damageType,
                category: dice.category,
                critical: dice.critical,
            });
            typeMap.set(damageType, list);
        }
    }

    // Add modifiers
    for (const modifier of damage.modifiers.filter((m) => m.enabled && outcomeMatches(m))) {
        // A genuine bonus must match against both damage type and category: e.g., a bonus to flat damage must
        // not be applied to persistent damage--nor vice versa
        const matchingBase =
            modifier.kind === "bonus"
                ? damage.base.find(
                      (b) => b.damageType === (modifier.damageType ?? b.damageType) && b.category === modifier.category
                  )
                : damage.base.find((b) => b.damageType === (modifier.damageType ?? b.damageType)) ?? damage.base.at(0);
        if (!matchingBase) continue;
        const damageType = modifier.damageType ?? matchingBase.damageType;

        const list = typeMap.get(damageType) ?? [];
        list.push({
            label: BONUS_BASE_LABELS.includes(modifier.label) ? null : `${modifier.label} ${addSign(modifier.value)}`,
            dice: null,
            modifier: modifier.value,
            damageType,
            category: modifier.damageCategory,
            critical: modifier.critical,
        });
        typeMap.set(damageType, list);
    }

    const instances = [
        instancesFromTypeMap(typeMap, { degree }),
        instancesFromTypeMap(typeMap, { degree, persistent: true }),
    ].flat();

    const commaSeparated = instances.map((i) => i.formula).join(",");
    const breakdown = instances.flatMap((i) => i.breakdown);
    return { formula: `{${commaSeparated}}`, breakdown };
}

function groupBy(array, criterion) {
    const result = new Map();
    for (const elem of array) {
        const key = criterion(elem);
        const group = result.get(key);
        if (group) {
            group.push(elem);
        } else {
            result.set(key, [elem]);
        }
    }
    return result;
}

function instancesFromTypeMap(
    typeMap,
    { degree, persistent = false }
) {
    return Array.from(typeMap.entries()).flatMap(([damageType, typePartials]) => {
        // Filter persistent (or filter out) based on persistent option
        const partials = typePartials.filter((p) => (p.category === "persistent") === persistent);
        if (partials.length === 0) return [];

        // Split into categories, which must be processed in a specific order
        const groups = groupBy(partials, (partial) => partial.category);

        const nonCriticalDamage = (() => {
            const criticalInclusion =
                degree === DEGREE_OF_SUCCESS.CRITICAL_SUCCESS
                    ? [CRITICAL_INCLUSION.DOUBLE_ON_CRIT]
                    : [CRITICAL_INCLUSION.DOUBLE_ON_CRIT, CRITICAL_INCLUSION.DONT_DOUBLE_ON_CRIT];

            // Whether to double the dice of these partials
            const doubleDice =
                degree === DEGREE_OF_SUCCESS.CRITICAL_SUCCESS &&
                criticalInclusion.includes(null) &&
                game.settings.get("pf2e", "critRule") === "doubledice";

            // If dice doubling is enabled, any doubling of dice or constants is handled by `createPartialFormulas`
            const double = degree === DEGREE_OF_SUCCESS.CRITICAL_SUCCESS && !doubleDice;
            return sumExpression(createPartialFormulas(groups, { criticalInclusion, doubleDice }), { double });
        })();

        const criticalDamage = (() => {
            if (degree !== DEGREE_OF_SUCCESS.CRITICAL_SUCCESS) return null;
            const criticalInclusion = [CRITICAL_INCLUSION.CRITICAL_ONLY, CRITICAL_INCLUSION.DONT_DOUBLE_ON_CRIT];
            return sumExpression(createPartialFormulas(groups, { criticalInclusion }));
        })();

        // Build final damage, and exit early if its 0 persistent dammage
        const summedDamage = sumExpression(degree ? [nonCriticalDamage, criticalDamage] : [nonCriticalDamage]);
        const enclosed = ensureValidFormulaHead(summedDamage) || "0";
        if (enclosed === "0" && persistent) return [];

        const flavor = (() => {
            const typeFlavor = damageType === "untyped" && !persistent ? [] : [damageType];
            const persistentFlavor = persistent ? ["persistent"] : [];
            const materialFlavor = typePartials.flatMap((p) => p.materials ?? []);
            const allFlavor = [typeFlavor, persistentFlavor, materialFlavor].flat().join(",");
            return allFlavor.length > 0 ? `[${allFlavor}]` : "";
        })();

        const breakdown = (() => {
            const categories = [null, "persistent", "precision", "splash"] ;
            const flattenedDamage = categories.flatMap((c) => {
                const partials = groups.get(c) ?? [];
                const breakdownDamage = partials.filter((e) => e.label !== null);

                // Null labels are assumed to be base damage. Combine them and create a single breakdown component
                const leadingTerms = partials.filter(
                    (p) =>
                        p.label === null && (p.modifier || p.dice?.number || partials.every((pp) => pp.label === null))
                );
                if (leadingTerms.length) {
                    const append = c === "splash" ? ` ${game.i18n.localize("PF2E.Damage.RollFlavor.splash")}` : "";
                    const label = createSimpleFormula(leadingTerms) + append;
                    breakdownDamage.unshift({ ...leadingTerms[0], label });
                }

                return breakdownDamage;
            });
            const breakdownDamage = flattenedDamage.filter((d) => d.critical !== true);
            if (degree === DEGREE_OF_SUCCESS.CRITICAL_SUCCESS) {
                breakdownDamage.push(...flattenedDamage.filter((d) => d.critical === true));
            }

            if (!breakdownDamage.length) return [];

            // Gather label values and assign a damage type string to the first label in the list
            const damageTypeLabel =
                breakdownDamage[0].category === "persistent"
                    ? game.i18n.format("PF2E.Damage.PersistentTooltip", {
                          damageType: game.i18n.localize(CONFIG.PF2E.damageTypes[damageType] ?? damageType),
                      })
                    : game.i18n.localize(CONFIG.PF2E.damageTypes[damageType] ?? damageType);
            const labelParts = breakdownDamage.map((d) => d.label);
            labelParts[0] = `${labelParts[0].replace(/^\s+\+/, "")} ${damageTypeLabel}`;

            return labelParts;
        })();

        const formula = enclosed && flavor ? `${enclosed}${flavor}` : enclosed;
        return formula ? { formula, breakdown } : [];
    });
}

//Hooks.on('ready', async function () {
Hooks.on('init', async function () {
    if (!game.settings.get(moduleName, "affliction")) {return}

    const ActorPF2e = Object.getPrototypeOf(CONFIG.PF2E.Actor.documentClasses.character);
    const ItemPF2e = Object.getPrototypeOf(CONFIG.PF2E.Item.documentClasses.action);
    const AbstractEffectPF2e = Object.getPrototypeOf(CONFIG.PF2E.Item.documentClasses.affliction);

    class AfflictionPF2e extends AbstractEffectPF2e {
        constructor(source, context) {
            super(source, context);
        }

        get isExpired() {
            return this.system.expired;
        }

        get totalDuration() {
            const { duration } = this.system;
            if (["unlimited", "encounter"].includes(duration.unit)) {
                return Infinity;
            } else {
                return duration.value * (DURATION_UNITS[duration.unit] ?? 0);
            }
        }

        get remainingDuration() {
            const duration = this.totalDuration;
            const { unit, expiry } = this.system.duration;
            if (unit === "encounter") {
                const isExpired = this.system.expired;
                return { expired: isExpired, remaining: isExpired ? 0 : Infinity };
            } else if (duration === Infinity) {
                return { expired: false, remaining: Infinity };
            } else {
                const start = this.system.start.value;
                const { combatant } = game.combat ?? {};

                // Prevent effects that expire at end of current turn from expiring immediately outside of encounters
                const addend = !combatant && duration === 0 && unit === "rounds" && expiry === "turn-end" ? 1 : 0;
                const remaining = start + duration + addend - game.time.worldTime;
                const result = { remaining, expired: remaining <= 0 };

                if (remaining === 0 && combatant?.actor) {
                    const startInitiative = this.system.start.initiative ?? 0;
                    const currentInitiative = combatant.initiative ?? 0;

                    // A familiar won't be represented in the encounter tracker: use the master in its place
                    const fightyActor = this.actor?.isOfType("familiar") ? this.actor.master ?? this.actor : this.actor;
                    const isEffectTurnStart =
                        startInitiative === currentInitiative && combatant.actor === (this.origin ?? fightyActor);

                    result.expired = isEffectTurnStart ? expiry === "turn-start" : currentInitiative < startInitiative;
                }

                return result;
            }
        }

        get badge() {
            const label = game.i18n.format("PF2E.Item.Affliction.Stage", { stage: this.stage });
            return {
                type: "counter",
                value: this.stage,
                max: this.maxStage,
                label,
            };
        }

        get stage() {
            return this.system.stage;
        }

        get maxStage() {
            return Object.keys(this.system.stages).length || 1;
        }

        async increase(update = { by: 1 }) {
            if (this.stage === this.maxStage) {
                const initiative = this.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;
                const stageStart = { value: game.time.worldTime, initiative };

                await this.update({ system: { stageStart } });
                return;
            }

            const stage = Math.min(this.maxStage, this.system.stage + (update.by ?? 1));

            const initiative = this.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;
            const stageStart = { value: game.time.worldTime, initiative };

            await this.update({ system: { stage, stageStart } });
        }

        async decrease(update = { by: 1 }){
            const stage = this.system.stage - (update.by ?? 1);
            if (stage <= 0) {
                await this.delete();
                return;
            }

            const initiative = this.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;
            const stageStart = { value: game.time.worldTime, initiative };

            await this.update({ system: { stage, stageStart } });
        }

        get isIdentified(){
            return !this.system.unidentified;
        }

        get remainingStageDuration() {
            const stageKey = Object.keys(this.system.stages)[this.system.stage - 1];
            const stageDuration = this.system.stages[stageKey].duration;

            if (["unlimited"].includes(stageDuration.unit)) {
                return { expired: false, remaining: Infinity };
            }
            const duration = stageDuration.value * (DURATION_UNITS[stageDuration.unit] ?? 0);
            const { unit, expiry } = stageDuration;

            const start = this.system.start.value;
            const { combatant } = game.combat ?? {};

            // Prevent effects that expire at end of current turn from expiring immediately outside of encounters
            const addend = !combatant && duration === 0 && unit === "rounds" && expiry === "turn-end" ? 1 : 0;
            const remaining = start + duration + addend - game.time.worldTime;
            const result = { remaining, expired: remaining <= 0 };

            if (remaining === 0 && combatant?.actor) {
                const startInitiative = this.system.start.initiative ?? 0;
                const currentInitiative = combatant.initiative ?? 0;

                // A familiar won't be represented in the encounter tracker: use the master in its place
                const fightyActor = this.actor?.isOfType("familiar") ? this.actor.master ?? this.actor : this.actor;
                const isEffectTurnStart =
                    startInitiative === currentInitiative && combatant.actor === (this.origin ?? fightyActor);

                result.expired = isEffectTurnStart ? expiry === "turn-start" : currentInitiative < startInitiative;
            }

            return result;
        }

        get onsetDuration() {
            if (!this.system.onset) {
                return 0;
            }
            return this.system.onset.value * (DURATION_UNITS[this.system.onset.unit] ?? 0);
        }

        prepareBaseData(){
            super.prepareBaseData();
            this.system.expired = this.remainingDuration.expired;

            this.system.stage = Math.clamped(this.system.stage, 1, this.maxStage);

            // Set certain defaults
            for (const stage of Object.values(this.system.stages)) {
                for (const condition of Object.values(stage.conditions)) {
                    condition.linked ??= true;
                }
            }
        }

        /** Retrieves the damage for a specific stage */
        getStageDamage(stage) {
            const stageData = Object.values(this.system.stages).at(stage - 1);

            const base = [];
            for (const data of Object.values(stageData?.damage ?? {})) {
                const { formula, type: damageType, category } = data;
                const terms = parseTermsFromSimpleFormula(formula);
                base.push({ terms, damageType, category: category ?? null });
            }

            if (!base.length) return null;

            try {
                const { formula, breakdown } = createDamageFormula({
                    base,
                    modifiers: [],
                    dice: [],
                    ignoredResistances: [],
                });

                const roll = new DamageRoll(formula);
                const stageLabel = game.i18n.format("PF2E.Item.Affliction.Stage", { stage: this.stage });
                const template = {
                    name: `${this.name} - ${stageLabel}`,
                    damage: { roll, breakdown },
                    notes: [],
                    materials: [],
                    traits: this.system.traits.value,
                    modifiers: [],
                };

                // Context isn't used for affliction damage rolls, but we still need it for creating messages
                const context = {
                    type: "damage-roll",
                    sourceType: "save",
                    outcome: "failure",
                    domains: [],
                    options: new Set(),
                    self: null,
                };

                return { template, context };
            } catch (err) {
                console.error(err);
            }

            return null;
        }

        /** Run all updates that need to occur whenever the stage changes */
        async handleStageChange() {
            if (this.system.onset) {return}
            const actor = this.actor;
            if (!actor) return;

            // Remove linked items first
            const itemsToDelete = this.getLinkedItems().map((i) => i.id);
            await actor.deleteEmbeddedDocuments("Item", itemsToDelete);

            const currentStage = Object.values(this.system.stages).at(this.stage - 1);
            if (!currentStage) return;

            // Get all conditions we need to add or update
            const conditionsToAdd = [];
            const conditionsToUpdate = {};
            for (const data of Object.values(currentStage.conditions ?? {})) {
                const value = data.value ?? 1;

                // Try to get an existing one to update first. This occurs for unlinked OR auto-expiring ones that linger
                const existing = (() => {
                    const allExisting = actor.conditions.bySlug(data.slug, { temporary: false });
                    const byAffliction = allExisting.find((i) => i.appliedBy === this);
                    if (byAffliction) return byAffliction;

                    if (!data.linked) {
                        return maxBy(
                            allExisting.filter((i) => !i.appliedBy && !i.isLocked),
                            (c) => (c.active ? Infinity : c.value ?? 0)
                        );
                    }

                    return null;
                })();

                // There is no need to create a new condition if one exists, perform an update instead
                if (existing) {
                    if (existing.system.value.isValued) {
                        conditionsToUpdate[existing.id] = { value, linked: !!data.linked };
                    }
                    continue;
                }

                // This is a new condition, set some flags
                const condition = game.pf2e.ConditionManager.getCondition(data.slug);
                condition.updateSource({ "flags.pf2e.grantedBy.id": this.id });
                if (data.linked) {
                    condition.updateSource({ "system.references.parent.id": this.id });
                }
                if (condition.system.value.isValued && value > 1) {
                    condition.updateSource({ "system.value.value": data.value });
                }
                conditionsToAdd.push(condition);
            }

            // Insert new conditions
            const additions = conditionsToAdd.map((c) => c.toObject());
            await actor.createEmbeddedDocuments("Item", additions);

            // Perform updates on existing ones to update their values
            await actor.updateEmbeddedDocuments(
                "Item",
                Object.entries(conditionsToUpdate).map(([_id, data]) => ({
                    _id,
                    "system.value.value": data.value,
                    "flags.pf2e.grantedBy.id": this.id,
                    ...(data.linked ? { "system.references.parent.id": this.id } : {}),
                }))
            );

            // Show message if there is no onset
            await this.createStageMessage();
        }

        getLinkedItems() {
            if (!this.actor) return [];
            return this.actor.items.filter(
                (i) =>
                    i.isOfType("condition") &&
                    !EXPIRING_CONDITIONS.has(i.slug) &&
                    i.flags.pf2e.grantedBy?.id === this.id &&
                    i.system.references.parent?.id === this.id
            );
        }

        async createStageMessage(){
            const actor = this.actor;
            if (!actor) return;

            const currentStage = Object.values(this.system.stages).at(this.stage - 1);
            if (!currentStage) return;

            const damage = this.getStageDamage(this.stage);
            if (damage) {
                const { template, context } = damage;
                await DamagePF2e.roll(template, context);
            }
        }

        /** Set the start time and initiative roll of a newly created effect */
        async _preCreate(
            data,
            options,
            user
        ){
            if (this.isOwned) {
                const initiative = this.origin?.combatant?.initiative ?? game.combat?.combatant?.initiative ?? null;
                this._source.system.start = { value: game.time.worldTime + this.onsetDuration, initiative, };
                this._source.system.stageStart = { value: game.time.worldTime + this.onsetDuration, initiative};
            }

            return super._preCreate(data, options, user);
        }

        _onCreate(
            data,
            options,
            userId
        ){
            super._onCreate(data, options, userId);
            if (game.user === this.actor?.primaryUpdater) {
                this.handleStageChange();
            }
        }

        async _preUpdate(
            changed,
            options,
            user
        ) {
            const duration = changed.system?.duration;
            if (duration?.unit === "unlimited") {
                duration.expiry = null;
            } else if (typeof duration?.unit === "string" && !["unlimited", "encounter"].includes(duration.unit)) {
                duration.expiry ||= "turn-start";
                if (duration.value === -1) duration.value = 1;
            }

            return super._preUpdate(changed, options, user);
        }

        _onUpdate(
            changed,
            options,
            userId
        ) {
            super._onUpdate(changed, options, userId);

            // If the stage changed, perform stage change events
            if ((changed.system?.stageStart || changed.system?.stage || changed.system?.onset === null) && game.user === this.actor?.primaryUpdater) {
                this.handleStageChange();
            }
        }

        async rollRecovery(){
            if (!this.actor) return;

            const save = this.actor.saves?.[this.system.save.type];
            if (save) {
                const result = await save.roll({
                    dc: { value: this.system.save.value },
                    extraRollOptions: this.getRollOptions("item"),
                });

                if (result?.degreeOfSuccess === 3) {
                    this.decrease({ by: 2 });
                } else if (result?.degreeOfSuccess === 2) {
                    this.decrease();
                } else if (result?.degreeOfSuccess === 1) {
                    this.increase();
                } else {
                    this.increase({ by: 2 });
                }
            }
        }

        async onEndTurn() {
            if (this.remainingStageDuration.expired && !this.remainingDuration.expired) {
                this.toMessage();
            }

            this.deleteOnset();
        }

        async deleteOnset(){
            const { system } = this;
            if (system.onset && game.time.worldTime >= this.system.stageStart.value) {
                await this.update({ "system.onset": null });
            }
        }

        prepareActorData(){
            super.prepareActorData();
            const actor = this.actor;
            if (!actor) throw ErrorPF2e("prepareActorData called from unembedded item");

            if (this.system.onset) {
                actor.rollOptions.all[`self:${this.type}:${this.rollOptionSlug}:onset`] = true;
            }
        }
    }

    CONFIG.PF2E.Item.documentClasses.affliction = AfflictionPF2e;
});

function createActionRangeLabel(range)  {
    if (!range?.max) return null;
    const [key, value] = range.increment
        ? ["PF2E.Action.Range.IncrementN", range.increment]
        : ["PF2E.Action.Range.MaxN", range.max];

    return game.i18n.format(key, { n: value });
}

Hooks.on('pf2e.startTurn', async (combatant, encounter, id) => {
    const {actor} = combatant;
    if (!actor) return;
    for (const affliction of actor.itemTypes.affliction) {
        await affliction.onEndTurn();
    }
});

Hooks.once("init", () => {
    const origin_advance = game.time.advance;
    game.time.advance = async function(seconds, options) {
        const r =  await origin_advance.call(this, seconds, options);

        game.canvas.scene.tokens.forEach(token=>{
            if (token?.actor?.itemTypes?.affliction) {
                checkAffectionsStage(token, token.actor.itemTypes.affliction)
            }
        });

        return r;
    }
})

async function checkAffectionsStage(token, afflictions) {
    afflictions.forEach(aff=>checkAffectionStage(token, aff))
}

async function checkAffectionStage(token, aff) {
    aff.prepareBaseData()
    if (aff.isExpired) {
        await aff.delete()
    } else  {
        aff.onEndTurn();
    }
};
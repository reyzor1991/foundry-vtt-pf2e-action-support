const Target = {
  None: "None",
  SelfEffect: "Apply effect to actor when use action",
  TargetEffect: "Apply effect to target when use action",
  SelfOrTargetEffect: "Apply effect to actor or 1 target when use action",
  TargetsEffect: "Apply effect to all targets when use action",
}

const Requirement = {
  None: "None",
  Success: "Message outcome is success",
  CriticalSuccess: "Message outcome is critical success",
  AnySuccess: "Message outcome is any success",
  Failure: "Message outcome is failure",
  CriticalFailure: "Message outcome is critical failure",
  AnyFailure: "Message outcome is any failure",
}

const Trigger = {
  None: "None",
  EqualsSlug: "Message slug Equals to",
  HasOption: "Message Has Option",
}

class HomebrewRequirement {
  constructor() {
    this.requirement = Requirement.None;
  }

  static fromObj(obj) {
    return Object.assign(new HomebrewRequirement(), obj);
  }
}

class HomebrewTrigger {
  constructor() {
    this.slug = ""
    this.type = ""
    this.battle = false
    this.trigger = Trigger.None
  }

  static fromObj(obj) {
    return Object.assign(new HomebrewTrigger(), obj);
  }
}

class Homebrew {
  constructor() {
    this.effect = ""
    this.target = Target.None
    this.triggers = [new HomebrewTrigger()]
    this.requirements = []
  }

  static fromObj(obj) {
    const h = new Homebrew();
    Object.assign(h, obj);
    h.triggers = h.triggers.map(a=>HomebrewTrigger.fromObj(a));
    h.requirements = h.requirements.map(a=>HomebrewRequirement.fromObj(a));
    return h;
  }
}

class PF2eActionSupportHomebrewSettings extends FormApplication {

    homebrews = []

    constructor() {
        super();
        const _e = game.settings.get(moduleName, "homebrew");
        if (_e) {
            this.homebrews = _e.map(a=>Homebrew.fromObj(a));
        }
    }

    async updateValue(key, value) {
        const qq = key.split(".");
        if (qq.length === 2) {
            this.homebrews[qq[0]][qq[1]] = value;
        } else if (qq.length === 4) {
            this.homebrews[qq[0]][qq[1]][qq[2]][qq[3]] = value;
        }
    }

    async _updateObject(_event, data) {
        for (const key of Object.keys(data)) {
            this.updateValue(key, data[key])
        }

        await game.settings.set(moduleName, "homebrew", this.rawValue());
    }

    updateForm(event) {
        $(event.currentTarget).closest('form').serializeArray().forEach(e=>{
           this.updateValue(e.name, e.value);
        })
    }

    rawValue() {
        const res = [];
        for (let i=0; i < this.homebrews.length; i++) {
            res.push({
                effect: this.homebrews[i].effect,
                target: this.homebrews[i].target,
                triggers: this.homebrews[i].triggers.map(a=>{
                    return {"trigger":a.trigger,"battle":a.battle,"slug":a.slug,"type":a?.type?.trim()};
                }),
                requirements: this.homebrews[i].requirements.map(a=>{
                    return {"requirement":a.requirement};
                }),
            });
        }
        return res;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.add').click(async (event) => {
            this.updateForm(event);

            this.homebrews.push(new Homebrew());

            super.render()
        });

        html.find('.homebrew-delete').click(async (event) => {
            this.updateForm(event);

            this.homebrews.splice($(event.currentTarget).data().idx, 1);
            super.render()
        });


        html.find('.trigger-delete').click(async (event) => {
            this.updateForm(event);

            this.homebrews[$(event.currentTarget).data().parent].triggers.splice($(event.currentTarget).data().idx, 1);
            super.render()
        });


        html.find('.requirement-delete').click(async (event) => {
            this.updateForm(event);

            this.homebrews[$(event.currentTarget).data().parent].requirements.splice($(event.currentTarget).data().idx, 1);
            super.render()
        });

        html.find('.add-trigger').click(async (event) => {
            this.updateForm(event);

            const i = $(event.currentTarget).data().idx;
            this.homebrews[i].triggers.push(new HomebrewTrigger());
            super.render()
        });

        html.find('.add-requirement').click(async (event) => {
            this.updateForm(event);

            const i = $(event.currentTarget).data().idx;
            this.homebrews[i].requirements.push(new HomebrewRequirement());
            super.render()
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Homebrew Settings",
            id: `${moduleName}-homebrew-settings`,
            classes: ['settings-menu'],
            template: `modules/pf2e-action-support/templates/homebrew.hbs`,
            width: 1050,
            height: "auto",
            closeOnSubmit: true,
            resizable: true,
        });
    }

    static init() {
        game.settings.registerMenu(moduleName, "homebrewSettings", {
            name: "Homebrew Settings",
            label: "Manage Homebrew Settings",
            icon: "fas fa-hand",
            type: this,
            restricted: true,
        });

        game.settings.register(moduleName, "homebrew", {
            name: "Homebrew",
            scope: "world",
            default: [],
            type: Array,
            config: false,
        });
    }

    getData() {
        return mergeObject(super.getData(), {
            homebrews: this.homebrews,
            triggerChoices: Trigger,
            targetChoices: Target,
            requirementChoices: Requirement,
        });
    }
}

Hooks.on('preCreateChatMessage',async (message, user, _options, userId)=>{
    if (game.settings.get(moduleName, "useHomebrew")) {
        const _obj = message?.flags?.pf2e?.origin ? (await fromUuid(message?.flags?.pf2e?.origin?.uuid)) : undefined;

        game.settings.get(moduleName, "homebrew")
            .filter(a=>a.triggers.length > 0 && a.effect.length > 0 && a.target != "None")
            .forEach(hb => {
                handleHomebrewMessages(hb, message, _obj);
            })
    }
});

async function handleHomebrewMessages(hb, message, _obj=undefined) {
    if (!hb.requirements.every(a=>handleRequirement(a, message))) {return}
    hb.triggers.forEach( t => {
        if (t.battle && !game?.combats?.active) {return}
        if (
            (t.trigger === "EqualsSlug" && _obj?.slug === t.slug)
            || (t.trigger === "HasOption" && hasOption(message, t.slug))
        ) {
            if (t.type && !messageType(message, t.type)){return;}
            handleTarget(hb.target, hb.effect, message, _obj)
        }
    })
}

function handleRequirement(req, message) {
    if (req.requirement === "None") {
        return true;
    } else if (req.requirement === "Success") {
        return successMessageOutcome(message);
    } else if (req.requirement === "CriticalSuccess") {
        return criticalSuccessMessageOutcome(message);
    } else if (req.requirement === "AnySuccess") {
        return anySuccessMessageOutcome(message);
    } else if (req.requirement === "Failure") {
        return failureMessageOutcome(message);
    } else if (req.requirement === "CriticalFailure") {
        return criticalFailureMessageOutcome(message);
    } else if (req.requirement === "AnyFailure") {
        return anyFailureMessageOutcome(message);
    }
    return false;
}

async function handleTarget(targetType, effect, message, _obj=undefined) {
    if (targetType === "SelfEffect") {
        setEffectToActor(message.actor, effect, message?.item?.level)
    } else if (targetType === "TargetEffect") {
        setEffectToTarget(message, effect)
    } else if (targetType === "SelfOrTargetEffect") {
        setEffectToActorOrTarget(message, effect, _obj ? _obj.name : '', _obj && message?.flags?.pf2e?.origin?.type === "spell" ? getSpellRange(message.actor, _obj) : 1000)
    } else if (targetType === "TargetsEffect") {
        game.user.targets.forEach(tt => {
            setEffectToActor(tt.actor, effect, message?.item?.level)
        });
    }
};
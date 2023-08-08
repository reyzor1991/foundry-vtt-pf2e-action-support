const moduleName = "pf2e-action-support";

const effect_off_guard = "Compendium.pf2e-action-support.action-support.Item.Vh5E1Qgp34sTKfVs";
const effect_off_guard_start_turn = "Compendium.pf2e-action-support.action-support.Item.YsNqG4OocHoErbc9";
const effect_enfeebled1_start_turn = "Compendium.pf2e-action-support.action-support.Item.9QvJm6xIKWjti3PD";
const effect_paralyzed_next_turn = "Compendium.pf2e-action-support.action-support.Item.aLqCfr4Yl6g2eyoO";
const effect_enfeebled2_start_turn = "Compendium.pf2e-action-support.action-support.Item.66Sg7uVVaIb3tOib";
const effect_immobilized1_round = "Compendium.pf2e-action-support.action-support.Item.FCKm1dZKZzF7Jkxl";
const effect_blinded1_round = "Compendium.pf2e-action-support.action-support.Item.KmUCaFZSk9efn9AR";
const effect_slowed1_round = "Compendium.pf2e-action-support.action-support.Item.xTHKw0VHuqu6SI93";
const effect_deafened_minute = "Compendium.pf2e-action-support.action-support.Item.enKjIoLFr4T0gfEe";
const effect_deafened_hour = "Compendium.pf2e-action-support.action-support.Item.KnjwOiVZr5Twwoum";
const effect_skunk_bomb_fail = "Compendium.pf2e-action-support.action-support.Item.Ed57eZ72j6RGAIp4";
const effect_skunk_bomb_cfail = "Compendium.pf2e-action-support.action-support.Item.0v7THqjruKWI0wJ4";
const effect_battle_medicine_immunity_hour = "Compendium.pf2e-action-support.action-support.Item.GMb4x4eHVGD9Tfzp";
const effect_treat_wounds_immunity_minutes = "Compendium.pf2e-action-support.action-support.Item.b1ILZ8YQvBd9XA2b";
const effect_demoralize_immunity_minutes = "Compendium.pf2e-action-support.action-support.Item.DFLW2gzu0PGeX6zu";
const effect_concealed_start_turn = "Compendium.pf2e-action-support.action-support.Item.1KroJZ72a4Hc10fW";
const effect_restrained_end_attacker_next_turn = "Compendium.pf2e-action-support.action-support.Item.zol83j7l2cBSmY3a";
const effect_grabbed_end_attacker_next_turn = "Compendium.pf2e-action-support.action-support.Item.5MNn6cmXxbORB8x8";
const effect_panache = "Compendium.pf2e.feat-effects.Item.uBJsxCzNhje8m8jj";
const effect_disarm_success = "Compendium.pf2e.equipment-effects.Item.z3ATL8DcRVrT0Uzt";
const effect_adverse_subsist_situation = "Compendium.pf2e.other-effects.Item.wHWWHkjDXmJl4Ia6";
const effect_conduct_energy = "Compendium.pf2e.equipment-effects.Item.lU8IO9FIGK1DXVMy";
const effect_daydream_trance = "Compendium.pf2e.feat-effects.Item.RATDyLyxXN3qmOas";
const effect_energy_shot = "Compendium.pf2e.feat-effects.Item.zocU4IYIlWwRKUuE";
const effect_entitys_resurgence = "Compendium.pf2e.feat-effects.Item.yr5ey5qC8dXH749T";
const effect_follow_the_expert = "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3";
const effect_feint_success = "Compendium.pf2e-action-support.action-support.Item.P6DGk2h38xE8O0pw";
const effect_feint_critical_success = "Compendium.pf2e-action-support.action-support.Item.lwcyhD03jVchmPGm";
const effect_feint_success_attacker_target = "Compendium.pf2e-action-support.action-support.Item.XcJAldj3qsmLKjSL";
const effect_feint_crit_success_attacker_target = "Compendium.pf2e-action-support.action-support.Item.jfn0eHEAnoxNI7YS";
const effect_bend_time = "Compendium.pf2e-action-support.action-support.Item.w4iqlhWrlHLlOiYP";
const effect_jinx_immunity = "Compendium.pf2e-action-support.action-support.Item.DGGVvtjm7r8yhSKG";
const effect_jinx_clumsy1 = "Compendium.pf2e-action-support.action-support.Item.aEhh2kWTcKJacdHe";
const effect_jinx_clumsy2 = "Compendium.pf2e-action-support.action-support.Item.MkWyAtPU3CAFpgdQ";
const effect_aberrant_whispers_immunity = "Compendium.pf2e-action-support.action-support.Item.zt5GIv9435SF0fYn";
const effect_intimidating_strike = "Compendium.pf2e-action-support.action-support.Item.w9i0aY2IQ3jvCX9K";
const effect_reach_spell = "Compendium.pf2e-action-support.action-support.Item.jLxv3W9FgO2SbxVC";
const effect_spectral_hand = "Compendium.pf2e-action-support.action-support.Item.wArBvC6i6Das3r8I";
const effect_hunt_prey = "Compendium.pf2e-action-support.action-support.Item.a51AN6VfpW9b4ttm";
const effect_allegro = "Compendium.pf2e-action-support.action-support.Item.kZmteGRpdP6qgIdC";

const pol = ["spell-effect-wild-morph", "spell-effect-juvenile-companion",
"spell-effect-pest-form", "spell-effect-wild-shape", "spell-effect-enlarge", "spell-effect-enlarge-heightened-4th",
 "spell-effect-shrink", "spell-effect-summoners-visage", "spell-effect-ooze-form-ochre-jelly", "spell-effect-elephant-form",
 "spell-effect-gaseous-form", "spell-effect-swarm-form", "spell-effect-unusual-anatomy",
 "spell-effect-righteous-might", "spell-effect-corrosive-body", "spell-effect-corrosive-body-heightened-9th",
 "spell-effect-cosmic-form-moon", "spell-effect-cosmic-form-sun", "spell-effect-fiery-body",
 "spell-effect-fiery-body-9th-level", "spell-effect-ki-form", "spell-effect-apex-companion",
 "spell-effect-nature-incarnate-kaiju", "spell-effect-nature-incarnate-green-man", "spell-effect-dragon-claws",
 "spell-effect-evolution-surge", "spell-effect-gluttons-jaw", "spell-effect-embrace-the-pit", "spell-effect-moon-frenzy",
 "spell-effect-divine-vessel", "spell-effect-divine-vessel-9th-level"];

const polAnim = ["spell-effect-aberrant-form-", "spell-effect-animal-form-", "spell-effect-insect-form-",
"spell-effect-ooze-form-", "spell-effect-aerial-form-", "spell-effect-bestial-curse-", "spell-effect-dinosaur-form-",
"spell-effect-fey-form-", "spell-effect-elemental-form-", "spell-effect-plant-form-", "spell-effect-daemon-form-",
"spell-effect-devil-form-", "spell-effect-dragon-form-", "spell-effect-tempest-form-", "spell-effect-angel-form-",
"spell-effect-monstrosity-form-", "spell-effect-element-embodied-",
"spell-effect-animal-feature-", "spell-effect-adapt-self-", "spell-effect-shifting-form-", "spell-effect-dragon-wings-",
"spell-effect-mantle-of-the-frozen-heart-", "spell-effect-mantle-of-the-magma-heart-"]

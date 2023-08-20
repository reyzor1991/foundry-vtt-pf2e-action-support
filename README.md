# PF2e Action Support
![](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps://raw.githubusercontent.com/reyzor1991/foundry-vtt-pf2e-action-support/master/module.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fsystem%3FnameType%3Dfull%26showVersion%3D1%26style%3Dflat%26url%3Dhttps://raw.githubusercontent.com/reyzor1991/foundry-vtt-pf2e-action-support/master/module.json)

[![Version]][Version URL]

![](https://img.shields.io/github/release-date/reyzor1991/foundry-vtt-pf2e-action-support?label=Release%20date)

![](https://img.shields.io/github/downloads/reyzor1991/foundry-vtt-pf2e-action-support/total?label=All%20downloads)
![](https://img.shields.io/github/downloads-pre/reyzor1991/foundry-vtt-pf2e-action-support/latest/total)
![](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpf2e-action-support&colorB=4aa94a)

[Version]: https://img.shields.io/badge/Version-0.2.21-yellow?style=flat-square
[Version URL]: https://github.com/reyzor1991/foundry-vtt-pf2e-action-support

[Support me on Patreon](https://www.patreon.com/reyzor1991)

### Module which automate work with actions
### Updating frequency of spell/actions(decrease when using, updating when new round begin for round frequency)
### Turn on Use socket option to automatically apply effects/conditions

### List of actions:
See [ACTIONS.md](./ACTIONS.md)

### To get more info/examples visit [WIKI](https://github.com/reyzor1991/foundry-vtt-pf2e-action-support/wiki)

### Afflictions(under dev feature)
- pf2e.mjs file is 5.3.1+ version with affliction modifications
- Replace pf2e.mjs and hbs files from afflictionfiles dir
- Paths 
- - systems/pf2e
- - systems/pf2e/templates/items
- - systems/pf2e/templates/system
- ```_token.actor.itemTypes.affliction.forEach(a=>a.delete())``` - delete all affliction from actor
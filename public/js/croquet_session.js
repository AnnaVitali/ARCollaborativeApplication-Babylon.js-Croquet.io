// Croquet Tutorial 1
// Hello World 
// Croquet Corporation 
// 2021

import { RootView } from "./view.js";
import { RootModel } from "./model.js";

Croquet.Session.join({
    apiKey: '1qyNnOonAkPmJ464x9pgDidv8rEf429oxDhsgrjzM',
    appId: 'it.unibo.studio.anna_2evitali4.CroquetOSExample_myapp',
    name: "unnamed",
    password: "secret",
    model: RootModel,
    view: RootView
});
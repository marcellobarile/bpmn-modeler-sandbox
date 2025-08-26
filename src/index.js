import "./styles.css";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import BpmnModeler from "bpmn-js/lib/Modeler";
import { CloudElementTemplatesPropertiesProviderModule } from 'bpmn-js-element-templates';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';


import { doLinting, initializePluginToggle } from "./linting";
import { diagram } from "./diagram";

const modeler = (window.modeler = new BpmnModeler({
  container: "#canvas",
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    ZeebePropertiesProviderModule,
    BpmnPropertiesProviderModule,
    BpmnPropertiesPanelModule,
    CloudElementTemplatesPropertiesProviderModule,
  ],
  moddleExtensions: {
    zeebe: zeebeModdle
  }
}));

modeler.importXML(diagram)
  .then(() => {
    registerEvents();
    initializePluginToggle();
  })
  .catch((err) => {
    if (err) {
      console.log("BPMN diagram import failed", err);
    }
  });

const registerEvents = () => {
  modeler.on('commandStack.changed', async () => {
    await doLinting().then((results) => {
      console.log('Linting results:', results);
    });
  });
};
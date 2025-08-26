import "./styles.css";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import bpmnXML from "./diagram.bpmn";

import BpmnModeler from "bpmn-js/lib/Modeler";

const modeler = (window.modeler = new BpmnModeler({
  container: "#canvas"
}));

modeler.importXML(bpmnXML).catch((err) => {
  if (err) {
    console.log("BPMN diagram import failed", err);
  }
});

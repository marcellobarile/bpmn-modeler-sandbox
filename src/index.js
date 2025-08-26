import "./styles.css";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import BpmnModeler from "bpmn-js/lib/Modeler";
import { diagram } from "./diagram";

const modeler = (window.modeler = new BpmnModeler({
  container: "#canvas"
}));

modeler.importXML(diagram).catch((err) => {
  if (err) {
    console.log("BPMN diagram import failed", err);
  }
});

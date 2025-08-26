export const diagram = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:modeler="http://camunda.org/schema/modeler/1.0" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Web Modeler" exporterVersion="ed62e54" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.7.0">
  <bpmn:process id="Process_0hu97q8" name="New BPMN diagram" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1exbzfy</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="Event_0f78b5z">
      <bpmn:incoming>Flow_1exbzfy</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1exbzfy" sourceRef="StartEvent_1" targetRef="Event_0f78b5z" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0hu97q8">
      <bpmndi:BPMNShape id="Event_0f78b5z_di" bpmnElement="Event_0f78b5z">
        <dc:Bounds x="362" y="32" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="32" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1exbzfy_di" bpmnElement="Flow_1exbzfy">
        <di:waypoint x="218" y="50" />
        <di:waypoint x="362" y="50" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
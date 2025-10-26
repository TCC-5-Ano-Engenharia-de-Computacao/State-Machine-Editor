// Types for State Machine XML structure

export interface ActionElement {
  name: string; // Nome do tipo da ação (ex: "SetColliderAction")
  attributes: Record<string, string>; // Atributos dinâmicos
}

export interface ConditionElement {
  name: string; // Nome do tipo da condição (ex: "CheckTieCondition")
  attributes: Record<string, string>; // Atributos dinâmicos
}

export interface Transition {
  id: string; // ID único gerado para a transição
  to: string; // ID do estado destino
  conditions: ConditionElement[];
  successActions: ActionElement[];
  failureActions: ActionElement[];
}

export interface StateEvents {
  beforeEnter: ActionElement[];
  onEnter: ActionElement[];
  onStay: ActionElement[];
  onLeave: ActionElement[];
}

export interface State {
  id: string; // ID único do estado
  events: StateEvents;
  transitions: Transition[];
}

export interface StateMachine {
  initialState: string;
  states: State[];
}

// Helper types for UI
export interface StateNode {
  id: string;
  label: string;
  incomingTransitions: string[]; // IDs de transições que chegam neste estado
  outgoingTransitions: string[]; // IDs de transições que saem deste estado
}

export interface TransitionEdge {
  id: string;
  source: string; // ID do estado de origem
  target: string; // ID do estado destino
  label?: string;
}


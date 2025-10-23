import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type {
  StateMachine,
  State,
  Transition,
  ActionElement,
  ConditionElement,
  StateEvents,
} from '../../../shared/types';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  ignoreDeclaration: true,
  commentPropName: '#comment',
  preserveOrder: false,
  parseAttributeValue: false,
  trimValues: true,
  allowBooleanAttributes: true, // Preservar atributos booleanos sem valor (ex: isInstantaneous)
};

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '    ',
  suppressEmptyNode: true,
  suppressBooleanAttributes: false, // Forçar valores explícitos para atributos booleanos
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseActions(actionsObj: any): ActionElement[] {
  if (!actionsObj) return [];
  
  const actions: ActionElement[] = [];
  
  // Iterar sobre todas as chaves do objeto (cada chave é um tipo de ação)
  for (const [actionName, actionData] of Object.entries(actionsObj)) {
    if (actionName.startsWith('#') || actionName.startsWith('@')) continue;
    
    const actionArray = Array.isArray(actionData) ? actionData : [actionData];
    
    for (const action of actionArray) {
      const attributes: Record<string, string> = {};
      
      if (action && typeof action === 'object') {
        for (const [key, value] of Object.entries(action)) {
          if (key.startsWith('@_')) {
            const attrName = key.substring(2);
            // Se valor for vazio ou true (atributo booleano sem valor), usar "true"
            if (value === '' || value === true) {
              attributes[attrName] = 'true';
            } else {
              attributes[attrName] = String(value);
            }
          }
        }
      }
      
      actions.push({
        name: actionName,
        attributes,
      });
    }
  }
  
  return actions;
}

function parseConditions(conditionsObj: any): ConditionElement[] {
  if (!conditionsObj) return [];
  
  const conditions: ConditionElement[] = [];
  
  for (const [conditionName, conditionData] of Object.entries(conditionsObj)) {
    if (conditionName.startsWith('#') || conditionName.startsWith('@')) continue;
    
    const conditionArray = Array.isArray(conditionData) ? conditionData : [conditionData];
    
    for (const condition of conditionArray) {
      const attributes: Record<string, string> = {};
      
      if (condition && typeof condition === 'object') {
        for (const [key, value] of Object.entries(condition)) {
          if (key.startsWith('@_')) {
            const attrName = key.substring(2);
            // Se valor for vazio ou true (atributo booleano sem valor), usar "true"
            if (value === '' || value === true) {
              attributes[attrName] = 'true';
            } else {
              attributes[attrName] = String(value);
            }
          }
        }
      }
      
      conditions.push({
        name: conditionName,
        attributes,
      });
    }
  }
  
  return conditions;
}

function parseTransitions(transitionsObj: any): Transition[] {
  if (!transitionsObj || !transitionsObj.Transition) return [];
  
  const transitionArray = Array.isArray(transitionsObj.Transition)
    ? transitionsObj.Transition
    : [transitionsObj.Transition];
  
  return transitionArray.map((trans: any) => {
    const to = trans['@_to'] || '';
    const conditions = parseConditions(trans.Conditions);
    const successActions = parseActions(trans.SuccessActions);
    const failureActions = parseActions(trans.FailureActions);
    
    return {
      id: generateId(),
      to,
      conditions,
      successActions,
      failureActions,
    };
  });
}

function parseStateEvents(stateObj: any): StateEvents {
  return {
    beforeEnter: parseActions(stateObj.BeforeEnter),
    onEnter: parseActions(stateObj.OnEnter),
    onStay: parseActions(stateObj.OnStay),
    onExit: parseActions(stateObj.OnExit),
  };
}

export function parseXMLToStateMachine(xmlString: string): StateMachine {
  const parser = new XMLParser(parserOptions);
  const parsed = parser.parse(xmlString);
  
  const stateMachineObj = parsed.StateMachine;
  const initialState = stateMachineObj['@_initialState'] || '';
  
  const stateArray = Array.isArray(stateMachineObj.State)
    ? stateMachineObj.State
    : [stateMachineObj.State];
  
  const states: State[] = stateArray.map((stateObj: any) => {
    const id = stateObj['@_id'] || '';
    const events = parseStateEvents(stateObj);
    const transitions = parseTransitions(stateObj.Transitions);
    
    return {
      id,
      events,
      transitions,
    };
  });
  
  return {
    initialState,
    states,
  };
}

function buildActions(actions: ActionElement[]): any {
  if (actions.length === 0) return undefined;
  
  const result: any = {};
  
  for (const action of actions) {
    const actionObj: any = {};
    
    for (const [key, value] of Object.entries(action.attributes)) {
      // Apenas adicionar atributo se tiver valor não vazio
      if (value !== undefined && value !== null && value !== '') {
        actionObj[`@_${key}`] = value;
      }
    }
    
    if (!result[action.name]) {
      result[action.name] = actionObj;
    } else if (Array.isArray(result[action.name])) {
      result[action.name].push(actionObj);
    } else {
      result[action.name] = [result[action.name], actionObj];
    }
  }
  
  return result;
}

function buildConditions(conditions: ConditionElement[]): any {
  if (conditions.length === 0) return undefined;
  
  const result: any = {};
  
  for (const condition of conditions) {
    const conditionObj: any = {};
    
    for (const [key, value] of Object.entries(condition.attributes)) {
      // Apenas adicionar atributo se tiver valor não vazio
      if (value !== undefined && value !== null && value !== '') {
        conditionObj[`@_${key}`] = value;
      }
    }
    
    if (!result[condition.name]) {
      result[condition.name] = conditionObj;
    } else if (Array.isArray(result[condition.name])) {
      result[condition.name].push(conditionObj);
    } else {
      result[condition.name] = [result[condition.name], conditionObj];
    }
  }
  
  return result;
}

function buildTransitions(transitions: Transition[]): any {
  if (transitions.length === 0) return undefined;
  
  const transitionArray = transitions.map((trans) => {
    const transObj: any = {
      '@_to': trans.to,
    };
    
    const conditions = buildConditions(trans.conditions);
    if (conditions) {
      transObj.Conditions = conditions;
    }
    
    const successActions = buildActions(trans.successActions);
    if (successActions) {
      transObj.SuccessActions = successActions;
    }
    
    const failureActions = buildActions(trans.failureActions);
    if (failureActions) {
      transObj.FailureActions = failureActions;
    }
    
    return transObj;
  });
  
  return {
    Transition: transitionArray.length === 1 ? transitionArray[0] : transitionArray,
  };
}

function buildStateEvents(events: StateEvents): any {
  const result: any = {};
  
  const beforeEnter = buildActions(events.beforeEnter);
  if (beforeEnter) result.BeforeEnter = beforeEnter;
  
  const onEnter = buildActions(events.onEnter);
  if (onEnter) result.OnEnter = onEnter;
  
  const onStay = buildActions(events.onStay);
  if (onStay) result.OnStay = onStay;
  
  const onExit = buildActions(events.onExit);
  if (onExit) result.OnExit = onExit;
  
  return result;
}

export function buildXMLFromStateMachine(stateMachine: StateMachine): string {
  const stateArray = stateMachine.states.map((state: State) => {
    const stateObj: any = {
      '@_id': state.id,
      ...buildStateEvents(state.events),
    };
    
    const transitions = buildTransitions(state.transitions);
    if (transitions) {
      stateObj.Transitions = transitions;
    }
    
    return stateObj;
  });
  
  const stateMachineObj = {
    StateMachine: {
      '@_initialState': stateMachine.initialState,
      State: stateArray.length === 1 ? stateArray[0] : stateArray,
    },
  };
  
  const builder = new XMLBuilder(builderOptions);
  return builder.build(stateMachineObj);
}


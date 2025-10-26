import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStateMachine } from './StateMachineContext';
import type { ActionElement, ConditionElement } from '../../../shared/types';

interface IndexedItem {
  name: string;
  attributes: Set<string>;
  examples: Record<string, Set<string>>; // attribute -> set of example values
}

interface IndexContextType {
  indexedActions: Map<string, IndexedItem>;
  indexedConditions: Map<string, IndexedItem>;
  getActionSuggestions: () => string[];
  getConditionSuggestions: () => string[];
  getAttributeSuggestions: (type: 'action' | 'condition', name: string) => string[];
  getAttributeValueSuggestions: (type: 'action' | 'condition', name: string, attribute: string) => string[];
}

const IndexContext = createContext<IndexContextType | undefined>(undefined);

export function IndexProvider({ children }: { children: React.ReactNode }) {
  const { stateMachine } = useStateMachine();
  const [indexedActions, setIndexedActions] = useState<Map<string, IndexedItem>>(new Map());
  const [indexedConditions, setIndexedConditions] = useState<Map<string, IndexedItem>>(new Map());
  
  useEffect(() => {
    if (!stateMachine) {
      setIndexedActions(new Map());
      setIndexedConditions(new Map());
      return;
    }
    
    const actionsMap = new Map<string, IndexedItem>();
    const conditionsMap = new Map<string, IndexedItem>();
    
    // Helper to index actions
    const indexAction = (action: ActionElement) => {
      if (!actionsMap.has(action.name)) {
        actionsMap.set(action.name, {
          name: action.name,
          attributes: new Set(),
          examples: {},
        });
      }
      
      const item = actionsMap.get(action.name)!;
      for (const [key, value] of Object.entries(action.attributes)) {
        item.attributes.add(key);
        if (!item.examples[key]) {
          item.examples[key] = new Set();
        }
        item.examples[key].add(value);
      }
    };
    
    // Helper to index conditions
    const indexCondition = (condition: ConditionElement) => {
      if (!conditionsMap.has(condition.name)) {
        conditionsMap.set(condition.name, {
          name: condition.name,
          attributes: new Set(),
          examples: {},
        });
      }
      
      const item = conditionsMap.get(condition.name)!;
      for (const [key, value] of Object.entries(condition.attributes)) {
        item.attributes.add(key);
        if (!item.examples[key]) {
          item.examples[key] = new Set();
        }
        item.examples[key].add(value);
      }
    };
    
    // Index all actions and conditions from all states
    for (const state of stateMachine.states) {
      // Index state event actions
      for (const action of state.events.beforeEnter) indexAction(action);
      for (const action of state.events.onEnter) indexAction(action);
      for (const action of state.events.onStay) indexAction(action);
      for (const action of state.events.onLeave) indexAction(action);
      
      // Index transition conditions and actions
      for (const transition of state.transitions) {
        for (const condition of transition.conditions) indexCondition(condition);
        for (const action of transition.successActions) indexAction(action);
        for (const action of transition.failureActions) indexAction(action);
      }
    }
    
    setIndexedActions(actionsMap);
    setIndexedConditions(conditionsMap);
  }, [stateMachine]);
  
  const getActionSuggestions = (): string[] => {
    return Array.from(indexedActions.keys()).sort();
  };
  
  const getConditionSuggestions = (): string[] => {
    return Array.from(indexedConditions.keys()).sort();
  };
  
  const getAttributeSuggestions = (type: 'action' | 'condition', name: string): string[] => {
    const map = type === 'action' ? indexedActions : indexedConditions;
    const item = map.get(name);
    if (!item) return [];
    return Array.from(item.attributes).sort();
  };
  
  const getAttributeValueSuggestions = (
    type: 'action' | 'condition',
    name: string,
    attribute: string
  ): string[] => {
    const map = type === 'action' ? indexedActions : indexedConditions;
    const item = map.get(name);
    if (!item || !item.examples[attribute]) return [];
    return Array.from(item.examples[attribute]).sort();
  };
  
  const value: IndexContextType = {
    indexedActions,
    indexedConditions,
    getActionSuggestions,
    getConditionSuggestions,
    getAttributeSuggestions,
    getAttributeValueSuggestions,
  };
  
  return <IndexContext.Provider value={value}>{children}</IndexContext.Provider>;
}

export function useIndex() {
  const context = useContext(IndexContext);
  if (!context) {
    throw new Error('useIndex must be used within IndexProvider');
  }
  return context;
}


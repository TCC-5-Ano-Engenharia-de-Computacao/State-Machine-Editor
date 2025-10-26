import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  StateMachine,
  State,
  Transition,
  ActionElement,
  ConditionElement,
} from '../../../shared/types';
import { parseXMLToStateMachine, buildXMLFromStateMachine } from '@/lib/xmlParser';

interface StateMachineContextType {
  stateMachine: StateMachine | null;
  selectedStateId: string | null;
  selectedTransitionId: string | null;
  
  // File operations
  loadFromXML: (xmlString: string) => void;
  exportToXML: () => string;
  
  // State operations
  createState: (id: string) => void;
  deleteState: (id: string) => void;
  updateStateId: (oldId: string, newId: string) => void;
  setInitialState: (stateId: string) => void;
  
  // State events operations
  addAction: (stateId: string, eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave', action: ActionElement) => void;
  updateAction: (stateId: string, eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave', index: number, action: ActionElement) => void;
  deleteAction: (stateId: string, eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave', index: number) => void;
  reorderActions: (stateId: string, eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave', fromIndex: number, toIndex: number) => void;
  
  // Transition operations
  addTransition: (fromStateId: string, toStateId: string) => string;
  deleteTransition: (stateId: string, transitionId: string) => void;
  updateTransitionTarget: (stateId: string, transitionId: string, newTarget: string) => void;
  updateTransition: (stateId: string, transitionId: string, transition: Transition) => void;
  
  // Transition conditions operations
  addCondition: (stateId: string, transitionId: string, condition: ConditionElement) => void;
  updateCondition: (stateId: string, transitionId: string, index: number, condition: ConditionElement) => void;
  deleteCondition: (stateId: string, transitionId: string, index: number) => void;
  
  // Transition actions operations
  addTransitionAction: (stateId: string, transitionId: string, actionType: 'success' | 'failure', action: ActionElement) => void;
  updateTransitionAction: (stateId: string, transitionId: string, actionType: 'success' | 'failure', index: number, action: ActionElement) => void;
  deleteTransitionAction: (stateId: string, transitionId: string, actionType: 'success' | 'failure', index: number) => void;
  
  // Reverse transition editing
  addIncomingTransition: (targetStateId: string, fromStateId: string) => void;
  removeIncomingTransition: (targetStateId: string, fromStateId: string) => void;
  getIncomingStates: (stateId: string) => string[];
  
  // Selection
  selectState: (stateId: string | null) => void;
  selectTransition: (transitionId: string | null) => void;
}

const StateMachineContext = createContext<StateMachineContextType | undefined>(undefined);

export function StateMachineProvider({ children }: { children: React.ReactNode }) {
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  
  const loadFromXML = useCallback((xmlString: string) => {
    try {
      const parsed = parseXMLToStateMachine(xmlString);
      setStateMachine(parsed);
      setSelectedStateId(null);
      setSelectedTransitionId(null);
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw error;
    }
  }, []);
  
  const exportToXML = useCallback(() => {
    if (!stateMachine) return '';
    return buildXMLFromStateMachine(stateMachine);
  }, [stateMachine]);
  
  const createState = useCallback((id: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newState: State = {
        id,
        events: {
          beforeEnter: [],
          onEnter: [],
          onStay: [],
          onLeave: [],
        },
        transitions: [],
      };
      
      return {
        ...prev,
        states: [...prev.states, newState],
      };
    });
  }, []);
  
  const deleteState = useCallback((id: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      // Remove o estado e todas as transições que apontam para ele
      const newStates = prev.states
        .filter((s) => s.id !== id)
        .map((s) => ({
          ...s,
          transitions: s.transitions.filter((t) => t.to !== id),
        }));
      
      return {
        ...prev,
        states: newStates,
        initialState: prev.initialState === id ? '' : prev.initialState,
      };
    });
    
    if (selectedStateId === id) {
      setSelectedStateId(null);
    }
  }, [selectedStateId]);
  
  const updateStateId = useCallback((oldId: string, newId: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      // Atualiza o ID do estado e todas as referências nas transições
      const newStates = prev.states.map((s) => {
        if (s.id === oldId) {
          return { ...s, id: newId };
        }
        return {
          ...s,
          transitions: s.transitions.map((t) => ({
            ...t,
            to: t.to === oldId ? newId : t.to,
          })),
        };
      });
      
      return {
        ...prev,
        states: newStates,
        initialState: prev.initialState === oldId ? newId : prev.initialState,
      };
    });
    
    if (selectedStateId === oldId) {
      setSelectedStateId(newId);
    }
  }, [selectedStateId]);
  
  const setInitialState = useCallback((stateId: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      return { ...prev, initialState: stateId };
    });
  }, []);
  
  const addAction = useCallback((
    stateId: string,
    eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave',
    action: ActionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            events: {
              ...s.events,
              [eventType]: [...s.events[eventType], action],
            },
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const updateAction = useCallback((
    stateId: string,
    eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave',
    index: number,
    action: ActionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          const newActions = [...s.events[eventType]];
          newActions[index] = action;
          return {
            ...s,
            events: {
              ...s.events,
              [eventType]: newActions,
            },
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const deleteAction = useCallback((
    stateId: string,
    eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave',
    index: number
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          const newActions = s.events[eventType].filter((_, i) => i !== index);
          return {
            ...s,
            events: {
              ...s.events,
              [eventType]: newActions,
            },
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const reorderActions = useCallback((
    stateId: string,
    eventType: 'beforeEnter' | 'onEnter' | 'onStay' | 'onLeave',
    fromIndex: number,
    toIndex: number
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          const newActions = [...s.events[eventType]];
          const [removed] = newActions.splice(fromIndex, 1);
          newActions.splice(toIndex, 0, removed);
          return {
            ...s,
            events: {
              ...s.events,
              [eventType]: newActions,
            },
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const addTransition = useCallback((fromStateId: string, toStateId: string): string => {
    const newTransitionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newTransition: Transition = {
        id: newTransitionId,
        to: toStateId,
        conditions: [],
        successActions: [],
        failureActions: [],
      };
      
      const newStates = prev.states.map((s) => {
        if (s.id === fromStateId) {
          return {
            ...s,
            transitions: [...s.transitions, newTransition],
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
    
    return newTransitionId;
  }, []);
  
  const deleteTransition = useCallback((stateId: string, transitionId: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.filter((t) => t.id !== transitionId),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
    
    if (selectedTransitionId === transitionId) {
      setSelectedTransitionId(null);
    }
  }, [selectedTransitionId]);
  
  const updateTransition = useCallback((
    stateId: string,
    transitionId: string,
    transition: Transition
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId ? transition : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const updateTransitionTarget = useCallback((
    stateId: string,
    transitionId: string,
    newTarget: string
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId ? { ...t, to: newTarget } : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const addCondition = useCallback((
    stateId: string,
    transitionId: string,
    condition: ConditionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId
                ? { ...t, conditions: [...t.conditions, condition] }
                : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const updateCondition = useCallback((
    stateId: string,
    transitionId: string,
    index: number,
    condition: ConditionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) => {
              if (t.id === transitionId) {
                const newConditions = [...t.conditions];
                newConditions[index] = condition;
                return { ...t, conditions: newConditions };
              }
              return t;
            }),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const deleteCondition = useCallback((
    stateId: string,
    transitionId: string,
    index: number
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId
                ? { ...t, conditions: t.conditions.filter((_, i) => i !== index) }
                : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const addTransitionAction = useCallback((
    stateId: string,
    transitionId: string,
    actionType: 'success' | 'failure',
    action: ActionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const field = actionType === 'success' ? 'successActions' : 'failureActions';
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId
                ? { ...t, [field]: [...t[field], action] }
                : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const updateTransitionAction = useCallback((
    stateId: string,
    transitionId: string,
    actionType: 'success' | 'failure',
    index: number,
    action: ActionElement
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const field = actionType === 'success' ? 'successActions' : 'failureActions';
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) => {
              if (t.id === transitionId) {
                const newActions = [...t[field]];
                newActions[index] = action;
                return { ...t, [field]: newActions };
              }
              return t;
            }),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const deleteTransitionAction = useCallback((
    stateId: string,
    transitionId: string,
    actionType: 'success' | 'failure',
    index: number
  ) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const field = actionType === 'success' ? 'successActions' : 'failureActions';
      
      const newStates = prev.states.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            transitions: s.transitions.map((t) =>
              t.id === transitionId
                ? { ...t, [field]: t[field].filter((_, i) => i !== index) }
                : t
            ),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const addIncomingTransition = useCallback((targetStateId: string, fromStateId: string) => {
    addTransition(fromStateId, targetStateId);
  }, [addTransition]);
  
  const removeIncomingTransition = useCallback((targetStateId: string, fromStateId: string) => {
    setStateMachine((prev) => {
      if (!prev) return prev;
      
      const newStates = prev.states.map((s) => {
        if (s.id === fromStateId) {
          return {
            ...s,
            transitions: s.transitions.filter((t) => t.to !== targetStateId),
          };
        }
        return s;
      });
      
      return { ...prev, states: newStates };
    });
  }, []);
  
  const getIncomingStates = useCallback((stateId: string): string[] => {
    if (!stateMachine) return [];
    
    const incomingStates: string[] = [];
    
    for (const state of stateMachine.states) {
      const hasTransitionToTarget = state.transitions.some((t) => t.to === stateId);
      if (hasTransitionToTarget) {
        incomingStates.push(state.id);
      }
    }
    
    return incomingStates;
  }, [stateMachine]);
  
  const selectState = useCallback((stateId: string | null) => {
    setSelectedStateId(stateId);
    setSelectedTransitionId(null);
  }, []);
  
  const selectTransition = useCallback((transitionId: string | null) => {
    setSelectedTransitionId(transitionId);
  }, []);
  
  const value: StateMachineContextType = {
    stateMachine,
    selectedStateId,
    selectedTransitionId,
    loadFromXML,
    exportToXML,
    createState,
    deleteState,
    updateStateId,
    setInitialState,
    addAction,
    updateAction,
    deleteAction,
    reorderActions,
    addTransition,
    deleteTransition,
    updateTransitionTarget,
    updateTransition,
    addCondition,
    updateCondition,
    deleteCondition,
    addTransitionAction,
    updateTransitionAction,
    deleteTransitionAction,
    addIncomingTransition,
    removeIncomingTransition,
    getIncomingStates,
    selectState,
    selectTransition,
  };
  
  return (
    <StateMachineContext.Provider value={value}>
      {children}
    </StateMachineContext.Provider>
  );
}

export function useStateMachine() {
  const context = useContext(StateMachineContext);
  if (!context) {
    throw new Error('useStateMachine must be used within StateMachineProvider');
  }
  return context;
}


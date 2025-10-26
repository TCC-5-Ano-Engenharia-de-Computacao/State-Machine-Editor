import type { StateMachine } from '../../../shared/types';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  stateId?: string;
  transitionId?: string;
}

export function validateStateMachine(stateMachine: StateMachine): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check if there are any states
  if (stateMachine.states.length === 0) {
    errors.push({
      type: 'error',
      message: 'State machine has no states',
    });
    return errors;
  }
  
  // Check if initial state exists
  if (!stateMachine.initialState) {
    errors.push({
      type: 'error',
      message: 'No initial state defined',
    });
  } else {
    const initialStateExists = stateMachine.states.some(
      (s) => s.id === stateMachine.initialState
    );
    if (!initialStateExists) {
      errors.push({
        type: 'error',
        message: `Initial state "${stateMachine.initialState}" does not exist`,
      });
    }
  }
  
  // Check for duplicate state IDs
  const stateIds = new Set<string>();
  for (const state of stateMachine.states) {
    if (stateIds.has(state.id)) {
      errors.push({
        type: 'error',
        message: `Duplicate state ID: "${state.id}"`,
        stateId: state.id,
      });
    }
    stateIds.add(state.id);
  }
  
  // Check each state
  for (const state of stateMachine.states) {
    // Check if state ID is empty
    if (!state.id || state.id.trim() === '') {
      errors.push({
        type: 'error',
        message: 'State has empty ID',
        stateId: state.id,
      });
    }
    
    // Check transitions
    for (const transition of state.transitions) {
      // Check if target state exists
      const targetExists = stateMachine.states.some((s) => s.id === transition.to);
      if (!targetExists) {
        errors.push({
          type: 'error',
          message: `Transition from "${state.id}" to non-existent state "${transition.to}"`,
          stateId: state.id,
          transitionId: transition.id,
        });
      }
      
      // Check if transition has at least one condition
      if (transition.conditions.length === 0) {
        errors.push({
          type: 'warning',
          message: `Transition from "${state.id}" to "${transition.to}" has no conditions (will always trigger)`,
          stateId: state.id,
          transitionId: transition.id,
        });
      }
      
      // Check for empty condition names
      for (const condition of transition.conditions) {
        if (!condition.name || condition.name.trim() === '') {
          errors.push({
            type: 'error',
            message: `Transition from "${state.id}" to "${transition.to}" has a condition with empty name`,
            stateId: state.id,
            transitionId: transition.id,
          });
        }
      }
      
      // Check for empty action names in success actions
      for (const action of transition.successActions) {
        if (!action.name || action.name.trim() === '') {
          errors.push({
            type: 'error',
            message: `Transition from "${state.id}" to "${transition.to}" has a success action with empty name`,
            stateId: state.id,
            transitionId: transition.id,
          });
        }
      }
      
      // Check for empty action names in failure actions
      for (const action of transition.failureActions) {
        if (!action.name || action.name.trim() === '') {
          errors.push({
            type: 'error',
            message: `Transition from "${state.id}" to "${transition.to}" has a failure action with empty name`,
            stateId: state.id,
            transitionId: transition.id,
          });
        }
      }
    }
    
    // Check state events for empty action names
    const eventTypes = ['beforeEnter', 'onEnter', 'onStay', 'onLeave'] as const;
    for (const eventType of eventTypes) {
      for (const action of state.events[eventType]) {
        if (!action.name || action.name.trim() === '') {
          errors.push({
            type: 'error',
            message: `State "${state.id}" has an action with empty name in ${eventType} event`,
            stateId: state.id,
          });
        }
      }
    }
    
    // Warning: State with no outgoing transitions (except if it's a terminal state)
    if (state.transitions.length === 0) {
      errors.push({
        type: 'warning',
        message: `State "${state.id}" has no outgoing transitions (terminal state)`,
        stateId: state.id,
      });
    }
  }
  
  // Check for unreachable states (states with no incoming transitions and not initial)
  for (const state of stateMachine.states) {
    if (state.id === stateMachine.initialState) continue;
    
    const hasIncoming = stateMachine.states.some((s) =>
      s.transitions.some((t) => t.to === state.id)
    );
    
    if (!hasIncoming) {
      errors.push({
        type: 'warning',
        message: `State "${state.id}" is unreachable (no incoming transitions)`,
        stateId: state.id,
      });
    }
  }
  
  return errors;
}


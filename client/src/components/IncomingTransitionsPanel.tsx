import React, { useState, useMemo } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import ActionEditor from './ActionEditor';
import ConditionEditor from './ConditionEditor';
import { Trash2, Plus } from 'lucide-react';
import type { ActionElement, ConditionElement } from '../../../shared/types';

export default function IncomingTransitionsPanel() {
  const {
    stateMachine,
    selectedStateId,
    addTransition,
    deleteTransition,
    addCondition,
    updateCondition,
    deleteCondition,
    addTransitionAction,
    updateTransitionAction,
    deleteTransitionAction,
  } = useStateMachine();

  const [selectedFromStateId, setSelectedFromStateId] = useState<string>('');
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>('');

  if (!stateMachine || !selectedStateId) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>Select a state to manage incoming transitions</p>
        </div>
      </div>
    );
  }

  const selectedState = stateMachine.states.find((s) => s.id === selectedStateId);
  if (!selectedState) return null;

  const availableStates = stateMachine.states.filter((s) => s.id !== selectedStateId);

  // Get states that have transitions to the selected state
  const incomingStates = useMemo(() => {
    return stateMachine.states
      .filter((state) => {
        if (state.id === selectedStateId) return false;
        return state.transitions.some((t) => t.to === selectedStateId);
      })
      .map((state) => state.id);
  }, [stateMachine, selectedStateId]);

  const handleToggleIncoming = (fromStateId: string, checked: boolean) => {
    const fromState = stateMachine.states.find((s) => s.id === fromStateId);
    if (!fromState) return;

    if (checked) {
      // Add transition from that state to current state
      const newId = addTransition(fromStateId, selectedStateId);
      setSelectedFromStateId(fromStateId);
      setSelectedTransitionId(newId);
    } else {
      // Remove all transitions from that state to current state
      const transitionsToRemove = fromState.transitions.filter(
        (t) => t.to === selectedStateId
      );
      transitionsToRemove.forEach((transition) => {
        deleteTransition(fromStateId, transition.id);
      });
      
      // Clear selection if we deleted the selected transition
      if (selectedFromStateId === fromStateId) {
        setSelectedFromStateId('');
        setSelectedTransitionId('');
      }
    }
  };

  const handleAddTransition = () => {
    if (!selectedFromStateId) return;
    const newId = addTransition(selectedFromStateId, selectedStateId);
    setSelectedTransitionId(newId);
  };

  // Get transitions from selected source state to current state
  const incomingTransitions = useMemo(() => {
    if (!selectedFromStateId) return [];
    const fromState = stateMachine.states.find((s) => s.id === selectedFromStateId);
    if (!fromState) return [];
    return fromState.transitions.filter((t) => t.to === selectedStateId);
  }, [stateMachine, selectedFromStateId, selectedStateId]);

  const selectedTransition = useMemo(() => {
    if (!selectedFromStateId || !selectedTransitionId) return null;
    const fromState = stateMachine.states.find((s) => s.id === selectedFromStateId);
    if (!fromState) return null;
    return fromState.transitions.find((t) => t.id === selectedTransitionId);
  }, [stateMachine, selectedFromStateId, selectedTransitionId]);

  const handleDeleteTransition = () => {
    if (selectedFromStateId && selectedTransitionId && confirm('Delete this transition?')) {
      deleteTransition(selectedFromStateId, selectedTransitionId);
      
      // Check if there are still transitions from this state
      const fromState = stateMachine.states.find((s) => s.id === selectedFromStateId);
      const remainingTransitions = fromState?.transitions.filter((t) => t.to === selectedStateId && t.id !== selectedTransitionId);
      
      if (remainingTransitions && remainingTransitions.length > 0) {
        // Select the first remaining transition
        setSelectedTransitionId(remainingTransitions[0].id);
      } else {
        // No more transitions, clear selection
        setSelectedTransitionId('');
        setSelectedFromStateId('');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* States that can transition here */}
        <div>
          <Label className="mb-3 block font-semibold">
            States that can transition to "{selectedStateId}"
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Check states to allow them to transition to this state
          </p>
          <div className="space-y-2 max-h-[300px] overflow-auto border rounded-md p-3">
            {availableStates.map((state) => {
              const isIncoming = incomingStates.includes(state.id);
              const transitionCount = isIncoming
                ? stateMachine.states
                    .find((s) => s.id === state.id)
                    ?.transitions.filter((t) => t.to === selectedStateId).length || 0
                : 0;
              
              return (
                <div key={state.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`incoming-${state.id}`}
                      checked={isIncoming}
                      onCheckedChange={(checked) =>
                        handleToggleIncoming(state.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`incoming-${state.id}`}
                      className="font-mono text-sm cursor-pointer"
                    >
                      {state.id}
                    </Label>
                  </div>
                  {isIncoming && (
                    <span className="text-xs text-muted-foreground">
                      {transitionCount} transition(s)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Select source state */}
        {incomingStates.length > 0 && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="mb-2 block">Select Source State</Label>
                <Select value={selectedFromStateId} onValueChange={(value) => {
                  setSelectedFromStateId(value);
                  setSelectedTransitionId('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {incomingStates.map((stateId) => (
                      <SelectItem key={stateId} value={stateId}>
                        {stateId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  size="default"
                  onClick={handleAddTransition}
                  disabled={!selectedFromStateId}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transition
                </Button>
              </div>
            </div>

            {/* Select transition from that state */}
            {selectedFromStateId && incomingTransitions.length > 0 && (
              <div>
                <Label className="mb-2 block">Select Transition</Label>
                <Select value={selectedTransitionId} onValueChange={setSelectedTransitionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a transition" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {incomingTransitions.map((transition) => (
                      <SelectItem key={transition.id} value={transition.id}>
                        {selectedFromStateId} → {transition.to} ({transition.conditions.length} condition(s))
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Transition Editor */}
            {selectedTransition && selectedFromStateId ? (
              <div className="space-y-4">
                {/* Delete Button */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteTransition}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Transition
                  </Button>
                </div>

                <Separator />

                {/* Conditions */}
                <div>
                  <Label className="mb-2 block font-semibold">Conditions</Label>
                  <ConditionEditor
                    conditions={selectedTransition.conditions}
                    onAdd={(condition: ConditionElement) =>
                      addCondition(selectedFromStateId, selectedTransition.id, condition)
                    }
                    onUpdate={(index: number, condition: ConditionElement) =>
                      updateCondition(selectedFromStateId, selectedTransition.id, index, condition)
                    }
                    onDelete={(index: number) =>
                      deleteCondition(selectedFromStateId, selectedTransition.id, index)
                    }
                  />
                </div>

                <Separator />

                {/* Success Actions */}
                <div>
                  <Label className="mb-2 block font-semibold">Success Actions</Label>
                  <ActionEditor
                    actions={selectedTransition.successActions}
                    onAdd={(action: ActionElement) =>
                      addTransitionAction(selectedFromStateId, selectedTransition.id, 'success', action)
                    }
                    onUpdate={(index: number, action: ActionElement) =>
                      updateTransitionAction(selectedFromStateId, selectedTransition.id, 'success', index, action)
                    }
                    onDelete={(index: number) =>
                      deleteTransitionAction(selectedFromStateId, selectedTransition.id, 'success', index)
                    }
                  />
                </div>

                <Separator />

                {/* Failure Actions */}
                <div>
                  <Label className="mb-2 block font-semibold">Failure Actions</Label>
                  <ActionEditor
                    actions={selectedTransition.failureActions}
                    onAdd={(action: ActionElement) =>
                      addTransitionAction(selectedFromStateId, selectedTransition.id, 'failure', action)
                    }
                    onUpdate={(index: number, action: ActionElement) =>
                      updateTransitionAction(selectedFromStateId, selectedTransition.id, 'failure', index, action)
                    }
                    onDelete={(index: number) =>
                      deleteTransitionAction(selectedFromStateId, selectedTransition.id, 'failure', index)
                    }
                  />
                </div>
              </div>
            ) : selectedFromStateId ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Select a transition to edit</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Select a source state to view its transitions</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


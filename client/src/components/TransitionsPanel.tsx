import React, { useState } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import ActionEditor from './ActionEditor';
import ConditionEditor from './ConditionEditor';
import { Plus, Trash2 } from 'lucide-react';
import type { ActionElement, ConditionElement } from '../../../shared/types';

export default function TransitionsPanel() {
  const {
    stateMachine,
    selectedStateId,
    addTransition,
    deleteTransition,
    updateTransition,
    addCondition,
    updateCondition,
    deleteCondition,
    addTransitionAction,
    updateTransitionAction,
    deleteTransitionAction,
  } = useStateMachine();

  const [selectedTransitionId, setSelectedTransitionId] = useState<string>('');
  const [newTransitionTarget, setNewTransitionTarget] = useState('');

  if (!stateMachine || !selectedStateId) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>Select a state to manage transitions</p>
        </div>
      </div>
    );
  }

  const selectedState = stateMachine.states.find((s) => s.id === selectedStateId);
  if (!selectedState) return null;

  const availableStates = stateMachine.states.filter((s) => s.id !== selectedStateId);
  
  const selectedTransition = selectedState.transitions.find(
    (t) => t.id === selectedTransitionId
  );

  const handleAddTransition = () => {
    if (newTransitionTarget) {
      const newId = addTransition(selectedStateId, newTransitionTarget);
      setNewTransitionTarget('');
      setSelectedTransitionId(newId);
    }
  };

  const handleDeleteTransition = () => {
    if (selectedTransitionId && confirm('Delete this transition?')) {
      deleteTransition(selectedStateId, selectedTransitionId);
      setSelectedTransitionId('');
    }
  };



  return (
    <div className="w-full h-full flex flex-col">
      {/* Add New Transition */}
      <div className="p-4 border-b flex-shrink-0">
        <Label className="mb-2 block">Add New Transition</Label>
        <div className="flex gap-2">
          <Select value={newTransitionTarget} onValueChange={setNewTransitionTarget}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select target state" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableStates.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAddTransition}
            disabled={!newTransitionTarget}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Select Transition to Edit */}
      <div className="p-4 border-b flex-shrink-0">
        <Label className="mb-2 block">Select Transition to Edit</Label>
        <Select value={selectedTransitionId} onValueChange={setSelectedTransitionId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a transition" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {selectedState.transitions.map((transition) => (
              <SelectItem key={transition.id} value={transition.id}>
                → {transition.to} ({transition.conditions.length} condition(s))
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transition Editor */}
      <ScrollArea className="flex-1 min-h-0">
        {selectedTransition ? (
          <div className="p-4 space-y-4">
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

            {/* Target State */}
            <div>
              <Label className="mb-2 block">Target State</Label>
              <Select
                value={selectedTransition.to}
                onValueChange={(newTarget) => {
                  updateTransition(selectedStateId, selectedTransition.id, {
                    ...selectedTransition,
                    to: newTarget,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableStates.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Conditions */}
            <div>
              <Label className="mb-2 block font-semibold">Conditions</Label>
              <ConditionEditor
                conditions={selectedTransition.conditions}
                onAdd={(condition: ConditionElement) =>
                  addCondition(selectedStateId, selectedTransition.id, condition)
                }
                onUpdate={(index: number, condition: ConditionElement) =>
                  updateCondition(selectedStateId, selectedTransition.id, index, condition)
                }
                onDelete={(index: number) =>
                  deleteCondition(selectedStateId, selectedTransition.id, index)
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
                  addTransitionAction(selectedStateId, selectedTransition.id, 'success', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateTransitionAction(selectedStateId, selectedTransition.id, 'success', index, action)
                }
                onDelete={(index: number) =>
                  deleteTransitionAction(selectedStateId, selectedTransition.id, 'success', index)
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
                  addTransitionAction(selectedStateId, selectedTransition.id, 'failure', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateTransitionAction(selectedStateId, selectedTransition.id, 'failure', index, action)
                }
                onDelete={(index: number) =>
                  deleteTransitionAction(selectedStateId, selectedTransition.id, 'failure', index)
                }
              />
            </div>


          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a transition to edit</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}


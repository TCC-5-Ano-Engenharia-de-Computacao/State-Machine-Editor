import React, { useState } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ActionEditor from './ActionEditor';
import ConditionEditor from './ConditionEditor';
import { Trash2, Star } from 'lucide-react';
import type { ActionElement, ConditionElement } from '../../../shared/types';

export default function PropertiesPanel() {
  const {
    stateMachine,
    selectedStateId,
    deleteState,
    updateStateId,
    setInitialState,
    addAction,
    updateAction,
    deleteAction,
    reorderActions,
  } = useStateMachine();
  
  const [editingStateId, setEditingStateId] = useState(false);
  const [newStateId, setNewStateId] = useState('');
  
  if (!stateMachine) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>No state machine loaded</p>
        </div>
      </div>
    );
  }
  
  if (!selectedStateId) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>Select a state to edit its properties</p>
        </div>
      </div>
    );
  }
  
  const selectedState = stateMachine.states.find((s) => s.id === selectedStateId);
  
  if (!selectedState) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>State not found</p>
        </div>
      </div>
    );
  }
  
  const isInitial = stateMachine.initialState === selectedStateId;
  
  const handleUpdateStateId = () => {
    if (newStateId.trim() && newStateId !== selectedStateId) {
      updateStateId(selectedStateId, newStateId.trim());
      setEditingStateId(false);
    }
  };
  
  const handleDeleteState = () => {
    if (confirm(`Are you sure you want to delete state "${selectedStateId}"?`)) {
      deleteState(selectedStateId);
    }
  };
  
  const handleSetInitial = () => {
    setInitialState(selectedStateId);
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>State ID</Label>
            <div className="flex gap-1">
              {isInitial && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <Star className="w-3 h-3 fill-green-600" />
                  Initial
                </div>
              )}
            </div>
          </div>
          
          {editingStateId ? (
            <div className="flex gap-2">
              <Input
                value={newStateId}
                onChange={(e) => setNewStateId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateStateId();
                  if (e.key === 'Escape') setEditingStateId(false);
                }}
                className="font-mono"
                autoFocus
              />
              <Button size="sm" onClick={handleUpdateStateId}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingStateId(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div
                className="flex-1 font-mono text-sm font-semibold px-3 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                onClick={() => {
                  setEditingStateId(true);
                  setNewStateId(selectedStateId);
                }}
              >
                {selectedStateId}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {!isInitial && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSetInitial}
                className="flex-1"
              >
                <Star className="w-4 h-4 mr-1" />
                Set as Initial
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteState}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete State
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          <Tabs defaultValue="beforeEnter" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="beforeEnter" className="text-xs">
                BeforeEnter
              </TabsTrigger>
              <TabsTrigger value="onEnter" className="text-xs">
                OnEnter
              </TabsTrigger>
              <TabsTrigger value="onStay" className="text-xs">
                OnStay
              </TabsTrigger>
              <TabsTrigger value="onLeave" className="text-xs">
                OnLeave
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="beforeEnter" className="mt-4">
              <ActionEditor
                actions={selectedState.events.beforeEnter}
                onAdd={(action: ActionElement) =>
                  addAction(selectedStateId, 'beforeEnter', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateAction(selectedStateId, 'beforeEnter', index, action)
                }
                onDelete={(index: number) =>
                  deleteAction(selectedStateId, 'beforeEnter', index)
                }
                onReorder={(from: number, to: number) =>
                  reorderActions(selectedStateId, 'beforeEnter', from, to)
                }
              />
            </TabsContent>
            
            <TabsContent value="onEnter" className="mt-4">
              <ActionEditor
                actions={selectedState.events.onEnter}
                onAdd={(action: ActionElement) =>
                  addAction(selectedStateId, 'onEnter', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateAction(selectedStateId, 'onEnter', index, action)
                }
                onDelete={(index: number) =>
                  deleteAction(selectedStateId, 'onEnter', index)
                }
                onReorder={(from: number, to: number) =>
                  reorderActions(selectedStateId, 'onEnter', from, to)
                }
              />
            </TabsContent>
            
            <TabsContent value="onStay" className="mt-4">
              <ActionEditor
                actions={selectedState.events.onStay}
                onAdd={(action: ActionElement) =>
                  addAction(selectedStateId, 'onStay', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateAction(selectedStateId, 'onStay', index, action)
                }
                onDelete={(index: number) =>
                  deleteAction(selectedStateId, 'onStay', index)
                }
                onReorder={(from: number, to: number) =>
                  reorderActions(selectedStateId, 'onStay', from, to)
                }
              />
            </TabsContent>
            
            <TabsContent value="onLeave" className="mt-4">
              <ActionEditor
                actions={selectedState.events.onLeave}
                onAdd={(action: ActionElement) =>
                  addAction(selectedStateId, 'onLeave', action)
                }
                onUpdate={(index: number, action: ActionElement) =>
                  updateAction(selectedStateId, 'onLeave', index, action)
                }
                onDelete={(index: number) =>
                  deleteAction(selectedStateId, 'onLeave', index)
                }
                onReorder={(from: number, to: number) =>
                  reorderActions(selectedStateId, 'onLeave', from, to)
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}


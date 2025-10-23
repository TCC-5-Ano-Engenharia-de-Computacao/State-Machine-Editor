import React, { useState } from 'react';
import { ActionElement } from '../../../shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, GripVertical, Edit2, Check, X } from 'lucide-react';
import { useIndex } from '@/contexts/IndexContext';

interface ActionEditorProps {
  actions: ActionElement[];
  onAdd: (action: ActionElement) => void;
  onUpdate: (index: number, action: ActionElement) => void;
  onDelete: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function ActionEditor({
  actions,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: ActionEditorProps) {
  const { getActionSuggestions, getAttributeSuggestions, getAttributeValueSuggestions } = useIndex();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingAction, setEditingAction] = useState<ActionElement | null>(null);
  const [newActionName, setNewActionName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  
  const actionSuggestions = getActionSuggestions();
  
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingAction({ ...actions[index] });
  };
  
  const saveEdit = () => {
    if (editingIndex !== null && editingAction) {
      onUpdate(editingIndex, editingAction);
      setEditingIndex(null);
      setEditingAction(null);
    }
  };
  
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingAction(null);
  };
  
  const addNewAction = () => {
    if (newActionName.trim()) {
      onAdd({
        name: newActionName.trim(),
        attributes: {},
      });
      setNewActionName('');
      setShowAddForm(false);
    }
  };
  
  const updateAttribute = (key: string, value: string) => {
    if (editingAction) {
      const newAttributes = { ...editingAction.attributes };
      if (value.trim() === '') {
        delete newAttributes[key];
      } else {
        newAttributes[key] = value;
      }
      setEditingAction({ ...editingAction, attributes: newAttributes });
    }
  };
  
  const addAttribute = (key: string) => {
    if (editingAction && key.trim()) {
      setEditingAction({
        ...editingAction,
        attributes: { ...editingAction.attributes, [key.trim()]: '' },
      });
      setNewAttrKey('');
    }
  };
  
  const removeAttribute = (key: string) => {
    if (editingAction) {
      const newAttributes = { ...editingAction.attributes };
      delete newAttributes[key];
      setEditingAction({ ...editingAction, attributes: newAttributes });
    }
  };
  
  const attributeSuggestions = editingAction
    ? getAttributeSuggestions('action', editingAction.name)
    : [];
  
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <Card key={index} className="p-3">
          {editingIndex === index && editingAction ? (
            <div className="space-y-3">
              <div>
                <Label>Action Type</Label>
                {actionSuggestions.length > 0 ? (
                  <Select
                    value={editingAction.name}
                    onValueChange={(value) =>
                      setEditingAction({ ...editingAction, name: value })
                    }
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {actionSuggestions.map((name) => (
                        <SelectItem key={name} value={name} className="font-mono text-sm">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editingAction.name}
                    onChange={(e) =>
                      setEditingAction({ ...editingAction, name: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                )}
              </div>
              
              <div>
                <Label className="mb-2 block">Attributes</Label>
                <div className="space-y-2">
                  {Object.entries(editingAction.attributes).map(([key, value]) => {
                    const valueSuggestions = getAttributeValueSuggestions('action', editingAction.name, key);
                    return (
                      <div key={key} className="flex gap-2">
                        <Input
                          value={key}
                          disabled
                          className="flex-1 font-mono text-xs"
                          placeholder="key"
                        />
                        {valueSuggestions.length > 0 ? (
                          <Select
                            value={value}
                            onValueChange={(newValue) => updateAttribute(key, newValue)}
                          >
                            <SelectTrigger className="flex-1 font-mono text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {valueSuggestions.map((val) => (
                                <SelectItem key={val} value={val} className="font-mono text-xs">
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => updateAttribute(key, e.target.value)}
                            className="flex-1 font-mono text-xs"
                            placeholder="value"
                          />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttribute(key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex gap-2">
                    {attributeSuggestions.length > 0 ? (
                      <Select value={newAttrKey} onValueChange={setNewAttrKey}>
                        <SelectTrigger className="flex-1 font-mono text-xs">
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {attributeSuggestions.map((attr) => (
                            <SelectItem key={attr} value={attr} className="font-mono text-xs">
                              {attr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={newAttrKey}
                        onChange={(e) => setNewAttrKey(e.target.value)}
                        placeholder="new attribute name"
                        className="flex-1 font-mono text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAttrKey.trim()) {
                            addAttribute(newAttrKey);
                          }
                        }}
                      />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addAttribute(newAttrKey)}
                      disabled={!newAttrKey.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              {onReorder && (
                <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-move" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-semibold text-foreground">
                  {action.name}
                </div>
                {Object.keys(action.attributes).length > 0 && (
                  <div className="mt-1 space-y-1">
                    {Object.entries(action.attributes).map(([key, value]) => (
                      <div key={key} className="font-mono text-xs text-muted-foreground">
                        <span className="text-primary">{key}</span>={'"'}
                        <span className="text-foreground">{value}</span>
                        {'"'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(index)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
      
      {showAddForm ? (
        <Card className="p-3">
          <div className="space-y-2">
            <Label>New Action Type</Label>
            {actionSuggestions.length > 0 ? (
              <Select value={newActionName} onValueChange={setNewActionName}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {actionSuggestions.map((name) => (
                    <SelectItem key={name} value={name} className="font-mono text-sm">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)}
                placeholder="e.g., PlayAnimationClipAction"
                className="font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNewAction();
                  if (e.key === 'Escape') setShowAddForm(false);
                }}
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={addNewAction} disabled={!newActionName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Action
        </Button>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { ConditionElement } from '../../../shared/types';
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
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { useIndex } from '@/contexts/IndexContext';

interface ConditionEditorProps {
  conditions: ConditionElement[];
  onAdd: (condition: ConditionElement) => void;
  onUpdate: (index: number, condition: ConditionElement) => void;
  onDelete: (index: number) => void;
}

export default function ConditionEditor({
  conditions,
  onAdd,
  onUpdate,
  onDelete,
}: ConditionEditorProps) {
  const { getConditionSuggestions, getAttributeSuggestions, getAttributeValueSuggestions } = useIndex();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingCondition, setEditingCondition] = useState<ConditionElement | null>(null);
  const [newConditionName, setNewConditionName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  
  const conditionSuggestions = getConditionSuggestions();
  
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingCondition({ ...conditions[index] });
  };
  
  const saveEdit = () => {
    if (editingIndex !== null && editingCondition) {
      onUpdate(editingIndex, editingCondition);
      setEditingIndex(null);
      setEditingCondition(null);
    }
  };
  
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingCondition(null);
  };
  
  const addNewCondition = () => {
    if (newConditionName.trim()) {
      onAdd({
        name: newConditionName.trim(),
        attributes: {},
      });
      setNewConditionName('');
      setShowAddForm(false);
    }
  };
  
  const updateAttribute = (key: string, value: string) => {
    if (editingCondition) {
      const newAttributes = { ...editingCondition.attributes };
      if (value.trim() === '') {
        delete newAttributes[key];
      } else {
        newAttributes[key] = value;
      }
      setEditingCondition({ ...editingCondition, attributes: newAttributes });
    }
  };
  
  const addAttribute = (key: string) => {
    if (editingCondition && key.trim()) {
      setEditingCondition({
        ...editingCondition,
        attributes: { ...editingCondition.attributes, [key.trim()]: '' },
      });
      setNewAttrKey('');
    }
  };
  
  const removeAttribute = (key: string) => {
    if (editingCondition) {
      const newAttributes = { ...editingCondition.attributes };
      delete newAttributes[key];
      setEditingCondition({ ...editingCondition, attributes: newAttributes });
    }
  };
  
  const attributeSuggestions = editingCondition
    ? getAttributeSuggestions('condition', editingCondition.name)
    : [];
  
  return (
    <div className="space-y-2">
      {conditions.length === 0 && !showAddForm && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No conditions. Add one to get started.
        </div>
      )}
      
      {conditions.map((condition, index) => (
        <Card key={index} className="p-3">
          {editingIndex === index && editingCondition ? (
            <div className="space-y-3">
              <div>
                <Label>Condition Type</Label>
                {conditionSuggestions.length > 0 ? (
                  <Select
                    value={editingCondition.name}
                    onValueChange={(value) =>
                      setEditingCondition({ ...editingCondition, name: value })
                    }
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {conditionSuggestions.map((name) => (
                        <SelectItem key={name} value={name} className="font-mono text-sm">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editingCondition.name}
                    onChange={(e) =>
                      setEditingCondition({ ...editingCondition, name: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                )}
              </div>
              
              <div>
                <Label className="mb-2 block">Attributes</Label>
                <div className="space-y-2">
                  {Object.entries(editingCondition.attributes).map(([key, value]) => {
                    const valueSuggestions = getAttributeValueSuggestions('condition', editingCondition.name, key);
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
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-semibold text-foreground">
                  {condition.name}
                </div>
                {Object.keys(condition.attributes).length > 0 && (
                  <div className="mt-1 space-y-1">
                    {Object.entries(condition.attributes).map(([key, value]) => (
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
            <Label>New Condition Type</Label>
            {conditionSuggestions.length > 0 ? (
              <Select value={newConditionName} onValueChange={setNewConditionName}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {conditionSuggestions.map((name) => (
                    <SelectItem key={name} value={name} className="font-mono text-sm">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newConditionName}
                onChange={(e) => setNewConditionName(e.target.value)}
                placeholder="e.g., CheckTieCondition"
                className="font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNewCondition();
                  if (e.key === 'Escape') setShowAddForm(false);
                }}
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={addNewCondition} disabled={!newConditionName.trim()}>
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
          Add Condition
        </Button>
      )}
    </div>
  );
}


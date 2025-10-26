import React, { useState, useMemo } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, ArrowRight, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StateListView() {
  const { stateMachine, selectedStateId, selectState } = useStateMachine();
  const [searchQuery, setSearchQuery] = useState('');

  if (!stateMachine) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>No state machine loaded</p>
        </div>
      </div>
    );
  }

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return stateMachine.states;
    const query = searchQuery.toLowerCase();
    return stateMachine.states.filter(state => 
      state.id.toLowerCase().includes(query)
    );
  }, [stateMachine.states, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1  overflow-y-auto">
        <div className="px-4 pb-4 space-y-2">
          {filteredStates.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No states found</p>
            </div>
          ) : (
            filteredStates.map((state) => {
          const isInitial = stateMachine.initialState === state.id;
          const isSelected = selectedStateId === state.id;
          
          return (
            <Card
              key={state.id}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
              }`}
              onClick={() => selectState(state.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isInitial && (
                    <Star className="w-4 h-4 fill-green-600 text-green-600" />
                  )}
                  <span className="font-mono font-semibold">{state.id}</span>
                </div>
                {isInitial && (
                  <Badge variant="secondary" className="text-xs">
                    Initial
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>{state.transitions.length} transition(s)</span>
                </div>
                
                {state.transitions.length > 0 && (
                  <div className="ml-5 text-xs">
                    → {state.transitions.map(t => t.to).join(', ')}
                  </div>
                )}
              </div>
            </Card>
          );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


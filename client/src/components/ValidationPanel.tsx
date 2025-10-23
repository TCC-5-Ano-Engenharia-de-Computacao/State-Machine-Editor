import React, { useMemo } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { validateStateMachine, ValidationError } from '@/lib/validator';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ValidationPanel() {
  const { stateMachine, selectState } = useStateMachine();
  
  const validationErrors = useMemo(() => {
    if (!stateMachine) return [];
    return validateStateMachine(stateMachine);
  }, [stateMachine]);
  
  const errorCount = validationErrors.filter((e) => e.type === 'error').length;
  const warningCount = validationErrors.filter((e) => e.type === 'warning').length;
  
  if (!stateMachine) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>No state machine loaded</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">Validation</h3>
        <div className="flex gap-2">
          <Badge variant={errorCount > 0 ? 'destructive' : 'secondary'}>
            {errorCount} Error{errorCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant={warningCount > 0 ? 'default' : 'secondary'}>
            {warningCount} Warning{warningCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {validationErrors.length === 0 ? (
            <Card className="p-4 flex items-center gap-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  No issues found
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Your state machine is valid
                </div>
              </div>
            </Card>
          ) : (
            validationErrors.map((error, index) => (
              <Card
                key={index}
                className={`p-3 cursor-pointer transition-colors ${
                  error.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900'
                    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                }`}
                onClick={() => {
                  if (error.stateId) {
                    selectState(error.stateId);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {error.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${
                        error.type === 'error'
                          ? 'text-red-900 dark:text-red-100'
                          : 'text-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      {error.message}
                    </div>
                    {error.stateId && (
                      <div
                        className={`text-xs mt-1 font-mono ${
                          error.type === 'error'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}
                      >
                        State: {error.stateId}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


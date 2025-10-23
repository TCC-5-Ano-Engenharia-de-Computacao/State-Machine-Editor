import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Circle, GitBranch, Zap } from 'lucide-react';

interface StateNodeData {
  label: string;
  isInitial: boolean;
  transitionCount: number;
  eventCount: number;
  isDimmed?: boolean;
  handles?: {
    id: string;
    type: 'source' | 'target';
    position: Position;
  }[];
}

export default function StateNode({ data, selected }: NodeProps<StateNodeData>) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-card shadow-md min-w-[180px]
        transition-all duration-200
        ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
        ${data.isInitial ? 'ring-2 ring-green-500/50' : ''}
      `}
    >
      {/* Renderizar handles dinâmicos */}
      {data.handles?.map((handle) => {
        // Agrupar handles por posição e tipo
        const handlesAtPosition = data.handles!.filter(
          h => h.position === handle.position && h.type === handle.type
        );
        const indexAtPosition = handlesAtPosition.findIndex(h => h.id === handle.id);
        const countAtPosition = handlesAtPosition.length;
        
        // Calcular offset baseado no índice
        let style: React.CSSProperties = {};
        
        if (handle.position === Position.Top || handle.position === Position.Bottom) {
          // Distribuir horizontalmente
          const offset = countAtPosition > 1
            ? (indexAtPosition / (countAtPosition - 1)) * 80 - 40
            : 0;
          style = { left: `calc(50% + ${offset}px)` };
        } else {
          // Distribuir verticalmente
          const offset = countAtPosition > 1
            ? (indexAtPosition / (countAtPosition - 1)) * 60 - 30
            : 0;
          style = { top: `calc(50% + ${offset}px)` };
        }
        
        return (
          <Handle
            key={handle.id}
            type={handle.type}
            id={handle.id}
            position={handle.position}
            style={style}
            className="w-2 h-2 !bg-primary"
          />
        );
      })}
      
      {/* Handles padrão se não houver handles customizados */}
      {!data.handles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 !bg-primary"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 !bg-primary"
          />
        </>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {data.isInitial && (
            <Circle className="w-3 h-3 fill-green-500 text-green-500" />
          )}
          <div className="font-semibold text-sm text-foreground truncate">
            {data.label}
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{data.eventCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span>{data.transitionCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


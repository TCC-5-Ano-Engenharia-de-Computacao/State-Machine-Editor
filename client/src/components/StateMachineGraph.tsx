import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
  Position,
  ConnectionMode,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStateMachine } from '@/contexts/StateMachineContext';
import StateNode from './StateNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generateColorFromString } from '@/lib/colorGenerator';
import { calculateHandlePosition, getOppositePosition } from '@/lib/handlePositioning';

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

export default function StateMachineGraph() {
  const { stateMachine, selectedStateId, selectState, addTransition } = useStateMachine();
  const [filterStateId, setFilterStateId] = React.useState<string>('all');
  
  // Calcular estados conectados baseado no filtro
  const connectedStateIds = useMemo(() => {
    if (!stateMachine) return new Set<string>();
    
    // Se filtro é 'all', mostrar todos
    if (filterStateId === 'all') {
      return new Set(stateMachine.states.map(s => s.id));
    }
    
    // Caso contrário, mostrar apenas o estado filtrado e seus conectados
    const connected = new Set<string>();
    connected.add(filterStateId);
    
    // Adicionar estados com transições de saída do estado filtrado
    const filteredState = stateMachine.states.find((s) => s.id === filterStateId);
    if (filteredState) {
      for (const transition of filteredState.transitions) {
        connected.add(transition.to);
      }
    }
    
    // Adicionar estados com transições de entrada para o estado filtrado
    for (const state of stateMachine.states) {
      const hasTransitionToFiltered = state.transitions.some(
        (t) => t.to === filterStateId
      );
      if (hasTransitionToFiltered) {
        connected.add(state.id);
      }
    }
    
    return connected;
  }, [stateMachine, filterStateId]);
  
  // Converter estados para nós do ReactFlow (apenas estados visíveis no filtro)
  const initialNodes = useMemo(() => {
    if (!stateMachine) return [];
    
    // Filtrar apenas estados que devem ser visíveis
    const visibleStates = stateMachine.states.filter(state => 
      connectedStateIds.has(state.id)
    );
    
    // Calcular peso de cada estado (número de conexões)
    const stateWeights = new Map<string, number>();
    for (const state of visibleStates) {
      let weight = state.transitions.length; // Conexões de saída
      
      // Contar conexões de entrada
      for (const otherState of visibleStates) {
        weight += otherState.transitions.filter(t => t.to === state.id).length;
      }
      
      stateWeights.set(state.id, weight);
    }
    
    // Ordenar estados por peso (mais conectados primeiro)
    const sortedStates = [...visibleStates].sort((a, b) => {
      const weightA = stateWeights.get(a.id) || 0;
      const weightB = stateWeights.get(b.id) || 0;
      return weightB - weightA;
    });
    
    // Criar mapa de posições dos estados para cálculo de handles
    const statePositions = new Map<string, { x: number, y: number }>();
    
    // Primeiro, calcular posições de todos os estados
    sortedStates.forEach((state, index) => {
      let x: number, y: number;
      
      if (index === 0) {
        x = 0;
        y = 0;
      } else {
        const weight = stateWeights.get(state.id) || 0;
        const maxWeight = stateWeights.get(sortedStates[0].id) || 1;
        const normalizedWeight = weight / maxWeight;
        const radius = 200 + (1 - normalizedWeight) * 300;
        const angle = (index - 1) * (2 * Math.PI / (sortedStates.length - 1));
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }
      
      statePositions.set(state.id, { x, y });
    });
    
    // Calcular handles dinâmicos para cada estado baseado em posições
    type HandleInfo = { id: string; type: 'source' | 'target'; position: Position };
    const stateHandles = new Map<string, HandleInfo[]>();
    
    for (const state of visibleStates) {
      const handles: HandleInfo[] = [];
      const sourcePos = statePositions.get(state.id)!;
      
      // Handles de saída (outgoing)
      for (const transition of state.transitions) {
        if (!connectedStateIds.has(transition.to)) continue;
        
        const targetPos = statePositions.get(transition.to);
        if (!targetPos) continue;
        
        const position = calculateHandlePosition(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
        handles.push({
          id: `${state.id}-out-${transition.id}`,
          type: 'source',
          position,
        });
      }
      
      // Handles de entrada (incoming)
      for (const otherState of visibleStates) {
        for (const transition of otherState.transitions) {
          if (transition.to !== state.id) continue;
          
          const otherPos = statePositions.get(otherState.id);
          if (!otherPos) continue;
          
          const position = getOppositePosition(
            calculateHandlePosition(otherPos.x, otherPos.y, sourcePos.x, sourcePos.y)
          );
          handles.push({
            id: `${state.id}-in-${transition.id}`,
            type: 'target',
            position,
          });
        }
      }
      
      stateHandles.set(state.id, handles);
    }
    
    // Layout orbital: estados com mais conexões no centro
    return sortedStates.map((state, index) => {
      const isInitial = state.id === stateMachine.initialState;
      const isSelected = state.id === selectedStateId;
      const weight = stateWeights.get(state.id) || 0;
      const handles = stateHandles.get(state.id);
      
      let x: number, y: number;
      
      if (index === 0) {
        // Estado mais conectado no centro
        x = 0;
        y = 0;
      } else {
        // Outros estados em órbitas
        // Calcular raio baseado no peso (menos peso = mais longe)
        const maxWeight = stateWeights.get(sortedStates[0].id) || 1;
        const normalizedWeight = weight / maxWeight;
        const radius = 200 + (1 - normalizedWeight) * 300; // 200-500px do centro
        
        // Distribuir em círculo
        const angle = (index - 1) * (2 * Math.PI / (sortedStates.length - 1));
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }
      
      return {
        id: state.id,
        type: 'stateNode',
        position: { x, y },
        data: {
          label: state.id,
          isInitial,
          transitionCount: state.transitions.length,
          eventCount:
            state.events.beforeEnter.length +
            state.events.onEnter.length +
            state.events.onStay.length +
            state.events.onLeave.length,
          isDimmed: false,
          handles: stateHandles.get(state.id),
        },
        selected: isSelected,
      } as Node;
    });
  }, [stateMachine, selectedStateId, connectedStateIds]);
  
  // Converter transições para arestas do ReactFlow (apenas entre estados visíveis)
  const initialEdges = useMemo(() => {
    if (!stateMachine) return [];
    
    const edges: Edge[] = [];
    
    // Contar transições entre mesmos pares de estados para offset
    const pairCounts = new Map<string, number>();
    const pairIndices = new Map<string, number>();
    
    for (const state of stateMachine.states) {
      if (!connectedStateIds.has(state.id)) continue;
      
      for (const transition of state.transitions) {
        if (!connectedStateIds.has(transition.to)) continue;
        
        const pairKey = `${state.id}->${transition.to}`;
        pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
      }
    }
    
    for (const state of stateMachine.states) {
      // Apenas processar estados visíveis
      if (!connectedStateIds.has(state.id)) continue;
      
      for (const transition of state.transitions) {
        // Apenas mostrar transições para estados visíveis
        if (!connectedStateIds.has(transition.to)) continue;
        
        const conditionCount = transition.conditions.length;
        const label = conditionCount > 0 ? `${conditionCount} condition${conditionCount > 1 ? 's' : ''}` : '';
        
        // Gerar cor única para esta transição
        const color = generateColorFromString(transition.id);
        
        // Calcular offset para evitar sobreposição
        const pairKey = `${state.id}->${transition.to}`;
        const totalForPair = pairCounts.get(pairKey) || 1;
        const currentIndex = pairIndices.get(pairKey) || 0;
        pairIndices.set(pairKey, currentIndex + 1);
        
        // Offset para múltiplas linhas entre mesmos estados
        const offset = totalForPair > 1 
          ? (currentIndex - (totalForPair - 1) / 2) * 30 
          : 0;
        
        // Handles customizados
        const sourceHandle = `${state.id}-out-${transition.id}`;
        const targetHandle = `${transition.to}-in-${transition.id}`;
        
        edges.push({
          id: transition.id,
          source: state.id,
          target: transition.to,
          sourceHandle,
          targetHandle,
          label,
          type: 'default',
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color,
          },
          style: {
            strokeWidth: 2,
            stroke: color,
          },
          // Usar data para armazenar offset customizado
          data: { offset },
        });
      }
    }
    
    return edges;
  }, [stateMachine, connectedStateIds]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Atualizar nós quando stateMachine mudar
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);
  
  // Atualizar arestas quando stateMachine mudar
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectState(node.id);
      setFilterStateId(node.id);
    },
    [selectState]
  );
  
  const onConnect = useCallback(
    (connection: any) => {
      if (connection.source && connection.target) {
        addTransition(connection.source, connection.target);
      }
    },
    [addTransition]
  );
  
  const onPaneClick = useCallback(() => {
    selectState(null);
  }, [selectState]);
  
  if (!stateMachine) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Carregue um arquivo XML para visualizar a state machine
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative">
      {/* Filter dropdown */}
      <div className="absolute top-4 left-4 z-10 bg-background border rounded-md p-3 shadow-lg">
        <Label className="text-xs mb-2 block">Filter Graph</Label>
        <Select value={filterStateId} onValueChange={setFilterStateId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">All States</SelectItem>
            {stateMachine.states.map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}


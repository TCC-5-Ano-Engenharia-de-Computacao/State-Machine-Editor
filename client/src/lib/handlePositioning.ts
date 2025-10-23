import { Position } from 'reactflow';

/**
 * Calcula a melhor posição de handle baseado no ângulo entre dois pontos
 * @param sourceX - Coordenada X do nó de origem
 * @param sourceY - Coordenada Y do nó de origem
 * @param targetX - Coordenada X do nó de destino
 * @param targetY - Coordenada Y do nó de destino
 * @returns Position (Top, Right, Bottom, Left)
 */
export function calculateHandlePosition(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): Position {
  // Calcular ângulo em radianos
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);
  
  // Converter para graus (0-360)
  let degrees = (angle * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  
  // Determinar posição baseado no ângulo
  // Right: -45° a 45° (315° a 45°)
  // Bottom: 45° a 135°
  // Left: 135° a 225°
  // Top: 225° a 315°
  
  if (degrees >= 315 || degrees < 45) {
    return Position.Right;
  } else if (degrees >= 45 && degrees < 135) {
    return Position.Bottom;
  } else if (degrees >= 135 && degrees < 225) {
    return Position.Left;
  } else {
    return Position.Top;
  }
}

/**
 * Calcula a posição oposta para o handle de destino
 */
export function getOppositePosition(position: Position): Position {
  switch (position) {
    case Position.Top:
      return Position.Bottom;
    case Position.Bottom:
      return Position.Top;
    case Position.Left:
      return Position.Right;
    case Position.Right:
      return Position.Left;
    default:
      return Position.Top;
  }
}


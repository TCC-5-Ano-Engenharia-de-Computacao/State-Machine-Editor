/**
 * Gera uma cor única baseada em um hash de string
 * Retorna cores em HSL para garantir boa visibilidade
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Usar hue entre 0-360, saturação alta (70%), luminosidade média (50-60%)
  const hue = Math.abs(hash % 360);
  const saturation = 70;
  const lightness = 50 + (Math.abs(hash) % 10); // 50-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Gera cores distintas para um array de IDs
 */
export function generateDistinctColors(ids: string[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  
  ids.forEach((id) => {
    colorMap.set(id, generateColorFromString(id));
  });
  
  return colorMap;
}


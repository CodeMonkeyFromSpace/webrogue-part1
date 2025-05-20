export function getDirectionName(dx: number, dy: number): string {
  const map: Record<string, string> = {
    "-1,-1": "northwest",
    "0,-1": "north",
    "1,-1": "northeast",
    "-1,0": "west",
    "0,0": "wait",
    "1,0": "east",
    "-1,1": "southwest",
    "0,1": "south",
    "1,1": "southeast",
  };
  return map[`${dx},${dy}`] || `move ${dx},${dy}`;
}

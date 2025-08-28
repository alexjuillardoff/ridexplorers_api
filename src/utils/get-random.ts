// Retourne un nombre entier aléatoire compris entre `min` (inclus) et `max`
// (exclu).
export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

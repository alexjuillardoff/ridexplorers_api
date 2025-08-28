// Extrait uniquement les chiffres d'une chaîne de caractères et les convertit
// en nombre. Retourne `NaN` si aucun chiffre n'est présent.
export default function getNumberOnly(content: string | undefined): number {
  return content ? Number(content.match(/\d/g)?.join('')) : Number.NaN;
}

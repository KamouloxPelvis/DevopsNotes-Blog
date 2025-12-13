// backend/src/utils/slug.ts

export function generateSlug(title: string): string {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')     // espaces et underscores -> tirets
    .replace(/[^\w-]+/g, '')     // enlève les caractères spéciaux
    .replace(/--+/g, '-');       // évite les doubles tirets
}

// Монгол кирилл үсгийг латин болгон хөрвүүлэх
const CYR: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'ye', ё:'yo', ж:'j', з:'z',
  и:'i', й:'i', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r',
  с:'s', т:'t', у:'u', ф:'f', х:'kh', ц:'ts', ч:'ch', ш:'sh',
  щ:'shch', ъ:'', ы:'i', ь:'', э:'e', ю:'yu', я:'ya',
  // Монгол тусгай үсэг
  ө:'o', ү:'u', ң:'ng',
};

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map(c => CYR[c] !== undefined ? CYR[c] : c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')   // тусгай тэмдэгт → зураас
    .replace(/^-+|-+$/g, '')        // эхэн/эцсийн зураас хасах
    .slice(0, 80);                  // хэт урт slug хасах
}

// MongoDB ObjectId мөн эсэхийг шалгах (24 hex тэмдэгт)
export function isObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

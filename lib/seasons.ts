// lib/seasons.ts — Аялалын улирлын мэдэгдэл

export interface SeasonInfo {
  best: string;       // "6–8-р сар"
  good: string;       // "5, 9-р сар"
  avoid: string;      // "11–3-р сар"
  tip: string;
}

const WINTER_PROVINCES = ['Баян-Өлгий', 'Ховд', 'Увс', 'Завхан', 'Говь-Алтай'];
const GOBI_PROVINCES   = ['Өмнөговь', 'Дундговь', 'Дорноговь', 'Говьсүмбэр'];

export function getSeasonInfo(type: 'resort' | 'nature', province?: string): SeasonInfo {
  if (GOBI_PROVINCES.includes(province ?? '')) {
    return {
      best:  '4–5, 9–10-р сар',
      good:  '3, 11-р сар',
      avoid: '6–8-р сар (халуун)',
      tip:   'Говийн уур амьсгал: зуны дулаан 40°C хүрнэ. Хаврын болон намрын улирал хамгийн тохиромжтой.',
    };
  }

  if (WINTER_PROVINCES.includes(province ?? '')) {
    return {
      best:  '7–8-р сар',
      good:  '6, 9-р сар',
      avoid: '10–5-р сар (маш хүйтэн)',
      tip:   'Алтайн нурууны бүс. Зуны улирал богино боловч гайхалтай байгалийн үзэмж үзүүлнэ.',
    };
  }

  if (type === 'resort') {
    return {
      best:  '6–8-р сар',
      good:  '5, 9-р сар',
      avoid: '11–3-р сар',
      tip:   'Амралтын газрын ихэнх нь зуны улиралд ажиллана. Урьдчилж захиалахыг зөвлөнө.',
    };
  }

  // природа default
  return {
    best:  '6–9-р сар',
    good:  '5, 10-р сар',
    avoid: '11–4-р сар (цас, хүйтэн)',
    tip:   'Монголын зун богино боловч маш тааламжтай. 7-р сар нь Наадамтай тохирно.',
  };
}

// Төвлөрсөн конфиг — BASE_URL-ийг зөвхөн энд тохируулна
export const BASE_URL =
  (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mongolia-resorts.vercel.app').replace(/\/$/, '');

export const SITE_NAME = 'Монгол Нутаг';

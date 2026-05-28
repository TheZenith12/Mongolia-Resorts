'use client';

import { useLang } from '@/lib/lang-context';
import SortSelect from './SortSelect';

interface Props {
  type?: string;
  count: number;
  currentSort?: string;
}

export default function PlacesSectionHeader({ type, count, currentSort }: Props) {
  const { tr } = useLang();

  const title =
    type === 'resort' ? tr('places_resorts') :
    type === 'nature' ? tr('places_nature') :
    tr('places_all');

  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="text-forest-500 mt-1.5 font-body text-sm">
          {count} {tr('places_found')}
        </p>
      </div>
      <SortSelect current={currentSort} />
    </div>
  );
}

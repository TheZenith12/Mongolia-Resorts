'use client';

import { useLang } from '@/lib/lang-context';

export default function SortSelect({ current }: { current?: string }) {
  const { tr } = useLang();

  return (
    <form method="GET">
      <select
        name="sort"
        defaultValue={current ?? 'created_at'}
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (form) form.submit();
        }}
        className="input-field w-auto text-sm py-2"
      >
        <option value="created_at">{tr('sort_newest')}</option>
        <option value="rating_avg">{tr('sort_rating')}</option>
        <option value="view_count">{tr('sort_views')}</option>
        <option value="price_per_night">{tr('sort_price')}</option>
      </select>
    </form>
  );
}

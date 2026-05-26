'use client';

import { Sun, Thermometer, Snowflake, Info } from 'lucide-react';
import type { SeasonInfo } from '@/lib/seasons';

interface Props {
  season: SeasonInfo;
}

export default function SeasonInfoCard({ season }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
        <Sun size={16} className="text-amber-500" />
        Аялалын улирал
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Sun size={14} className="text-green-600" />
          </div>
          <div>
            <div className="text-xs text-forest-500 font-medium">Хамгийн тохиромжтой</div>
            <div className="text-sm font-semibold text-forest-900">{season.best}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Thermometer size={14} className="text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-forest-500 font-medium">Боломжтой</div>
            <div className="text-sm font-semibold text-forest-900">{season.good}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Snowflake size={14} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-forest-500 font-medium">Хаалттай / хүйтэн</div>
            <div className="text-sm font-semibold text-forest-900">{season.avoid}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-forest-100 flex items-start gap-2">
          <Info size={14} className="text-forest-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-forest-500 leading-relaxed">{season.tip}</p>
        </div>
      </div>
    </div>
  );
}

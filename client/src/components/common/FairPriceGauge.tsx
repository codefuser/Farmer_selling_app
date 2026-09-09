import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FairPriceGaugeProps {
  enteredPrice?: number;
  minPrice: number;
  maxPrice: number;
  modalPrice?: number;
  unit?: string;
  productName?: string;
}

export const FairPriceGauge: React.FC<FairPriceGaugeProps> = ({
  enteredPrice,
  minPrice,
  maxPrice,
  modalPrice,
  unit = 'kg',
  productName,
}) => {
  const isEntered = enteredPrice !== undefined && !isNaN(enteredPrice) && enteredPrice > 0;
  const isWithin = isEntered && enteredPrice >= minPrice && enteredPrice <= maxPrice;
  const isHigh = isEntered && enteredPrice > maxPrice;
  const isLow = isEntered && enteredPrice < minPrice;

  // Percentage position of entered price within gauge range (0% to 100%)
  const gaugeMin = Math.max(0, minPrice * 0.7);
  const gaugeMax = maxPrice * 1.3;
  const range = gaugeMax - gaugeMin;

  const currentPercent = isEntered
    ? Math.min(100, Math.max(0, ((enteredPrice - gaugeMin) / range) * 100))
    : 50;

  return (
    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 my-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Fair Price Transparency Guide {productName ? `· ${productName}` : ''}
          </span>
        </div>
        <span className="text-xs font-medium text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
          Ref Band: ₹{minPrice} - ₹{maxPrice}/{unit}
        </span>
      </div>

      {/* Visual Gauge Bar */}
      <div className="relative pt-2 pb-2">
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
          <div className="w-[30%] bg-amber-200" title="Low Range" />
          <div className="w-[40%] bg-emerald-500" title="Fair Market Band" />
          <div className="w-[30%] bg-rose-200" title="High Range" />
        </div>

        {/* Marker */}
        {isEntered && (
          <div
            className="absolute top-1 -ml-2 transition-all duration-300 pointer-events-none"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md" />
          </div>
        )}
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1">
        <span>Below Ref (₹{minPrice})</span>
        <span className="text-emerald-700 font-semibold">Recommended (₹{modalPrice || (minPrice + maxPrice) / 2})</span>
        <span>Above Ref (₹{maxPrice})</span>
      </div>

      {/* Price Status Message */}
      {isEntered && (
        <div className="mt-3 text-xs flex items-center gap-1.5 pt-2 border-t border-emerald-200/60">
          {isWithin && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 font-medium">
                ✓ Entered price ₹{enteredPrice}/{unit} is within the fair market range. Maximizes buyer matching!
              </span>
            </>
          )}
          {isHigh && (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-800 font-medium">
                ⚠️ Price ₹{enteredPrice}/{unit} is above the current market reference band (₹{minPrice}-₹{maxPrice}). May take longer to match buyers.
              </span>
            </>
          )}
          {isLow && (
            <>
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-blue-800 font-medium">
                💡 Price ₹{enteredPrice}/{unit} is below the typical reference range. Ensure you are getting fair return for your harvest.
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FairPriceGauge;

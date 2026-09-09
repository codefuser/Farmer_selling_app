import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Truck, Warehouse, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DeliveryMapProps {
  orderCode: string;
  status: string;
  sourceName?: string;
  destinationName?: string;
  farmerLocations?: Array<{ name: string; village: string; quantity: number }>;
  currentStage?: number; // 0 to 4
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  orderCode,
  status,
  sourceName = 'Thalaivasal Collection Depot (Salem)',
  destinationName = 'ABC Grand Heritage Hotel, Fairlands, Salem',
  farmerLocations = [
    { name: 'Kumar G', village: 'Thalaivasal (5 km)', quantity: 100 },
    { name: 'Murugan P', village: 'Attur (8 km)', quantity: 150 },
    { name: 'Priya S', village: 'Gangavalli (12 km)', quantity: 100 },
    { name: 'Ravi C', village: 'Mecheri (10 km)', quantity: 150 },
  ],
}) => {
  // Vehicle position percentage along route (0% to 100%)
  const [truckProgress, setTruckProgress] = useState(65);

  useEffect(() => {
    if (status === 'DELIVERED' || status === 'PAYMENT_RELEASED' || status === 'COMPLETED') {
      setTruckProgress(100);
    } else if (status === 'DISPATCHED') {
      setTruckProgress(65);
    } else if (status === 'COLLECTED' || status === 'QUALITY_CHECKED' || status === 'PACKED') {
      setTruckProgress(35);
    } else {
      setTruckProgress(10);
    }
  }, [status]);

  return (
    <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Live Logistics GPS Tracking · {orderCode}
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Active Telemetry
              </span>
            </h4>
            <p className="text-xs text-slate-400">Salem Agri Corridor · Hub Route TN-30</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Status: {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Simulated Visual Vector Map Canvas */}
      <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 relative min-h-[220px] flex flex-col justify-between overflow-hidden">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

        {/* Farmer Collection Feeder Pins */}
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Farm Supply Aggregation Points (4 Nearby Farmers)
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {farmerLocations.map((f, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 text-xs flex items-center gap-2 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">{f.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {f.village} · {f.quantity}kg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Route Line with Animated Truck */}
        <div className="relative my-8 z-10 px-4">
          <div className="h-1.5 bg-slate-800 rounded-full relative">
            {/* Completed Route Gradient */}
            <div
              className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${truckProgress}%` }}
            />

            {/* Hub Point 1: Collection Center */}
            <div className="absolute left-0 -top-2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center">
                <Warehouse className="w-2.5 h-2.5 text-slate-950" />
              </div>
              <span className="text-[10px] text-slate-300 font-semibold mt-1 whitespace-nowrap">
                Hub (Thalaivasal)
              </span>
            </div>

            {/* Moving Delivery Truck Marker */}
            <div
              className="absolute -top-3.5 -ml-4 transition-all duration-700 flex flex-col items-center"
              style={{ left: `${truckProgress}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-slate-900/90 border border-emerald-400/40 text-emerald-300 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap font-mono font-bold">
                TN-30-BC-4491
              </span>
            </div>

            {/* Destination Point: Hotel / Buyer */}
            <div className="absolute right-0 -top-2 flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center ${
                  truckProgress >= 100 ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <MapPin className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] text-slate-300 font-semibold mt-1 whitespace-nowrap">
                Buyer Delivery Dock
              </span>
            </div>
          </div>
        </div>

        {/* Route Details Footer */}
        <div className="relative z-10 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-1">
            <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Origin: {sourceName}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Destination: {destinationName}</span>
          </div>
          <div className="text-emerald-400 font-mono font-bold">
            Distance: 14.8 km · ETA: ~22 mins
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;

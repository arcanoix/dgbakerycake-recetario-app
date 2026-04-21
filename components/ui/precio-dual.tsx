import { formatearUSD, formatearBS, convertirUSDaBS } from "@/lib/currency";

interface PrecioDualProps {
  valorUSD: number;
  tasaCambio: number;
  monedaPorDefecto?: string; // 'USD' o 'VES' (Bolívares)
  className?: string;
}

export const PrecioDual = ({ 
  valorUSD, 
  tasaCambio, 
  monedaPorDefecto = 'VES',
  className = ""
}: PrecioDualProps) => {
  const valorBS = convertirUSDaBS(valorUSD, tasaCambio);
  const usdFormateado = formatearUSD(valorUSD);
  const bsFormateado = formatearBS(valorBS);

  // Si la moneda por defecto es USD, mostrar USD grande
  if (monedaPorDefecto === 'USD') {
    return (
      <span className={`flex flex-col gap-0.5 ${className}`}>
        <span className="font-bold text-gray-900">
          {usdFormateado}
        </span>
        <span className="text-[10px] font-medium text-gray-700 uppercase tracking-wide">
          {bsFormateado}
        </span>
      </span>
    );
  }

  // Si la moneda por defecto es VES (Bolívares), mostrar BS grande
  return (
    <span className={`flex flex-col gap-0.5 ${className}`}>
      <span className="font-semibold text-green-600">
        {bsFormateado}
      </span>
      <span className="text-[10px] font-medium text-gray-700 uppercase tracking-wide">
        {usdFormateado}
      </span>
    </span>
  );
};

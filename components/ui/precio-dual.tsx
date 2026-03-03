import { formatearUSD, formatearBS, convertirUSDaBS } from "@/lib/currency";

interface PrecioDualProps {
  valorUSD: number;
  tasaCambio: number;
  mostrarUSDPrimero?: boolean;
  className?: string;
  destacarBS?: boolean;
}

export const PrecioDual = ({ 
  valorUSD, 
  tasaCambio, 
  mostrarUSDPrimero = false,
  className = "",
  destacarBS = true
}: PrecioDualProps) => {
  const valorBS = convertirUSDaBS(valorUSD, tasaCambio);
  const usdFormateado = formatearUSD(valorUSD);
  const bsFormateado = formatearBS(valorBS);

  if (mostrarUSDPrimero) {
    return (
      <span className={`flex flex-col gap-0.5 ${className}`}>
        <span className="font-bold text-gray-900">
          {usdFormateado}
        </span>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {bsFormateado}
        </span>
      </span>
    );
  }

  return (
    <span className={`flex flex-col gap-0.5 ${className}`}>
      <span className="font-semibold text-green-600">
        {bsFormateado}
      </span>
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
        {usdFormateado}
      </span>
    </span>
  );
};

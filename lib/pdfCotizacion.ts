import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Orden, ConfiguracionGlobal } from "@/types";
import { formatearNumero } from "./constants";
import { convertirUSDaBS, formatearUSD, formatearBS } from "./currency";

export const exportarCotizacionPDF = (
  orden: Orden,
  configuracion: ConfiguracionGlobal | null
) => {
  const doc = new jsPDF();
  const moneda = configuracion?.moneda || "VES";
  const tasaCambio = configuracion?.tasaCambioUSD || 1;

  // Colors (matching existing pdfExport.ts palette)
  const textDark = [9, 9, 11];
  const textMuted = [113, 113, 122];
  const tableHeadBg = [244, 244, 245];
  const tableHeadText = [9, 9, 11];
  const lineColor = [228, 228, 231];
  const accentColor = [124, 58, 237]; // violet-600

  // ---- HEADER ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("PRESUPUESTO / FACTURA PROFORMA", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`N° ${orden.numerOrden}`, 14, 30);

  // Estado badge
  const estadoLabel: Record<string, string> = {
    cotizacion: "COTIZACIÓN",
    confirmada: "CONFIRMADA",
    entregada: "ENTREGADA",
    cancelada: "CANCELADA",
  };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(estadoLabel[orden.estado] || orden.estado.toUpperCase(), 196, 30, { align: "right" });

  // Separator
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.line(14, 34, 196, 34);

  // ---- CLIENT INFO ----
  let y = 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("CLIENTE:", 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(orden.clienteNombre || "—", 45, y);

  const fechaCreacion = orden.fechaCreacion.toLocaleDateString("es-VE");
  doc.setFont("helvetica", "bold");
  doc.text("FECHA:", 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(fechaCreacion, 165, y);

  y += 6;
  if (orden.fechaEntrega) {
    doc.setFont("helvetica", "bold");
    doc.text("ENTREGA:", 140, y);
    doc.setFont("helvetica", "normal");
    doc.text(orden.fechaEntrega.toLocaleDateString("es-VE"), 165, y);
  }

  y += 10;

  // ---- ITEMS TABLE ----
  const tableData = orden.items.map(item => {
    const precioBS = convertirUSDaBS(item.precioUnitario, tasaCambio);
    const subtotalBS = convertirUSDaBS(item.subtotal, tasaCambio);

    const precioStr = moneda === "USD"
      ? `${formatearUSD(item.precioUnitario)}\n${formatearBS(precioBS)}`
      : `${formatearBS(precioBS)}\n${formatearUSD(item.precioUnitario)}`;

    const subtotalStr = moneda === "USD"
      ? `${formatearUSD(item.subtotal)}\n${formatearBS(subtotalBS)}`
      : `${formatearBS(subtotalBS)}\n${formatearUSD(item.subtotal)}`;

    return [
      item.nombreItem,
      formatearNumero(item.cantidad),
      precioStr,
      subtotalStr,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Artículo / Receta", "Cant.", "Precio Unit.", "Subtotal"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: tableHeadBg as [number, number, number],
      textColor: tableHeadText as [number, number, number],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: textDark as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 45, halign: "right", textColor: textMuted as [number, number, number] },
      3: { cellWidth: 45, halign: "right", fontStyle: "bold" },
    },
    didDrawCell: (data: any) => {
      if (data.row.section === "body") {
        doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 12;

  // ---- TOTALS BOX ----
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.roundedRect(100, finalY - 6, 96, 60, 2, 2, "FD");

  const formatVal = (val: number) => {
    const bs = convertirUSDaBS(val, tasaCambio);
    return moneda === "USD"
      ? `${formatearUSD(val)}  (${formatearBS(bs)})`
      : `${formatearBS(bs)}  (${formatearUSD(val)})`;
  };

  const totalsRows = [
    { label: "Subtotal:", value: orden.subtotal },
    ...(orden.descuentoPorcentaje > 0
      ? [{ label: `Descuento (${orden.descuentoPorcentaje}%):`, value: -orden.descuentoMonto }]
      : []),
    { label: "TOTAL:", value: orden.total, bold: true },
    ...(orden.pagoAdelantado > 0
      ? [{ label: "Pago Adelantado:", value: orden.pagoAdelantado }]
      : []),
    ...(orden.saldoPendiente > 0
      ? [{ label: "Saldo Pendiente:", value: orden.saldoPendiente, bold: true }]
      : []),
  ];

  let ty = finalY + 4;
  for (const row of totalsRows) {
    doc.setFont("helvetica", (row as any).bold ? "bold" : "normal");
    doc.setFontSize((row as any).bold ? 11 : 9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(row.label, 150, ty, { align: "right" });
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(formatVal(Math.abs(row.value)), 196, ty, { align: "right" });
    ty += (row as any).bold ? 10 : 8;
  }

  // ---- NOTES ----
  if (orden.notas) {
    finalY = ty + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Notas:", 14, finalY);
    doc.setFont("helvetica", "normal");
    const splitNotas = doc.splitTextToSize(orden.notas, 170);
    doc.text(splitNotas, 14, finalY + 5);
  }

  // ---- FOOTER ----
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()} · DGcost`,
    14,
    285
  );

  const filename = `Cotizacion-${orden.numerOrden.replace(/[^a-z0-9-]/gi, "_")}.pdf`;
  doc.save(filename);
};

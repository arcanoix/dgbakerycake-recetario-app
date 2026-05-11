import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Receta, ConfiguracionGlobal } from "@/types";
import { formatearNumero } from "./constants";
import { convertirUSDaBS, formatearUSD, formatearBS } from "./currency";

export const exportarRecetaPDF = (
  receta: Receta,
  configuracion: ConfiguracionGlobal | null
) => {
  const doc = new jsPDF();
  const moneda = configuracion?.moneda || "VES";
  const tasaCambio = configuracion?.tasaCambioUSD || 1;

  // Brand Colors (Slate/Zinc modern palette matching Shadcn UI defaults)
  const textDark = [9, 9, 11];         // Zinc-950
  const textMuted = [113, 113, 122];   // Zinc-500
  const tableHeadBg = [244, 244, 245]; // Zinc-100
  const tableHeadText = [9, 9, 11];    // Zinc-950
  const lineColor = [228, 228, 231];   // Zinc-200
  
  // Header
  // App primary is usually dark, so let's make the main title bold and dark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receta.nombre.toUpperCase(), 14, 24);

  // Category and Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  let lastY = 30;
  
  if (receta.categoria) {
    doc.text(`Categoría: ${receta.categoria}`, 14, lastY);
    lastY += 6;
  }
  if (receta.rendimiento && receta.unidadRendimiento) {
    doc.text(`Rendimiento: ${receta.rendimiento} ${receta.unidadRendimiento}`, 14, lastY);
    lastY += 6;
  }
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const splitDesc = doc.splitTextToSize(`Descripción: ${receta.descripcion}`, 180);
  doc.text(splitDesc, 14, lastY);
  lastY += (splitDesc.length * 5) + 8;
  
  // Decorative line separator
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.line(14, lastY - 4, 196, lastY - 4);

  // Materials Table
  const tableData = receta.materiales.map((m) => {
    // Los datos base en Supabase / UI se almacenan en escala USD
    const unitarioBS = convertirUSDaBS(m.costoUnitario, tasaCambio);
    const materialBS = convertirUSDaBS(m.costoMaterial, tasaCambio);

    // Formatear dependiendo de la moneda principal seleccionada ("USD" o "VES")
    const costoUnitStr = moneda === "USD"
      ? `${formatearUSD(m.costoUnitario)}\n${formatearBS(unitarioBS)}`
      : `${formatearBS(unitarioBS)}\n${formatearUSD(m.costoUnitario)}`;

    const costoTotalStr = moneda === "USD"
      ? `${formatearUSD(m.costoMaterial)}\n${formatearBS(materialBS)}`
      : `${formatearBS(materialBS)}\n${formatearUSD(m.costoMaterial)}`;

    return [
      m.nombreProducto,
      `${formatearNumero(m.cantidadUtilizada)} ${m.unidadMedidaSimbolo || m.unidadMedidaNombre || "u"}`,
      costoUnitStr,
      costoTotalStr,
    ];
  });

  autoTable(doc, {
    startY: lastY,
    head: [["Ingrediente", "Cantidad", "Costo Unit.", "Total"]],
    body: tableData,
    theme: "plain", // We'll manage styles manually for a more elegant look
    headStyles: { 
      fillColor: tableHeadBg as [number, number, number],
      textColor: tableHeadText as [number, number, number],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 5,
      textColor: textDark as [number, number, number]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250] as [number, number, number]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40, halign: 'right', textColor: textMuted as [number, number, number] },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data: any) => {
      // Draw subtle bottom border on all rows
      if (data.row.section === 'body') {
        doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
        doc.setLineWidth(0.1);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    }
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 15;

  // Totals Section
  const rightColX = 140;

  const totales: { label: string, bsv: number, isSubtotal?: boolean, isTotal?: boolean, isMargin?: boolean }[] = [
    { label: "Costo Insumos:", bsv: receta.costoMateriales },
  ];

  if (receta.costoManoObra && receta.costoManoObra > 0) {
    totales.push({ label: "Mano de Obra:", bsv: receta.costoManoObra });
  }

  totales.push({ label: "Costo Total:", bsv: receta.costoTotal, isSubtotal: true });

  if (receta.margenGanancia) {
    totales.push({ label: `Margen (${receta.margenGanancia}%):`, bsv: receta.costoTotal * (receta.margenGanancia / 100), isMargin: true });
  }

  if (receta.precioVentaSugerido) {
    totales.push({ label: "Precio Sugerido:", bsv: receta.precioVentaSugerido, isTotal: true });
  }

  // Calculate box height dynamically based on the elements and spacing
  let boxHeight = 6; // Base padding
  totales.forEach((t) => {
    if (t.isSubtotal || t.isTotal) {
      boxHeight += 11; // 8 for text + 3 extra space
    } else {
      boxHeight += 8;
    }
  });
  
  // Dibuja una caja elegante para los totales
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
  doc.roundedRect(60, finalY - 8, 136, boxHeight, 2, 2, 'FD');

  totales.forEach((total) => {
    const isBold = total.isSubtotal || total.isTotal;
    doc.setFontSize(isBold ? 11 : 10);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    // Y-spacing rules
    if (isBold) {
      finalY += 3; // Extra space before total
      doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.line(65, finalY - 6, 191, finalY - 6);
    }
    
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(total.label, rightColX, finalY, { align: "right" });
    
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    
    // El valor base (total.bsv) también está internamente en escala USD en este sistema
    const vUS = total.bsv;
    const vBS = convertirUSDaBS(vUS, tasaCambio);

    if (moneda === "USD") {
      doc.text(`${formatearUSD(vUS)}`, rightColX + 5, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${formatearBS(vBS)}`, rightColX + 35, finalY);
    } else {
      doc.text(`${formatearBS(vBS)}`, rightColX + 5, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${formatearUSD(vUS)}`, rightColX + 35, finalY);
    }
    
    finalY += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()} - Tasa USD: ${formatearNumero(tasaCambio)}`,
    14,
    285
  );

  // Save the PDF
  const filename = `Receta-${receta.nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
};

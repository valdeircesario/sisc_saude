import jsPDF from "jspdf";
import { 
  COLORS, 
  safeText, 
  addMainHeader, 
  addPatientInfo, 
  addLegacyFooter, 
  addPageNumber, 
  normalizeText,
  formatDate 
} from "./common";

export const generateHistoricoMedicoPDF = async (
  historico: any[],
  paciente: any,
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentPage = 1;

  // Cabeçalho principal
  let yPosition = addMainHeader(
    pdf,
    "HISTORICO MEDICO",
    "Registro completo de atendimentos",
  );

  // Informações do paciente
  yPosition = addPatientInfo(pdf, paciente, yPosition);
  yPosition += 8;

  // Resumo estatístico compacto
  pdf.setFillColor(...COLORS.accent);
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.roundedRect(15, yPosition, 50, 10, 2, 2, "F");
  safeText(
    pdf,
    `Total: ${historico.length} consulta${historico.length !== 1 ? "s" : ""}`,
    18,
    yPosition + 7,
  );

  yPosition += 18;

  // Lista de consultas com layout otimizado
  historico.forEach((item, index) => {
    // Verifica necessidade de nova página
    const estimatedHeight =
      35 +
      (item.laudo ? 15 : 0) +
      (item.observacoes ? 10 : 0) +
      (item.doenca ? 5 : 0) +
      (item.medicacao ? 5 : 0);

    if (yPosition + estimatedHeight > pageHeight - 25) {
      addLegacyFooter(pdf);
      addPageNumber(pdf, currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = addMainHeader(pdf, "HISTORICO MEDICO", "Continuacao");
      yPosition += 8;
    }

    // Card da consulta com design limpo
    const cardHeight = Math.max(30, estimatedHeight);

    // Background alternado para facilitar leitura
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.background);
      pdf.rect(15, yPosition, pageWidth - 30, cardHeight, "F");
    }

    // Borda esquerda colorida
    pdf.setFillColor(...COLORS.accent);
    pdf.rect(15, yPosition, 3, cardHeight, "F");

    // Número da consulta
    pdf.setFillColor(...COLORS.primary);
    pdf.setTextColor(...COLORS.white);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.circle(28, yPosition + 8, 5, "F");
    safeText(pdf, `${index + 1}`, 28, yPosition + 10, { align: "center" });

    // Diagnóstico principal
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    safeText(pdf, normalizeText(item.diagnostico), 38, yPosition + 10);

    // Data e profissional na mesma linha
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.text);

    const dataConsulta = formatDate(item.dataConsulta);
    const profissional = `Dr(a). ${normalizeText(item.funcionario?.nome || "N/I")}`;

    safeText(pdf, `Data: ${dataConsulta}`, 38, yPosition + 18);
    safeText(pdf, profissional, 38, yPosition + 25);

    let detailY = yPosition + 32;

    // Detalhes clínicos em formato compacto
    const details = [];

    if (item.doenca) {
      details.push(`Doenca: ${normalizeText(item.doenca)}`);
    }

    if (item.medicacao) {
      details.push(`Medicacao: ${normalizeText(item.medicacao)}`);
    }

    // Renderizar detalhes
    if (details.length > 0) {
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.secondary);
      details.forEach((detail) => {
        safeText(pdf, detail, 38, detailY);
        detailY += 5;
      });
    }

    // Laudo e observações se existirem
    if (item.laudo) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLORS.primary);
      safeText(pdf, "Laudo:", 38, detailY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.text);
      const laudoLines = pdf.splitTextToSize(
        normalizeText(item.laudo),
        pageWidth - 70,
      );
      pdf.text(laudoLines, 38, detailY + 5);
      detailY += 5 + laudoLines.length * 3;
    }

    if (item.observacoes) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLORS.primary);
      safeText(pdf, "Observacoes:", 38, detailY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.text);
      const obsLines = pdf.splitTextToSize(
        normalizeText(item.observacoes),
        pageWidth - 70,
      );
      pdf.text(obsLines, 38, detailY + 5);
      detailY += 5 + obsLines.length * 3;
    }

    yPosition += cardHeight + 5;
  });

  // Rodapé final
  addLegacyFooter(pdf);
  addPageNumber(pdf, currentPage);

  pdf.save(
    `historico-medico-${normalizeText(paciente.nome).replace(/\s+/g, "-")}.pdf`,
  );
};

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

export const generateVacinasPDF = async (vacinas: any[], paciente: any) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentPage = 1;

  // Cabeçalho principal
  let yPosition = addMainHeader(
    pdf,
    "CARTAO DE VACINACAO",
    "Registro de imunizacoes",
  );

  // Informações do paciente
  yPosition = addPatientInfo(pdf, paciente, yPosition);
  yPosition += 8;

  // Estatísticas compactas
  const vacinasCompletas = vacinas.filter((v) => !v.proximaDose).length;
  const vacinasPendentes = vacinas.length - vacinasCompletas;

  // Cards de estatísticas lado a lado
  const cardWidth = 70;

  // Card vacinas completas
  pdf.setFillColor(...COLORS.success);
  pdf.roundedRect(15, yPosition, cardWidth, 12, 2, 2, "F");
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, `Completas: ${vacinasCompletas}`, 18, yPosition + 8);

  // Card vacinas pendentes
  pdf.setFillColor(...COLORS.warning);
  pdf.roundedRect(90, yPosition, cardWidth, 12, 2, 2, "F");
  pdf.setTextColor(...COLORS.white);
  safeText(pdf, `Pendentes: ${vacinasPendentes}`, 93, yPosition + 8);

  yPosition += 20;

  // Cabeçalho da tabela
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(15, yPosition, pageWidth - 30, 12, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");

  const headers = ["VACINA", "DATA", "LOTE", "PROXIMA", "STATUS"];
  const colWidths = [55, 25, 25, 25, 30];
  let xPos = 18;

  headers.forEach((header, index) => {
    safeText(pdf, header, xPos, yPosition + 8);
    xPos += colWidths[index];
  });

  yPosition += 15;

  // Linhas das vacinas
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);

  vacinas.forEach((vacina, index) => {
    if (yPosition > pageHeight - 30) {
      addLegacyFooter(pdf);
      addPageNumber(pdf, currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = addMainHeader(pdf, "CARTAO DE VACINACAO", "Continuacao");

      // Re-adicionar cabeçalho da tabela
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(15, yPosition, pageWidth - 30, 12, "F");
      pdf.setTextColor(...COLORS.white);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");

      let xHeaderPos = 18;
      headers.forEach((header, headerIndex) => {
        safeText(pdf, header, xHeaderPos, yPosition + 8);
        xHeaderPos += colWidths[headerIndex];
      });

      yPosition += 15;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
    }

    // Background alternado
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.background);
      pdf.rect(15, yPosition, pageWidth - 30, 10, "F");
    }

    pdf.setTextColor(...COLORS.text);

    // Dados da linha
    const dataAplicacao = formatDate(vacina.dataApl);
    const proximaDose = formatDate(vacina.proximaDose);
    const status = vacina.proximaDose ? "Pendente" : "Completa";

    const rowData = [
      normalizeText(vacina.nome || ""),
      dataAplicacao,
      normalizeText(vacina.lote || "N/I"),
      proximaDose,
      status,
    ];

    let xPosition = 18;
    rowData.forEach((data, colIndex) => {
      // Cor especial para status
      if (colIndex === 4) {
        if (vacina.proximaDose) {
          pdf.setTextColor(...COLORS.warning);
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setTextColor(...COLORS.success);
          pdf.setFont("helvetica", "bold");
        }
      } else {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont("helvetica", "normal");
      }

      // Truncar texto se necessário
      let displayText = data;
      if (colIndex === 0 && data.length > 20) {
        // Nome da vacina
        displayText = data.substring(0, 17) + "...";
      }

      safeText(pdf, displayText, xPosition, yPosition + 7);
      xPosition += colWidths[colIndex];
    });

    yPosition += 10;
  });

  // Legenda compacta
  if (yPosition + 20 > pageHeight - 25) {
    addLegacyFooter(pdf);
    addPageNumber(pdf, currentPage);
    pdf.addPage();
    currentPage++;
    yPosition = addMainHeader(pdf, "CARTAO DE VACINACAO", "Legenda");
  }

  yPosition += 8;
  pdf.setFillColor(...COLORS.light);
  pdf.rect(15, yPosition, pageWidth - 30, 18, "F");

  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, "LEGENDA:", 18, yPosition + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.text);
  safeText(
    pdf,
    "Completa: Vacinacao finalizada para esta dose",
    18,
    yPosition + 14,
  );
  safeText(pdf, "Pendente: Proxima dose agendada", 120, yPosition + 14);

  // Rodapé final
  addLegacyFooter(pdf);
  addPageNumber(pdf, currentPage);

  pdf.save(
    `cartao-vacinas-${normalizeText(paciente.nome).replace(/\s+/g, "-")}.pdf`,
  );
};

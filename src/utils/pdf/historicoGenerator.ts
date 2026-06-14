import jsPDF from "jspdf";
import { 
  COLORS, 
  safeText, 
  addHeader,
  addFooter,
  normalizeText,
  formatDate,
  ML,
  DARK,
  MID_GRAY,
  LIGHT_GRAY,
  LINE_GRAY,
  pageWidth,
  pageHeight,
  contentWidth,
  hLine,
  sectionTitle,
  norm,
  slug,
  MR
} from "./common";

export const generateHistoricoMedicoPDF = async (
  historico: any[],
  paciente: any,
) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let currentPage = 1;
  const CW = contentWidth(pdf);

  // ── Cabeçalho Principal
  let y = addHeader(pdf, "Histórico Médico");
  y += 2;

  // Borda decorativa lateral discreta (padrão SISC)
  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML - 10, 0, 1.5, pdf.internal.pageSize.getHeight(), "F");

  // ── Identificação do Paciente
  y = sectionTitle(pdf, "Identificação do Cidadão", y);
  
  pdf.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(ML, y, CW, 20, 1, 1, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, norm(paciente.nome), ML + 5, y + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, `CPF: ${norm(paciente.cpf)}    CNS: ${norm(paciente.cns)}`, ML + 5, y + 14);

  y += 28;

  // ── Resumo de Atendimentos
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "RESUMO DE ATENDIMENTOS", ML, y);
  
  y += 4;
  hLine(pdf, y, 0.4, DARK);
  y += 6;

  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.rect(ML, y, CW, 10);
  pdf.setFontSize(8);
  safeText(pdf, "Total de Consultas Registradas:", ML + 4, y + 6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  safeText(pdf, String(historico.length), ML + CW - 6, y + 7, { align: "right" });
  pdf.setFont("helvetica", "normal");

  y += 18;

  // ── Lista de Registros
  y = sectionTitle(pdf, "Cronologia de Atendimentos", y);

  historico.forEach((item, index) => {
    // Cálculo de altura dinâmica
    const laudoText = norm(item.laudo);
    const obsText = norm(item.observacoes);
    const diagText = norm(item.diagnostico);
    
    const diagLines = pdf.splitTextToSize(diagText, CW - 15);
    const laudoLines = laudoText !== "—" ? pdf.splitTextToSize(`Laudo: ${laudoText}`, CW - 15) : [];
    const obsLines = obsText !== "—" ? pdf.splitTextToSize(`Obs: ${obsText}`, CW - 15) : [];

    const entryHeight = 22 + (diagLines.length * 4) + (laudoLines.length * 3.5) + (obsLines.length * 3.5);

    // Verifica quebra de página
    if (y + entryHeight > pageHeight(pdf) - 30) {
      addFooter(pdf);
      pdf.addPage();
      currentPage++;
      y = addHeader(pdf, "Histórico Médico (Cont.)");
      y += 15;
      pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
      pdf.rect(ML - 10, 0, 1.5, pdf.internal.pageSize.getHeight(), "F");
    }

    // Container do Registro
    pdf.setFillColor(252, 252, 252);
    pdf.rect(ML, y, CW, entryHeight, "F");
    pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
    pdf.rect(ML, y, CW, entryHeight, "S");

    // Destaque lateral do registro
    pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
    pdf.rect(ML, y, 1.5, entryHeight, "F");

    let currentY = y + 6;

    // Header da Consulta (Data, UBS e Médico)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    safeText(pdf, formatDate(item.dataConsulta), ML + 5, currentY);
    
    // UBS acima do profissional
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    const ubsNome = norm(item.funcionario?.ubs?.nome || item.ubs?.nome);
    safeText(pdf, ubsNome, ML + CW - 5, currentY, { align: "right" });

    currentY += 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    const medicoNome = `Profissional: ${norm(item.funcionario?.nome)}`;
    safeText(pdf, medicoNome, ML + CW - 5, currentY, { align: "right" });

    currentY += 2; // Espaço antes do diagnóstico

    // Diagnóstico
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    pdf.text(diagLines, ML + 5, currentY);
    currentY += (diagLines.length * 4) + 2;

    // Laudo e Observações (se existirem)
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);

    if (laudoLines.length > 0) {
      pdf.text(laudoLines, ML + 5, currentY);
      currentY += (laudoLines.length * 3.5) + 1;
    }

    if (obsLines.length > 0) {
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
      pdf.text(obsLines, ML + 5, currentY);
      currentY += (obsLines.length * 3.5);
    }

    y += entryHeight + 5;
  });

  // ── Rodapé Especial (Sem linha de assinatura)
  const H = pageHeight(pdf);
  const W = pageWidth(pdf);
  hLine(pdf, H - 20, 0.3, LINE_GRAY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  safeText(pdf, "Documento oficial gerado pelo Sistema Individual de Saúde do Cidadão (SISC)", ML, H - 14);
  safeText(pdf, `Emitido em ${new Date().toLocaleString("pt-BR")}`, W - MR, H - 14, { align: "right" });

  pdf.save(`historico-medico-${slug(paciente.nome)}.pdf`);
};

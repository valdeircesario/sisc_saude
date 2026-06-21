import jsPDF from "jspdf";
import { 
  COLORS, 
  safeText, 
  addHeader,
  normalizeText,
  formatDate,
  ML,
  MR,
  DARK,
  MID_GRAY,
  LIGHT_GRAY,
  LINE_GRAY,
  pageWidth,
  pageHeight,
  contentWidth,
  hLine,
  sectionTitle,
  norm
} from "./common";

export const generateVacinasPDF = async (vacinas: any[], paciente: any) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let currentPage = 1;

  // ── Cabeçalho Principal (Título ajustado)
  let y = addHeader(pdf, "Cartão de Vacinação");
  y += 2;

  // Borda decorativa lateral discreta (padrão SISC)
  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML - 10, 0, 1.5, pdf.internal.pageSize.getHeight(), "F");

  // ── Informações do Paciente
  y = sectionTitle(pdf, "Dados do Cidadão", y);
  
  const CW = contentWidth(pdf);
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
// ── Resumo de Imunização
const dosesAplicadas = vacinas.length; // Conta todas as doses no histórico
const proximasDoses = vacinas.filter((v) => v.proximaDose).length; // Conta quantas têm data de retorno

pdf.setFont("helvetica", "bold");
pdf.setFontSize(7);
pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
safeText(pdf, "RESUMO DE IMUNIZAÇÃO", ML, y);

y += 4;
hLine(pdf, y, 0.4, DARK);
y += 6;

// Cards de resumo P&B
pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
pdf.rect(ML, y, (CW / 2) - 2, 12);
pdf.setFontSize(8);
safeText(pdf, "Doses Aplicadas:", ML + 4, y + 7.5);
pdf.setFontSize(10);
safeText(pdf, String(dosesAplicadas), ML + (CW / 2) - 10, y + 8, { align: "right" });

pdf.rect(ML + (CW / 2) + 2, y, (CW / 2) - 2, 12);
pdf.setFontSize(8);
safeText(pdf, "Próximas Doses:", ML + (CW / 2) + 6, y + 7.5);
pdf.setFontSize(10);
safeText(pdf, String(proximasDoses), ML + CW - 6, y + 8, { align: "right" });


  y += 20;

  // ── Tabela de Vacinas
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  
  const headers = ["IMUNOBIOLÓGICO / VACINA", "DATA APL.", "LOTE", "PRÓX. DOSE"];
  const colWidths = [CW * 0.45, CW * 0.18, CW * 0.17, CW * 0.20];
  
  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML, y, CW, 8, "F");
  pdf.setTextColor(255, 255, 255);
  
  let xHeader = ML + 3;
  headers.forEach((h, i) => {
    safeText(pdf, h, xHeader, y + 5.5);
    xHeader += colWidths[i];
  });

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  vacinas.forEach((vacina, index) => {
    if (y > pageHeight(pdf) - 45) {
      pdf.addPage();
      currentPage++;
      y = addHeader(pdf, "Cartão de Vacinação (Cont.)");
      y += 10;
      
      pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
      pdf.rect(ML, y, CW, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      let xH = ML + 3;
      headers.forEach((h, i) => {
        safeText(pdf, h, xH, y + 5.5);
        xH += colWidths[i];
      });
      y += 8;
      pdf.setFont("helvetica", "normal");
    }

    if (index % 2 === 0) {
      pdf.setFillColor(252, 252, 252);
      pdf.rect(ML, y, CW, 9, "F");
    }
    
    pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
    pdf.line(ML, y + 9, ML + CW, y + 9);

    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    
    const dataApl = formatDate(vacina.dataApl);
    // Alteração: se não houver data de próxima dose, exibe PENDENTE ou CONCLUÍDO (ajustar conforme lógica de negócio se necessário)
    const proxDose = vacina.proximaDose ? formatDate(vacina.proximaDose) : "PENDENTE";

    let xRow = ML + 3;
    const nomeVacina = normalizeText(vacina.nome || "—");
    const nomeTruncado = nomeVacina.length > 35 ? nomeVacina.substring(0, 32) + "..." : nomeVacina;
    safeText(pdf, nomeTruncado, xRow, y + 6);
    xRow += colWidths[0];

    safeText(pdf, dataApl, xRow, y + 6);
    xRow += colWidths[1];

    safeText(pdf, normalizeText(vacina.lote || "—"), xRow, y + 6);
    xRow += colWidths[2];

    if (proxDose === "PENDENTE") {
      pdf.setFont("helvetica", "bold");
    }
    safeText(pdf, proxDose, xRow, y + 6);
    pdf.setFont("helvetica", "normal");

    y += 9;
  });

  y += 10;

  if (y > pageHeight(pdf) - 40) {
    pdf.addPage();
    y = 30;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "NOTAS IMPORTANTES", ML, y);
  y += 3;
  hLine(pdf, y, 0.2, LINE_GRAY);
  y += 5;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7);
  const notas = [
    "• Este documento é uma transcrição digital oficial do histórico de vacinação do cidadão.",
    "• Este documento tem validade de 90 dias a partir da data de emissão.",
    "• A veracidade das informações pode ser confirmada junto à unidade de saúde emissora."
  ];

  notas.forEach(nota => {
    safeText(pdf, nota, ML, y);
    y += 4;
  });

  // ── Rodapé Especial (Sem linha de assinatura, com validade)
  const H = pageHeight(pdf);
  const W = pageWidth(pdf);
  hLine(pdf, H - 20, 0.3, LINE_GRAY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  safeText(pdf, "Documento oficial gerado pelo Sistema Individual de Saúde do Cidadão (SISC)", ML, H - 14);
  safeText(pdf, `Emitido em ${new Date().toLocaleString("pt-BR")}`, W - MR, H - 14, { align: "right" });

  pdf.save(`cartao-vacinas-${norm(paciente.nome).toLowerCase().replace(/\s+/g, "-")}.pdf`);
};

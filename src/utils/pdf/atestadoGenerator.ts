import jsPDF from "jspdf";
import { 
  norm, 
  slug, 
  ML, 
  DARK, 
  LINE_GRAY, 
  MID_GRAY, 
  LIGHT_GRAY,
  pageWidth,
  contentWidth,
  addHeader,
  addFooter,
  drawSignature,
  sectionTitle,
  safeText,
  hLine,
  formatDate
} from "./common";

// ─── Primitivos Específicos ───────────────────────────────────────────────────

const fieldUnderline = (
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number => {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), x, y);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, value, x, y + 5);

  hLine(pdf, y + 7, 0.2, LINE_GRAY, x, x + width);
  return y + 10;
};

const twoColumns = (
  pdf: jsPDF,
  col1: { label: string; value: string },
  col2: { label: string; value: string },
  y: number,
): number => {
  const CW = contentWidth(pdf);
  const half = CW / 2;
  fieldUnderline(pdf, col1.label, col1.value, ML, y, half - 5);
  fieldUnderline(pdf, col2.label, col2.value, ML + half + 5, y, half - 5);
  return y + 12;
};

const highlightBlock = (
  pdf: jsPDF,
  label: string,
  value: string,
  subValue: string,
  y: number,
): number => {
  const CW = contentWidth(pdf);
  pdf.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  pdf.roundedRect(ML, y, CW, 18, 2, 2, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML + 5, y + 6);

  pdf.setFontSize(12);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, value, ML + 5, y + 13);

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "italic");
  safeText(pdf, subValue, ML + CW - 5, y + 13, { align: "right" });

  return y + 24;
};

const textBlock = (
  pdf: jsPDF,
  label: string,
  text: string,
  y: number,
): number => {
  const CW = contentWidth(pdf);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  const lines = pdf.splitTextToSize(text, CW);
  pdf.text(lines, ML, y + 5);

  return y + 5 + lines.length * 4 + 4;
};

// ─── Função Principal ─────────────────────────────────────────────────────────

export const generateAtestadoPDF = (
  atestado: any,
  paciente: any,
  medico: any,
  ubs: any,
  assinatura?: {
    texto?: string;
    posX?: number;
    posY?: number;
    registro?: string;
    data?: string;
  },
) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = pageWidth(pdf);
  const colFull = W - 64;

  addHeader(pdf, "Atestado Médico");

  let y = 62;

  // Borda decorativa lateral discreta
  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML - 10, 0, 1.5, pdf.internal.pageSize.getHeight(), "F");

  // ── Paciente
  y = sectionTitle(pdf, "Identificação do Paciente", y);
  y = fieldUnderline(pdf, "Nome do Paciente", norm(paciente?.nome), ML, y, colFull) + 5;
  y = twoColumns(
    pdf,
    { label: "CPF / Documento", value: norm(paciente?.cpf) },
    { label: "CNS", value: norm(paciente?.cns) },
    y,
  );

  y += 6;

  // ── Atendimento
  y = sectionTitle(pdf, "Dados do Atendimento Médico", y);
  y = twoColumns(
    pdf,
    { label: "Profissional Responsável", value: norm(medico?.nome) },
    { label: "Unidade de Saúde", value: norm(ubs?.nome || medico?.ubs?.nome) },
    y,
  );
  y = twoColumns(
    pdf,
    {
      label: "Data da Emissão",
      value: formatDate(atestado?.dataEmissao),
    },
    { label: "CID-10", value: norm(atestado?.cid) },
    y,
  );

  y += 6;

  // ── Afastamento
  y = sectionTitle(pdf, "Dispensa e Recomendações", y);
  y = highlightBlock(
    pdf,
    "Período de Afastamento Concedido",
    `${atestado?.diasRepouso ?? 0} dia(s) de repouso`,
    `Válido a partir desta data`,
    y,
  );
  
  y += 2;
  y = textBlock(pdf, "Finalidade / Justificativa", norm(atestado?.descricao), y);
  
  if (atestado?.observacoes) {
    y = textBlock(
      pdf,
      "Observações Adicionais",
      norm(atestado?.observacoes),
      y,
    );
  }

  drawSignature(pdf, assinatura);
  addFooter(pdf);
  pdf.save(`atestado-${slug(paciente?.nome)}.pdf`);
};

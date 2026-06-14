import jsPDF from "jspdf";

// Cores neutras e profissionais
export const COLORS = {
  primary: [45, 55, 72] as [number, number, number],
  secondary: [74, 85, 104] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 101, 101] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  text: [51, 65, 85] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  background: [249, 250, 251] as [number, number, number],
};

export const LINE_GRAY = [180, 180, 180] as const;
export const DARK = [26, 26, 26] as const;
export const MID_GRAY = [110, 110, 110] as const;
export const LIGHT_GRAY = [240, 240, 240] as const;

export const ML = 28; // margem esquerda
export const MR = 28; // margem direita

// ─── Utilitários de Texto ───────────────────────────────────────────────────

export const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toString()
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[®©™]/g, "")
    .replace(/[\u2000-\u206F]/g, " ")
    .replace(/[\u2070-\u209F]/g, "")
    .replace(/[\u20A0-\u20CF]/g, "")
    .trim();
};

export const safeText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: any,
) => {
  const normalizedText = normalizeText(text);
  pdf.text(normalizedText, x, y, options);
};

export const norm = (v: string | undefined | null): string =>
  String(v ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim() || "—";

export const slug = (name: string) =>
  norm(name).toLowerCase().replace(/\s+/g, "-");

export const formatDate = (d?: string | Date): string => {
  if (!d) return "—";
  try {
    const date = new Date(d);
    // Adiciona o offset do fuso horário para evitar que datas à meia-noite UTC 
    // sejam convertidas para o dia anterior no horário local
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString("pt-BR");
  } catch {
    return String(d);
  }
};

// ─── Primitivos de Layout ────────────────────────────────────────────────────

export const pageWidth = (pdf: jsPDF) => pdf.internal.pageSize.getWidth();
export const pageHeight = (pdf: jsPDF) => pdf.internal.pageSize.getHeight();
export const contentWidth = (pdf: jsPDF) => pageWidth(pdf) - ML - MR;

export const hLine = (
  pdf: jsPDF,
  y: number,
  weight = 0.3,
  color: readonly [number, number, number] = LINE_GRAY,
  x1?: number,
  x2?: number,
) => {
  const W = pageWidth(pdf);
  pdf.setDrawColor(color[0], color[1], color[2]);
  pdf.setLineWidth(weight);
  pdf.line(x1 ?? ML, y, x2 ?? W - MR, y);
};

// ─── Cabeçalhos e Rodapés (Estilo Profissional P&B) ─────────────────────────

export const addHeader = (
  pdf: jsPDF,
  docTitle: string,
  logoBase64?: string,
  logoMime: string = "PNG",
) => {
  const W = pageWidth(pdf);
  const CX = W / 2;

  let logoBottom = 14;
if (logoBase64) {
  const logoW = 36;
  const logoH = 14;
  pdf.addImage(logoBase64, logoMime, CX - logoW / 2, 10, logoW, logoH);
  logoBottom = 10 + logoH + 2;
} else {
  // Logo SISC em destaque
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, "SISC", CX, 18, { align: "center" });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setCharSpace(1);
  safeText(pdf, "SAÚDE DIGITAL", CX, 23, { align: "center" });
  pdf.setCharSpace(0);
  logoBottom = 26;
}

// Subtítulo do sistema
pdf.setFont("helvetica", "italic");
pdf.setFontSize(8);
pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
safeText(
  pdf,
  "sistema individual de saude do cidadão",
  CX,
  logoBottom + 3,
  { align: "center" },
);

  const sepY = logoBottom + 8;
  hLine(pdf, sepY, 1.0, DARK);
  hLine(pdf, sepY + 2.5, 0.3, [140, 140, 140]);

  // Título do documento — centralizado, com letter-spacing
  const docTitleY = sepY + 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);

  // Garantir centralização absoluta usando a largura total / 2
  pdf.setCharSpace(1); // Ajustado para evitar que o espaçamento empurre o texto para fora do centro
  safeText(pdf, docTitle.toUpperCase(), W / 2.2, docTitleY, { align: "center" });
  pdf.setCharSpace(0);

  return sepY + 22; // y inicial para o conteúdo

};

export const addFooter = (pdf: jsPDF) => {
  const W = pageWidth(pdf);
  const H = pageHeight(pdf);

  hLine(pdf, H - 42, 0.3, LINE_GRAY);

  pdf.setDrawColor(DARK[0], DARK[1], DARK[2]);
  pdf.setLineWidth(0.5);
  pdf.line(ML, H - 20, ML + 110, H - 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "Assinatura e carimbo do médico", ML, H - 14);

  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  safeText(
    pdf,
    "Sistema Individual de Saúde do Cidadão",
    W - MR,
    H - 26,
    { align: "right" },
  );
  safeText(
    pdf,
    `Emitido em ${new Date().toLocaleString("pt-BR")}`,
    W - MR,
    H - 19,
    { align: "right" },
  );
};

// ─── Assinatura Digital ─────────────────────────────────────────────────────

export const drawSignature = (pdf: jsPDF, assinatura?: any) => {
  if (!assinatura?.texto || assinatura.posX == null || assinatura.posY == null)
    return;

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(11);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, assinatura.texto, assinatura.posX, assinatura.posY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(
    pdf,
    `CRM: ${norm(assinatura.registro)}`,
    assinatura.posX,
    assinatura.posY + 6,
  );
  safeText(
    pdf,
    `Assinado em ${assinatura.data || new Date().toLocaleDateString("pt-BR")}`,
    assinatura.posX,
    assinatura.posY + 12,
  );
};

// ─── Blocos Comuns ───────────────────────────────────────────────────────────

export const sectionTitle = (pdf: jsPDF, label: string, y: number): number => {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML, y);
  hLine(pdf, y + 2, 0.5, DARK);
  return y + 10;
};

// ─── Cabeçalhos e Rodapés (Estilo Legado/Colorido) ──────────────────────────

export const addMainHeader = (pdf: jsPDF, title: string, subtitle?: string) => {
  const W = pageWidth(pdf);

  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, W, 28, "F");

  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 28, W, 2, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, title, W / 2, 18, { align: "center" });

  if (subtitle) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    safeText(pdf, subtitle, W / 2, 25, { align: "center" });
  }

  return 40;
};

export const addPatientInfo = (pdf: jsPDF, paciente: any, yPosition: number) => {
  const W = pageWidth(pdf);

  pdf.setFillColor(...COLORS.background);
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(1);
  pdf.roundedRect(15, yPosition, W - 30, 28, 4, 4, "FD");

  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, "DADOS DO PACIENTE", 20, yPosition + 8);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...COLORS.text);

  safeText(pdf, `Nome: ${normalizeText(paciente.nome)}`, 20, yPosition + 16);

  const cpfText = paciente.cpf ? `CPF: ${normalizeText(paciente.cpf)}` : "";
  const dataEmissao = `Emissao: ${new Date().toLocaleDateString("pt-BR")}`;

  if (cpfText) {
    safeText(pdf, cpfText, 20, yPosition + 23);
  }
  safeText(pdf, dataEmissao, W - 80, yPosition + 23);

  return yPosition + 35;
};

export const addLegacyFooter = (pdf: jsPDF) => {
  const W = pageWidth(pdf);
  const H = pageHeight(pdf);

  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(20, H - 15, W - 20, H - 15);

  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  safeText(
    pdf,
    "Documento gerado pelo Sistema Municipal de Saude",
    W / 2,
    H - 8,
    { align: "center" },
  );
};

export const addPageNumber = (
  pdf: jsPDF,
  currentPage: number,
  totalPages?: number,
) => {
  const W = pageWidth(pdf);
  const H = pageHeight(pdf);

  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");

  const pageText = totalPages
    ? `Pagina ${currentPage} de ${totalPages}`
    : `Pagina ${currentPage}`;
  safeText(pdf, pageText, W - 20, H - 8, { align: "right" });
};

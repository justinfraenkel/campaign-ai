// utils/downloadDocx.ts
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

/* numeric helper */
const num = (s: string) => Number(String(s).replace(/[^\d.]/g, "")) || 0;

/** Build professional DOCX: branded cover, teal headings, shaded tables */
export function downloadDocx(raw: string) {
  /* --- Parse GPT text --- */
  const blocks = raw.includes("###")
    ? raw.split(/\n(?=### )/g)
    : ["### Campaign Overview\n" + raw];

  const sections = blocks.map((b) => {
    const m = b.match(/^### (.+)/);
    return {
      title: m ? m[1].trim() : "Details",
      body: b.replace(/^### .+\n?/, "").trim(),
    };
  });

  /* --- Cover page --- */
  const cover: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: "campaign.ai", bold: true, color: "11C4D3", size: 96 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: "Campaign Plan", bold: true, size: 64 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Generated ${new Date().toLocaleDateString()}`,
          italics: true,
          color: "666666",
        }),
      ],
    }),
  ];

  /* --- Content section --- */
  const content: (Paragraph | Table)[] = [];
  let budgetLines: { item: string; amount: string }[] = [];

  sections.forEach(({ title, body }) => {
    content.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 150 },
        children: [
          new TextRun({ text: title, bold: true, color: "11C4D3", size: 32 }),
        ],
      })
    );

    if (title.toLowerCase().includes("budget")) {
      budgetLines = body.split("\n").map((l) => {
        const [i, a] = l.split(/\s{2,}/);
        return { item: (i || "").trim(), amount: (a || "").trim() };
      });
    }

    body.split(/\n/).forEach((line) => {
      const txt = line.trim();
      if (!txt) return;

      const run = new TextRun(txt);
      if (/^[-•\*]/.test(txt)) {
        content.push(new Paragraph({ bullet: { level: 0 }, children: [run] }));
      } else {
        content.push(new Paragraph({ children: [run] }));
      }
    });

    content.push(new Paragraph({ spacing: { after: 200 } }));
  });

  /* --- Budget table --- */
  if (budgetLines.length) {
    /* heading */
    content.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
        children: [
          new TextRun({ text: "Budget Allocation", bold: true, color: "11C4D3", size: 28 }),
        ],
      })
    );

    /* table rows */
    const header = new TableRow({
      children: [
        new TableCell({
          shading: { fill: "11C4D3" },
          children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true })] })],
        }),
        new TableCell({
          shading: { fill: "11C4D3" },
          children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true })] })],
        }),
      ],
    });

    const rows = budgetLines.map((b) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun(b.item)] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun(b.amount)] })] }),
        ],
      })
    );

    content.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [header, ...rows],
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      })
    );

    /* bar lines */
    const maxVal = Math.max(...budgetLines.map((b) => num(b.amount))) || 1;
    budgetLines.forEach((b) => {
      const len = Math.round((num(b.amount) / maxVal) * 28) || 1;
      content.push(
        new Paragraph({ children: [new TextRun({ text: `${b.item}: ${b.amount}`, bold: true })] })
      );
      content.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: "█".repeat(len), color: "11C4D3", size: 24 })],
        })
      );
    });
  }

  /* --- Build & save --- */
  const doc = new Document({
    sections: [
      { children: cover },
      { children: content },
    ],
  });

  Packer.toBlob(doc).then((blob: Blob) => saveAs(blob, "campaign_plan.docx"));
}

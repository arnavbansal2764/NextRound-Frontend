import { jsPDF } from "jspdf";

export function generatePdf(data: string) {
  const doc = new jsPDF();
  const parsedData = JSON.parse(data);
  const resumeText = parsedData.resume;
  const lineHeight = 10; 
  const margin = 10;
  let y = margin;

  resumeText.split("\n").forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });
  doc.save("customized_resume.pdf");
}

import jsPDF from "jspdf";
import Papa from "papaparse";
import { ReportData } from "@/hooks/useReportData";
import { format } from "date-fns";

export const exportToPDF = (reportData: ReportData, startDate: Date, endDate: Date) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors matching the app theme
  const primaryColor: [number, number, number] = [30, 58, 138]; // Navy Blue
  const secondaryColor: [number, number, number] = [5, 150, 105]; // Forest Green
  const accentColor: [number, number, number] = [251, 191, 36]; // Golden Yellow
  const lightGray: [number, number, number] = [241, 245, 249];
  const darkGray: [number, number, number] = [31, 41, 55];

  // Helper function to draw a box
  const drawBox = (x: number, y: number, width: number, height: number, fillColor?: [number, number, number], borderColor?: [number, number, number]) => {
    if (fillColor) {
      pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      pdf.rect(x, y, width, height, 'F');
    }
    if (borderColor) {
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height, 'S');
    }
  };

  // Header Section with background
  drawBox(0, 0, pageWidth, 50, primaryColor);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text("Financial Report", pageWidth / 2, 25, { align: "center" });
  
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text(
    `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`,
    pageWidth / 2,
    38,
    { align: "center" }
  );

  yPosition = 60;
  pdf.setTextColor(...darkGray);

  // Summary Cards Section
  const cardWidth = (pageWidth - 50) / 3;
  const cardHeight = 35;
  const cardY = yPosition;

  // Total Expenses Card
  drawBox(15, cardY, cardWidth, cardHeight, lightGray, primaryColor);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("TOTAL EXPENSES", 20, cardY + 10);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(...darkGray);
  pdf.text(`₹${reportData.expenses.total.toLocaleString()}`, 20, cardY + 23);

  // Total Savings Card
  const card2X = 20 + cardWidth;
  drawBox(card2X, cardY, cardWidth, cardHeight, lightGray, secondaryColor);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("TOTAL SAVINGS", card2X + 5, cardY + 10);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(...darkGray);
  pdf.text(`₹${reportData.savings.totalSaved.toLocaleString()}`, card2X + 5, cardY + 23);

  // EMI Outstanding Card
  const card3X = 25 + (cardWidth * 2);
  drawBox(card3X, cardY, cardWidth, cardHeight, lightGray, accentColor);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EMI OUTSTANDING", card3X + 5, cardY + 10);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(...darkGray);
  pdf.text(`₹${reportData.emi.totalOutstanding.toLocaleString()}`, card3X + 5, cardY + 23);

  yPosition = cardY + cardHeight + 20;

  // Expenses Section
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...primaryColor);
  pdf.text("Expense Breakdown", 15, yPosition);
  yPosition += 8;

  // Table Header
  drawBox(15, yPosition, pageWidth - 30, 10, primaryColor);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text("Category", 20, yPosition + 7);
  pdf.text("Amount", pageWidth - 50, yPosition + 7, { align: "right" });
  yPosition += 10;

  // Table Rows
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(...darkGray);
  let rowIndex = 0;
  Object.entries(reportData.expenses.byCategory).forEach(([category, amount]) => {
    const bgColor: [number, number, number] = rowIndex % 2 === 0 ? [255, 255, 255] : lightGray;
    drawBox(15, yPosition, pageWidth - 30, 8, bgColor, [220, 220, 220]);
    
    pdf.setFontSize(9);
    pdf.text(category, 20, yPosition + 6);
    pdf.text(`₹${amount.toLocaleString()}`, pageWidth - 50, yPosition + 6, { align: "right" });
    yPosition += 8;
    rowIndex++;
  });

  yPosition += 15;

  // Savings Section
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...secondaryColor);
  pdf.text("Savings Goals Progress", 15, yPosition);
  yPosition += 8;

  if (reportData.savings.goalProgress.length > 0) {
    // Table Header
    drawBox(15, yPosition, pageWidth - 30, 10, secondaryColor);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("Goal", 20, yPosition + 7);
    pdf.text("Progress", pageWidth / 2 + 10, yPosition + 7);
    pdf.text("Amount", pageWidth - 50, yPosition + 7, { align: "right" });
    yPosition += 10;

    // Table Rows
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...darkGray);
    rowIndex = 0;
    reportData.savings.goalProgress.forEach((goal) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const bgColor: [number, number, number] = rowIndex % 2 === 0 ? [255, 255, 255] : lightGray;
      drawBox(15, yPosition, pageWidth - 30, 12, bgColor, [220, 220, 220]);
      
      pdf.setFontSize(9);
      pdf.text(goal.title, 20, yPosition + 7);
      
      // Progress bar
      const progressBarWidth = 40;
      const progressBarX = pageWidth / 2 + 10;
      drawBox(progressBarX, yPosition + 3, progressBarWidth, 6, [230, 230, 230]);
      drawBox(progressBarX, yPosition + 3, progressBarWidth * (goal.progress / 100), 6, secondaryColor);
      pdf.text(`${goal.progress.toFixed(0)}%`, progressBarX + progressBarWidth + 5, yPosition + 7);
      
      pdf.text(
        `₹${goal.current.toLocaleString()} / ₹${goal.target.toLocaleString()}`,
        pageWidth - 50,
        yPosition + 7,
        { align: "right" }
      );
      yPosition += 12;
      rowIndex++;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("No savings goals set", 20, yPosition + 10);
    yPosition += 20;
  }

  yPosition += 15;

  // EMI Section
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...accentColor);
  pdf.text("Active Loans & EMI", 15, yPosition);
  yPosition += 8;

  // Summary Box
  drawBox(15, yPosition, pageWidth - 30, 18, lightGray, accentColor);
  pdf.setFontSize(10);
  pdf.setTextColor(...darkGray);
  pdf.text("Total Outstanding:", 20, yPosition + 8);
  pdf.setFont(undefined, 'bold');
  pdf.text(`₹${reportData.emi.totalOutstanding.toLocaleString()}`, 70, yPosition + 8);
  pdf.setFont(undefined, 'normal');
  pdf.text("Monthly Payment:", 20, yPosition + 15);
  pdf.setFont(undefined, 'bold');
  pdf.text(`₹${reportData.emi.monthlyPayment.toLocaleString()}`, 70, yPosition + 15);
  yPosition += 25;

  if (reportData.emi.loans.length > 0) {
    // Table Header
    drawBox(15, yPosition, pageWidth - 30, 10, accentColor);
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("Lender", 20, yPosition + 7);
    pdf.text("Outstanding", pageWidth / 2, yPosition + 7);
    pdf.text("EMI", pageWidth - 50, yPosition + 7, { align: "right" });
    yPosition += 10;

    // Table Rows
    pdf.setFont(undefined, 'normal');
    rowIndex = 0;
    reportData.emi.loans.forEach((loan) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const bgColor: [number, number, number] = rowIndex % 2 === 0 ? [255, 255, 255] : lightGray;
      drawBox(15, yPosition, pageWidth - 30, 8, bgColor, [220, 220, 220]);
      
      pdf.setFontSize(9);
      pdf.text(loan.lender, 20, yPosition + 6);
      pdf.text(`₹${loan.outstanding.toLocaleString()}`, pageWidth / 2, yPosition + 6);
      pdf.text(`₹${loan.emi.toLocaleString()}`, pageWidth - 50, yPosition + 6, { align: "right" });
      yPosition += 8;
      rowIndex++;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("No active loans", 20, yPosition + 10);
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated on ${format(new Date(), "MMM dd, yyyy 'at' hh:mm a")}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  pdf.text("Trackget - Your Financial Companion", pageWidth / 2, footerY + 5, { align: "center" });

  // Save the PDF
  pdf.save(`financial-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const exportToCSV = (reportData: ReportData, startDate: Date, endDate: Date) => {
  const csvData = [];

  // Header
  csvData.push(["Financial Report"]);
  csvData.push([`Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`]);
  csvData.push([]);

  // Expenses
  csvData.push(["Expenses Summary"]);
  csvData.push(["Total Expenses", `₹${reportData.expenses.total.toLocaleString()}`]);
  csvData.push([]);
  csvData.push(["Category", "Amount"]);
  Object.entries(reportData.expenses.byCategory).forEach(([category, amount]) => {
    csvData.push([category, `₹${amount.toLocaleString()}`]);
  });
  csvData.push([]);

  // Savings
  csvData.push(["Savings Summary"]);
  csvData.push(["Total Saved", `₹${reportData.savings.totalSaved.toLocaleString()}`]);
  csvData.push(["Total Target", `₹${reportData.savings.totalTarget.toLocaleString()}`]);
  csvData.push([]);
  csvData.push(["Goal", "Current", "Target", "Progress %"]);
  reportData.savings.goalProgress.forEach((goal) => {
    csvData.push([
      goal.title,
      `₹${goal.current.toLocaleString()}`,
      `₹${goal.target.toLocaleString()}`,
      `${goal.progress.toFixed(1)}%`,
    ]);
  });
  csvData.push([]);

  // EMI
  csvData.push(["EMI Summary"]);
  csvData.push(["Total Outstanding", `₹${reportData.emi.totalOutstanding.toLocaleString()}`]);
  csvData.push(["Monthly Payment", `₹${reportData.emi.monthlyPayment.toLocaleString()}`]);
  csvData.push([]);
  csvData.push(["Lender", "Outstanding", "EMI"]);
  reportData.emi.loans.forEach((loan) => {
    csvData.push([
      loan.lender,
      `₹${loan.outstanding.toLocaleString()}`,
      `₹${loan.emi.toLocaleString()}`,
    ]);
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `financial-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

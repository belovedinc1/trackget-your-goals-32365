import jsPDF from "jspdf";
import Papa from "papaparse";
import { ReportData } from "@/hooks/useReportData";
import { format } from "date-fns";

export const exportToPDF = (reportData: ReportData, startDate: Date, endDate: Date) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text("Financial Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Date range
  pdf.setFontSize(12);
  pdf.text(
    `Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 20;

  // Expenses Summary
  pdf.setFontSize(16);
  pdf.text("Expenses Summary", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Total Expenses: ₹${reportData.expenses.total.toLocaleString()}`, 20, yPosition);
  yPosition += 10;

  pdf.text("Category Breakdown:", 20, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  Object.entries(reportData.expenses.byCategory).forEach(([category, amount]) => {
    pdf.text(`  ${category}: ₹${amount.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Savings Summary
  pdf.setFontSize(16);
  pdf.text("Savings Summary", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Total Saved: ₹${reportData.savings.totalSaved.toLocaleString()}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Total Target: ₹${reportData.savings.totalTarget.toLocaleString()}`, 20, yPosition);
  yPosition += 10;

  if (reportData.savings.goalProgress.length > 0) {
    pdf.text("Goals Progress:", 20, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    reportData.savings.goalProgress.forEach((goal) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(
        `  ${goal.title}: ₹${goal.current.toLocaleString()} / ₹${goal.target.toLocaleString()} (${goal.progress.toFixed(1)}%)`,
        20,
        yPosition
      );
      yPosition += 6;
    });
  }

  yPosition += 10;

  // EMI Summary
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.text("EMI Summary", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Total Outstanding: ₹${reportData.emi.totalOutstanding.toLocaleString()}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Monthly Payment: ₹${reportData.emi.monthlyPayment.toLocaleString()}`, 20, yPosition);
  yPosition += 10;

  if (reportData.emi.loans.length > 0) {
    pdf.text("Active Loans:", 20, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    reportData.emi.loans.forEach((loan) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(
        `  ${loan.lender}: ₹${loan.outstanding.toLocaleString()} (EMI: ₹${loan.emi.toLocaleString()})`,
        20,
        yPosition
      );
      yPosition += 6;
    });
  }

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

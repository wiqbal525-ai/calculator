const TAB_INPUTS = 'Inputs';
const TAB_SCHEDULE = 'Schedule';
const TAB_SCENARIOS = 'Scenarios';

const COLORS = {
  title: '#d9ead3',
  section: '#fce5cd',
  input: '#fff2cc',
  output: '#ead1dc',
  header: '#efefef',
  accent: '#d0e0e3',
};

function setupMusharakaCalculator() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetMap = ensureSheets_(spreadsheet);

  buildInputsSheet_(sheetMap[TAB_INPUTS]);
  buildScheduleSheet_(sheetMap[TAB_SCHEDULE]);
  buildScenariosSheet_(sheetMap[TAB_SCENARIOS]);

  spreadsheet.setActiveSheet(sheetMap[TAB_INPUTS]);
}

function ensureSheets_(spreadsheet) {
  const sheetMap = {};
  [TAB_INPUTS, TAB_SCHEDULE, TAB_SCENARIOS].forEach((sheetName) => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    sheet.clear();
    sheet.clearFormats();
    sheetMap[sheetName] = sheet;
  });

  return sheetMap;
}

function buildInputsSheet_(sheet) {
  sheet.setHiddenGridlines(true);
  sheet.setColumnWidths(1, 6, 150);
  sheet.getRange('B1:F1').merge();
  sheet.getRange('B1').setValue('Diminishing Musharaka Calculator').setFontSize(14).setFontWeight('bold');
  sheet.getRange('B1:F1').setBackground(COLORS.title);

  const financingRows = [
    ['Purchase price', 700000, 'purchase_price'],
    ['Down payment', 200000, 'down_payment'],
    ['Financing amount', '=C4-C5', 'financing_amount'],
    ['Profit rate (annual)', 0.0675, 'profit_rate_annual'],
    ['Term (years)', 25, 'term_years'],
    ['Term (months)', '=C7*12', 'term_months'],
    ['Qualification ratio', 0.30, 'qualification_ratio'],
    ['Monthly property tax', 350, 'property_tax_monthly'],
    ['Stress-test rate add-on', 0.02, 'stress_rate_addon'],
    ['Default monthly prepayment', 0, 'default_monthly_prepayment'],
  ];

  const affordabilityRows = [
    ['Monthly payment', '=-PMT(profit_rate_annual/12, term_months, financing_amount)', 'monthly_payment'],
    ['Stress tested payment', '=-PMT((profit_rate_annual+stress_rate_addon)/12, term_months, financing_amount)', 'stress_tested_payment'],
    ['Estimated monthly property tax', '=property_tax_monthly', 'estimated_property_tax'],
    ['Required monthly income', '=(stress_tested_payment+estimated_property_tax)/qualification_ratio', 'required_monthly_income'],
    ['Required annual income', '=required_monthly_income*12', 'required_annual_income'],
    ['x income', '=1/qualification_ratio', 'income_multiple'],
  ];

  sheet.getRange('B3:C3').merge();
  sheet.getRange('B3').setValue('Financing').setBackground(COLORS.section).setFontWeight('bold');
  writeInputBlock_(sheet, 4, financingRows);

  sheet.getRange('E3:F3').merge();
  sheet.getRange('E3').setValue('Affordability').setBackground(COLORS.section).setFontWeight('bold');
  writeOutputBlock_(sheet, 4, affordabilityRows);

  sheet.getRange('B16:F18').merge();
  sheet.getRange('B16').setValue(
    'Edit yellow cells only. Financing amount is calculated from purchase price minus down payment. Qualification is based on a 30% housing ratio by default.'
  ).setWrap(true).setBackground(COLORS.accent);

  sheet.getRange('C4:C13').setNumberFormats([
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['0.00%'],
    ['0'],
    ['0'],
    ['0.00%'],
    ['$#,##0.00'],
    ['0.00%'],
    ['$#,##0.00'],
  ]);
  sheet.getRange('F4:F9').setNumberFormats([
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['0.00x'],
  ]);

  sheet.setFrozenRows(3);
}

function writeInputBlock_(sheet, startRow, rows) {
  rows.forEach(([label, value, rangeName], index) => {
    const row = startRow + index;
    sheet.getRange(row, 2).setValue(label).setFontWeight('bold');
    sheet.getRange(row, 3).setValue(value).setBackground(COLORS.input);
    const namedRange = sheet.getRange(row, 3);
    SpreadsheetApp.getActiveSpreadsheet().setNamedRange(rangeName, namedRange);
  });
}

function writeOutputBlock_(sheet, startRow, rows) {
  rows.forEach(([label, value, rangeName], index) => {
    const row = startRow + index;
    sheet.getRange(row, 5).setValue(label).setFontWeight('bold');
    sheet.getRange(row, 6).setFormula(value).setBackground(COLORS.output);
    const namedRange = sheet.getRange(row, 6);
    SpreadsheetApp.getActiveSpreadsheet().setNamedRange(rangeName, namedRange);
  });
}

function buildScheduleSheet_(sheet) {
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(1);

  sheet.getRange('A1:L1').merge();
  sheet.getRange('A1').setValue('Monthly Musharaka Schedule').setFontWeight('bold').setFontSize(13).setBackground(COLORS.title);

  const headers = [
    'Period',
    'Beginning Fund Balance',
    'Total Installment',
    'Payment Toward Fund Profit',
    'Payment Toward Share Cost Price',
    'Ending Fund Contribution Balance',
    'Quarterly Sale Price Transfer %',
    'Quarterly Share Transfer %',
    'Quarterly Unit Transfer',
    'Annual % Transfer',
    'Client Ownership %',
    'Prepayment',
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]).setBackground(COLORS.header).setFontWeight('bold').setWrap(true);
  sheet.setColumnWidths(1, 12, 145);

  const maxPeriods = 300;
  for (let offset = 0; offset < maxPeriods; offset += 1) {
    const row = 3 + offset;
    if (offset === 0) {
      sheet.getRange(row, 1).setFormula('=IF(ROW()-2<=term_months, ROW()-2, "")');
      sheet.getRange(row, 2).setFormula('=IF(A3="", "", financing_amount)');
    } else {
      sheet.getRange(row, 1).setFormula(`=IF(ROW()-2<=term_months, ROW()-2, "")`);
      sheet.getRange(row, 2).setFormula(`=IF(A${row}="", "", F${row - 1})`);
    }

    sheet.getRange(row, 3).setFormula(`=IF(A${row}="", "", monthly_payment)`);
    sheet.getRange(row, 4).setFormula(`=IF(A${row}="", "", ROUND(B${row}*(profit_rate_annual/12), 2))`);
    sheet.getRange(row, 5).setFormula(`=IF(A${row}="", "", ROUND(C${row}-D${row}, 2))`);
    sheet.getRange(row, 12).setFormula(`=IF(A${row}="", "", default_monthly_prepayment)`);
    sheet.getRange(row, 6).setFormula(`=IF(A${row}="", "", MAX(0, ROUND(B${row}-E${row}-L${row}, 2)))`);
    sheet.getRange(row, 7).setFormula(`=IF(OR(A${row}="", MOD(A${row}, 3)<>0), "", ROUND((SUM(E${Math.max(3, row - 2)}:E${row}) + SUM(L${Math.max(3, row - 2)}:L${row}))/purchase_price, 4))`);
    sheet.getRange(row, 8).setFormula(`=IF(G${row}="", "", G${row})`);
    sheet.getRange(row, 9).setFormula(`=IF(H${row}="", "", ROUND(H${row}*1000000, 0))`);
    sheet.getRange(row, 10).setFormula(`=IF(A${row}="", "", ROUND(((E${row}+L${row})*12)/purchase_price, 4))`);
    sheet.getRange(row, 11).setFormula(`=IF(A${row}="", "", ROUND((down_payment + SUM($E$3:E${row}) + SUM($L$3:L${row}))/purchase_price, 4))`);
  }

  sheet.getRange('A3:A302').setNumberFormat('0');
  sheet.getRange('B3:F302').setNumberFormat('$#,##0.00');
  sheet.getRange('G3:H302').setNumberFormat('0.00%');
  sheet.getRange('I3:I302').setNumberFormat('#,##0');
  sheet.getRange('J3:K302').setNumberFormat('0.00%');
  sheet.getRange('L3:L302').setNumberFormat('$#,##0.00');

  sheet.getRange('N2:O8').setValues([
    ['Validation checks', ''],
    ['Final balance', '=INDEX(F3:F302, term_months)'],
    ['Final ownership', '=INDEX(K3:K302, term_months)'],
    ['Total share purchased', '=SUM(E3:E302)+SUM(L3:L302)'],
    ['Expected share purchased', '=purchase_price-down_payment'],
    ['Balance difference', '=O5-O6'],
    ['Notes', 'Quarterly transfer fields are modeled as quarterly sums of share purchases.'],
  ]);
  sheet.getRange('N2:O2').setBackground(COLORS.section).setFontWeight('bold');
  sheet.getRange('O3:O7').setNumberFormats([
    ['$#,##0.00'],
    ['0.00%'],
    ['$#,##0.00'],
    ['$#,##0.00'],
    ['$#,##0.00'],
  ]);
}

function buildScenariosSheet_(sheet) {
  sheet.setHiddenGridlines(true);
  sheet.getRange('A1:F1').merge();
  sheet.getRange('A1').setValue('Scenario Comparison').setFontWeight('bold').setFontSize(13).setBackground(COLORS.title);

  const headers = ['Scenario', 'Purchase Price', 'Down Payment', 'Profit Rate', 'Term Years', 'Monthly Prepayment'];
  const rows = [
    ['Base case', '=Inputs!C4', '=Inputs!C5', '=Inputs!C7', '=Inputs!C8', '=Inputs!C13'],
    ['Higher down payment', '', '', '', '', ''],
    ['Faster payoff', '', '', '', '', ''],
    ['Rate stress', '', '', '', '', ''],
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]).setBackground(COLORS.header).setFontWeight('bold');
  sheet.getRange(3, 1, rows.length, headers.length).setValues(rows);
  sheet.setColumnWidths(1, 6, 160);
}
function createSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  CONFIG.SHEETS.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
      // Add headers based on sheet name
      if (sheetName === 'Applications') {
        const headers = [
          'ApplicationID', 'CreatedDate', 'FullName', 'Gender', 'DOB', 'Phone', 'Email',
          'Province', 'District', 'Commune', 'Village', 'Address', 'Occupation', 'Company', 'Position',
          'Income', 'OtherIncome', 'WorkingExperience', 'EmploymentType', 'LoanType', 'LoanAmount',
          'LoanPurpose', 'LoanPeriod', 'InterestRate', 'PreferredBranch', 'Status', 'FolderID',
          'IDFrontFileID', 'IDFrontURL', 'IDBackFileID', 'IDBackURL', 'SalarySlipFileID', 'SalarySlipURL',
          'SelfieFileID', 'SelfieURL', 'OtherFileID', 'OtherURL', 'OfficerRemark'
        ];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
        sheet.setFrozenRows(1);
      } else if (sheetName === 'Settings') {
        sheet.appendRow(['Key', 'Value', 'Description']);
        sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#f3f4f6');
        sheet.setFrozenRows(1);
      }
    }
  });
}

function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function setSetting(key, value, description = '') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      if (description) sheet.getRange(i + 1, 3).setValue(description);
      return;
    }
  }
  sheet.appendRow([key, value, description]);
}

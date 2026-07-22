const CONFIG = {
  APP_NAME: 'HFC Easy Apply',
  MAIN_FOLDER_NAME: 'HFC Easy Apply',
  APPLICANTS_FOLDER_NAME: 'Applicants',
  SHEETS: [
    'Users', 'Applications', 'Branches', 'LoanProducts', 
    'Notifications', 'Promotions', 'FAQ', 'Settings', 'ActivityLogs'
  ]
};

function setupSystem() {
  createSheets();
  createFolders();
  SpreadsheetApp.getUi().alert('System Setup Complete! Required sheets and Google Drive folders have been created.');
}

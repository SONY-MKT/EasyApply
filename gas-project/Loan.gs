function generateApplicationID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Applications');
  const lastRow = sheet.getLastRow();
  const year = new Date().getFullYear();
  let count = 1;
  
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue();
    if (lastId && lastId.toString().includes(year)) {
      const parts = lastId.toString().split('-');
      if (parts.length === 3) {
        count = parseInt(parts[2], 10) + 1;
      }
    }
  }
  
  return `HFC-${year}-${String(count).padStart(6, '0')}`;
}

function saveApplication(formData) {
  try {
    const settings = getSettings();
    const applicantsFolderId = settings['APPLICANTS_FOLDER_ID'];
    if (!applicantsFolderId) throw new Error('System not setup. Please run setupSystem() first from Apps Script IDE.');
    
    const applicantsFolder = DriveApp.getFolderById(applicantsFolderId);
    const appId = generateApplicationID();
    const appFolder = applicantsFolder.createFolder(appId);
    const appFolderId = appFolder.getId();
    
    const uploadedDocs = {};
    const docTypes = ['idFront', 'idBack', 'salarySlip', 'selfie', 'other'];
    
    docTypes.forEach(docType => {
      if (formData[docType] && formData[docType].data) {
        const ext = formData[docType].name.split('.').pop();
        const newName = `${docType.toUpperCase()}_${appId}.${ext}`;
        const result = uploadToDrive(formData[docType].data, newName, appFolderId);
        uploadedDocs[docType] = result;
      }
    });
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Applications');
    
    const rowData = [
      appId,
      new Date(),
      formData.fullName || '',
      formData.gender || '',
      formData.dob || '',
      formData.phone || '',
      formData.email || '',
      formData.province || '',
      formData.district || '',
      formData.commune || '',
      formData.village || '',
      formData.address || '',
      formData.occupation || '',
      formData.company || '',
      formData.position || '',
      formData.income || '',
      formData.otherIncome || '',
      formData.workingExperience || '',
      formData.employmentType || '',
      formData.loanType || '',
      formData.loanAmount || '',
      formData.loanPurpose || '',
      formData.loanPeriod || '',
      formData.interestRate || '',
      formData.preferredBranch || '',
      'Pending',
      appFolderId,
      uploadedDocs.idFront ? uploadedDocs.idFront.fileId : '',
      uploadedDocs.idFront ? uploadedDocs.idFront.previewUrl : '',
      uploadedDocs.idBack ? uploadedDocs.idBack.fileId : '',
      uploadedDocs.idBack ? uploadedDocs.idBack.previewUrl : '',
      uploadedDocs.salarySlip ? uploadedDocs.salarySlip.fileId : '',
      uploadedDocs.salarySlip ? uploadedDocs.salarySlip.previewUrl : '',
      uploadedDocs.selfie ? uploadedDocs.selfie.fileId : '',
      uploadedDocs.selfie ? uploadedDocs.selfie.previewUrl : '',
      uploadedDocs.other ? uploadedDocs.other.fileId : '',
      uploadedDocs.other ? uploadedDocs.other.previewUrl : '',
      ''
    ];
    
    sheet.appendRow(rowData);
    return { success: true, applicationId: appId, message: 'Application submitted successfully.' };
    
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

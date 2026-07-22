function createFolders() {
  let mainFolder;
  const folders = DriveApp.getFoldersByName(CONFIG.MAIN_FOLDER_NAME);
  if (folders.hasNext()) {
    mainFolder = folders.next();
  } else {
    mainFolder = DriveApp.createFolder(CONFIG.MAIN_FOLDER_NAME);
  }
  
  setSetting('MAIN_FOLDER_ID', mainFolder.getId(), 'ID of the root application folder');
  
  let applicantsFolder;
  const appFolders = mainFolder.getFoldersByName(CONFIG.APPLICANTS_FOLDER_NAME);
  if (appFolders.hasNext()) {
    applicantsFolder = appFolders.next();
  } else {
    applicantsFolder = mainFolder.createFolder(CONFIG.APPLICANTS_FOLDER_NAME);
  }
  
  setSetting('APPLICANTS_FOLDER_ID', applicantsFolder.getId(), 'ID of the applicants folder');
}

function uploadToDrive(base64Data, filename, folderId) {
  try {
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, filename);
    
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    
    // Make previewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      fileId: file.getId(),
      url: file.getUrl(),
      previewUrl: `https://drive.google.com/uc?export=view&id=${file.getId()}`
    };
  } catch (e) {
    Logger.log(e.toString());
    throw new Error('Failed to upload file: ' + filename);
  }
}

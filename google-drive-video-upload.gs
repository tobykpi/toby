const FOLDER_ID = "1_pv7HA7mbeGkHLbdclo1cUi0ph7p7YHq";

function doPost(event) {
  try {
    const filename = event.parameter.filename || "uploaded-video";
    const mimeType = event.parameter.mimeType || "application/octet-stream";
    const fileData = event.parameter.fileData;

    if (!fileData) {
      return htmlResponse("Missing file data.");
    }

    if (!mimeType.startsWith("video/")) {
      return htmlResponse("Only video files are accepted.");
    }

    const bytes = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(bytes, mimeType, filename);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);

    file.setName(filename);

    return htmlResponse("Uploaded " + filename);
  } catch (error) {
    return htmlResponse("Upload failed: " + error.message);
  }
}

function htmlResponse(message) {
  return HtmlService.createHtmlOutput("<!doctype html><title>Upload</title><p>" + escapeHtml(message) + "</p>");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const FOLDER_ID = "1_pv7HA7mbeGkHLbdclo1cUi0ph7p7YHq";

function doPost(event) {
  try {
    const filename = event.parameter.filename || "uploaded-video";
    const mimeType = event.parameter.mimeType || "application/octet-stream";
    const fileData = event.parameter.fileData;

    if (!fileData) {
      return htmlResponse("Missing file data.", false);
    }

    if (!mimeType.startsWith("video/") && !mimeType.startsWith("image/")) {
      return htmlResponse("Only video and image files are accepted.", false);
    }

    const bytes = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(bytes, mimeType, filename);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);

    file.setName(filename);

    return htmlResponse("Uploaded " + filename, true);
  } catch (error) {
    return htmlResponse("Upload failed: " + error.message, false);
  }
}

function htmlResponse(message, ok) {
  const payload = JSON.stringify({
    type: "tobykpi-upload-result",
    ok: ok,
    message: message
  });

  return HtmlService.createHtmlOutput(
    "<!doctype html><title>Upload</title><script>window.parent.postMessage(" +
    payload +
    ", '*');</script><p>" +
    escapeHtml(message) +
    "</p>"
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

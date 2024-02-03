const fse = require('fs-extra');
const path = require('path');

async function mergeDxtFilesAndCleanup() {
  // Folder name
  const folderName = 'test';

  try {
    // Find .dxt files in the folder
    const dxtFiles = await fse.readdir(folderName);
    const dxtFilePaths = dxtFiles.filter(file => file.endsWith('.dxt')).map(file => path.join(folderName, file));

    if (dxtFilePaths.length === 0) {
      console.log('No .dxt files found in the folder.');
      return;
    }

    // Merge .dxt files
    const mergedDxtContent = await mergeDxtFiles(dxtFilePaths);

    // Create hdr file
    const hdrContent = createHdrContent(dxtFiles, mergedDxtContent);

    // Create src file
    const srcContent = Buffer.from(mergedDxtContent);

    // Save hdr and src files
    await fse.outputFile(path.join(folderName, 'result.hdr'), hdrContent);
    await fse.outputFile(path.join(folderName, 'result.src'), srcContent);

    // Delete .dxt files
    await cleanupDxtFiles(dxtFilePaths);

    console.log('Merging and cleanup completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Merge .dxt files
async function mergeDxtFiles(dxtFilePaths) {
  const mergedBuffers = await Promise.all(dxtFilePaths.map(filePath => fse.readFile(filePath)));
  return Buffer.concat(mergedBuffers);
}

// Create content for hdr file
function createHdrContent(dxtFiles, mergedDxtContent) {
  const totalFiles = dxtFiles.length;
  const totalNameLength = dxtFiles.reduce((total, file) => total + file.length, 0);

  return `${totalFiles}\n${totalNameLength}\n${dxtFiles.map(file => `${file}\n${mergedDxtContent.length}`).join('\n')}\n`;
}

// Delete .dxt files
async function cleanupDxtFiles(dxtFilePaths) {
  await Promise.all(dxtFilePaths.map(filePath => fse.unlink(filePath)));
}

// Run the function
mergeDxtFilesAndCleanup();

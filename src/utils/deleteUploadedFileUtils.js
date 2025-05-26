import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);

// Function for deleting the uploaded file from upload folder
const deleteUploadedFile = (filename) => {
  const filePath = join(process.cwd(), 'src/utils/upload', filename);
  console.log("filnename", filename);
  console.log(`Deleting file: ${filePath}`);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file '${filename}':`, err.message);
    } else {
      console.log(`File '${filename}' deleted from upload folder.`);
    }
  });
};

export default deleteUploadedFile;
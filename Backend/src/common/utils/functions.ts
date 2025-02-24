import path from 'path';
import fs from 'fs';

export function deleteFileInPublic(fileAddress: string | undefined): void {
  if (fileAddress) {
    if (fs.existsSync(fileAddress)) {
      fs.unlinkSync(fileAddress);
    } else {
      console.log(`File not found: ${fileAddress}`);
    }
  } else {
    console.log('No file address provided.');
  } 
}

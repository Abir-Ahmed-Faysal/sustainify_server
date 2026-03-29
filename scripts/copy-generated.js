import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, "../src/generated");
const destPath = path.join(__dirname, "../dist/generated");

// Remove destination if it exists
if (fs.existsSync(destPath)) {
  fs.rmSync(destPath, { recursive: true, force: true });
}

// Copy the generated folder
function copyFolder(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    const stat = fs.statSync(srcFile);

    if (stat.isDirectory()) {
      copyFolder(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

copyFolder(srcPath, destPath);
console.log("✅ Generated folder copied successfully");

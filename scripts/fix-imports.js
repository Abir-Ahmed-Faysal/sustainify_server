import fs from "fs";
import path from "path";

const distRoot = path.resolve("dist");
const distGenerated = path.join(distRoot, "src", "generated");

function fixDir(dir) {
  const abs = path.resolve(dir);
  if (abs === distGenerated || abs.startsWith(distGenerated + path.sep)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      fixDir(full);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    let content = fs.readFileSync(full, "utf8");

    content = content.replace(
      /from\s+["'](\.\.?\/[^"']+)["']/g,
      (match, p1) => {
        if (p1.endsWith(".js")) return match;

        if (p1.endsWith("/generated/prisma")) {
          return match.replace(p1, `${p1}/index.js`);
        }

        return match.replace(p1, `${p1}.js`);
      },
    );

    fs.writeFileSync(full, content);
  }
}

fixDir("./dist");

const srcGenerated = path.join("src", "generated");
if (fs.existsSync(srcGenerated)) {
  fs.mkdirSync(path.dirname(distGenerated), { recursive: true });
  fs.rmSync(distGenerated, { recursive: true, force: true });
  fs.cpSync(srcGenerated, distGenerated, { recursive: true });
}

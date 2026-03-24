import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name. Usage: node generate-module.js [moduleName]");
  process.exit(1);
}

const modulePath = path.join(__dirname, "src", "app", "modules", moduleName);

if (fs.existsSync(modulePath)) {
  console.error(`Module "${moduleName}" already exists at ${modulePath}`);
  process.exit(1);
}

try {
  fs.mkdirSync(modulePath, { recursive: true });

  const files = [
    {
      name: `${moduleName}.controller.ts`,
      content: `import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ${moduleName}Service } from "./${moduleName}.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";

const create${capitalize(moduleName)} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${moduleName}Service.create${capitalize(moduleName)}(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "${capitalize(moduleName)} created successfully",
    data: result,
  });
});

export const ${moduleName}Controller = {
  create${capitalize(moduleName)},
};
`,
    },
    {
      name: `${moduleName}.service.ts`,
      content: `import { prisma } from "../../lib/prisma";

const create${capitalize(moduleName)} = async (payload: any) => {
  const result = await prisma.${moduleName}.create({ data: payload });
  return result;
};

export const ${moduleName}Service = {
  create${capitalize(moduleName)},
};
`,
    },
    {
      name: `${moduleName}.routes.ts`,
      content: `import { Router } from "express";
import { ${moduleName}Controller } from "./${moduleName}.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ${moduleName}Validation } from "./${moduleName}.validation";

const router = Router();

router.post(
  "/create-${moduleName}",
  validateRequest(${moduleName}Validation.create${capitalize(moduleName)}ValidationSchema),
  ${moduleName}Controller.create${capitalize(moduleName)}
);

export const ${moduleName}Routes = router;
`,
    },
    {
      name: `${moduleName}.validation.ts`,
      content: `import { z } from "zod";

const create${capitalize(moduleName)}ValidationSchema = z.object({
  // Add your validation fields here using the Sustainify pattern, e.g.:
  // fieldName: z.string("fieldName is required"),
});

export const ${moduleName}Validation = {
  create${capitalize(moduleName)}ValidationSchema,
};
`,
    },
    {
      name: `${moduleName}.interface.ts`,
      content: `export type I${capitalize(moduleName)} = {
  // Add your interface fields here
};
`,
    },
  ];

  files.forEach((file) => {
    fs.writeFileSync(path.join(modulePath, file.name), file.content);
    console.log(`Created: ${file.name}`);
  });

  console.log(`\nSuccessfully generated module "${moduleName}" in ${modulePath}`);
} catch (error) {
  console.error("Error creating module:", error);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

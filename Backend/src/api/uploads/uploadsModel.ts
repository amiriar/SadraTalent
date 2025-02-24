import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UploadSchema = z.object({
  _Id: z.string(),
  filePath: z.string(),
  // type: z.enum(["image", "audio", "video", "document"]),
  type: z.string(),
  size: z.number().positive(),
  uploadedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Upload = z.infer<typeof UploadSchema>;

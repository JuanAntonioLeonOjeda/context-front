import { z } from "zod";

// Build-time configuration enters through one schema, like every external input.
const schema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default("/api"),
});

export const apiBaseUrl = schema.parse(import.meta.env).VITE_API_BASE_URL;

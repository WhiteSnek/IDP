import { z } from 'zod'

const registerApplicationSchema = z.object({
    name: z.string().min(1, "Application name is required"),
    redirectUrls: z.array(z.url("Each redirect URL must be a valid URL")).min(1, "At least one redirect URL is required")
})

export { registerApplicationSchema };
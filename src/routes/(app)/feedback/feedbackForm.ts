import { z } from "zod";

export const FeedbackFormTypes = z.enum(['bug', 'feature', 'other']);
export type FeedbackFormTypes = z.infer<typeof FeedbackFormTypes>;

export const FeedbackFormSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(2).max(500),
    type: FeedbackFormTypes.default('not_selected' as FeedbackFormTypes), // Abuse the typing system to set an empty default value
});
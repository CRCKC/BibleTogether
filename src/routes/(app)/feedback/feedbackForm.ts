import { z } from "zod";

export const FeedbackFormTypes = ['bug', 'feature', 'other'] as const;

export const FeedbackFormSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(2).max(500),
    type: z.enum(FeedbackFormTypes)
});
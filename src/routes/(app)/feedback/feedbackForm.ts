import { firebaseAuth, firebaseFirestore } from "$lib/firebase/firebase";
import { addDoc, collection } from "firebase/firestore";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

export const FeedbackFormTypes = z.enum(['bug', 'feature', 'other']);
export type FeedbackFormTypes = z.infer<typeof FeedbackFormTypes>;

export const FeedbackFormSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(20).max(500),
    type: FeedbackFormTypes.default('not_selected' as FeedbackFormTypes), // Abuse the typing system to set an empty default value
    status: z.enum(['open', 'closed', 'accepted']).default('open'),
    uid: z.string(),
    date: z.date().default(() => new Date()),
});

export async function submitFeedback(formData: FormData) {
    const form = await superValidate(formData, zod(FeedbackFormSchema));
    console.log(form);
    if (!form.valid) {
        return false;
    }

    // Submit feedback to firebase database
    return uploadNewFeedback(form.data);


}

async function uploadNewFeedback(data: z.infer<typeof FeedbackFormSchema>) {
    const userId = firebaseAuth.currentUser?.uid;

    if (!userId) {
        console.error('User not logged in');
        return false;
    }

    data.uid = userId;
    const newFeedbackDocRef = collection(firebaseFirestore, "feedback");

    try {
        await addDoc(newFeedbackDocRef, data);
        return true;
    } catch (error) {
        console.error('Error writing document: ', error);
        return false;
    }

}
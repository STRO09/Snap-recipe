'use server';
/**
 * @fileOverview Generates recipe suggestions based on a photo of ingredients.
 *
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRecipesFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestRecipesFromPhotoInput = z.infer<typeof SuggestRecipesFromPhotoInputSchema>;

const SuggestRecipesFromPhotoOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.string().describe('The instructions for preparing the recipe.'),
    })
  ).describe('An array of suggested recipes based on the ingredients in the photo.'),
});
export type SuggestRecipesFromPhotoOutput = z.infer<typeof SuggestRecipesFromPhotoOutputSchema>;

export async function suggestRecipesFromPhoto(input: SuggestRecipesFromPhotoInput): Promise<SuggestRecipesFromPhotoOutput> {
  return suggestRecipesFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesFromPhotoPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(
        z.object({
          name: z.string().describe('The name of the recipe.'),
          ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
          instructions: z.string().describe('The instructions for preparing the recipe.'),
        })
      ).describe('An array of suggested recipes based on the ingredients in the photo.'),
    }),
  },
  prompt: `You are a recipe suggestion AI.  A user will upload a photo of ingredients they have available to them, and you will suggest recipes that they can make with those ingredients.  Suggest at least three recipes.

Here is the photo:

{{media url=photoDataUri}}`,
});

const suggestRecipesFromPhotoFlow = ai.defineFlow<
  typeof SuggestRecipesFromPhotoInputSchema,
  typeof SuggestRecipesFromPhotoOutputSchema
>({
  name: 'suggestRecipesFromPhotoFlow',
  inputSchema: SuggestRecipesFromPhotoInputSchema,
  outputSchema: SuggestRecipesFromPhotoOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

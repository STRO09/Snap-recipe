'use client';

import Image from 'next/image';
import {useState, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Preferences} from '@/services/preferences';
import {Checkbox} from '@/components/ui/checkbox';
import {suggestRecipesFromPhoto} from '@/ai/flows/suggest-recipes-from-photo';
import {filterRecipes} from '@/services/preferences';
import {Toaster} from '@/components/ui/toaster';
import {useToast} from '@/hooks/use-toast';
import {useEffect} from 'react';

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreferenceChange = (pref: keyof Preferences) => {
    setPreferences(prev => ({...prev, [pref]: !prev[pref]}));
  };

  const handleSubmit = useCallback(async () => {
    if (!photo) {
      toast({
        title: 'No photo selected',
        description: 'Please upload a photo of your ingredients.',
      });
      return;
    }

    setLoading(true);
    try {
      const suggestedRecipes = await suggestRecipesFromPhoto({photoDataUri: photo});
      if (suggestedRecipes?.recipes) {
        // TODO: Implement filterRecipes using an API or filtering algorithm.
        const filtered = await filterRecipes(suggestedRecipes.recipes, preferences);
        setRecipes(filtered);
      } else {
        toast({
          title: 'Error',
          description: 'Could not generate recipes from photo.',
        });
        setRecipes([]);
      }
    } catch (error: any) {
      console.error('Error suggesting recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recipes. Please try again.',
      });
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [photo, preferences, toast]);

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-background">
      <Toaster />
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">RecipeSnap</h1>
        <p className="text-muted-foreground">
          Upload a photo of your ingredients and let AI suggest recipes!
        </p>
      </header>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Upload Ingredients</CardTitle>
          <CardDescription>Take a snap or upload an image of your ingredients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="picture">Select Photo:</Label>
            <Input id="picture" type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
          {photo && (
            <div className="relative w-32 h-32 rounded-md overflow-hidden">
              <Image src={photo} alt="Ingredients" layout="fill" objectFit="cover" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Filter recipes based on your dietary needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="vegetarian" checked={preferences.vegetarian} onCheckedChange={() => handlePreferenceChange('vegetarian')} />
            <Label htmlFor="vegetarian">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="vegan" checked={preferences.vegan} onCheckedChange={() => handlePreferenceChange('vegan')} />
            <Label htmlFor="vegan">Vegan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="glutenFree" checked={preferences.glutenFree} onCheckedChange={() => handlePreferenceChange('glutenFree')} />
            <Label htmlFor="glutenFree">Gluten-Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dairyFree" checked={preferences.dairyFree} onCheckedChange={() => handlePreferenceChange('dairyFree')} />
            <Label htmlFor="dairyFree">Dairy-Free</Label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
        {loading ? 'Suggesting...' : 'Suggest Recipes'}
      </Button>

      {recipes.length > 0 && (
        <div className="w-full max-w-3xl mt-8 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Suggested Recipes</h2>
          {recipes.map((recipe, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>A delicious recipe you can make with your ingredients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="text-lg font-semibold">Ingredients:</h3>
                <ul className="list-disc pl-4">
                  {recipe.ingredients.map((ingredient: string, i: number) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mt-2">Instructions:</h3>
                <p>{recipe.instructions}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export interface FoodMacro {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
}

/** Cropped Unsplash stills. URLs are stored in the catalog (no live API). */
export function unsplashFood(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=480&h=480&q=80`;
}

/** Typical macros per 100 g, used to auto-fill a meal from food + quantity. */
export const FOOD_CATALOG: FoodMacro[] = [
  { name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, imageUrl: unsplashFood('photo-1512058564366-18510be2db19') },
  { name: 'Chicken', calories: 165, protein: 31, carbs: 0, fat: 3.6, imageUrl: unsplashFood('photo-1598103442097-8b74394b95c6') },
  { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1.1, imageUrl: unsplashFood('photo-1621996346565-e3dbc646d9a9') },
  { name: 'Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, imageUrl: unsplashFood('photo-1509440159596-0249088772ff') },
  { name: 'Egg', calories: 155, protein: 13, carbs: 1.1, fat: 11, imageUrl: unsplashFood('photo-1525351484163-7529414344d8') },
  { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, imageUrl: unsplashFood('photo-1488477181946-6428a0291777') },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, imageUrl: unsplashFood('photo-1571771894821-ce9b6c11b08e') },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, imageUrl: unsplashFood('photo-1560806887-1e4cd0b6cbd6') },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, imageUrl: unsplashFood('photo-1467003909585-2f8a72700288') },
  { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1.3, imageUrl: unsplashFood('photo-1615141982883-c7ad0e69fd62') },
  { name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 15, imageUrl: unsplashFood('photo-1544025162-d766403b8d2f') },
  { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1, imageUrl: unsplashFood('photo-1518977676601-b53f82be2211') },
  { name: 'Salad', calories: 20, protein: 1.2, carbs: 3.6, fat: 0.2, imageUrl: unsplashFood('photo-1512621776951-a57141f2eefd') },
  { name: 'Olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, imageUrl: unsplashFood('photo-1474979266404-7eaacbcd87c5') },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, imageUrl: unsplashFood('photo-1599599810769-bcde5a160d32') },
  { name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 7, imageUrl: unsplashFood('photo-1517686469429-8bdb88b9f907') },
  { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, imageUrl: unsplashFood('photo-1563636619-e9143da7973b') },
  { name: 'Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, imageUrl: unsplashFood('photo-1486297678162-eb2a19b0a32d') },
  { name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0.4, imageUrl: unsplashFood('photo-1596797038530-2c107229654b') },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, imageUrl: unsplashFood('photo-1523049673857-eb18f1d7b578') },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, imageUrl: unsplashFood('photo-1459411621453-7b03977f4bfc') },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, imageUrl: unsplashFood('photo-1546094096-0df4bcaaa337') },
  { name: 'Couscous', calories: 112, protein: 3.8, carbs: 23, fat: 0.2, imageUrl: unsplashFood('photo-1604329760661-e71dc83f8f26') },
  { name: 'Chickpeas', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, imageUrl: unsplashFood('photo-1571068316344-75bc76f77890') },
  { name: 'Shrimp', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, imageUrl: unsplashFood('photo-1559339352-11d035aa65de') },
  { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, imageUrl: unsplashFood('photo-1547592180-85f173990554') },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, imageUrl: unsplashFood('photo-1576045057995-568f588f82fb') },
  { name: 'Sweet potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, imageUrl: unsplashFood('photo-1596097635121-14b63b7a0c16') },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, imageUrl: unsplashFood('photo-1547514701-4278210174e7') },
  { name: 'Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, imageUrl: unsplashFood('photo-1464965911861-746a04b4bca6') },
  { name: 'Honey', calories: 304, protein: 0.3, carbs: 82, fat: 0, imageUrl: unsplashFood('photo-1587049352846-4a222e784d38') },
  { name: 'Dates', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, imageUrl: unsplashFood('photo-1559181567-c3190ca9959b') },
  { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, imageUrl: unsplashFood('photo-1546069901-ba9599a7e63c') },
  { name: 'Lamb', calories: 294, protein: 25, carbs: 0, fat: 21, imageUrl: unsplashFood('photo-1529042410759-befb1204b468') },
  { name: 'Corn', calories: 86, protein: 3.3, carbs: 19, fat: 1.2, imageUrl: unsplashFood('photo-1551754655-cd27e38d2076') },
];

export interface MealFoodLine {
  name: string;
  grams: number;
}

export function foodByName(name: string): FoodMacro | undefined {
  const key = name.trim().toLowerCase();
  return (
    FOOD_CATALOG.find((food) => food.name.toLowerCase() === key) ??
    FOOD_CATALOG.find((food) => key.includes(food.name.toLowerCase()) || food.name.toLowerCase().includes(key))
  );
}

export function macrosFor(name: string, grams: number): FoodMacro {
  const item = foodByName(name);
  const factor = Math.max(0, grams) / 100;
  if (!item) {
    return {
      name: name.trim() || 'Food',
      calories: Math.round(120 * factor),
      protein: Math.round(6 * factor),
      carbs: Math.round(15 * factor),
      fat: Math.round(4 * factor),
      imageUrl: '',
    };
  }
  return {
    name: item.name,
    calories: Math.round(item.calories * factor),
    protein: Math.round(item.protein * factor * 10) / 10,
    carbs: Math.round(item.carbs * factor * 10) / 10,
    fat: Math.round(item.fat * factor * 10) / 10,
    imageUrl: item.imageUrl,
  };
}

export function sumMacros(lines: MealFoodLine[]): Omit<FoodMacro, 'name' | 'imageUrl'> {
  return lines.reduce(
    (total, line) => {
      const macros = macrosFor(line.name, line.grams);
      return {
        calories: total.calories + macros.calories,
        protein: Math.round((total.protein + macros.protein) * 10) / 10,
        carbs: Math.round((total.carbs + macros.carbs) * 10) / 10,
        fat: Math.round((total.fat + macros.fat) * 10) / 10,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function foodImageUrl(name: string): string | null {
  const url = foodByName(name)?.imageUrl;
  return url || null;
}

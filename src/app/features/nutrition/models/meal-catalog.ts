import type { MealType } from './nutrition.models';
import { unsplashFood, type MealFoodLine } from './food-catalog';

export interface MealPreset {
  name: string;
  imageUrl: string;
  foods: MealFoodLine[];
}

export const MEAL_CATALOG: Record<MealType, MealPreset[]> = {
  breakfast: [
    { name: 'Oatmeal bowl', imageUrl: unsplashFood('photo-1495214786740-6d135b4ba81a'), foods: [{ name: 'Oats', grams: 60 }, { name: 'Milk', grams: 200 }, { name: 'Banana', grams: 100 }] },
    { name: 'Eggs and toast', imageUrl: unsplashFood('photo-1525351484163-7529414344d8'), foods: [{ name: 'Egg', grams: 100 }, { name: 'Bread', grams: 60 }] },
    { name: 'Yogurt and fruit', imageUrl: unsplashFood('photo-1488477181946-6428a0291777'), foods: [{ name: 'Yogurt', grams: 150 }, { name: 'Apple', grams: 120 }] },
    { name: 'Avocado toast', imageUrl: unsplashFood('photo-1541519227354-08bf5a18d1b3'), foods: [{ name: 'Bread', grams: 70 }, { name: 'Avocado', grams: 80 }, { name: 'Egg', grams: 50 }] },
    { name: 'Pancakes', imageUrl: unsplashFood('photo-1567620905732-2d1ec7ab7445'), foods: [{ name: 'Oats', grams: 40 }, { name: 'Milk', grams: 120 }, { name: 'Egg', grams: 50 }, { name: 'Honey', grams: 15 }] },
    { name: 'Granola parfait', imageUrl: unsplashFood('photo-1506086679524-382d5bd6d52b'), foods: [{ name: 'Yogurt', grams: 180 }, { name: 'Oats', grams: 40 }, { name: 'Strawberry', grams: 80 }] },
    { name: 'Smoothie bowl', imageUrl: unsplashFood('photo-1623428187969-5da2dcea5ebf'), foods: [{ name: 'Banana', grams: 120 }, { name: 'Strawberry', grams: 80 }, { name: 'Yogurt', grams: 100 }, { name: 'Almonds', grams: 15 }] },
    { name: 'Shakshuka', imageUrl: unsplashFood('photo-1482049016688-2d3e1b311543'), foods: [{ name: 'Egg', grams: 100 }, { name: 'Tomato', grams: 150 }, { name: 'Bread', grams: 50 }] },
    { name: 'Croissant breakfast', imageUrl: unsplashFood('photo-1555507036-ab1f4038808a'), foods: [{ name: 'Bread', grams: 70 }, { name: 'Cheese', grams: 30 }, { name: 'Orange', grams: 150 }] },
    { name: 'Fruit salad', imageUrl: unsplashFood('photo-1490474418585-ba9bad8fd0ea'), foods: [{ name: 'Apple', grams: 100 }, { name: 'Banana', grams: 80 }, { name: 'Orange', grams: 100 }, { name: 'Strawberry', grams: 60 }] },
    { name: 'Dates and yogurt', imageUrl: unsplashFood('photo-1559181567-c3190ca9959b'), foods: [{ name: 'Yogurt', grams: 150 }, { name: 'Dates', grams: 40 }, { name: 'Almonds', grams: 15 }] },
    { name: 'Spinach omelette', imageUrl: unsplashFood('photo-1510693206972-df098062cb71'), foods: [{ name: 'Egg', grams: 120 }, { name: 'Spinach', grams: 80 }, { name: 'Cheese', grams: 20 }] },
    { name: 'Sweet potato hash', imageUrl: unsplashFood('photo-1596097635121-14b63b7a0c16'), foods: [{ name: 'Sweet potato', grams: 180 }, { name: 'Egg', grams: 100 }, { name: 'Spinach', grams: 50 }] },
    { name: 'Honey oats', imageUrl: unsplashFood('photo-1517686469429-8bdb88b9f907'), foods: [{ name: 'Oats', grams: 70 }, { name: 'Milk', grams: 180 }, { name: 'Honey', grams: 20 }] },
  ],
  lunch: [
    { name: 'Chicken and rice', imageUrl: unsplashFood('photo-1598103442097-8b74394b95c6'), foods: [{ name: 'Chicken', grams: 150 }, { name: 'Rice', grams: 100 }, { name: 'Salad', grams: 80 }] },
    { name: 'Pasta bowl', imageUrl: unsplashFood('photo-1621996346565-e3dbc646d9a9'), foods: [{ name: 'Pasta', grams: 120 }, { name: 'Tomato', grams: 80 }, { name: 'Cheese', grams: 30 }] },
    { name: 'Tuna salad', imageUrl: unsplashFood('photo-1540189549336-e6e99c3679fe'), foods: [{ name: 'Tuna', grams: 120 }, { name: 'Salad', grams: 100 }, { name: 'Olive oil', grams: 10 }] },
    { name: 'Buddha bowl', imageUrl: unsplashFood('photo-1546069901-ba9599a7e63c'), foods: [{ name: 'Quinoa', grams: 100 }, { name: 'Chickpeas', grams: 80 }, { name: 'Avocado', grams: 60 }, { name: 'Salad', grams: 80 }] },
    { name: 'Chicken wrap', imageUrl: unsplashFood('photo-1626700051175-6818013e1d4f'), foods: [{ name: 'Chicken', grams: 120 }, { name: 'Bread', grams: 70 }, { name: 'Salad', grams: 60 }] },
    { name: 'Couscous chicken', imageUrl: unsplashFood('photo-1604329760661-e71dc83f8f26'), foods: [{ name: 'Couscous', grams: 150 }, { name: 'Chicken', grams: 120 }, { name: 'Chickpeas', grams: 60 }] },
    { name: 'Lentil soup', imageUrl: unsplashFood('photo-1547592166-23ac45744acd'), foods: [{ name: 'Lentils', grams: 180 }, { name: 'Tomato', grams: 80 }, { name: 'Bread', grams: 40 }] },
    { name: 'Quinoa salad', imageUrl: unsplashFood('photo-1512621776951-a57141f2eefd'), foods: [{ name: 'Quinoa', grams: 120 }, { name: 'Tomato', grams: 70 }, { name: 'Avocado', grams: 50 }, { name: 'Olive oil', grams: 8 }] },
    { name: 'Grilled shrimp bowl', imageUrl: unsplashFood('photo-1559339352-11d035aa65de'), foods: [{ name: 'Shrimp', grams: 140 }, { name: 'Rice', grams: 100 }, { name: 'Broccoli', grams: 80 }] },
    { name: 'Beef rice plate', imageUrl: unsplashFood('photo-1432139509613-5c4255815697'), foods: [{ name: 'Beef', grams: 130 }, { name: 'Rice', grams: 110 }, { name: 'Broccoli', grams: 70 }] },
    { name: 'Falafel plate', imageUrl: unsplashFood('photo-1601050690597-df0568f70950'), foods: [{ name: 'Chickpeas', grams: 150 }, { name: 'Salad', grams: 90 }, { name: 'Bread', grams: 50 }] },
    { name: 'Pesto pasta', imageUrl: unsplashFood('photo-1473093295043-cdd812d0e601'), foods: [{ name: 'Pasta', grams: 130 }, { name: 'Spinach', grams: 60 }, { name: 'Cheese', grams: 25 }, { name: 'Olive oil', grams: 8 }] },
    { name: 'Salmon poke', imageUrl: unsplashFood('photo-1579871494447-9811cf80d66c'), foods: [{ name: 'Salmon', grams: 120 }, { name: 'Rice', grams: 100 }, { name: 'Avocado', grams: 50 }] },
    { name: 'Veggie sandwich', imageUrl: unsplashFood('photo-1528735602780-2552fd46c7af'), foods: [{ name: 'Bread', grams: 80 }, { name: 'Tomato', grams: 50 }, { name: 'Cheese', grams: 30 }, { name: 'Spinach', grams: 30 }] },
    { name: 'Tofu stir-fry', imageUrl: unsplashFood('photo-1546069901-d5bfd2cbfb1f'), foods: [{ name: 'Tofu', grams: 150 }, { name: 'Rice', grams: 100 }, { name: 'Broccoli', grams: 90 }] },
    { name: 'Corn salad', imageUrl: unsplashFood('photo-1551754655-cd27e38d2076'), foods: [{ name: 'Corn', grams: 120 }, { name: 'Tomato', grams: 80 }, { name: 'Cheese', grams: 20 }, { name: 'Olive oil', grams: 8 }] },
  ],
  snack: [
    { name: 'Yogurt and almonds', imageUrl: unsplashFood('photo-1488477181946-6428a0291777'), foods: [{ name: 'Yogurt', grams: 150 }, { name: 'Almonds', grams: 20 }] },
    { name: 'Banana', imageUrl: unsplashFood('photo-1571771894821-ce9b6c11b08e'), foods: [{ name: 'Banana', grams: 120 }] },
    { name: 'Cheese and bread', imageUrl: unsplashFood('photo-1486297678162-eb2a19b0a32d'), foods: [{ name: 'Cheese', grams: 40 }, { name: 'Bread', grams: 40 }] },
    { name: 'Apple and almonds', imageUrl: unsplashFood('photo-1560806887-1e4cd0b6cbd6'), foods: [{ name: 'Apple', grams: 150 }, { name: 'Almonds', grams: 20 }] },
    { name: 'Dates and nuts', imageUrl: unsplashFood('photo-1559181567-c3190ca9959b'), foods: [{ name: 'Dates', grams: 50 }, { name: 'Almonds', grams: 20 }] },
    { name: 'Strawberry yogurt', imageUrl: unsplashFood('photo-1464965911861-746a04b4bca6'), foods: [{ name: 'Yogurt', grams: 150 }, { name: 'Strawberry', grams: 80 }] },
    { name: 'Orange', imageUrl: unsplashFood('photo-1547514701-4278210174e7'), foods: [{ name: 'Orange', grams: 180 }] },
    { name: 'Hummus dip', imageUrl: unsplashFood('photo-1571068316344-75bc76f77890'), foods: [{ name: 'Chickpeas', grams: 80 }, { name: 'Olive oil', grams: 8 }, { name: 'Bread', grams: 40 }] },
    { name: 'Avocado snack', imageUrl: unsplashFood('photo-1523049673857-eb18f1d7b578'), foods: [{ name: 'Avocado', grams: 80 }, { name: 'Bread', grams: 40 }] },
    { name: 'Honey toast', imageUrl: unsplashFood('photo-1587049352846-4a222e784d38'), foods: [{ name: 'Bread', grams: 50 }, { name: 'Honey', grams: 20 }] },
    { name: 'Mixed fruit', imageUrl: unsplashFood('photo-1619566636858-adf3ef46400b'), foods: [{ name: 'Apple', grams: 80 }, { name: 'Banana', grams: 80 }, { name: 'Orange', grams: 80 }] },
    { name: 'Cheese cubes', imageUrl: unsplashFood('photo-1452195100486-9cc805987862'), foods: [{ name: 'Cheese', grams: 40 }] },
  ],
  dinner: [
    { name: 'Salmon and potatoes', imageUrl: unsplashFood('photo-1467003909585-2f8a72700288'), foods: [{ name: 'Salmon', grams: 150 }, { name: 'Potato', grams: 150 }, { name: 'Broccoli', grams: 100 }] },
    { name: 'Lentil bowl', imageUrl: unsplashFood('photo-1547592166-23ac45744acd'), foods: [{ name: 'Lentils', grams: 150 }, { name: 'Rice', grams: 80 }, { name: 'Salad', grams: 80 }] },
    { name: 'Beef and vegetables', imageUrl: unsplashFood('photo-1544025162-d766403b8d2f'), foods: [{ name: 'Beef', grams: 140 }, { name: 'Broccoli', grams: 100 }, { name: 'Potato', grams: 120 }] },
    { name: 'Grilled chicken plate', imageUrl: unsplashFood('photo-1532550907401-a532c00947da'), foods: [{ name: 'Chicken', grams: 160 }, { name: 'Sweet potato', grams: 140 }, { name: 'Salad', grams: 90 }] },
    { name: 'Lamb couscous', imageUrl: unsplashFood('photo-1529042410759-befb1204b468'), foods: [{ name: 'Lamb', grams: 140 }, { name: 'Couscous', grams: 150 }, { name: 'Chickpeas', grams: 70 }] },
    { name: 'Shrimp pasta', imageUrl: unsplashFood('photo-1563379926898-05f4575a45d8'), foods: [{ name: 'Shrimp', grams: 140 }, { name: 'Pasta', grams: 120 }, { name: 'Tomato', grams: 70 }] },
    { name: 'Vegetable curry', imageUrl: unsplashFood('photo-1585937421612-70a008356fbe'), foods: [{ name: 'Potato', grams: 120 }, { name: 'Chickpeas', grams: 100 }, { name: 'Rice', grams: 100 }, { name: 'Spinach', grams: 50 }] },
    { name: 'Ramen bowl', imageUrl: unsplashFood('photo-1569718212165-3a8278d5f624'), foods: [{ name: 'Pasta', grams: 110 }, { name: 'Egg', grams: 50 }, { name: 'Spinach', grams: 40 }, { name: 'Chicken', grams: 80 }] },
    { name: 'Baked salmon salad', imageUrl: unsplashFood('photo-1559847844-5315695dadae'), foods: [{ name: 'Salmon', grams: 140 }, { name: 'Salad', grams: 120 }, { name: 'Olive oil', grams: 10 }] },
    { name: 'Steak dinner', imageUrl: unsplashFood('photo-1432139509613-5c4255815697'), foods: [{ name: 'Beef', grams: 160 }, { name: 'Potato', grams: 150 }, { name: 'Spinach', grams: 60 }] },
    { name: 'Tofu vegetable plate', imageUrl: unsplashFood('photo-1512621776951-a57141f2eefd'), foods: [{ name: 'Tofu', grams: 160 }, { name: 'Broccoli', grams: 100 }, { name: 'Rice', grams: 100 }] },
    { name: 'Chicken quinoa', imageUrl: unsplashFood('photo-1604908176997-125f25cc6f3d'), foods: [{ name: 'Chicken', grams: 140 }, { name: 'Quinoa', grams: 120 }, { name: 'Broccoli', grams: 80 }] },
    { name: 'Fish and salad', imageUrl: unsplashFood('photo-1519708227418-c8fd9a32b7a2'), foods: [{ name: 'Salmon', grams: 150 }, { name: 'Salad', grams: 100 }, { name: 'Tomato', grams: 60 }] },
    { name: 'Sweet potato chicken', imageUrl: unsplashFood('photo-1598515214211-89d3c73ae83b'), foods: [{ name: 'Chicken', grams: 150 }, { name: 'Sweet potato', grams: 160 }, { name: 'Spinach', grams: 70 }] },
    { name: 'Chickpea tagine', imageUrl: unsplashFood('photo-1455619452474-d2be8b1e70cd'), foods: [{ name: 'Chickpeas', grams: 150 }, { name: 'Tomato', grams: 90 }, { name: 'Couscous', grams: 120 }] },
    { name: 'Grilled vegetables', imageUrl: unsplashFood('photo-1540420773420-3366772f4999'), foods: [{ name: 'Broccoli', grams: 100 }, { name: 'Tomato', grams: 80 }, { name: 'Sweet potato', grams: 120 }, { name: 'Olive oil', grams: 10 }] },
  ],
};

export const MEAL_NAME_PRESETS = MEAL_CATALOG;

export function mealsForType(type: MealType): MealPreset[] {
  return MEAL_CATALOG[type] ?? [];
}

export function findMealPreset(name: string, type?: MealType): MealPreset | undefined {
  const key = name.trim().toLowerCase();
  const pools = type ? [MEAL_CATALOG[type]] : Object.values(MEAL_CATALOG);
  for (const list of pools) {
    const match = list.find((meal) => meal.name.toLowerCase() === key);
    if (match) {
      return match;
    }
  }
  return undefined;
}

export function mealImageUrl(name: string, type?: MealType): string | null {
  return findMealPreset(name, type)?.imageUrl ?? null;
}

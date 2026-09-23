import { describe, expect, it } from 'vitest';
import { FOOD_CATALOG, macrosFor, sumMacros } from './food-catalog';
import { MEAL_CATALOG, findMealPreset, mealImageUrl } from './meal-catalog';

describe('food catalog macros', () => {
  it('scales rice macros from 100 g', () => {
    expect(macrosFor('Rice', 100).calories).toBe(130);
    expect(macrosFor('rice', 200).calories).toBe(260);
  });

  it('sums several foods by quantity', () => {
    const totals = sumMacros([
      { name: 'Rice', grams: 100 },
      { name: 'Chicken', grams: 150 },
    ]);
    expect(totals.calories).toBe(130 + Math.round(165 * 1.5));
    expect(totals.protein).toBeGreaterThan(0);
  });

  it('stores an image URL on every food', () => {
    expect(FOOD_CATALOG.length).toBeGreaterThan(20);
    for (const food of FOOD_CATALOG) {
      expect(food.imageUrl.startsWith('https://images.unsplash.com/')).toBe(true);
    }
  });
});

describe('meal catalog images', () => {
  it('covers each meal type with stored photos', () => {
    const types = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
    let total = 0;
    for (const type of types) {
      expect(MEAL_CATALOG[type].length).toBeGreaterThanOrEqual(12);
      total += MEAL_CATALOG[type].length;
      for (const meal of MEAL_CATALOG[type]) {
        expect(meal.imageUrl.startsWith('https://images.unsplash.com/')).toBe(true);
        expect(meal.foods.length).toBeGreaterThan(0);
      }
    }
    expect(total).toBeGreaterThanOrEqual(50);
  });

  it('looks up a meal photo by name', () => {
    expect(findMealPreset('Chicken and rice')?.name).toBe('Chicken and rice');
    expect(mealImageUrl('Chicken and rice')).toContain('images.unsplash.com');
  });
});

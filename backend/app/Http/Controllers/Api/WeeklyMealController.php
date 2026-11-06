<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklyMeal;

class WeeklyMealController extends Controller
{
    public function index()
    {
        $meals = WeeklyMeal::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $meals->map(function ($m) {
                return [
                    'id' => $m->id,
                    'day' => $m->day_key,
                    'dayName' => $m->day_name,
                    'name' => $m->name,
                    'description' => $m->description,
                    'price' => (float) $m->price,
                    'calories' => $m->calories,
                    'tag' => $m->tag,
                    'image' => $m->image,
                    'sideDishes' => $m->side_dishes ?? [],
                    'benefits' => $m->benefits ?? [],
                    'chefTip' => $m->chef_tip,
                ];
            }),
        ]);
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;

class DishController extends Controller
{
    /**
     * Get dishes with optional category, search, and best-sellers filtering
     */
    public function index(Request $request)
    {
        $query = Dish::query()->where('is_available', true);

        // فلترة بالقسم
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // فلترة بالأكثر طلباً
        if ($request->boolean('best_sellers')) {
            $query->where('is_best_seller', true);
        }

        // البحث بالاسم أو الوصف أو التاج
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('tag', 'like', "%{$q}%");
            });
        }

        $dishes = $query->orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'count' => $dishes->count(),
            'data' => $dishes->map(function ($dish) {
                return [
                    'id' => $dish->id,
                    'categoryId' => $dish->category_id,
                    'name' => $dish->name,
                    'description' => $dish->description,
                    'price' => (float) $dish->price,
                    'calories' => $dish->calories,
                    'tag' => $dish->tag,
                    'icon' => $dish->icon,
                    'image' => $dish->image,
                    'isBestSeller' => $dish->is_best_seller,
                ];
            }),
        ]);
    }

    /**
     * Get single dish by ID
     */
    public function show($id)
    {
        $dish = Dish::where('id', $id)->first();

        if (!$dish) {
            return response()->json([
                'success' => false,
                'message' => 'الطبق غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $dish->id,
                'categoryId' => $dish->category_id,
                'name' => $dish->name,
                'description' => $dish->description,
                'price' => (float) $dish->price,
                'calories' => $dish->calories,
                'tag' => $dish->tag,
                'icon' => $dish->icon,
                'image' => $dish->image,
                'isAvailable' => $dish->is_available,
            ],
        ]);
    }
}


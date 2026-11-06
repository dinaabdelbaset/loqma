<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all active categories with dishes count
     */
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->withCount(['dishes' => function ($q) {
                $q->where('is_available', true);
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $categories->count(),
            'data' => $categories->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'nameEn' => $cat->name_en ?? $cat->id,
                    'arabicSubtitle' => $cat->arabic_subtitle ?? '',
                    'description' => $cat->description ?? '',
                    'icon' => $cat->icon,
                    'tag' => $cat->tag,
                    'bannerImg' => $cat->banner_img,
                    'dishesCount' => $cat->dishes_count ?? 0,
                    'badge' => $cat->tag,
                    'sortOrder' => $cat->sort_order,
                ];
            }),
        ]);
    }

    /**
     * Get a single category by ID with its dishes
     */
    public function show($id)
    {
        $category = Category::where('id', $id)
            ->where('is_active', true)
            ->with(['dishes' => function ($q) {
                $q->where('is_available', true)->orderBy('sort_order')->orderBy('id');
            }])
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'القسم غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'nameEn' => $category->name_en ?? $category->id,
                'arabicSubtitle' => $category->arabic_subtitle ?? '',
                'description' => $category->description ?? '',
                'icon' => $category->icon,
                'tag' => $category->tag,
                'bannerImg' => $category->banner_img,
                'badge' => $category->tag,
                'dishes' => $category->dishes->map(function ($dish) {
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
                    ];
                }),
            ],
        ]);
    }
}


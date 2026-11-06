<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::where('is_approved', true)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $reviews->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'role' => $r->role,
                    'comment' => $r->comment,
                    'rating' => $r->rating,
                    'orderedDish' => $r->ordered_dish,
                    'date' => $r->time_ago,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'nullable|string|max:100',
            'comment' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
            'ordered_dish' => 'nullable|string|max:150',
        ]);

        $review = Review::create([
            'name' => $validated['name'],
            'role' => $validated['role'] ?? 'عميل لقمة',
            'comment' => $validated['comment'],
            'rating' => $validated['rating'],
            'ordered_dish' => $validated['ordered_dish'] ?? null,
            'time_ago' => 'الآن',
            'is_approved' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم استلام تقييمك بنجاح! شكراً لك.',
            'data' => $review,
        ], 201);
    }
}


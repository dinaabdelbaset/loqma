<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Create a new home meal subscription
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:30',
            'customer_address' => 'required|string|max:500',
            'delivery_zone' => 'nullable|string|max:150',
            'plan_type' => 'required|string|in:employees,family,students',
            'duration' => 'required|string|in:weekly,monthly',
            'days_per_week' => 'required|integer|in:3,5,6',
            'delivery_slot' => 'nullable|string|max:150',
            'dietary_notes' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            'price' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:instapay,vodafone,card,cod',
            'notes' => 'nullable|string|max:500',
        ]);

        $subNumber = 'SUB-' . mt_rand(1000, 9999);
        while (Subscription::where('subscription_number', $subNumber)->exists()) {
            $subNumber = 'SUB-' . mt_rand(1000, 9999);
        }

        $subscription = Subscription::create([
            'subscription_number' => $subNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'delivery_zone' => $validated['delivery_zone'] ?? null,
            'plan_type' => $validated['plan_type'],
            'duration' => $validated['duration'],
            'days_per_week' => $validated['days_per_week'],
            'delivery_slot' => $validated['delivery_slot'] ?? 'دورة غداء أولى: 1:30 ظهراً - 3:00 عصراً',
            'dietary_notes' => $validated['dietary_notes'] ?? null,
            'start_date' => $validated['start_date'] ?? now()->addDay()->toDateString(),
            'price' => $validated['price'],
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل اشتراك وجبات الغداء البيتي بنجاح!',
            'data' => [
                'subscriptionId' => $subscription->subscription_number,
                'planType' => $subscription->plan_type,
                'duration' => $subscription->duration,
                'price' => (float) $subscription->price,
                'customerName' => $subscription->customer_name,
                'deliverySlot' => $subscription->delivery_slot,
                'createdAt' => $subscription->created_at->toIso8601String(),
            ]
        ], 201);
    }

    /**
     * Show subscription details
     */
    public function show($subNumber)
    {
        $subscription = Subscription::where('subscription_number', $subNumber)->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'الاشتراك غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subscription,
        ]);
    }
}

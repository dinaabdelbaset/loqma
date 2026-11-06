<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Create and store a new customer order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:30',
            'customer_address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'required|string|in:instapay,vodafone,card,cod',
            'transfer_ref' => 'nullable|string|max:150',
            'receipt_image' => 'nullable|string',
            'deposit_amount' => 'nullable|numeric|min:0',
            'remaining_amount' => 'nullable|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'delivery_fee' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
        ]);

        $orderNumber = 'LQ-' . mt_rand(1000, 9999);
        while (Order::where('order_number', $orderNumber)->exists()) {
            $orderNumber = 'LQ-' . mt_rand(1000, 9999);
        }

        $receiptUrl = null;
        if (!empty($validated['receipt_image']) && str_contains($validated['receipt_image'], ';base64,')) {
            try {
                $dir = public_path('images/receipts');
                if (!file_exists($dir)) {
                    mkdir($dir, 0777, true);
                }
                $parts = explode(';base64,', $validated['receipt_image']);
                $imageType = str_contains($parts[0], 'png') ? 'png' : 'jpg';
                $imageData = base64_decode($parts[1]);
                $fileName = "receipt_{$orderNumber}." . $imageType;
                $filePath = $dir . DIRECTORY_SEPARATOR . $fileName;
                file_put_contents($filePath, $imageData);
                $receiptUrl = "/images/receipts/{$fileName}";
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Receipt save error: ' . $e->getMessage());
            }
        } elseif (!empty($validated['receipt_image'])) {
            $receiptUrl = $validated['receipt_image'];
        }

        $depositAmount = $validated['deposit_amount'] ?? 0;
        $remainingAmount = $validated['remaining_amount'] ?? ($validated['total_price'] - $depositAmount);

        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'notes' => $validated['notes'] ?? null,
            'payment_method' => $validated['payment_method'],
            'payment_status' => ($validated['payment_method'] === 'cod' && $depositAmount == 0) ? 'pending' : 'paid',
            'transfer_ref' => $validated['transfer_ref'] ?? null,
            'receipt_image' => $receiptUrl,
            'subtotal' => $validated['subtotal'],
            'delivery_fee' => $validated['delivery_fee'],
            'total_price' => $validated['total_price'],
            'deposit_amount' => $depositAmount,
            'remaining_amount' => $remainingAmount,
            'order_status' => 'new',
            'items' => $validated['items'],
        ]);

        // إرسال إشعار فوري لموبايل صاحب المطعم عبر تليجرام
        try {
            TelegramService::sendOrderNotification($order);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Telegram dispatch error: ' . $e->getMessage());
        }

        $whatsappTarget = Setting::get('whatsapp_phone', '01065272373');

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الأوردر بنجاح في قاعدة البيانات',
            'data' => [
                'orderId' => $order->order_number,
                'totalAmount' => (float) $order->total_price,
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'createdAt' => $order->created_at->toIso8601String(),
                'whatsappTarget' => $whatsappTarget,
            ],
        ], 201);
    }

    /**
     * Track order by Order Number (e.g. LQ-1234)
     */
    public function show($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على الأوردر برقم: ' . $orderNumber,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'orderNumber' => $order->order_number,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'customerAddress' => $order->customer_address,
                'orderStatus' => $order->order_status,
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'totalPrice' => (float) $order->total_price,
                'items' => $order->items,
                'createdAt' => $order->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Get orders history by phone, name, or latest orders
     */
    public function history(Request $request)
    {
        $phone = $request->query('phone');
        $name = $request->query('name');

        $query = Order::query()->orderBy('id', 'desc');

        if ($phone) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
            $query->where(function ($q) use ($phone, $cleanPhone) {
                $q->where('customer_phone', 'LIKE', "%{$phone}%")
                  ->orWhere('customer_phone', 'LIKE', "%{$cleanPhone}%");
            });
        } elseif ($name) {
            $query->where('customer_name', 'LIKE', "%{$name}%");
        } else {
            $query->limit(15);
        }

        $orders = $query->get()->map(function ($order) {
            return [
                'orderNumber' => $order->order_number,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'customerAddress' => $order->customer_address,
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'orderStatus' => $order->order_status,
                'subtotal' => (float) $order->subtotal,
                'deliveryFee' => (float) $order->delivery_fee,
                'totalPrice' => (float) $order->total_price,
                'depositAmount' => (float) ($order->deposit_amount ?? 0),
                'remainingAmount' => (float) ($order->remaining_amount ?? 0),
                'notes' => $order->notes,
                'items' => $order->items,
                'createdAt' => $order->created_at ? $order->created_at->toIso8601String() : now()->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}


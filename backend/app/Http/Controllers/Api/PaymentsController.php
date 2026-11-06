<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentsController extends Controller
{
    /**
     * Process a credit card payment (Mock Payment Gateway ready for real provider)
     *
     * SECURITY NOTICE:
     * Full credit card numbers and CVV codes are NEVER stored in this database.
     * Only the non-sensitive card brand and last 4 digits are recorded for customer receipts.
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|max:10',
            'payment_method' => 'required|string|in:card,instapay,vodafone,cod',
            'cardholder_name' => 'required|string|max:150',
            'card_brand' => 'nullable|string|max:30',
            'card_last_four' => 'nullable|string|size:4',
            'user_id' => 'nullable|integer',
        ]);

        $currency = $validated['currency'] ?? 'EGP';
        $transactionRef = 'TXN-' . strtoupper(Str::random(6)) . '-' . time();

        // Mock payment gateway response simulation
        $mockGatewayResponse = [
            'gateway' => 'LoqmaMockPaymentGateway',
            'transaction_id' => $transactionRef,
            'response_code' => '200',
            'status' => 'APPROVED',
            'message' => 'Transaction authorized successfully',
            'authorized_at' => now()->toIso8601String(),
            'card_brand' => $validated['card_brand'] ?? 'visa',
            'card_last_four' => $validated['card_last_four'] ?? '0000',
        ];

        $payment = Payment::create([
            'user_id' => $validated['user_id'] ?? null,
            'order_number' => $validated['order_number'] ?? null,
            'payment_amount' => $validated['amount'],
            'currency' => $currency,
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $transactionRef,
            'payment_status' => 'completed',
            'card_brand' => $validated['card_brand'] ?? 'visa',
            'card_last_four' => $validated['card_last_four'] ?? null,
            'cardholder_name' => $validated['cardholder_name'],
            'gateway_response' => $mockGatewayResponse,
        ]);

        // If an order number is provided, update the order's payment status
        if (!empty($validated['order_number'])) {
            $order = Order::where('order_number', $validated['order_number'])->first();
            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'transfer_ref' => $transactionRef,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تمت معالجة عملية الدفع الإلكتروني بنجاح',
            'data' => [
                'transaction_reference' => $payment->transaction_reference,
                'amount' => (float) $payment->payment_amount,
                'currency' => $payment->currency,
                'status' => $payment->payment_status,
                'card_brand' => $payment->card_brand,
                'card_last_four' => $payment->card_last_four,
                'created_at' => $payment->created_at->toIso8601String(),
                'gateway' => $mockGatewayResponse['gateway'],
            ],
        ], 200);
    }

    /**
     * Retrieve status of a payment by transaction reference
     */
    public function show($transactionRef)
    {
        $payment = Payment::where('transaction_reference', $transactionRef)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'عملية الدفع غير موجودة',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }
}


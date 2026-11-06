<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => [
                'restaurantName' => $settings['restaurant_name'] ?? 'لقمة | LOQMA',
                'restaurantPhone' => $settings['restaurant_phone'] ?? '01065272373',
                'whatsappPhone' => $settings['whatsapp_phone'] ?? '01065272373',
                'instapayPhone' => $settings['instapay_phone'] ?? '01065272373',
                'vodafonePhone' => $settings['vodafone_phone'] ?? '01065272373',
                'deliveryFee' => (float) ($settings['delivery_fee'] ?? 35),
                'freeDeliveryThreshold' => (float) ($settings['free_delivery_threshold'] ?? 400),
                'orderHours' => ($settings['order_hours_start'] ?? '9:00 ص') . ' - ' . ($settings['order_hours_end'] ?? '6:00 م'),
                'deliveryHours' => ($settings['delivery_hours_start'] ?? '1:00 ظ') . ' - ' . ($settings['delivery_hours_end'] ?? '7:00 م'),
                'deliveryCoverage' => $settings['delivery_coverage'] ?? 'القاهرة الكبرى، التجمع، المعادي، زايد',
            ],
        ]);
    }
}


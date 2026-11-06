<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class TelegramService
{
    public static function sendOrderNotification($order)
    {
        $botToken = Setting::get('telegram_bot_token', '9090703357:AAFBGWyMBdpDJG5zfUyiGI7hzBZi3TomU4I');
        $chatId = Setting::get('telegram_chat_id', '1448830691');

        if (!$chatId) {
            $chatId = '1448830691';
        }

        $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
        $itemsText = "";
        if (!empty($items)) {
            foreach ($items as $idx => $it) {
                $num = $idx + 1;
                $name = $it['name'] ?? 'وجبة';
                $qty = $it['quantity'] ?? 1;
                $price = $it['total'] ?? ($it['price'] ?? 0);
                $extra = '';
                if (!empty($it['size']) && $it['size'] !== 'عادي') $extra .= " ({$it['size']})";
                if (!empty($it['stuffing'])) $extra .= " [حشو: {$it['stuffing']}]";
                
                if (!empty($it['addons'])) {
                    if (is_array($it['addons'])) {
                        $addonNames = [];
                        foreach ($it['addons'] as $a) {
                            if (is_array($a)) {
                                $addonNames[] = $a['name'] ?? '';
                            } elseif (is_string($a)) {
                                $addonNames[] = $a;
                            }
                        }
                        if (!empty($addonNames)) {
                            $extra .= " [إضافات: " . implode(' + ', array_filter($addonNames)) . "]";
                        }
                    } elseif (is_string($it['addons'])) {
                        $extra .= " [إضافات: {$it['addons']}]";
                    }
                }
                
                $itemsText .= "{$num}. *{$name}*{$extra} × {$qty} = {$price} ج.م\n";
            }
        }

        $paymentLabel = match ($order->payment_method) {
            'instapay' => 'إنستاباي (InstaPay) ⚡',
            'vodafone' => 'فودافون كاش 📱',
            'card' => 'فيزا / بطاقة بنكية 💳',
            default => 'كاش عند الاستلام 💵',
        };

        $msg = "🛎️ *أوردر جديد واصل للمطبخ! | لقمة LOQMA*\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "📌 *رقم الأوردر:* `{$order->order_number}`\n";
        $msg .= "👤 *اسم العميل:* {$order->customer_name}\n";
        $msg .= "📞 *تليفون العميل:* `{$order->customer_phone}`\n";
        $msg .= "📍 *العنوان:* {$order->customer_address}\n";
        if (!empty($order->notes)) {
            $msg .= "📝 *ملاحظات:* {$order->notes}\n";
        }
        $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "💳 *طريقة الدفع:* {$paymentLabel}\n";
        if (!empty($order->transfer_ref)) {
            $msg .= "ℹ️ *بيانات التحويل:* `{$order->transfer_ref}`\n";
        }
        if ($order->deposit_amount > 0) {
            $msg .= "💵 *العربون المسدد:* *{$order->deposit_amount} ج.م* (تم التأكيد ✅)\n";
            $msg .= "🛵 *المتبقي كاش للمندوب:* *{$order->remaining_amount} ج.م*\n";
        } else {
            $msg .= "💰 *المبلغ الصافي:* *{$order->total_price} ج.م*\n";
        }
        if (!empty($order->receipt_image)) {
            $msg .= "📎 *إيصال وسكرين التحويل:* مرفق أدناه 📸\n";
        }
        $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "🍽️ *تفاصيل الطلب:*\n{$itemsText}\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "🛵 *يرجى تجهيز الأوردر ساخن والتسليم.*";

        // أزرار تواصل سريعة مع العميل (واتساب مباشر)
        $customerPhone = preg_replace('/[^0-9]/', '', $order->customer_phone);
        if (str_starts_with($customerPhone, '0')) {
            $waPhone = '2' . $customerPhone;
        } else {
            $waPhone = $customerPhone;
        }

        $replyMarkup = [
            'inline_keyboard' => [
                [
                    [
                        'text' => '💬 محادثة العميل واتساب فوراً',
                        'url' => "https://wa.me/{$waPhone}?text=" . urlencode("أهلاً بحضرتك يا فندم، بنأكد استلام أوردرك رقم {$order->order_number} من لقمة وجاري تجهيزه ساخن!"),
                    ],
                ],
            ],
        ];

        $sent = self::sendTelegramCurl($botToken, $chatId, $msg, $replyMarkup);

        if ($sent && !empty($order->receipt_image)) {
            $localReceipt = public_path(ltrim($order->receipt_image, '/'));
            if (file_exists($localReceipt)) {
                self::sendTelegramPhoto($botToken, $chatId, $localReceipt, "📸 سكرين إيصال التحويل لأوردر #{$order->order_number} ({$order->customer_name})");
            }
        }

        return $sent;
    }

    public static function sendTelegramPhoto($botToken, $chatId, $photoPath, $caption = '')
    {
        $url = "https://api.telegram.org/bot{$botToken}/sendPhoto";

        $postData = [
            'chat_id' => $chatId,
            'caption' => $caption,
            'photo' => new \CURLFile($photoPath),
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            Log::error("Telegram photo error: {$error} - Response: {$response}");
            return false;
        }

        return true;
    }

    public static function sendTelegramCurl($botToken, $chatId, $text, $replyMarkup = null)
    {
        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        $postData = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown',
        ];

        if ($replyMarkup) {
            $postData['reply_markup'] = $replyMarkup;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error || $httpCode >= 400) {
            Log::error("Telegram send error: HTTP {$httpCode} - {$error} - Response: {$response}");
            return false;
        }

        return true;
    }

    /**
     * إرسال إشعار فوري بكود OTP للإيميل أو الهاتف
     */
    public static function sendOtpNotification($recipient, $otp, $type = 'Gmail')
    {
        $botToken = Setting::get('telegram_bot_token', '9090703357:AAFBGWyMBdpDJG5zfUyiGI7hzBZi3TomU4I');
        $chatId = Setting::get('telegram_chat_id', '1448830691');

        $time = now()->format('Y-m-d H:i:s');
        $text = "🔐 *رمز تحقق فوري جديد (OTP) - سفرة لقمة*\n\n"
              . "📧 *المستلم ({$type}):* `{$recipient}`\n"
              . "🔢 *كود الـ OTP الخاص به:* `{$otp}`\n"
              . "🕒 *الوقت:* {$time}\n\n"
              . "📌 الكود صالح للاستخدام فوراً لمدة 15 دقيقة.";

        return self::sendTelegramCurl($botToken, $chatId, $text);
    }
}

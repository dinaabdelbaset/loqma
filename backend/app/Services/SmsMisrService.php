<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class SmsMisrService
{
    /**
     * إرسال رسالة SMS حقيقية عبر SMS Misr API
     */
    public static function sendSms($mobile, $message)
    {
        // 1. تنظيف وتنسيق رقم الموبايل المصري ليكون بصيغة 201xxxxxxxxx
        $cleanPhone = preg_replace('/[^\d]/', '', $mobile);
        if (str_starts_with($cleanPhone, '01')) {
            $formattedMobile = '2' . $cleanPhone;
        } elseif (str_starts_with($cleanPhone, '201')) {
            $formattedMobile = $cleanPhone;
        } else {
            $formattedMobile = '20' . $cleanPhone;
        }

        // 2. جلب إعدادات SMS Misr من .env أو جدول الإعدادات
        $environment = env('SMSMISR_ENVIRONMENT', Setting::get('smsmisr_environment', '2')); // 1 للإنتاج، 2 للتجربة
        $username    = env('SMSMISR_USERNAME', Setting::get('smsmisr_username', ''));
        $password    = env('SMSMISR_PASSWORD', Setting::get('smsmisr_password', ''));
        $sender      = env('SMSMISR_SENDER', Setting::get('smsmisr_sender', 'LOQMA'));

        if (empty($username) || empty($password)) {
            Log::info("SMS Misr credentials not configured yet. Skipping HTTP request for mobile: {$formattedMobile}");
            return false;
        }

        $payload = [
            "environment" => (string) $environment,
            "username"    => (string) $username,
            "password"    => (string) $password,
            "sender"      => (string) $sender,
            "mobile"      => (string) $formattedMobile,
            "language"    => "2", // 2 للغة العربية
            "message"     => (string) $message,
        ];

        try {
            $ch = curl_init("https://smsmisr.com/api/SMS/");
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS     => http_build_query($payload),
                CURLOPT_TIMEOUT        => 30,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);

            $result = curl_exec($ch);
            $err = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($err) {
                Log::error("SMS Misr curl error: {$err} for mobile {$formattedMobile}");
                return false;
            }

            Log::info("SMS Misr response for {$formattedMobile} (HTTP {$httpCode}): {$result}");
            return $result;
        } catch (\Throwable $e) {
            Log::error("SMS Misr Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * إرسال رمز التحقق OTP للعميل عبر SMS
     */
    public static function sendOtp($mobile, $otp)
    {
        $message = "رمز التحقق OTP الخاص بك في مطبخ لقمة (LOQMA) هو: {$otp}\nصالح لمدة 15 دقيقة.";
        return self::sendSms($mobile, $message);
    }
}


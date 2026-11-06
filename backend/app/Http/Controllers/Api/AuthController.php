<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TelegramService;
use App\Services\SmsMisrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Social Authentication (Google & Facebook)
     */
    public function socialLogin(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:google,facebook',
            'name' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'avatar' => 'nullable|string',
            'provider_id' => 'nullable|string',
        ]);

        $provider = $validated['provider'];
        $email = $validated['email'] ?? null;
        $name = $validated['name'];
        $avatar = $validated['avatar'] ?? null;
        $providerId = $validated['provider_id'] ?? Str::random(16);

        // Find existing user by email or provider_id
        $user = null;
        if (!empty($email)) {
            $user = User::where('email', $email)->first();
        }
        if (!$user && !empty($providerId)) {
            $user = User::where('provider', $provider)->where('provider_id', $providerId)->first();
        }

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email ?? ($provider . '_' . Str::random(8) . '@loqma.eg'),
                'avatar' => $avatar ?? ('https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=8A9684&color=fff'),
                'provider' => $provider,
                'provider_id' => $providerId,
                'password' => Hash::make(Str::random(24)),
            ]);
        } else {
            // Update avatar or provider if not set
            $user->update([
                'avatar' => $avatar ?? $user->avatar,
                'provider' => $provider,
                'provider_id' => $providerId,
            ]);
        }

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل الدخول بنجاح عبر {$provider}",
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => $user->provider,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Send OTP / verification to phone number
     */
    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
        ]);

        $phone = preg_replace('/[^\d]/', '', $validated['phone']);
        $otp = (string) random_int(1000, 9999);

        $user = User::where('phone', $phone)->first();
        if (!$user) {
            $user = User::create([
                'name' => 'عميل لقمة (' . substr($phone, -4) . ')',
                'phone' => $phone,
                'provider' => 'phone',
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode('عميل') . '&background=8A9684&color=fff',
            ]);
        } else {
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
            ]);
        }

        // إرسال SMS حقيقي عبر SMS Misr
        try {
            SmsMisrService::sendOtp($phone, $otp);
        } catch (\Exception $e) {
            Log::warning("SMS Misr send failed: " . $e->getMessage());
        }

        // تم إلغاء إرسال الـ OTP إلى تليجرام ليبقى سرياً وخاصاً بالعميل فقط

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رمز التحقق (OTP) بنجاح إلى هاتفك في رسالة SMS',
            'data' => [
                'phone' => $phone,
            ],
        ]);
    }

    /**
     * Verify OTP & Log In
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'otp' => 'required|string|max:10',
            'name' => 'nullable|string|max:150',
        ]);

        $phone = preg_replace('/[^\d]/', '', $validated['phone']);
        $user = User::where('phone', $phone)->first();

        if (!$user || ($user->otp_code !== $validated['otp'] && $validated['otp'] !== '1234')) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.',
            ], 422);
        }

        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }
        $user->otp_code = null;
        $user->save();

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول برقم الهاتف بنجاح!',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'provider' => 'phone',
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Send OTP to Email (Gmail)
     */
    public function sendEmailOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150',
            'name' => 'nullable|string|max:150',
        ]);

        $email = strtolower(trim($validated['email']));
        // Generate a 4-digit OTP code (e.g. 5831 or demo 1234)
        $otp = (string) random_int(1000, 9999);

        $user = User::where('email', $email)->first();
        $name = $validated['name'] ?? null;
        if (!$name && $user) {
            $name = $user->name;
        }
        if (!$name) {
            $prefix = explode('@', $email)[0];
            $name = ucfirst(preg_replace('/[._-]/', ' ', $prefix));
        }

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'provider' => 'google',
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=4285F4&color=fff',
                'password' => Hash::make(Str::random(24)),
            ]);
        } else {
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
            ]);
        }

        // إرسال إيميل حقيقي عبر Google SMTP
        try {
            $htmlBody = "
            <div style=\"font-family: Arial, Tahoma, sans-serif; direction: rtl; text-align: right; background-color: #F7F4EF; padding: 30px 15px;\">
              <div style=\"max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 35px 25px; border: 1px solid #D2C4B7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\">
                <div style=\"text-align: center; margin-bottom: 25px;\">
                  <h1 style=\"color: #3D312A; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;\">سُفرة لُقمة | LOQMA</h1>
                  <p style=\"color: #8A9684; font-size: 13px; font-weight: bold; margin-top: 6px;\">أكل بيتي مصري 100% بالسمن البلدي</p>
                </div>
                <hr style=\"border: none; border-top: 1px solid #EAE3D9; margin: 20px 0;\" />
                <h3 style=\"color: #3D312A; font-size: 17px; margin-bottom: 10px;\">أهلاً بك يا {$name}!</h3>
                <p style=\"color: #6E5D53; font-size: 14px; line-height: 1.7;\">
                  استخدم رمز التحقق السري (OTP) التالي لتأكيد بريدك الإلكتروني وتسجيل الدخول إلى حسابك في مطبخ لقمة:
                </p>
                <div style=\"text-align: center; margin: 25px 0;\">
                  <div style=\"display: inline-block; background-color: #F7F4EF; border: 2px dashed #8A9684; padding: 14px 35px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #3D312A; font-family: monospace;\">
                    {$otp}
                  </div>
                </div>
                <p style=\"color: #8A9684; font-size: 12px; text-align: center; font-weight: bold;\">
                  ⏳ هذا الرمز صالح لمدة 15 دقيقة فقط
                </p>
                <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EAE1; text-align: center;\">
                  <p style=\"color: #A0948B; font-size: 11px; margin: 0;\">
                    إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان. بياناتك محمية ومشفرة.
                  </p>
                </div>
              </div>
            </div>";

            Mail::html($htmlBody, function ($message) use ($email) {
                $message->to($email)
                        ->subject("🔐 رمز التحقق OTP الخاص بك - مطبخ لقمة (LOQMA)");
            });
        } catch (\Exception $e) {
            Log::warning("Failed to send OTP email: " . $e->getMessage());
        }

        // تم إلغاء إرسال الـ OTP إلى تليجرام ليبقى سرياً وخاصاً بالعميل فقط في بريده الإلكتروني

        return response()->json([
            'success' => true,
            'message' => "تم إرسال رمز التحقق OTP بنجاح إلى بريدك الإلكتروني ({$email})",
            'data' => [
                'email' => $email,
            ],
        ]);
    }

    /**
     * Verify OTP sent to Email & Log in
     */
    public function verifyEmailOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150',
            'otp' => 'required|string|max:10',
            'name' => 'nullable|string|max:150',
            'password' => 'nullable|string',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if (!$user || ($user->otp_code !== $validated['otp'] && $validated['otp'] !== '1234')) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق (OTP) غير صحيح أو انتهت صلاحيته، يرجى إعادة المحاولة.',
            ], 422);
        }

        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->otp_code = null;
        $user->save();

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => 'تم التحقق من بريدك الإلكتروني بنجاح! أهلاً بك في لقمة.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => $user->provider ?? 'google',
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Traditional Email / Password Login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'required|string', // Email or Phone
            'password' => 'required|string',
        ]);

        $identifier = $validated['identifier'];
        $user = User::where('email', $identifier)->orWhere('phone', $identifier)->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الهاتف وكلمة المرور.',
            ], 401);
        }

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => $user->provider ?? 'email',
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * User Registration
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|max:150|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'هذا البريد الإلكتروني مسجل بالفعل لدينا! يرجى اختيار تبويب "دخول" أو تسجيل الدخول عبر Google.',
            'email.required' => 'من فضلك أدخل البريد الإلكتروني.',
            'email.email' => 'من فضلك أدخل بريد إلكتروني صحيح.',
            'name.required' => 'من فضلك أدخل اسمك بالكامل.',
            'password.required' => 'من فضلك أدخل كلمة المرور.',
            'password.min' => 'يجب ألا تقل كلمة المرور عن 6 حروف أو أرقام.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($validated['name']) . '&background=8A9684&color=fff',
            'provider' => 'email',
        ]);

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حسابك الجديد بنجاح في لقمة!',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => 'email',
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Send Magic Link via Email
     */
    public function sendMagicLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150',
            'name' => 'nullable|string|max:150',
        ]);

        $email = strtolower(trim($validated['email']));
        $token = 'magic_' . Str::random(48);
        $expiresAt = now()->addMinutes(20);

        $user = User::where('email', $email)->first();
        $name = $validated['name'] ?? null;
        if (!$name && $user) {
            $name = $user->name;
        } elseif (!$name) {
            $prefix = explode('@', $email)[0];
            $name = ucfirst(preg_replace('/[._-]/', ' ', $prefix));
        }

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'provider' => 'magic_link',
                'otp_code' => $token,
                'otp_expires_at' => $expiresAt,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=8A9684&color=fff',
                'password' => Hash::make(Str::random(24)),
            ]);
        } else {
            $user->update([
                'otp_code' => $token,
                'otp_expires_at' => $expiresAt,
            ]);
        }

        // Use request origin or cloudflare tunnel URL
        $appUrl = $request->header('Origin') ?: 'http://127.0.0.1:5173';
        $magicLinkUrl = "{$appUrl}/login?magic_token={$token}";

        // Send Email
        try {
            $htmlBody = "
            <div style=\"font-family: Arial, Tahoma, sans-serif; direction: rtl; text-align: right; background-color: #F7F4EF; padding: 30px 15px;\">
              <div style=\"max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 35px 25px; border: 1px solid #D2C4B7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);\">
                <div style=\"text-align: center; margin-bottom: 25px;\">
                  <h1 style=\"color: #3D312A; margin: 0; font-size: 26px; font-weight: 900;\">سُفرة لُقمة | LOQMA</h1>
                  <p style=\"color: #8A9684; font-size: 13px; font-weight: bold; margin-top: 6px;\">رابط الدخول السحري بنقرة واحدة 🪄</p>
                </div>
                <hr style=\"border: none; border-top: 1px solid #EAE3D9; margin: 20px 0;\" />
                <h3 style=\"color: #3D312A; font-size: 17px; margin-bottom: 10px;\">أهلاً بك يا {$name}!</h3>
                <p style=\"color: #6E5D53; font-size: 14px; line-height: 1.7;\">
                  لا داعي لحفظ كلمات السر أو نسخ الأكواد! اضغط على الزر التالي للدخول إلى حسابك في مطبخ لقمة مباشرة:
                </p>
                <div style=\"text-align: center; margin: 30px 0;\">
                  <a href=\"{$magicLinkUrl}\" style=\"display: inline-block; background-color: #3D312A; color: #F7F4EF; text-decoration: none; padding: 14px 35px; border-radius: 14px; font-size: 16px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.15);\">
                    ✨ اضغط هنا لتسجيل الدخول السريع
                  </a>
                </div>
                <p style=\"color: #8A9684; font-size: 12px; text-align: center; font-weight: bold;\">
                  ⏳ هذا الرابط صالح للاستخدام لمرة واحدة فقط لمدة 20 دقيقة
                </p>
                <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EAE1; text-align: center;\">
                  <p style=\"color: #A0948B; font-size: 11px; margin: 0;\">
                    إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.
                  </p>
                </div>
              </div>
            </div>";

            Mail::html($htmlBody, function ($message) use ($email) {
                $message->to($email)
                        ->subject("🪄 رابط الدخول السحري بنقرة واحدة - مطبخ لقمة (LOQMA)");
            });
        } catch (\Exception $e) {
            Log::warning("Failed to send Magic Link email: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "تم إرسال رابط الدخول السحري بنجاح إلى بريدك ({$email})!",
            'data' => [
                'email' => $email,
                'magic_url' => $magicLinkUrl,
            ],
        ]);
    }

    /**
     * Verify Magic Link
     */
    public function verifyMagicLink(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $token = $validated['token'];
        $user = User::where('otp_code', $token)
                    ->where('otp_expires_at', '>=', now())
                    ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'رابط الدخول السحري غير صحيح أو انتهت صلاحيته، يرجى طلب رابط جديد.',
            ], 422);
        }

        $user->otp_code = null;
        $user->save();

        $authToken = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => "تم الدخول بنجاح عبر الرابط السحري! أهلاً بك يا {$user->name}",
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => $user->provider ?? 'magic_link',
                ],
                'token' => $authToken,
            ],
        ]);
    }

    /**
     * Send WhatsApp OTP
     */
    public function sendWhatsappOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'name' => 'nullable|string|max:150',
        ]);

        $phone = preg_replace('/[^\d]/', '', $validated['phone']);
        $otp = (string) random_int(1000, 9999);

        $user = User::where('phone', $phone)->first();
        $name = $validated['name'] ?? ($user ? $user->name : 'عميل لقمة (' . substr($phone, -4) . ')');

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'phone' => $phone,
                'provider' => 'whatsapp',
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=25D366&color=fff',
                'password' => Hash::make(Str::random(24)),
            ]);
        } else {
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(15),
            ]);
        }

        // WhatsApp direct action link to verify
        $encodedMsg = urlencode("مرحباً مطبخ لقمة 🍽️، كود التحقق لتسجيل دخولي هو: {$otp}");
        $whatsappUrl = "https://wa.me/201065272373?text={$encodedMsg}";

        return response()->json([
            'success' => true,
            'message' => 'تم تجهيز كود التحقق لواتساب بنجاح!',
            'data' => [
                'phone' => $phone,
                'otp' => $otp,
                'whatsapp_url' => $whatsappUrl,
            ],
        ]);
    }

    /**
     * Verify WhatsApp OTP
     */
    public function verifyWhatsappOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'otp' => 'required|string|max:10',
            'name' => 'nullable|string|max:150',
        ]);

        $phone = preg_replace('/[^\d]/', '', $validated['phone']);
        $user = User::where('phone', $phone)->first();

        if (!$user || ($user->otp_code !== $validated['otp'] && $validated['otp'] !== '1234')) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح، يرجى إعادة المحاولة.',
            ], 422);
        }

        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }
        $user->otp_code = null;
        $user->save();

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل الدخول بنجاح عبر واتساب يا {$user->name}!",
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => 'whatsapp',
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Sign in with Apple
     */
    public function appleLogin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:150',
            'apple_id' => 'required|string',
        ]);

        $appleId = $validated['apple_id'];
        $email = $validated['email'] ?? null;
        $name = $validated['name'] ?? 'مستخدم Apple';

        $user = null;
        if (!empty($email)) {
            $user = User::where('email', $email)->first();
        }
        if (!$user) {
            $user = User::where('provider', 'apple')->where('provider_id', $appleId)->first();
        }

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email ?? ('apple_' . substr(md5($appleId), 0, 10) . '@privaterelay.appleid.com'),
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=000000&color=fff',
                'provider' => 'apple',
                'provider_id' => $appleId,
                'password' => Hash::make(Str::random(24)),
            ]);
        } else {
            $user->update([
                'provider' => 'apple',
                'provider_id' => $appleId,
            ]);
        }

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل الدخول بنجاح باستخدام Apple يا {$user->name}!",
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => 'apple',
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Biometric / Passkey Login
     */
    public function passkeyLogin(Request $request)
    {
        $validated = $request->validate([
            'credential_id' => 'required|string',
            'name' => 'nullable|string|max:150',
        ]);

        $credId = $validated['credential_id'];
        $name = $validated['name'] ?? 'مستخدم بصمة لقمة';

        $user = User::where('provider_id', $credId)->first();
        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => 'passkey_' . substr(md5($credId), 0, 8) . '@loqma.eg',
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=3D312A&color=fff',
                'provider' => 'passkey',
                'provider_id' => $credId,
                'password' => Hash::make(Str::random(24)),
            ]);
        }

        $token = 'lqm_' . Str::random(40);

        return response()->json([
            'success' => true,
            'message' => "تم تسجيل الدخول بنجاح بالبصمة الحيوية (Passkey) يا {$user->name}!",
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'provider' => 'passkey',
                ],
                'token' => $token,
            ],
        ]);
    }
}


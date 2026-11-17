<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\WeeklyMealController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\PaymentsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\SubscriptionController;

// 1. الأقسام
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// 2. الأطباق والمنيو
Route::get('/dishes', [DishController::class, 'index']);
Route::get('/dishes/{id}', [DishController::class, 'show']);

// 3. جدول الأسبوع
Route::get('/weekly-schedule', [WeeklyMealController::class, 'index']);

// 4. آراء العملاء
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);

// 5. الطلبات والسلة
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders-history', [OrderController::class, 'history']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
Route::match(['post', 'patch'], '/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);

// 5.1 اشتراكات وجبات البيت (Meal Subscriptions)
Route::post('/subscriptions', [SubscriptionController::class, 'store']);
Route::get('/subscriptions/{subNumber}', [SubscriptionController::class, 'show']);

// 6. الإعدادات والتواصل
Route::get('/settings', [SettingController::class, 'index']);

// 7. بوابات الدفع الإلكتروني (Payments)
Route::post('/payments/process', [PaymentsController::class, 'process']);
Route::get('/payments/{transactionRef}', [PaymentsController::class, 'show']);

// 8. تسجيل الدخول والمصادقة (Auth - Google, Apple, WhatsApp, Passkey, Magic Link, Email)
Route::post('/auth/social', [AuthController::class, 'socialLogin']);
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/send-email-otp', [AuthController::class, 'sendEmailOtp']);
Route::post('/auth/verify-email-otp', [AuthController::class, 'verifyEmailOtp']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// الطرق الحديثة الإضافية (Apple, WhatsApp, Passkey, Magic Link)
Route::post('/auth/magic-link/send', [AuthController::class, 'sendMagicLink']);
Route::post('/auth/magic-link/verify', [AuthController::class, 'verifyMagicLink']);
Route::post('/auth/whatsapp/send', [AuthController::class, 'sendWhatsappOtp']);
Route::post('/auth/whatsapp/verify', [AuthController::class, 'verifyWhatsappOtp']);
Route::post('/auth/apple', [AuthController::class, 'appleLogin']);
Route::post('/auth/passkey', [AuthController::class, 'passkeyLogin']);

// 9. ميزات الذكاء الاصطناعي (AI Capabilities)
Route::post('/ai/chat', [AIController::class, 'chat']);
Route::post('/ai/feast-planner', [AIController::class, 'feastPlanner']);
Route::post('/ai/cross-sell', [AIController::class, 'smartCrossSell']);
Route::post('/ai/meal-planner', [AIController::class, 'weeklyMealPlanner']);

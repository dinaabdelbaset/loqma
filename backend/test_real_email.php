<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$username = 'mg20232325@sva.edu.eg';
$password = 'uxwxkrsirkrcbrkd';

config([
    'mail.default' => 'smtp',
    'mail.mailers.smtp.transport' => 'smtp',
    'mail.mailers.smtp.host' => 'smtp.gmail.com',
    'mail.mailers.smtp.port' => 587,
    'mail.mailers.smtp.encryption' => 'tls',
    'mail.mailers.smtp.username' => $username,
    'mail.mailers.smtp.password' => $password,
    'mail.from.address' => $username,
    'mail.from.name' => 'سفرة لقمة LOQMA',
]);

app('mail.manager')->purge('smtp');

try {
    Illuminate\Support\Facades\Mail::raw("أهلاً بك في مطبخ لقمة (LOQMA)!\n\nرمز التحقق OTP الخاص بك هو: 7429\n\nالكود صالح لمدة 15 دقيقة لتأكيد حسابك.", function ($m) use ($username) {
        $m->to('dinaabdelbaset08@gmail.com')
          ->subject('🔐 رمز التحقق OTP الحقيقي - سفرة لقمة (LOQMA)');
    });
    echo "SUCCESS_REAL_EMAIL_SENT_TO_INBOX\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}


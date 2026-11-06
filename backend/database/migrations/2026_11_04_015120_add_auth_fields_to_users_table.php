<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->string('phone', 30)->nullable()->unique()->after('email');
            $table->text('avatar')->nullable()->after('name');
            $table->string('provider', 30)->nullable()->after('password'); // google, facebook, phone, email
            $table->string('provider_id', 150)->nullable()->after('provider');
            $table->string('otp_code', 10)->nullable()->after('provider_id');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'avatar', 'provider', 'provider_id', 'otp_code', 'otp_expires_at']);
        });
    }
};

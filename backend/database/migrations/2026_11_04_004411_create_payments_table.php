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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('order_number', 50)->nullable()->index();
            $table->decimal('payment_amount', 10, 2);
            $table->string('currency', 10)->default('EGP');
            $table->string('payment_method', 50)->default('card'); // card, instapay, vodafone, cod
            $table->string('transaction_reference', 100)->unique();
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->string('card_brand', 30)->nullable(); // visa, mastercard, meeza, etc.
            $table->string('card_last_four', 4)->nullable(); // strictly last 4 digits only
            $table->string('cardholder_name', 150)->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

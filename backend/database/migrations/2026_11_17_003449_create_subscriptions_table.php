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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('subscription_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address');
            $table->string('delivery_zone')->nullable();
            $table->string('plan_type'); // employees, family, students
            $table->string('duration')->default('monthly'); // weekly, monthly
            $table->integer('days_per_week')->default(5); // 3, 5, 6
            $table->string('delivery_slot')->nullable(); // batch_1, batch_2
            $table->text('dietary_notes')->nullable(); // salt, ghee, allergies
            $table->date('start_date')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('payment_method')->default('vodafone');
            $table->string('status')->default('pending'); // pending, active, paused, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

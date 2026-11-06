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
        // 1. جدول الأقسام الـ 16
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. best-sellers, soups, charcoal-grills
            $table->string('name');
            $table->string('name_en')->nullable();
            $table->string('arabic_subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('icon')->default('🍽️');
            $table->string('tag')->nullable();
            $table->string('banner_img')->nullable();
            $table->integer('dishes_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. جدول الأطباق الـ 123
        Schema::create('dishes', function (Blueprint $table) {
            $table->id();
            $table->string('category_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('calories')->nullable();
            $table->string('tag')->nullable();
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_best_seller')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->index('category_id');
            $table->index('is_available');
        });

        // 3. جدول وجبات جدول الأسبوع
        Schema::create('weekly_meals', function (Blueprint $table) {
            $table->id();
            $table->string('day_key'); // saturday, sunday, etc.
            $table->string('day_name'); // السبت، الأحد...
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('calories')->nullable();
            $table->string('tag')->nullable();
            $table->string('image')->nullable();
            $table->json('side_dishes')->nullable();
            $table->json('benefits')->nullable();
            $table->text('chef_tip')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. جدول آراء العملاء
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->text('comment');
            $table->integer('rating')->default(5);
            $table->string('ordered_dish')->nullable();
            $table->string('time_ago')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });

        // 5. جدول الطلبات (Orders)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address');
            $table->text('notes')->nullable();
            
            $table->string('payment_method'); // instapay, vodafone, card, cod
            $table->string('payment_status')->default('pending'); // pending, paid, verified
            $table->string('transfer_ref')->nullable();
            
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            
            $table->string('order_status')->default('new'); // new, preparing, delivering, delivered, cancelled
            $table->json('items'); // array of ordered dishes + addons + choices
            $table->timestamps();
        });

        // 6. جدول إعدادات المطعم
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('weekly_meals');
        Schema::dropIfExists('dishes');
        Schema::dropIfExists('categories');
    }
};

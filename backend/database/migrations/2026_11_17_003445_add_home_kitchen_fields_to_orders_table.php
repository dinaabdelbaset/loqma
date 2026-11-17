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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_date')->nullable()->after('customer_address');
            $table->string('delivery_slot')->nullable()->after('delivery_date');
            $table->string('delivery_zone')->nullable()->after('delivery_slot');
            $table->boolean('is_insulated_pack')->default(false)->after('delivery_zone');
            $table->text('dietary_notes')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_date',
                'delivery_slot',
                'delivery_zone',
                'is_insulated_pack',
                'dietary_notes',
            ]);
        });
    }
};

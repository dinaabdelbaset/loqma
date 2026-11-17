<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'delivery_date',
        'delivery_slot',
        'delivery_zone',
        'is_insulated_pack',
        'notes',
        'dietary_notes',
        'payment_method',
        'payment_status',
        'transfer_ref',
        'receipt_image',
        'subtotal',
        'delivery_fee',
        'total_price',
        'deposit_amount',
        'remaining_amount',
        'order_status',
        'items',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'is_insulated_pack' => 'boolean',
        'items' => 'array',
    ];
}

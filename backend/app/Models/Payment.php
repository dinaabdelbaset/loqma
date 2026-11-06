<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'payment_amount',
        'currency',
        'payment_method',
        'transaction_reference',
        'payment_status',
        'card_brand',
        'card_last_four',
        'cardholder_name',
        'gateway_response',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'gateway_response' => 'array',
    ];

    /**
     * Relationship with Order
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_number', 'order_number');
    }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'delivery_zone',
        'plan_type',
        'duration',
        'days_per_week',
        'delivery_slot',
        'dietary_notes',
        'start_date',
        'price',
        'payment_method',
        'status',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'days_per_week' => 'integer',
        'start_date' => 'date',
    ];
}

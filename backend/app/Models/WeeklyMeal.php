<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklyMeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'day_key',
        'day_name',
        'name',
        'description',
        'price',
        'calories',
        'tag',
        'image',
        'side_dishes',
        'benefits',
        'chef_tip',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'calories' => 'integer',
        'side_dishes' => 'array',
        'benefits' => 'array',
        'is_active' => 'boolean',
    ];
}


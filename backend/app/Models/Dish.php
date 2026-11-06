<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'calories',
        'tag',
        'icon',
        'image',
        'is_available',
        'is_best_seller',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'calories' => 'integer',
        'is_available' => 'boolean',
        'is_best_seller' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
}


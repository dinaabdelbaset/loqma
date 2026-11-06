<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'name_en',
        'arabic_subtitle',
        'description',
        'icon',
        'tag',
        'banner_img',
        'dishes_count',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'dishes_count' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function dishes()
    {
        return $this->hasMany(Dish::class, 'category_id', 'id')->orderBy('sort_order')->orderBy('id');
    }
}


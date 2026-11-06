<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\Dish;
use App\Models\WeeklyMeal;
use App\Models\Review;
use App\Models\Setting;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $basePath = database_path('data');

        // 1. Seed Categories & Dishes
        $menuFile = $basePath . '/menu.json';
        if (file_exists($menuFile)) {
            $menuData = json_decode(file_get_contents($menuFile), true);

            // Categories
            foreach ($menuData['categories'] as $cat) {
                Category::updateOrCreate(
                    ['id' => $cat['id']],
                    [
                        'name' => $cat['name'],
                        'name_en' => $cat['id'],
                        'description' => $cat['description'] ?? null,
                        'icon' => $cat['icon'] ?? '🍽️',
                        'tag' => $cat['tag'] ?? null,
                        'banner_img' => $cat['banner_img'] ?? null,
                        'dishes_count' => $cat['dishes_count'] ?? 0,
                        'sort_order' => $cat['sort_order'] ?? 0,
                        'is_active' => true,
                    ]
                );
            }

            // Dishes
            foreach ($menuData['dishes'] as $dish) {
                Dish::updateOrCreate(
                    ['id' => $dish['id']],
                    [
                        'category_id' => $dish['category_id'],
                        'name' => $dish['name'],
                        'description' => $dish['description'] ?? null,
                        'price' => $dish['price'],
                        'calories' => $dish['calories'] ?? null,
                        'tag' => $dish['tag'] ?? null,
                        'icon' => $dish['icon'] ?? '🍽️',
                        'image' => $dish['image'] ?? null,
                        'is_available' => true,
                        'is_best_seller' => $dish['is_best_seller'] ?? false,
                        'sort_order' => $dish['sort_order'] ?? $dish['id'],
                    ]
                );
            }
        }

        // 2. Seed Weekly Meals
        $weeklyFile = $basePath . '/weekly.json';
        if (file_exists($weeklyFile)) {
            $weeklyData = json_decode(file_get_contents($weeklyFile), true);
            foreach ($weeklyData as $meal) {
                WeeklyMeal::updateOrCreate(
                    ['day_key' => $meal['day_key']],
                    [
                        'day_name' => $meal['day_name'],
                        'name' => $meal['name'],
                        'description' => $meal['description'] ?? null,
                        'price' => $meal['price'],
                        'calories' => $meal['calories'] ?? null,
                        'tag' => $meal['tag'] ?? null,
                        'image' => $meal['image'] ?? null,
                        'side_dishes' => $meal['side_dishes'] ?? [],
                        'benefits' => $meal['benefits'] ?? [],
                        'chef_tip' => $meal['chef_tip'] ?? null,
                        'is_active' => true,
                    ]
                );
            }
        }

        // 3. Seed Reviews
        $reviewsFile = $basePath . '/reviews.json';
        if (file_exists($reviewsFile)) {
            $reviewsData = json_decode(file_get_contents($reviewsFile), true);
            foreach ($reviewsData as $r) {
                Review::updateOrCreate(
                    ['name' => $r['name']],
                    [
                        'role' => $r['role'] ?? null,
                        'comment' => $r['comment'],
                        'rating' => $r['rating'] ?? 5,
                        'ordered_dish' => $r['ordered_dish'] ?? null,
                        'time_ago' => $r['time_ago'] ?? 'مؤخراً',
                        'is_approved' => true,
                    ]
                );
            }
        }

        // 4. Seed Settings
        $settings = [
            'restaurant_name' => 'لقمة | LOQMA',
            'restaurant_phone' => '01065272373',
            'whatsapp_phone' => '01065272373',
            'instapay_phone' => '01065272373',
            'vodafone_phone' => '01065272373',
            'delivery_fee' => '35',
            'free_delivery_threshold' => '400',
            'order_hours_start' => '09:00',
            'order_hours_end' => '18:00',
            'delivery_hours_start' => '13:00',
            'delivery_hours_end' => '19:00',
            'delivery_coverage' => 'القاهرة الكبرى، التجمع الخامس، المعادي، الشيخ زايد، 6 أكتوبر',
            'currency' => 'ج.م',
        ];

        foreach ($settings as $key => $val) {
            Setting::set($key, $val, 'general');
        }
    }
}


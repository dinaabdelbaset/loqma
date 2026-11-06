import DishAssemblyStudio from '../components/DishAssemblyStudio';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BurgerPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#3D312A] flex flex-col justify-between py-6">
      {/* Top Bar with Return Link & Studio Title */}
      <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#6E5D53] hover:text-[#3D312A] hover:bg-[#D2C4B7]/30 text-sm font-medium transition-all"
        >
          <ArrowRight className="w-4 h-4 text-[#8A9684]" />
          <span>العودة للرئيسية</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#8A9684] bg-[#8A9684]/15 px-3 py-1 rounded-full border border-[#8A9684]/30 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#8A9684]" />
          <span>استوديو تجميع أطباق لوقما التفاعلي</span>
        </div>
      </div>

      {/* Main Centered Studio */}
      <div className="flex-1 flex items-center justify-center">
        <DishAssemblyStudio initialDishId="burger" />
      </div>
    </main>
  );
}

import React, { useState, useMemo } from 'react';
import { useI18n } from '@/context/I18nContext';
import { getPublicTranslations } from '@/lib/i18n/publicTranslations';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  ChevronDown,
  Search,
  HelpCircle,
} from 'lucide-react';

export const FaqPage: React.FC = () => {
  const { locale, navigate } = useI18n();
  const t = getPublicTranslations(locale);
  const f = t.faq;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = f.categories;
  const allFaqs = f.items;

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, allFaqs]);

  return (
    <div className="py-12 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-12 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 border border-[#E2E8F0] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold">
                {f.tag}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B2346] mb-4">
              {f.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {f.subtitle}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 rtl:right-3.5 rtl:left-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={f.searchPlaceholder}
              className="w-full bg-white border border-[#E2E8F0] pl-11 pr-4 rtl:pr-11 rtl:pl-4 py-3 text-sm text-[#0B2346] focus:outline-none focus:ring-2 focus:ring-[#0B2346] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rtl:left-3.5 rtl:right-auto text-xs font-mono text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {locale === 'ar' ? 'مسح' : locale === 'fr' ? 'EFFACER' : 'CLEAR'}
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B2346] text-white shadow-xs'
                      : 'bg-white border border-[#E2E8F0] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 text-center text-gray-500">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-[#0B2346] text-base mb-1">
                {locale === 'ar' ? 'لم يتم العثور على أسئلة مطابقة' : locale === 'fr' ? 'Aucune question correspondante' : 'No matching questions found'}
              </p>
              <p className="text-xs text-gray-500">
                {locale === 'ar' ? 'جرب البحث بكلمات مفتاحية أخرى أو اختر قسمًا مختلفًا.' : locale === 'fr' ? 'Essayez avec d’autres mots-clés ou sélectionnez une autre catégorie.' : 'Try searching with different keywords or switch categories.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              const catObj = categories.find((c) => c.id === item.category);
              const catLabel = catObj ? catObj.label : item.category;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 flex items-start justify-between text-start cursor-pointer hover:bg-gray-50/70 gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                        {catLabel}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#0B2346]">
                        {item.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0B2346]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Direct Action Box */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-[#0B2346] mb-1">
              {locale === 'ar' ? 'هل لديك استفسار آخر غير وارد هنا؟' : locale === 'fr' ? 'Vous avez une question spécifique non traitée ?' : 'Have a specific question not covered here?'}
            </h3>
            <p className="text-xs text-gray-600">
              {locale === 'ar'
                ? 'فريق الدعم الفني لـ VIREXON متاح للتحقق من أرقام الشحنات، متابعة التوصيل في الـ 58 ولاية، والإجابة عن كافة التساؤلات.'
                : locale === 'fr'
                ? 'Notre équipe d’assistance vous guide pour la vérification des lots, le suivi de livraison dans les 58 wilayas et vos questions techniques.'
                : 'Our support team assists with batch verification, order status across all 58 wilayas, and technical questions.'}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('verify')}
              className="cursor-pointer"
            >
              {locale === 'ar' ? 'التحقق من العبوة' : locale === 'fr' ? 'Vérifier un code' : 'Verify Code'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('shop')}
              className="cursor-pointer"
            >
              {locale === 'ar' ? 'كتالوج المنتجات' : locale === 'fr' ? 'Voir le catalogue' : 'View Shop'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};


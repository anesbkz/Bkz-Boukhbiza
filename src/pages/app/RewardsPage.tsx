import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { useGamification } from '@/hooks/useGamification';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { Reward, RewardType } from '@/types/gamification';
import {
  Gift,
  Sparkles,
  ArrowRight,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  Zap,
  History,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Users,
  Target,
} from 'lucide-react';

type TabType = 'catalog' | 'badges' | 'milestones' | 'ledger' | 'redemptions';

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate, locale, dir } = useI18n();
  const t = getAppTranslations(locale);
  const { hasActivatedProduct } = useCustomerEntitlements();

  const {
    xp,
    level,
    levelProgress,
    currentStreak,
    longestStreak,
    xpTransactions,
    userBadges,
    userMilestones,
    rewards,
    redemptions,
    redeem,
    badgeCatalog,
    milestoneCatalog,
  } = useGamification();

  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [selectedRewardType, setSelectedRewardType] = useState<string>('ALL');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<{ id: string; title: string } | null>(null);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);

  // Filter rewards by category
  const filteredRewards = rewards.filter((r) => {
    if (selectedRewardType === 'ALL') return true;
    return r.type === selectedRewardType;
  });

  // Handle reward redemption
  const handleConfirmRedemption = async () => {
    if (!selectedReward) return;
    setRedeeming(true);
    setRedemptionError(null);
    try {
      const result = await redeem(selectedReward.id);
      setRedemptionSuccess({
        id: result?.redemptionId || 'CONFIRMED',
        title: selectedReward.title,
      });
      setSelectedReward(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Redemption transaction could not be processed.';
      setRedemptionError(msg);
    } finally {
      setRedeeming(false);
    }
  };

  const earnedBadgeKeys = new Set(userBadges.map((b) => b.badgeKey));
  const achievedMilestoneKeys = new Set(userMilestones.map((m) => m.milestoneKey));

  return (
    <div className="py-8 sm:py-10 bg-[#F5F7FA] min-h-screen" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <GridPattern />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                <Gift className="w-3.5 h-3.5 text-[#0B2346]" />
                <span>{t.rewards.headerBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346] tracking-tight">
                {t.rewards.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                {t.rewards.subtitle}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[90px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  {t.rewards.levelLabel}
                </div>
                <div className="text-xl font-black text-[#0B2346] font-mono">
                  {level}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[90px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold">
                  {t.rewards.totalXpLabel}
                </div>
                <div className="text-xl font-black text-[#F28C28] font-mono">
                  {xp}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[90px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>{locale === 'ar' ? 'التتابع' : locale === 'fr' ? 'Série' : 'Streak'}</span>
                </div>
                <div className="text-xl font-black text-orange-600 font-mono">
                  {currentStreak}d
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 text-center min-w-[90px]">
                <div className="text-[10px] font-mono uppercase text-gray-500 font-bold flex items-center justify-center gap-1">
                  <Award className="w-3 h-3 text-[#2E9E45]" />
                  <span>{locale === 'ar' ? 'الأوسمة' : locale === 'fr' ? 'Badges' : 'Badges'}</span>
                </div>
                <div className="text-xl font-black text-[#2E9E45] font-mono">
                  {userBadges.length}
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#0B2346] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F28C28]" />
                {locale === 'ar'
                  ? `التقدم نحو المستوى ${level + 1}`
                  : locale === 'fr'
                  ? `Progression vers le niveau ${level + 1}`
                  : `Progress to Level ${level + 1}`}
              </span>
              <span className="font-mono text-gray-500">
                {levelProgress.currentXp} / {levelProgress.xpForNextLevel ?? levelProgress.currentXp} XP ({levelProgress.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#F28C28] to-amber-500 transition-all duration-300"
                style={{ width: `${levelProgress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-3.5 cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-[#0B2346] text-[#0B2346]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{locale === 'ar' ? 'متجر المكافآت' : locale === 'fr' ? 'Boutique' : 'Rewards Catalog'}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`pb-3 px-3.5 cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'badges'
                ? 'border-[#0B2346] text-[#0B2346]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{locale === 'ar' ? 'الأوسمة والإنجازات' : locale === 'fr' ? 'Badges & Mérites' : 'Badges & Credentials'}</span>
            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.2 font-mono text-[10px]">
              {userBadges.length}/{badgeCatalog.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`pb-3 px-3.5 cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'border-[#0B2346] text-[#0B2346]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>{locale === 'ar' ? 'المحطات الرئيسية' : locale === 'fr' ? 'Jalons' : 'Milestones'}</span>
            <span className="bg-gray-100 text-gray-700 px-1.5 py-0.2 font-mono text-[10px]">
              {userMilestones.length}/{milestoneCatalog.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-3 px-3.5 cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'border-[#0B2346] text-[#0B2346]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{locale === 'ar' ? 'سجل النقاط XP' : locale === 'fr' ? 'Journal XP' : 'XP Activity Ledger'}</span>
          </button>

          <button
            onClick={() => setActiveTab('redemptions')}
            className={`pb-3 px-3.5 cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'redemptions'
                ? 'border-[#0B2346] text-[#0B2346]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{locale === 'ar' ? 'سجل الاسترداد' : locale === 'fr' ? 'Échanges' : 'Redemption History'}</span>
            {redemptions.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-mono text-[10px]">
                {redemptions.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Toast for Successful Redemption */}
        {redemptionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-emerald-900">
                  {locale === 'ar'
                    ? 'تم استرداد المكافأة بنجاح!'
                    : locale === 'fr'
                    ? 'Récompense échangée avec succès !'
                    : 'Reward Successfully Redeemed!'}
                </div>
                <div className="text-xs text-emerald-800 mt-0.5">
                  {locale === 'ar'
                    ? `لقد حصلت على: ${redemptionSuccess.title}. مرجع المعاملة: ${redemptionSuccess.id}`
                    : locale === 'fr'
                    ? `Vous avez obtenu : ${redemptionSuccess.title}. ID : ${redemptionSuccess.id}`
                    : `You have redeemed: ${redemptionSuccess.title}. Audit Reference: ${redemptionSuccess.id}`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setRedemptionSuccess(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Rewards Store */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'ALL', label: locale === 'ar' ? 'الكل' : locale === 'fr' ? 'Tous' : 'All Rewards' },
                  { key: 'DIGITAL', label: locale === 'ar' ? 'رقمية' : locale === 'fr' ? 'Numérique' : 'Digital' },
                  { key: 'PLATFORM_BENEFIT', label: locale === 'ar' ? 'مزايا المنصة' : locale === 'fr' ? 'Avantages' : 'Benefits' },
                  { key: 'EDUCATIONAL', label: locale === 'ar' ? 'تعليمية' : locale === 'fr' ? 'Éducatif' : 'Educational' },
                  { key: 'BADGE', label: locale === 'ar' ? 'أوسمة خاصة' : locale === 'fr' ? 'Badges' : 'Badges' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedRewardType(cat.key)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                      selectedRewardType === cat.key
                        ? 'bg-[#0B2346] text-white border-[#0B2346]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-gray-500">
                {locale === 'ar' ? 'الرصيد المتاح:' : locale === 'fr' ? 'Solde disponible :' : 'Available Balance:'}{' '}
                <span className="font-bold text-[#F28C28]">{xp} XP</span>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => {
                const canAfford = xp >= reward.xpCost;
                const inStock = reward.stock === null || reward.stock > 0;
                const xpDifference = reward.xpCost - xp;

                return (
                  <div
                    key={reward.id}
                    className="bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between shadow-xs hover:border-gray-400 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#0B2346] border border-blue-100">
                          {reward.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#F28C28] bg-amber-50 px-2 py-0.5 border border-amber-200">
                          {reward.xpCost} XP
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#0B2346] mb-1.5">{reward.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">{reward.description}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                        <span>
                          {inStock
                            ? reward.stock !== null
                              ? `${reward.stock} ${locale === 'ar' ? 'متاح' : locale === 'fr' ? 'restants' : 'left'}`
                              : locale === 'ar' ? 'متوفر' : locale === 'fr' ? 'Illimité' : 'Available'
                            : locale === 'ar' ? 'نفد المخزون' : locale === 'fr' ? 'Épuisé' : 'Out of Stock'}
                        </span>
                        {!canAfford && (
                          <span className="text-red-500 font-medium">
                            +{xpDifference} XP {locale === 'ar' ? 'مطلوب' : locale === 'fr' ? 'requis' : 'needed'}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => setSelectedReward(reward)}
                        disabled={!canAfford || !inStock}
                        variant={canAfford && inStock ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full justify-center cursor-pointer disabled:cursor-not-allowed"
                      >
                        {!inStock
                          ? (locale === 'ar' ? 'غير متوفر' : locale === 'fr' ? 'Indisponible' : 'Out of Stock')
                          : canAfford
                          ? (locale === 'ar' ? 'استرداد المكافأة' : locale === 'fr' ? 'Échanger la récompense' : 'Redeem Reward')
                          : (locale === 'ar' ? 'نقاط غير كافية' : locale === 'fr' ? 'XP insuffisant' : 'Insufficient XP')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Badges & Credentials */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-[#0B2346]">
                    {locale === 'ar'
                      ? 'الأوسمة وشهادات الإنجاز التأسيسية'
                      : locale === 'fr'
                      ? 'Badges et distinctions de mérite'
                      : 'Earned Badges & Platform Credentials'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    {locale === 'ar'
                      ? 'تُمنح الأوسمة تلقائياً بناءً على إنجازاتك في التفعيل، التعلم، والالتزام ببروتوكول ZIRON.'
                      : locale === 'fr'
                      ? 'Les badges sont décernés de manière vérifiable lors de vos jalons d\'activation, d\'apprentissage et d\'adhérence.'
                      : 'Badges are server-verified awards granted upon activation milestones, learning mastery, and protocol adherence.'}
                  </p>
                </div>
                <div className="text-xs font-mono text-[#0B2346] bg-blue-50 px-3 py-1.5 border border-blue-200 shrink-0">
                  {userBadges.length} / {badgeCatalog.length} {locale === 'ar' ? 'مكتسب' : locale === 'fr' ? 'débloqués' : 'Unlocked'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgeCatalog.map((badgeDef) => {
                  const isEarned = earnedBadgeKeys.has(badgeDef.key);
                  const earnedRecord = userBadges.find((b) => b.badgeKey === badgeDef.key);

                  return (
                    <div
                      key={badgeDef.key}
                      className={`p-5 border flex flex-col justify-between transition-all ${
                        isEarned
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-gray-50/50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 flex items-center justify-center font-bold text-lg ${
                              isEarned
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isEarned ? '★' : '🔒'}
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                              isEarned
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isEarned
                              ? (locale === 'ar' ? 'مكتسب' : locale === 'fr' ? 'Débloqué' : 'Earned')
                              : (locale === 'ar' ? 'مقفل' : locale === 'fr' ? 'Verrouillé' : 'Locked')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#0B2346] mb-1">
                          {locale === 'ar' ? badgeDef.nameAr : locale === 'fr' ? badgeDef.nameFr : badgeDef.nameEn}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                          {locale === 'ar' ? badgeDef.descriptionAr : locale === 'fr' ? badgeDef.descriptionFr : badgeDef.descriptionEn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-200/60 text-[11px]">
                        <div className="text-gray-500 font-mono">
                          <span className="font-bold text-[#0B2346]">
                            {locale === 'ar' ? 'المتطلب: ' : locale === 'fr' ? 'Requis : ' : 'Requirement: '}
                          </span>
                          {locale === 'ar' ? badgeDef.requirementAr : locale === 'fr' ? badgeDef.requirementFr : badgeDef.requirementEn}
                        </div>
                        {isEarned && earnedRecord?.awardedAt && (
                          <div className="text-[10px] text-emerald-700 font-mono mt-1">
                            {locale === 'ar' ? 'تاريخ المنح: ' : locale === 'fr' ? 'Obtenu le : ' : 'Awarded: '}
                            {new Date(earnedRecord.awardedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Milestones */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#0B2346] mb-1">
                {locale === 'ar'
                  ? 'محطات بروتوكول ZIRON'
                  : locale === 'fr'
                  ? 'Jalons du protocole ZIRON'
                  : 'ZIRON Protocol Milestones'}
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                {locale === 'ar'
                  ? 'محطات تقدم رئيسية تُسجل رسمياً على السلسلة التأسيسية للمنصة.'
                  : locale === 'fr'
                  ? 'Grandes étapes officielles enregistrées sur votre parcours d\'adhérence.'
                  : 'Key milestones officially recorded in the authoritative system ledger.'}
              </p>

              <div className="space-y-4">
                {milestoneCatalog.map((m) => {
                  const isAchieved = achievedMilestoneKeys.has(m.key);
                  const record = userMilestones.find((rec) => rec.milestoneKey === m.key);

                  return (
                    <div
                      key={m.key}
                      className={`p-4 border flex items-start justify-between gap-4 ${
                        isAchieved
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isAchieved
                              ? 'bg-[#0B2346] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isAchieved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#0B2346]">
                            {locale === 'ar' ? m.titleAr : locale === 'fr' ? m.titleFr : m.titleEn}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {locale === 'ar' ? m.descriptionAr : locale === 'fr' ? m.descriptionFr : m.descriptionEn}
                          </div>
                          {isAchieved && record?.achievedAt && (
                            <div className="text-[10px] text-blue-700 font-mono mt-1">
                              {locale === 'ar' ? 'تم تحقيقه في: ' : locale === 'fr' ? 'Atteint le : ' : 'Achieved on: '}
                              {new Date(record.achievedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 shrink-0 ${
                          isAchieved
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isAchieved
                          ? (locale === 'ar' ? 'مكتمل' : locale === 'fr' ? 'Atteint' : 'Achieved')
                          : (locale === 'ar' ? 'قيد التقدم' : locale === 'fr' ? 'En cours' : 'In Progress')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: XP Activity Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B2346]">
                    {locale === 'ar' ? 'سجل معاملات النقاط XP' : locale === 'fr' ? 'Grand livre XP' : 'Authoritative XP Activity Ledger'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {locale === 'ar'
                      ? 'سجل غير قابل للتعديل لكافة أحداث اكتساب واسترداد النقاط.'
                      : locale === 'fr'
                      ? 'Journal immuable de tous les gains et déductions de points XP.'
                      : 'Immutable append-only ledger of earned and redeemed XP transactions.'}
                  </p>
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {xpTransactions.length} {locale === 'ar' ? 'معاملة' : locale === 'fr' ? 'événements' : 'records'}
                </div>
              </div>

              {xpTransactions.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-500">
                  {locale === 'ar'
                    ? 'لا توجد معاملات مسجلة بعد. قم بتفعيل عبوة أو إكمال درس لبدء كسب النقاط.'
                    : locale === 'fr'
                    ? 'Aucune transaction pour le moment. Activez un flacon ou complétez une leçon.'
                    : 'No XP transactions recorded yet. Activate a container or complete a lesson to earn XP.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-400 font-mono text-[10px] uppercase border-b border-gray-200">
                        <th className="pb-2 font-medium">{locale === 'ar' ? 'التاريخ' : locale === 'fr' ? 'Date' : 'Date'}</th>
                        <th className="pb-2 font-medium">{locale === 'ar' ? 'الحدث' : locale === 'fr' ? 'Source' : 'Event Source'}</th>
                        <th className="pb-2 font-medium">{locale === 'ar' ? 'النوع' : locale === 'fr' ? 'Type' : 'Type'}</th>
                        <th className="pb-2 font-medium text-right">{locale === 'ar' ? 'القيمة' : locale === 'fr' ? 'Montant' : 'XP Amount'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {xpTransactions.map((tx) => {
                        const isCredit = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 text-gray-500 whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2.5 font-sans font-medium text-[#0B2346]">
                              {tx.source.replace(/_/g, ' ')}
                            </td>
                            <td className="py-2.5 text-gray-500">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 font-mono ${
                                  isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td
                              className={`py-2.5 text-right font-bold ${
                                isCredit ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {isCredit ? `+${tx.amount}` : tx.amount} XP
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Redemption History */}
        {activeTab === 'redemptions' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#0B2346] mb-1">
                {locale === 'ar' ? 'سجل المكافآت المستردة' : locale === 'fr' ? 'Historique des récompenses' : 'Reward Redemption History'}
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                {locale === 'ar'
                  ? 'سجل المشتريات والمكافآت الرقمية المستردة عبر نقاط XP.'
                  : locale === 'fr'
                  ? 'Historique de vos échanges de points validés par le serveur.'
                  : 'Audit trail of rewards redeemed through server-authoritative transactions.'}
              </p>

              {redemptions.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-500">
                  {locale === 'ar'
                    ? 'لم تقم باسترداد أي مكافأة بعد. استكشف متجر المكافآت أعلاه.'
                    : locale === 'fr'
                    ? 'Aucun échange effectué. Parcourez la boutique pour utiliser vos XP.'
                    : 'You have not redeemed any rewards yet. Browse the catalog to spend your XP.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="p-4 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-[#0B2346] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{redemption.rewardTitle}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          ID: {redemption.id} • {new Date(redemption.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">
                          -{redemption.xpCost} XP
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold">
                          {redemption.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Redemption Confirmation */}
        {selectedReward && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-amber-50 text-[#F28C28] text-[10px] font-mono uppercase font-bold border border-amber-200">
                  <Sparkles className="w-3 h-3" />
                  <span>{locale === 'ar' ? 'تأكيد الاسترداد' : locale === 'fr' ? 'Confirmation' : 'Confirm Redemption'}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedReward(null);
                    setRedemptionError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0B2346] mb-1">{selectedReward.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{selectedReward.description}</p>
              </div>

              {/* Cost Summary Box */}
              <div className="p-3 bg-gray-50 border border-gray-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-600">
                  <span>{locale === 'ar' ? 'رصيدك الحالي:' : locale === 'fr' ? 'Solde actuel :' : 'Current Balance:'}</span>
                  <span className="font-bold text-[#0B2346]">{xp} XP</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>{locale === 'ar' ? 'تكلفة المكافأة:' : locale === 'fr' ? 'Coût :' : 'Reward Cost:'}</span>
                  <span className="font-bold">-{selectedReward.xpCost} XP</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex justify-between font-bold text-[#0B2346]">
                  <span>{locale === 'ar' ? 'الرصيد المتبقي:' : locale === 'fr' ? 'Solde restant :' : 'Remaining Balance:'}</span>
                  <span>{xp - selectedReward.xpCost} XP</span>
                </div>
              </div>

              {redemptionError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{redemptionError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedReward(null);
                    setRedemptionError(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-1/2 justify-center cursor-pointer"
                  disabled={redeeming}
                >
                  {locale === 'ar' ? 'إلغاء' : locale === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>

                <Button
                  onClick={handleConfirmRedemption}
                  variant="primary"
                  size="sm"
                  className="w-1/2 justify-center cursor-pointer bg-[#0B2346]"
                  disabled={redeeming}
                >
                  {redeeming ? (
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {locale === 'ar' ? 'جاري الاسترداد...' : locale === 'fr' ? 'En cours...' : 'Redeeming...'}
                    </span>
                  ) : (
                    locale === 'ar' ? 'تأكيد الاستبدال' : locale === 'fr' ? 'Confirmer' : 'Confirm'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

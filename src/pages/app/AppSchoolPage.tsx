import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { SchoolCategory, SchoolCourse, SchoolProgress, SchoolModule, SchoolLesson } from '@/types/models';
import {
  listSchoolCategories,
  listAllCourses,
  listCoursesByCategory,
  getCourseById,
  listUserProgress,
  getUserCertificates,
  listModulesByCourse,
  listLessonsByCourse,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { GridPattern } from '@/components/design-system/GridPattern';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import { CoursePlayer } from '@/components/school/CoursePlayer';
import {
  GraduationCap,
  Lock,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Award,
  Layers,
  Search,
  Filter,
  BarChart2,
  Play,
  PlayCircle,
  ExternalLink,
  Compass,
} from 'lucide-react';

interface AppSchoolPageProps {
  initialView?: 'dashboard' | 'catalog' | 'detail' | 'player';
  initialCourseId?: string;
}

export const AppSchoolPage: React.FC<AppSchoolPageProps> = ({
  initialView = 'dashboard',
  initialCourseId,
}) => {
  const { user, loading: authLoading, isStaff } = useAuth();
  const { locale, dir, navigate } = useI18n();
  const t = getAppTranslations(locale);
  const { hasSchoolAccess, qualifyingContainerCount } = useCustomerEntitlements();

  // Internal view state
  const [view, setView] = useState<'dashboard' | 'catalog' | 'detail' | 'player'>(initialView);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId || null);
  const [selectedCourse, setSelectedCourse] = useState<SchoolCourse | null>(null);

  // Data states
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [userProgressList, setUserProgressList] = useState<SchoolProgress[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED'>('all');

  // Detail view curriculum states
  const [courseModules, setCourseModules] = useState<SchoolModule[]>([]);
  const [courseLessons, setCourseLessons] = useState<SchoolLesson[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // General loading states
  const [loading, setLoading] = useState(true);

  // Entitlement check
  const hasAccess = Boolean(isStaff || hasSchoolAccess || qualifyingContainerCount >= 3);
  const count = Math.max(0, Math.min(3, qualifyingContainerCount));

  // Sync initial view/courseId if props change
  useEffect(() => {
    if (initialView) setView(initialView);
    if (initialCourseId) setSelectedCourseId(initialCourseId);
  }, [initialView, initialCourseId]);

  // Load core school data once authenticated & entitled
  useEffect(() => {
    async function loadSchoolData() {
      if (!hasAccess || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [cats, allCourses, progressData, certs] = await Promise.all([
          listSchoolCategories(false),
          listAllCourses(false),
          listUserProgress(user.uid),
          getUserCertificates(user.uid),
        ]);

        setCategories(cats);
        setCourses(allCourses);
        setUserProgressList(progressData);
        setCertificates(certs);

        // If a course ID was passed in URL/props, fetch it
        if (selectedCourseId) {
          const targetCourse = allCourses.find((c) => c.id === selectedCourseId) || (await getCourseById(selectedCourseId));
          if (targetCourse) {
            setSelectedCourse(targetCourse);
          }
        }
      } catch (err) {
        console.error('Error loading school data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSchoolData();
  }, [hasAccess, user, selectedCourseId]);

  // Load curriculum modules & lessons when entering detail view for a course
  useEffect(() => {
    async function loadDetail() {
      if (!selectedCourse) return;
      setLoadingCurriculum(true);
      try {
        const [mods, less] = await Promise.all([
          listModulesByCourse(selectedCourse.id, false),
          listLessonsByCourse(selectedCourse.id, false),
        ]);
        setCourseModules(mods);
        setCourseLessons(less);
      } catch (err) {
        console.error('Error loading course modules:', err);
      } finally {
        setLoadingCurriculum(false);
      }
    }

    if (view === 'detail' && selectedCourse) {
      loadDetail();
    }
  }, [view, selectedCourse]);

  // Helper mapping course progress
  const progressByCourseId = useMemo(() => {
    const map = new Map<string, SchoolProgress>();
    for (const p of userProgressList) {
      map.set(p.courseId, p);
    }
    return map;
  }, [userProgressList]);

  // Completed & In-Progress counts
  const completedCoursesCount = useMemo(() => {
    return userProgressList.filter((p) => p.isCompleted || p.progressPercent >= 100).length;
  }, [userProgressList]);

  const inProgressCourses = useMemo(() => {
    return courses
      .map((c) => ({
        course: c,
        progress: progressByCourseId.get(c.id),
      }))
      .filter(
        (item) =>
          item.progress &&
          !item.progress.isCompleted &&
          item.progress.progressPercent < 100 &&
          item.progress.progressPercent > 0
      );
  }, [courses, progressByCourseId]);

  // Recommended next course:
  // 1) First in-progress course, OR
  // 2) First unstarted foundational course, OR
  // 3) First course available
  const recommendedCourse = useMemo(() => {
    if (inProgressCourses.length > 0) {
      return inProgressCourses[0].course;
    }
    const unstartedFoundational = courses.find((c) => {
      const p = progressByCourseId.get(c.id);
      return !p && c.difficulty === 'FOUNDATIONAL';
    });
    if (unstartedFoundational) return unstartedFoundational;

    const unstartedAny = courses.find((c) => {
      const p = progressByCourseId.get(c.id);
      return !p || (!p.isCompleted && p.progressPercent === 0);
    });
    return unstartedAny || courses[0] || null;
  }, [courses, inProgressCourses, progressByCourseId]);

  // Filtered courses for catalog view
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory =
        selectedCategoryId === 'all' ||
        c.categoryId === selectedCategoryId ||
        c.categoryId === `seed-${selectedCategoryId}`;

      const matchesDifficulty =
        difficultyFilter === 'all' || c.difficulty === difficultyFilter;

      const titleStr = (c.title[locale] || c.title.en || '').toLowerCase();
      const descStr = (c.description[locale] || c.description.en || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || titleStr.includes(q) || descStr.includes(q);

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [courses, selectedCategoryId, difficultyFilter, searchQuery, locale]);

  // Actions
  const openCourseDetail = (course: SchoolCourse) => {
    setSelectedCourse(course);
    setSelectedCourseId(course.id);
    setView('detail');
    navigate(`app/school/courses/${course.id}`);
  };

  const openCoursePlayer = (course: SchoolCourse) => {
    setSelectedCourse(course);
    setSelectedCourseId(course.id);
    setView('player');
    navigate(`app/school/courses/${course.id}/learn`);
  };

  // Determine dynamic message based on 3-container count
  const getStatusMessage = () => {
    if (count === 0) return t.school.zeroContainersMsg;
    if (count === 1) return t.school.oneContainerMsg;
    if (count === 2) return t.school.twoContainersMsg;
    return t.school.threeContainersMsg;
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        {t.common.loading}
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="py-16 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
            <Lock className="w-8 h-8 text-[#0B2346] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-[#0B2346] mb-2">{t.shell.authRequiredTitle}</h1>
            <p className="text-xs text-gray-600 mb-6">{t.shell.authRequiredDesc}</p>
            <Button onClick={() => navigate('login')} variant="primary" size="md" className="w-full cursor-pointer">
              {t.common.signIn}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOCKED STATE: Exactly complies with Phase 8 prompt
  // =========================================================================
  if (!hasAccess) {
    const progressPercent = Math.round((count / 3) * 100);

    return (
      <div className="py-16 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm relative text-center">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4 rounded-full">
                <Lock className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                <span>STATUS: LOCKED</span>
                <span>•</span>
                <span dir="ltr">{count} / 3 CONTAINERS</span>
              </div>

              <h1 className="text-2xl font-black text-[#0B2346] mb-3">{t.school.title}</h1>

              {/* Exact required phrasing */}
              <div className="p-4 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 leading-relaxed mb-6 max-w-md mx-auto">
                <p className="font-bold text-[#0B2346] mb-1">
                  ZIRON School unlocks after activation of 3 unique ZIRON product containers.
                </p>
                <p className="text-gray-600 text-[11px]">
                  {t.school.ruleExplanation}
                </p>
              </div>

              {/* 3-Container Qualification Progress Box */}
              <div className="p-5 bg-gray-50 border border-gray-200 text-start text-xs mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B2346] text-xs">{t.school.progressLabel}</span>
                  <span dir="ltr" className="font-mono text-xs font-bold text-[#0B2346] bg-white px-2.5 py-0.5 border border-gray-200">
                    {count} / 3 Required
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-gray-200 h-2.5 overflow-hidden">
                  <div
                    className="bg-[#0B2346] h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 3 Step Indicators */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[1, 2, 3].map((step) => {
                    const isCompleted = count >= step;
                    return (
                      <div
                        key={step}
                        className={`p-2 border text-center text-[11px] font-mono transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shrink-0" />
                          )}
                          <span dir="ltr">#{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Guidance Message */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B2346] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#0B2346] font-medium leading-relaxed">{getStatusMessage()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{count === 0 ? t.school.activateFirstBtn : t.school.activateAnotherBtn}</span>
                  {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
                <Button onClick={() => navigate('app')} variant="outline" size="md" className="flex-1 cursor-pointer">
                  {t.common.backToDashboard}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: COURSE PLAYER
  // =========================================================================
  if (view === 'player' && selectedCourse) {
    return (
      <div className="py-8 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoursePlayer
            course={selectedCourse}
            onBack={() => {
              setView('detail');
              navigate(`app/school/courses/${selectedCourse.id}`);
            }}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: COURSE DETAIL / SYLLABUS
  // =========================================================================
  if (view === 'detail' && selectedCourse) {
    const courseProgress = progressByCourseId.get(selectedCourse.id);
    const progressPercent = courseProgress?.progressPercent || 0;
    const completedLessonIds = courseProgress?.completedLessonIds || [];
    const isCompleted = Boolean(courseProgress?.isCompleted || progressPercent >= 100);

    return (
      <div className="py-8 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setView('catalog');
                navigate('app/school/courses');
              }}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-600 hover:text-[#0B2346] cursor-pointer"
            >
              {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{locale === 'ar' ? 'العودة لدليل الدورات' : locale === 'fr' ? 'Retour au catalogue' : 'Back to Course Catalog'}</span>
            </button>

            <span className="text-xs font-mono text-gray-500 uppercase">
              ID: <span dir="ltr">{selectedCourse.slug || selectedCourse.id}</span>
            </span>
          </div>

          {/* Course Hero Dossier */}
          <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] relative overflow-hidden">
            <GridPattern />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] font-bold uppercase border border-blue-100">
                  {selectedCourse.difficulty}
                </span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 font-mono text-[10px] font-bold uppercase border border-gray-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span dir="ltr">{selectedCourse.estimatedHours}</span> {t.school.hoursCount}
                </span>
                {isCompleted && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{locale === 'ar' ? 'مكتمل ومعتمد' : locale === 'fr' ? 'Validé & Certifié' : 'Completed & Certified'}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346]">
                {selectedCourse.title[locale] || selectedCourse.title.en}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
                {selectedCourse.description[locale] || selectedCourse.description.en}
              </p>

              {/* Progress Summary */}
              <div className="pt-2 max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-600">{locale === 'ar' ? 'نسبة الإنجاز:' : locale === 'fr' ? 'Progression :' : 'Course Progress:'}</span>
                  <span className="font-bold text-[#0B2346]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-600' : 'bg-[#0B2346]'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => openCoursePlayer(selectedCourse)}
                  className="bg-[#0B2346] text-white hover:bg-[#0B2346]/90 font-bold text-xs"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {progressPercent > 0
                    ? locale === 'ar' ? 'استئناف التعلم' : locale === 'fr' ? 'Reprendre la formation' : 'Resume Learning'
                    : locale === 'ar' ? 'بدء الدورة الآن' : locale === 'fr' ? 'Commencer la formation' : 'Start Course Now'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Curriculum Syllabus Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0B2346] tracking-tight">
              {locale === 'ar' ? 'المنهج والوحدات الدراسية' : locale === 'fr' ? 'Programme & Modules' : 'Curriculum Syllabus'}
            </h2>

            {loadingCurriculum ? (
              <div className="p-8 bg-white border border-[#E2E8F0] text-center text-xs font-mono text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
                {t.common.loading}
              </div>
            ) : courseModules.length === 0 ? (
              <div className="p-8 bg-white border border-[#E2E8F0] text-center text-xs text-gray-500">
                {locale === 'ar' ? 'لا توجد وحدات دراسية منشورة حالياً.' : locale === 'fr' ? 'Aucun module disponible.' : 'No modules currently published for this course.'}
              </div>
            ) : (
              <div className="space-y-4">
                {courseModules.map((mod, modIdx) => {
                  const modLessons = courseLessons.filter((l) => l.moduleId === mod.id);
                  return (
                    <Card key={mod.id} className="p-6 bg-white border border-[#E2E8F0] space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B2346] font-bold block mb-1">
                          MODULE {modIdx + 1}
                        </span>
                        <h3 className="text-base font-bold text-[#0B2346]">
                          {mod.title[locale] || mod.title.en}
                        </h3>
                        {mod.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {mod.description[locale] || mod.description.en}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        {modLessons.map((les, lesIdx) => {
                          const isLessonDone = completedLessonIds.includes(les.id);
                          return (
                            <div
                              key={les.id}
                              className="p-3 bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {isLessonDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-gray-300 text-[10px] flex items-center justify-center text-gray-400 font-mono shrink-0">
                                    {lesIdx + 1}
                                  </span>
                                )}
                                <span className={`font-medium ${isLessonDone ? 'text-gray-900 line-through text-gray-500' : 'text-[#0B2346]'}`}>
                                  {les.title[locale] || les.title.en}
                                </span>
                              </div>

                              <span className="text-[11px] font-mono text-gray-400">
                                {isLessonDone
                                  ? locale === 'ar' ? 'مكتمل' : locale === 'fr' ? 'Validé' : 'Completed'
                                  : locale === 'ar' ? 'متاح' : locale === 'fr' ? 'Disponible' : 'Available'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN UNLOCKED SCHOOL INTERFACE (DASHBOARD & CATALOG)
  // =========================================================================
  return (
    <div className="py-8 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Dossier */}
        <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
          <GridPattern />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.school.curriculumAccessActive}</span>
              <span className="mx-1">•</span>
              <span dir="ltr">{qualifyingContainerCount} / 3 {t.school.containersUnlockedBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2346]">{t.school.title}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">{t.school.subtitle}</p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => navigate('app/restart')}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              {locale === 'ar' ? 'منظومة Restart' : locale === 'fr' ? 'Écosystème Restart' : 'Restart Hub'}
            </Button>
            <Button
              onClick={() => navigate('app/school/certificates')}
              variant="outline"
              size="sm"
              className="border-[#0B2346] text-[#0B2346] text-xs font-bold"
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              {t.shell.navCertificates} ({certificates.length})
            </Button>
          </div>
        </div>

        {/* Navigation Tabs between Dashboard & Catalog */}
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-2">
          <button
            onClick={() => {
              setView('dashboard');
              navigate('app/school');
            }}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors border flex items-center gap-2 ${
              view === 'dashboard'
                ? 'bg-[#0B2346] text-white border-[#0B2346]'
                : 'bg-white text-gray-600 border-[#E2E8F0] hover:bg-gray-50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'لوحة التحكم والمتابعة' : locale === 'fr' ? 'Tableau de bord' : 'School Dashboard'}</span>
          </button>

          <button
            onClick={() => {
              setView('catalog');
              navigate('app/school/courses');
            }}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-colors border flex items-center gap-2 ${
              view === 'catalog'
                ? 'bg-[#0B2346] text-white border-[#0B2346]'
                : 'bg-white text-gray-600 border-[#E2E8F0] hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'دليل المسارات والدورات' : locale === 'fr' ? 'Catalogue des Formations' : 'Course Catalog'}</span>
          </button>
        </div>

        {/* ===================================================================
            VIEW 1: DASHBOARD VIEW
            =================================================================== */}
        {view === 'dashboard' && (
          <div className="space-y-8">
            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-5 bg-white border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                  {locale === 'ar' ? 'حالة الأهلية' : locale === 'fr' ? 'Statut d’accès' : 'Access Status'}
                </span>
                <p className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'متاح ومؤهل' : locale === 'fr' ? 'Actif & Validé' : 'Active Access'}</span>
                </p>
              </Card>

              <Card className="p-5 bg-white border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                  {locale === 'ar' ? 'العبوات المفعلة' : locale === 'fr' ? 'Contenants activés' : 'Activated Containers'}
                </span>
                <p className="text-lg font-black text-[#0B2346]" dir="ltr">
                  {qualifyingContainerCount} / 3 <span className="text-xs font-normal text-gray-500">Req.</span>
                </p>
              </Card>

              <Card className="p-5 bg-white border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                  {locale === 'ar' ? 'الدورات المكتملة' : locale === 'fr' ? 'Cours complétés' : 'Completed Courses'}
                </span>
                <p className="text-lg font-black text-[#0B2346]" dir="ltr">
                  {completedCoursesCount} <span className="text-xs font-normal text-gray-500">/ {courses.length}</span>
                </p>
              </Card>

              <Card className="p-5 bg-white border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 font-bold block">
                  {locale === 'ar' ? 'الشهادات المكتسبة' : locale === 'fr' ? 'Certificats obtenus' : 'Earned Certificates'}
                </span>
                <p className="text-lg font-black text-[#0B2346]" dir="ltr">
                  {certificates.length}
                </p>
              </Card>
            </div>

            {/* Recommended Next Course Banner */}
            {recommendedCourse && (
              <Card className="p-6 bg-gradient-to-r from-blue-50/70 via-white to-white border border-blue-200 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0B2346] text-white font-mono text-[10px] font-bold uppercase">
                        {locale === 'ar' ? 'الدورة التالية المقترحة' : locale === 'fr' ? 'Formation Recommandée' : 'Recommended Next Course'}
                      </span>
                      <span className="text-xs font-mono text-gray-500 uppercase">
                        {recommendedCourse.difficulty} • {recommendedCourse.estimatedHours} {t.school.hoursCount}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#0B2346]">
                      {recommendedCourse.title[locale] || recommendedCourse.title.en}
                    </h2>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {recommendedCourse.description[locale] || recommendedCourse.description.en}
                    </p>

                    {/* Progress if any */}
                    {progressByCourseId.get(recommendedCourse.id) && (
                      <div className="pt-1 max-w-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-600">
                          <span>Progress</span>
                          <span>{progressByCourseId.get(recommendedCourse.id)?.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5">
                          <div
                            className="bg-[#0B2346] h-full"
                            style={{ width: `${progressByCourseId.get(recommendedCourse.id)?.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => openCoursePlayer(recommendedCourse)}
                      className="bg-[#0B2346] text-white hover:bg-[#0B2346]/90 font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      {progressByCourseId.get(recommendedCourse.id)?.progressPercent
                        ? locale === 'ar' ? 'استئناف' : locale === 'fr' ? 'Reprendre' : 'Resume'
                        : locale === 'ar' ? 'بدء الدورة' : locale === 'fr' ? 'Commencer' : 'Start Course'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openCourseDetail(recommendedCourse)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                    >
                      {locale === 'ar' ? 'المنهج' : locale === 'fr' ? 'Syllabus' : 'Syllabus'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Active In-Progress Courses */}
            {inProgressCourses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-[#0B2346] tracking-tight">
                  {locale === 'ar' ? 'دوراتي قيد التقدم' : locale === 'fr' ? 'Mes Formations en Cours' : 'Active In-Progress Courses'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inProgressCourses.map(({ course, progress }) => (
                    <Card key={course.id} className="p-5 bg-white border border-[#E2E8F0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] font-bold uppercase">
                          {course.difficulty}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0B2346]">
                          {progress?.progressPercent}%
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#0B2346]">{course.title[locale] || course.title.en}</h4>
                        <div className="w-full bg-gray-200 h-1.5 mt-2">
                          <div className="bg-[#0B2346] h-full" style={{ width: `${progress?.progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-mono">
                          {progress?.completedCount || 0} / {progress?.totalLessonsCount || 0} lessons
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCoursePlayer(course)}
                          className="border-[#0B2346] text-[#0B2346] text-xs font-bold"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          <span>{locale === 'ar' ? 'استئناف' : locale === 'fr' ? 'Reprendre' : 'Resume'}</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Course Categories Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                    ACADEMIC DISCIPLINES
                  </span>
                  <h3 className="text-lg font-black text-[#0B2346] tracking-tight">
                    {locale === 'ar' ? 'المسارات والتخصصات المتاحة' : locale === 'fr' ? 'Disciplines & Filières' : 'Available Course Categories'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setView('catalog');
                    navigate('app/school/courses');
                  }}
                  className="text-xs font-bold text-[#0B2346] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{locale === 'ar' ? 'عرض جميع الدورات' : locale === 'fr' ? 'Voir tout le catalogue' : 'View Full Catalog'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const catCourses = courses.filter((c) => c.categoryId === cat.id || c.categoryId === `seed-${cat.slug}`);
                  return (
                    <Card
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setView('catalog');
                        navigate('app/school/courses');
                      }}
                      className="p-5 bg-white border border-[#E2E8F0] hover:border-[#0B2346] transition-colors cursor-pointer space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold block">
                          TRACK: {cat.slug.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-bold text-[#0B2346]">{cat.title[locale] || cat.title.en}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {cat.description[locale] || cat.description.en}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                        <span>{catCourses.length} {locale === 'ar' ? 'دورات' : locale === 'fr' ? 'cours' : 'courses'}</span>
                        <span className="text-[#0B2346] font-bold flex items-center gap-1">
                          {locale === 'ar' ? 'استعراض' : locale === 'fr' ? 'Explorer' : 'Browse'}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: COURSE CATALOG VIEW
            =================================================================== */}
        {view === 'catalog' && (
          <div className="space-y-6">
            {/* Filter & Search Controls */}
            <div className="bg-white border border-[#E2E8F0] p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ar' ? 'بحث في الدورات والمناهج...' : locale === 'fr' ? 'Rechercher une formation...' : 'Search courses & syllabus...'}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 text-xs focus:outline-none focus:border-[#0B2346]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-mono text-gray-500">{locale === 'ar' ? 'المستوى:' : locale === 'fr' ? 'Niveau :' : 'Difficulty:'}</span>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as any)}
                    className="border border-gray-300 text-xs px-2.5 py-1.5 bg-white focus:outline-none focus:border-[#0B2346]"
                  >
                    <option value="all">{locale === 'ar' ? 'جميع المستويات' : locale === 'fr' ? 'Tous les niveaux' : 'All Difficulties'}</option>
                    <option value="FOUNDATIONAL">Foundational</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Category Quick Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                    selectedCategoryId === 'all'
                      ? 'bg-[#0B2346] text-white border-[#0B2346]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {locale === 'ar' ? 'جميع المسارات' : locale === 'fr' ? 'Toutes les filières' : 'All Disciplines'}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                      selectedCategoryId === cat.id
                        ? 'bg-[#0B2346] text-white border-[#0B2346]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat.title[locale] || cat.title.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#E2E8F0] space-y-2">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">{t.school.noCoursesTitle}</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">{t.school.noCoursesDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const p = progressByCourseId.get(course.id);
                  const progressPercent = p?.progressPercent || 0;
                  const isFinished = Boolean(p?.isCompleted || progressPercent >= 100);

                  return (
                    <Card
                      key={course.id}
                      className="p-6 bg-white border border-[#E2E8F0] hover:border-[#0B2346] transition-colors flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] text-[10px] font-mono font-bold uppercase border border-blue-100">
                            {course.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span dir="ltr">{course.estimatedHours}</span> {t.school.hoursCount}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#0B2346] line-clamp-1">
                            {course.title[locale] || course.title.en}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {course.description[locale] || course.description.en}
                          </p>
                        </div>

                        {/* Progress bar if user started */}
                        {progressPercent > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-bold text-[#0B2346]">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${isFinished ? 'bg-emerald-600' : 'bg-[#0B2346]'}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <Button
                          onClick={() => openCoursePlayer(course)}
                          variant="primary"
                          size="sm"
                          className="flex-1 bg-[#0B2346] text-white hover:bg-[#0B2346]/90 font-bold text-xs"
                        >
                          <Play className="w-3.5 h-3.5 mr-1" />
                          <span>{progressPercent > 0 ? (locale === 'ar' ? 'استئناف' : locale === 'fr' ? 'Reprendre' : 'Resume') : (locale === 'ar' ? 'بدء' : locale === 'fr' ? 'Démarrer' : 'Start')}</span>
                        </Button>

                        <Button
                          onClick={() => openCourseDetail(course)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        >
                          <span>{locale === 'ar' ? 'المنهج' : locale === 'fr' ? 'Syllabus' : 'Syllabus'}</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

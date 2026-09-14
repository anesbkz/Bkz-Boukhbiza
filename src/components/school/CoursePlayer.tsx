import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { SchoolCourse, SchoolModule, SchoolLesson, SchoolProgress, EnrollmentRecord } from '@/types/models';
import {
  listModulesByCourse,
  listLessonsByCourse,
  enrollInCourse,
  getUserEnrollment,
  getUserSchoolProgress,
  completeSchoolLesson,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { GridPattern } from '@/components/design-system/GridPattern';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Award,
  ChevronRight,
  PlayCircle,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CoursePlayerProps {
  course: SchoolCourse;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const { user } = useAuth();
  const { locale, dir, navigate } = useI18n();

  const [modules, setModules] = useState<SchoolModule[]>([]);
  const [lessons, setLessons] = useState<SchoolLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(null);
  const [progress, setProgress] = useState<SchoolProgress | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load course curriculum, enrollment, and progress
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [modList, lesList] = await Promise.all([
          listModulesByCourse(course.id, false),
          listLessonsByCourse(course.id, false),
        ]);
        setModules(modList);
        setLessons(lesList);

        // Fetch or create enrollment
        let userEnrollment = await getUserEnrollment(user.uid, course.id);
        if (!userEnrollment) {
          try {
            await enrollInCourse(course.id);
            userEnrollment = await getUserEnrollment(user.uid, course.id);
          } catch (e) {
            console.warn('Auto-enroll error (handled gracefully):', e);
          }
        }
        setEnrollment(userEnrollment);

        // Fetch progress
        const userProgress = await getUserSchoolProgress(user.uid, course.id);
        setProgress(userProgress);

        // Pick initial active lesson
        if (lesList.length > 0) {
          const completedIds = userProgress?.completedLessonIds || [];
          const firstUncompleted = lesList.find((l) => !completedIds.includes(l.id));
          setActiveLesson(firstUncompleted || lesList[0]);
        }
      } catch (err) {
        console.error('Failed to load course player data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [course.id, user]);

  const completedLessonIds = progress?.completedLessonIds || [];
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : progress?.progressPercent || 0;
  const isCourseFinished = Boolean(progress?.isCompleted || progressPercent === 100);

  // Handle authoritative lesson completion
  const handleCompleteLesson = async (lesson: SchoolLesson) => {
    if (!user || actionLoading) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await completeSchoolLesson(course.id, lesson.id);
      setProgress((prev) => ({
        userId: user.uid,
        courseId: course.id,
        completedLessonIds: prev?.completedLessonIds?.includes(lesson.id)
          ? prev.completedLessonIds
          : [...(prev?.completedLessonIds || []), lesson.id],
        progressPercent: res.progressPercent,
        completedCount: res.completedCount,
        totalLessonsCount: res.totalLessonsCount,
        isCompleted: res.isCompleted,
        lastAccessedAt: new Date().toISOString(),
        completedAt: res.completedAt || prev?.completedAt || null,
      }));

      if (res.isCompleted) {
        setFeedbackMsg({
          type: 'success',
          text: 'Congratulations! You have completed all lessons in this curriculum track.',
        });
      } else {
        setFeedbackMsg({
          type: 'success',
          text: `Lesson completed! Course progress updated to ${res.progressPercent}%.`,
        });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedbackMsg({
        type: 'error',
        text: error.message || 'Could not record lesson completion. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Lesson navigation
  const currentIndex = lessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B2346]" />
        Loading course curriculum & progress...
      </div>
    );
  }

  const courseTitle = course.title[locale] || course.title.en;
  const courseDescription = course.description[locale] || course.description.en;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Top Header & Navigation */}
      <div className="bg-white border border-[#E2E8F0] p-6 relative overflow-hidden">
        <GridPattern />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gray-600 hover:text-[#0B2346] cursor-pointer transition-colors"
            >
              {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>Back to Courses</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-[#0B2346] font-mono text-[11px] font-bold uppercase border border-blue-100">
                {course.difficulty}
              </span>
              <span className="px-2.5 py-1 bg-gray-50 text-gray-700 font-mono text-[11px] font-bold border border-gray-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span dir="ltr">{course.estimatedHours}h Total</span>
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2346] mb-1">
              {courseTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
              {courseDescription}
            </p>
          </div>

          {/* Course Progress Bar */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#0B2346] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0B2346]" />
                Curriculum Progress
              </span>
              <span dir="ltr" className="font-mono font-bold text-[#0B2346]">
                {completedCount} / {totalLessons} Lessons ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 overflow-hidden">
              <div
                className="bg-[#0B2346] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Banner */}
      {isCourseFinished && (
        <div className="bg-emerald-50 border border-emerald-300 p-5 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center rounded-full shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                  Track Completed • 100%
                </span>
                {progress?.completedAt && (
                  <span className="text-[10px] font-mono text-emerald-700">
                    ({new Date(progress.completedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-emerald-900 mt-0.5">
                Congratulations! You have satisfied all learning modules for this curriculum.
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Your completion record is signed authoritatively on the ZIRON Bio-Science ledger.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('app/certificates')}
            variant="primary"
            size="sm"
            className="cursor-pointer shrink-0 bg-emerald-800 hover:bg-emerald-900 text-white border-transparent"
          >
            View Certificates
          </Button>
        </div>
      )}

      {/* Main Learning Workspace: Curriculum Sidebar + Lesson Content Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Module & Lesson Outline (Sidebar) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] divide-y divide-gray-100">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
              Course Structure
            </span>
            <span className="text-xs font-bold text-[#0B2346]">
              {modules.length} Modules • {lessons.length} Lessons
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {modules.map((mod, modIdx) => {
              const modLessons = lessons.filter((l) => l.moduleId === mod.id);
              const modTitle = mod.title[locale] || mod.title.en;

              return (
                <div key={mod.id} className="p-4 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-gray-500 uppercase">
                    Module {modIdx + 1}
                  </div>
                  <div className="text-xs font-bold text-[#0B2346] mb-2 leading-snug">
                    {modTitle}
                  </div>

                  <div className="space-y-1">
                    {modLessons.map((les) => {
                      const isCompleted = completedLessonIds.includes(les.id);
                      const isSelected = activeLesson?.id === les.id;
                      const lesTitle = les.title[locale] || les.title.en;

                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            setActiveLesson(les);
                            setFeedbackMsg(null);
                          }}
                          className={`w-full text-start p-2.5 text-xs flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#0B2346] text-[#0B2346] font-bold shadow-xs'
                              : 'bg-white border-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <PlayCircle className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#0B2346]' : 'text-gray-400'}`} />
                            )}
                            <span className="truncate">{lesTitle}</span>
                          </div>
                          <span dir="ltr" className="text-[10px] font-mono text-gray-400 shrink-0">
                            {les.durationMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson Reader & Player Content */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
          {activeLesson ? (
            <>
              {/* Lesson Top Bar */}
              <div className="border-b border-gray-200 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[10px] font-bold uppercase">
                    Lesson {currentIndex + 1} of {lessons.length}
                  </span>
                  <span dir="ltr" className="text-xs font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson.durationMinutes} minutes
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-[#0B2346]">
                  {activeLesson.title[locale] || activeLesson.title.en}
                </h2>
              </div>

              {/* Action feedback */}
              {feedbackMsg && (
                <div
                  className={`p-3 text-xs flex items-center gap-2 border ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {feedbackMsg.type === 'success' ? (
                    <Sparkles className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Lesson Content Markdown Body */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4">
                {activeLesson.contentMarkdown ? (
                  <div className="whitespace-pre-line font-sans space-y-3">
                    {activeLesson.contentMarkdown[locale] ||
                      activeLesson.contentMarkdown.en ||
                      'No written content provided for this lesson.'}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No lesson content available.</p>
                )}
              </div>

              {/* Action Bar: Mark Complete & Prev / Next */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {completedLessonIds.includes(activeLesson.id) ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Lesson Completed
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCompleteLesson(activeLesson)}
                      variant="primary"
                      size="md"
                      disabled={actionLoading}
                      className="cursor-pointer inline-flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Progress...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Lesson as Completed</span>
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        if (prevLesson) {
                          setActiveLesson(prevLesson);
                          setFeedbackMsg(null);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!prevLesson}
                      className="cursor-pointer"
                    >
                      {dir === 'rtl' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                      <span className="ms-1">Previous</span>
                    </Button>
                    <Button
                      onClick={() => {
                        if (nextLesson) {
                          setActiveLesson(nextLesson);
                          setFeedbackMsg(null);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={!nextLesson}
                      className="cursor-pointer"
                    >
                      <span className="me-1">Next</span>
                      {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs">Select a lesson from the outline to begin reading.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

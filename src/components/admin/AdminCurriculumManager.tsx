import React, { useState, useEffect } from 'react';
import { SchoolCourse, SchoolModule, SchoolLesson } from '@/types/models';
import {
  listAllCourses,
  listModulesByCourse,
  listLessonsByCourse,
  createSchoolModule,
  updateSchoolModule,
  deleteSchoolModule,
  createSchoolLesson,
  updateSchoolLesson,
  deleteSchoolLesson,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Card } from '@/components/design-system/Card';
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Loader2,
  FolderOpen,
  FileText,
  Clock,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const AdminCurriculumManager: React.FC = () => {
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<SchoolModule[]>([]);
  const [lessons, setLessons] = useState<SchoolLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Module modal state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<SchoolModule | null>(null);
  const [modTitleEn, setModTitleEn] = useState('');
  const [modDescEn, setModDescEn] = useState('');
  const [modOrder, setModOrder] = useState('1');
  const [modPublished, setModPublished] = useState(true);

  // Lesson modal state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<SchoolLesson | null>(null);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [lesTitleEn, setLesTitleEn] = useState('');
  const [lesContentEn, setLesContentEn] = useState('');
  const [lesDuration, setLesDuration] = useState('20');
  const [lesOrder, setLesOrder] = useState('1');
  const [lesPublished, setLesPublished] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load of courses
  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const crs = await listAllCourses(true);
        setCourses(crs);
        if (crs.length > 0) {
          setSelectedCourseId(crs[0].id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Load modules and lessons whenever selectedCourseId changes
  const loadCurriculum = async () => {
    if (!selectedCourseId) return;
    setDataLoading(true);
    try {
      const [mods, les] = await Promise.all([
        listModulesByCourse(selectedCourseId, true),
        listLessonsByCourse(selectedCourseId, true),
      ]);
      setModules(mods);
      setLessons(les);
    } catch (err) {
      console.error('Error fetching modules and lessons:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, [selectedCourseId]);

  // Open Module Modal
  const openCreateModuleModal = () => {
    setEditingModule(null);
    setModTitleEn('');
    setModDescEn('');
    setModOrder(String(modules.length + 1));
    setModPublished(true);
    setErrorMsg('');
    setShowModuleModal(true);
  };

  const openEditModuleModal = (m: SchoolModule) => {
    setEditingModule(m);
    setModTitleEn(m.title.en);
    setModDescEn(m.description?.en || '');
    setModOrder(String(m.displayOrder));
    setModPublished(m.isPublished);
    setErrorMsg('');
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitleEn || !selectedCourseId) {
      setErrorMsg('Module title is required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        courseId: selectedCourseId,
        title: { en: modTitleEn, fr: modTitleEn, ar: modTitleEn },
        description: { en: modDescEn, fr: modDescEn, ar: modDescEn },
        displayOrder: parseInt(modOrder, 10) || 1,
        isPublished: modPublished,
      };

      if (editingModule) {
        await updateSchoolModule(editingModule.id, payload);
      } else {
        await createSchoolModule(payload);
      }

      setShowModuleModal(false);
      await loadCurriculum();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to save module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure? All lessons under this module will be affected.')) return;
    try {
      await deleteSchoolModule(moduleId);
      await loadCurriculum();
    } catch (err) {
      alert('Failed to delete module.');
    }
  };

  // Open Lesson Modal
  const openCreateLessonModal = (moduleId: string) => {
    setEditingLesson(null);
    setTargetModuleId(moduleId);
    setLesTitleEn('');
    setLesContentEn('');
    setLesDuration('20');
    setLesOrder(String(lessons.filter((l) => l.moduleId === moduleId).length + 1));
    setLesPublished(true);
    setErrorMsg('');
    setShowLessonModal(true);
  };

  const openEditLessonModal = (les: SchoolLesson) => {
    setEditingLesson(les);
    setTargetModuleId(les.moduleId);
    setLesTitleEn(les.title.en);
    setLesContentEn(les.contentMarkdown?.en || '');
    setLesDuration(String(les.durationMinutes));
    setLesOrder(String(les.displayOrder));
    setLesPublished(les.isPublished);
    setErrorMsg('');
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesTitleEn || !targetModuleId || !selectedCourseId) {
      setErrorMsg('Lesson title is required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        courseId: selectedCourseId,
        moduleId: targetModuleId,
        title: { en: lesTitleEn, fr: lesTitleEn, ar: lesTitleEn },
        contentMarkdown: { en: lesContentEn, fr: lesContentEn, ar: lesContentEn },
        durationMinutes: parseInt(lesDuration, 10) || 15,
        displayOrder: parseInt(lesOrder, 10) || 1,
        isPublished: lesPublished,
      };

      if (editingLesson) {
        await updateSchoolLesson(editingLesson.id, payload);
      } else {
        await createSchoolLesson(payload);
      }

      setShowLessonModal(false);
      await loadCurriculum();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to save lesson.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteSchoolLesson(lessonId);
      await loadCurriculum();
    } catch (err) {
      alert('Failed to delete lesson.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        Loading curriculum workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selector Header */}
      <div className="bg-white border border-[#E2E8F0] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block mb-1">
            Target Learning Track
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="p-2 border border-[#E2E8F0] text-xs font-bold text-[#0B2346] bg-white min-w-[280px]"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title.en} ({c.difficulty})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={openCreateModuleModal}
          variant="primary"
          size="sm"
          className="cursor-pointer inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Module</span>
        </Button>
      </div>

      {/* Modules & Lessons Workspace */}
      {dataLoading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
          Loading course structure...
        </div>
      ) : modules.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs font-bold text-gray-700">No modules in this course</p>
          <p className="text-xs text-gray-500">Click &ldquo;Add Module&rdquo; to begin organizing lessons.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((mod, modIdx) => {
            const modLessons = lessons.filter((l) => l.moduleId === mod.id);

            return (
              <Card key={mod.id} className="p-0 border border-[#E2E8F0] overflow-hidden">
                {/* Module Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#0B2346] text-white font-mono text-xs font-bold flex items-center justify-center">
                      {modIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-[#0B2346]">{mod.title.en}</h3>
                      {mod.description?.en && (
                        <p className="text-[11px] text-gray-500">{mod.description.en}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                        mod.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {mod.isPublished ? 'Published' : 'Draft'}
                    </span>

                    <button
                      onClick={() => openCreateLessonModal(mod.id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0B2346] bg-white border border-gray-300 hover:bg-blue-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Lesson</span>
                    </button>
                    <button
                      onClick={() => openEditModuleModal(mod)}
                      className="p-1 text-gray-500 hover:text-blue-700 border border-gray-300 bg-white hover:bg-gray-100 cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1 text-gray-500 hover:text-red-700 border border-gray-300 bg-white hover:bg-red-50 cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Module Lessons Table/List */}
                <div className="divide-y divide-gray-100">
                  {modLessons.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No lessons added to this module yet. Click &ldquo;Add Lesson&rdquo; above.
                    </div>
                  ) : (
                    modLessons.map((les) => (
                      <div
                        key={les.id}
                        className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-800 block truncate">
                              {les.title.en}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {les.durationMinutes} mins • Order #{les.displayOrder}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                              les.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {les.isPublished ? 'Live' : 'Draft'}
                          </span>
                          <button
                            onClick={() => openEditLessonModal(les)}
                            className="p-1 text-gray-500 hover:text-blue-700 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            title="Edit Lesson"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(les.id)}
                            className="p-1 text-gray-500 hover:text-red-700 border border-gray-200 hover:bg-red-50 cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-[#0B2346]">
                {editingModule ? 'Edit Module' : 'Create Module'}
              </h3>
              <button
                onClick={() => setShowModuleModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Module Title (English)</label>
                <Input
                  value={modTitleEn}
                  onChange={(e) => setModTitleEn(e.target.value)}
                  placeholder="e.g. Substrate Formulation & Soil Biology"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description (English)</label>
                <textarea
                  value={modDescEn}
                  onChange={(e) => setModDescEn(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-[#E2E8F0] text-xs"
                  placeholder="Module objectives and scope..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Display Order</label>
                <Input
                  type="number"
                  value={modOrder}
                  onChange={(e) => setModOrder(e.target.value)}
                  min="1"
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modPub"
                  checked={modPublished}
                  onChange={(e) => setModPublished(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="modPub" className="text-gray-700 font-medium cursor-pointer">
                  Publish module
                </label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModuleModal(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingModule ? 'Update Module' : 'Create Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] w-full max-w-xl p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-[#0B2346]">
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Lesson Title (English)</label>
                <Input
                  value={lesTitleEn}
                  onChange={(e) => setLesTitleEn(e.target.value)}
                  placeholder="e.g. Foundations of Microbial Inoculation"
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Duration (Minutes)</label>
                  <Input
                    type="number"
                    value={lesDuration}
                    onChange={(e) => setLesDuration(e.target.value)}
                    min="1"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={lesOrder}
                    onChange={(e) => setLesOrder(e.target.value)}
                    min="1"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lesson Content (Markdown / Text)</label>
                <textarea
                  value={lesContentEn}
                  onChange={(e) => setLesContentEn(e.target.value)}
                  rows={8}
                  className="w-full p-2.5 border border-[#E2E8F0] font-mono text-xs"
                  placeholder="Write lesson notes, protocols, key principles..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lesPub"
                  checked={lesPublished}
                  onChange={(e) => setLesPublished(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="lesPub" className="text-gray-700 font-medium cursor-pointer">
                  Publish lesson immediately
                </label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLessonModal(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

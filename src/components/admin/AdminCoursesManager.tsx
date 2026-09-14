import React, { useState, useEffect } from 'react';
import { SchoolCategory, SchoolCourse } from '@/types/models';
import {
  listSchoolCategories,
  listAllCourses,
  createSchoolCourse,
  updateSchoolCourse,
  deleteSchoolCourse,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Card } from '@/components/design-system/Card';
import { Plus, Eye, EyeOff, Trash2, Edit3, Loader2, BookOpen, AlertCircle } from 'lucide-react';

export const AdminCoursesManager: React.FC = () => {
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<SchoolCourse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [categoryId, setCategoryId] = useState('');
  const [slug, setSlug] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [difficulty, setDifficulty] = useState<'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [estimatedHours, setEstimatedHours] = useState('4');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, crs] = await Promise.all([
        listSchoolCategories(true),
        listAllCourses(true),
      ]);
      setCategories(cats);
      setCourses(crs);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Error fetching courses data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setSlug('');
    setTitleEn('');
    setTitleFr('');
    setTitleAr('');
    setDescEn('');
    setDescFr('');
    setDescAr('');
    setDifficulty('INTERMEDIATE');
    setEstimatedHours('4');
    setDisplayOrder(String(courses.length + 1));
    setIsPublished(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (course: SchoolCourse) => {
    setEditingCourse(course);
    setCategoryId(course.categoryId);
    setSlug(course.slug);
    setTitleEn(course.title.en);
    setTitleFr(course.title.fr || '');
    setTitleAr(course.title.ar || '');
    setDescEn(course.description.en);
    setDescFr(course.description.fr || '');
    setDescAr(course.description.ar || '');
    setDifficulty(course.difficulty);
    setEstimatedHours(String(course.estimatedHours));
    setDisplayOrder(String(course.displayOrder));
    setIsPublished(course.isPublished);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !slug) {
      setErrorMsg('Course title and slug are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        categoryId,
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
        title: {
          en: titleEn,
          fr: titleFr || titleEn,
          ar: titleAr || titleEn,
        },
        description: {
          en: descEn,
          fr: descFr || descEn,
          ar: descAr || descEn,
        },
        difficulty,
        estimatedHours: parseInt(estimatedHours, 10) || 1,
        displayOrder: parseInt(displayOrder, 10) || 1,
        isPublished,
      };

      if (editingCourse) {
        await updateSchoolCourse(editingCourse.id, payload);
      } else {
        await createSchoolCourse(payload);
      }

      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (course: SchoolCourse) => {
    try {
      await updateSchoolCourse(course.id, { isPublished: !course.isPublished });
      await loadData();
    } catch (err) {
      alert('Failed to update published status.');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteSchoolCourse(courseId);
      await loadData();
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B2346]">Course Catalog Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure learning tracks, descriptions, difficulty tiers, and publication flags.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="sm"
          className="cursor-pointer inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center text-gray-500 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs font-bold text-gray-700">No courses created yet</p>
          <p className="text-xs text-gray-500">Create your first course to begin building tracks.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const cat = categories.find((c) => c.id === course.categoryId);
            return (
              <Card
                key={course.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-gray-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#0B2346] text-[10px] font-mono font-bold uppercase border border-blue-100">
                      {cat?.title.en || course.categoryId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold uppercase">
                        {course.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {course.estimatedHours}h
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#0B2346]">{course.title.en}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {course.description.en}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold ${
                      course.isPublished ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {course.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className="p-1.5 text-gray-500 hover:text-[#0B2346] border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      title={course.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {course.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-1.5 text-gray-500 hover:text-blue-700 border border-gray-200 hover:bg-blue-50 cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-gray-500 hover:text-red-700 border border-gray-200 hover:bg-red-50 cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Course */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] w-full max-w-xl p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-[#0B2346]">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Parent Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] bg-white text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title.en} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Slug (URL identifier)</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. bio-systems-foundation"
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED')}
                    className="w-full p-2 border border-[#E2E8F0] bg-white text-xs"
                  >
                    <option value="FOUNDATIONAL">Foundational</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Title (English)</label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Precision Agricultural Systems"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description (English)</label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-[#E2E8F0] text-xs"
                  placeholder="Executive overview of curriculum..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Estimated Hours</label>
                  <Input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    min="1"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    min="1"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coursePublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="coursePublished" className="text-gray-700 font-medium cursor-pointer">
                  Publish immediately to student curriculum
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
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
                  {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SchoolCategory } from '@/types/models';
import {
  listSchoolCategories,
  createSchoolCategory,
  updateSchoolCategory,
} from '@/services/schoolService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Card } from '@/components/design-system/Card';
import { AdminCoursesManager } from '@/components/admin/AdminCoursesManager';
import { AdminCurriculumManager } from '@/components/admin/AdminCurriculumManager';
import { Plus, Check, Eye, EyeOff, GraduationCap, Loader2, BookOpen, Layers } from 'lucide-react';

export const AdminSchoolPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'courses' | 'curriculum'>('categories');
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [slug, setSlug] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await listSchoolCategories(true);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!slug || !titleEn) {
      setErrorMsg('Category slug and English title are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await createSchoolCategory(
        {
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
          displayOrder: parseInt(displayOrder, 10) || 1,
          isPublished,
        },
        profile
      );

      // Reset form
      setSlug('');
      setTitleEn('');
      setTitleFr('');
      setTitleAr('');
      setDescEn('');
      setDescFr('');
      setDescAr('');
      setShowCreateModal(false);
      await loadCategories();
    } catch (err) {
      setErrorMsg('Failed to save category to Firestore. Check permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (cat: SchoolCategory) => {
    if (!profile) return;
    try {
      await updateSchoolCategory(cat.id, { isPublished: !cat.isPublished }, profile);
      await loadCategories();
    } catch (err) {
      console.error('Failed to toggle publish state:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin LMS Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-[#0B2346] text-white border-[#0B2346]'
              : 'bg-white text-gray-600 border-[#E2E8F0] hover:bg-gray-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'courses'
              ? 'bg-[#0B2346] text-white border-[#0B2346]'
              : 'bg-white text-gray-600 border-[#E2E8F0] hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Courses</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'curriculum'
              ? 'bg-[#0B2346] text-white border-[#0B2346]'
              : 'bg-white text-gray-600 border-[#E2E8F0] hover:bg-gray-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Modules & Lessons</span>
        </button>
      </div>

      {activeTab === 'courses' && <AdminCoursesManager />}
      {activeTab === 'curriculum' && <AdminCurriculumManager />}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-[#E2E8F0] p-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                FIRESTORE-DRIVEN CMS
              </div>
              <h1 className="text-xl font-black text-[#0B2346]">
                ZIRON School Categories
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Add, publish, and reorder curriculum categories without redeploying code.
              </p>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </Button>
          </div>

      {/* Categories List */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0] font-mono text-xs text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
          LOADING FIRESTORE CURRICULA CATEGORIES...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2E8F0]">
          <p className="text-xs font-bold text-gray-700">No categories found in active database.</p>
          <p className="text-xs text-gray-500 mt-1">Click "New Category" to initialize the first category.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                  <th className="py-3 px-4 text-start font-bold">ORDER</th>
                  <th className="py-3 px-4 text-start font-bold">SLUG</th>
                  <th className="py-3 px-4 text-start font-bold">TITLE (EN / FR / AR)</th>
                  <th className="py-3 px-4 text-start font-bold">STATUS</th>
                  <th className="py-3 px-4 text-end font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-500">
                      #{cat.displayOrder}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-800 font-semibold">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2346]">{cat.title.en}</div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        FR: {cat.title.fr} | AR: {cat.title.ar}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          cat.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {cat.isPublished ? 'Published' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => handleTogglePublish(cat)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border border-[#E2E8F0] hover:bg-gray-100 text-gray-700 cursor-pointer"
                        title={cat.isPublished ? 'Archive Category' : 'Publish Category'}
                      >
                        {cat.isPublished ? (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Archive</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-[#0B2346] mb-1">
              Add School Category (Firestore CMS)
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Category will be live instantly for customers with School entitlement.
            </p>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-xs text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                label="Slug Identifier"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. precision-agriculture"
                helperText="URL-friendly identifier"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  label="Title (English)"
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Agriculture"
                />
                <Input
                  label="Title (French)"
                  type="text"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  placeholder="Agriculture"
                />
                <Input
                  label="Title (Arabic)"
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="الزراعة"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2346] mb-1">
                  Description (English)
                </label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border border-[#E2E8F0] focus:border-[#0B2346] focus:outline-none"
                  placeholder="Foundational agricultural methodologies..."
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-24">
                  <Input
                    label="Display Order"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Saving to Firestore...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

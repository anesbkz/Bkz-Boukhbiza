import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CommunityAnnouncement } from '@/types/models';
import {
  listCommunityAnnouncements,
  createCommunityAnnouncement,
} from '@/services/communityService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { MessageSquare, Plus, Bell, ShieldAlert, Loader2 } from 'lucide-react';

export const AdminCommunityPage: React.FC = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [isPinned, setIsPinned] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listCommunityAnnouncements();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !titleEn || !contentEn) return;

    setSubmitting(true);
    try {
      await createCommunityAnnouncement(
        {
          title: {
            en: titleEn,
            fr: titleFr || titleEn,
            ar: titleAr || titleEn,
          },
          content: {
            en: contentEn,
            fr: contentEn,
            ar: contentEn,
          },
          isPinned,
          priority: 'NORMAL',
        },
        profile
      );

      setTitleEn('');
      setTitleFr('');
      setTitleAr('');
      setContentEn('');
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-[#E2E8F0] p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-50 text-[#2E9E45] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            COMMUNITY GOVERNANCE
          </div>
          <h1 className="text-xl font-black text-[#0B2346]">
            Community Moderation & Announcements
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Broadcast official advisories to verified subjects and manage moderation queues.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </Button>
      </div>

      {/* Announcements List */}
      <div className="bg-white border border-[#E2E8F0] p-6">
        <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346] mb-4">
          Active Broadcast Announcements
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            LOADING ANNOUNCEMENTS...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
            <p className="text-xs font-bold text-gray-700">No active announcements</p>
            <p className="text-xs text-gray-500 mt-1">
              Create an announcement to broadcast advisories to community members.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 border border-[#E2E8F0] bg-gray-50/50 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {ann.isPinned && (
                      <span className="px-1.5 py-0.5 bg-[#0B2346] text-white text-[9px] font-mono font-bold uppercase">
                        PINNED
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-[#0B2346]">{ann.title.en}</h3>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{ann.content.en}</p>
                  <div className="mt-2 text-[10px] font-mono text-gray-400">
                    Published by {ann.authorName} on {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Queue (Explicit Empty State) */}
      <div className="bg-white border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
            Reported Content Moderation Queue
          </h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold">
            0 PENDING
          </span>
        </div>
        <div className="p-8 text-center bg-[#F5F7FA] border border-dashed border-[#E2E8F0]">
          <ShieldAlert className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <div className="text-xs font-bold text-gray-700 mb-1">
            No moderation reports currently pending
          </div>
          <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
            When members report posts or comments in the ZIRON Community, triage flags will appear here for staff review.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-lg w-full p-6 shadow-xl relative">
            <h2 className="text-base font-bold text-[#0B2346] mb-1">New Community Announcement</h2>
            <p className="text-xs text-gray-600 mb-4">
              Broadcasted immediately to all verified community members.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                label="Title (English)"
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Welcome to ZIRON Community"
              />

              <div>
                <label className="block text-xs font-semibold text-[#0B2346] mb-1">
                  Content Body
                </label>
                <textarea
                  required
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2 border border-[#E2E8F0] focus:border-[#0B2346] focus:outline-none"
                  placeholder="Official advisory text..."
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <span>Pin to top of Community feed</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { CommunityPost, CommunityAnnouncement } from '@/types/models';
import {
  listCommunityPosts,
  listCommunityAnnouncements,
  createCommunityPost,
} from '@/services/communityService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { GridPattern } from '@/components/design-system/GridPattern';
import { useCustomerEntitlements } from '@/hooks/useCustomerEntitlements';
import { getAppTranslations } from '@/lib/i18n/appTranslations';
import {
  MessageSquare,
  Lock,
  Plus,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

export const AppCommunityPage: React.FC = () => {
  const { user, profile, loading: authLoading, isStaff } = useAuth();
  const { locale, dir, navigate } = useI18n();
  const t = getAppTranslations(locale);
  const { hasCommunityAccess, qualifyingContainerCount } = useCustomerEntitlements();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Access requires staff bypass OR authoritative active COMMUNITY_ACCESS entitlement
  const hasAccess = Boolean(isStaff || hasCommunityAccess);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const [annData, postData] = await Promise.all([
        listCommunityAnnouncements(),
        listCommunityPosts(25),
      ]);
      setAnnouncements(annData);
      setPosts(postData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadFeed();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !title || !body) return;
    setSubmitting(true);
    try {
      await createCommunityPost(title, body, profile);
      setTitle('');
      setBody('');
      setShowNewPostModal(false);
      await loadFeed();
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
        {t.common.verifying}
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="py-16 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm">
            <Lock className="w-8 h-8 text-[#0B2346] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-[#0B2346] mb-2">
              {t.shell.authRequiredTitle}
            </h1>
            <p className="text-xs text-gray-600 mb-6">
              {t.shell.authRequiredDesc}
            </p>
            <Button
              onClick={() => navigate('login')}
              variant="primary"
              size="md"
              className="w-full cursor-pointer"
            >
              {t.common.signIn}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but lacking entitlement
  if (!hasAccess) {
    return (
      <div className="py-16 bg-[#F5F7FA]" dir={dir}>
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-[#E2E8F0] p-8 shadow-sm relative text-center">
            <GridPattern />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-[#F28C28] flex items-center justify-center mx-auto mb-4 rounded-full">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F28C28] font-bold block mb-1">
                {t.community.lockedTitle}
              </span>
              <h1 className="text-2xl font-black text-[#0B2346] mb-3">
                {t.community.title}
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
                {t.community.lockedDesc}
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 text-start text-xs font-mono mb-6 space-y-2">
                <div className="text-gray-500 font-bold uppercase text-[10px]">
                  {locale === 'ar' ? 'حالة الصلاحية' : locale === 'fr' ? 'Statut du droit' : 'Entitlement Status'}
                </div>
                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'صلاحية المجتمع' : locale === 'fr' ? 'Accès communauté' : 'Community Access'}:</span>
                  <span className="text-red-600 font-bold">{t.common.locked}</span>
                </div>
                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'العبوات المفعّلة' : locale === 'fr' ? 'Flacons vérifiés' : 'Verified Containers'}:</span>
                  <span className="text-gray-700 font-semibold" dir="ltr">{qualifyingContainerCount}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate('app/products/activate')}
                  variant="primary"
                  size="md"
                  className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>{t.dashboard.activateProductBtn}</span>
                  {dir === 'rtl' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() => navigate('app')}
                  variant="outline"
                  size="md"
                  className="flex-1 cursor-pointer"
                >
                  {t.common.backToDashboard}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#F5F7FA]" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white border border-[#E2E8F0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.common.unlocked}
            </div>
            <h1 className="text-2xl font-black text-[#0B2346]">
              {t.community.title}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {t.community.subtitle}
            </p>
          </div>

          <Button
            onClick={() => setShowNewPostModal(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.community.newPostBtn}</span>
          </Button>
        </div>

        {/* Official Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
              {t.community.announcementsTitle}
            </h2>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#0B2346] text-white p-5 border-l-4 border-[#2E9E45] shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    VIREXON BIOSCIENCES
                  </span>
                  <span className="text-[10px] font-mono text-gray-400" dir="ltr">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">
                  {ann.title[locale] || ann.title.en}
                </h3>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {ann.content[locale] || ann.content.en}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Discussion Posts Feed */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B2346]">
            {t.community.discussionForumTitle}
          </h2>

          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-gray-500 bg-white border border-[#E2E8F0]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
              {t.common.loading}
            </div>
          ) : posts.length === 0 ? (
            /* Explicit empty state */
            <div className="p-12 text-center bg-white border border-[#E2E8F0] space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">
                {t.community.noPostsYet}
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                {t.community.noPostsDesc}
              </p>
              <Button
                onClick={() => setShowNewPostModal(true)}
                variant="outline"
                size="sm"
                className="mt-4 cursor-pointer"
              >
                {t.community.newPostBtn}
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white border border-[#E2E8F0] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B2346]">{post.authorName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-600">
                      {post.authorRoles?.[0] || 'SUBJECT'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400" dir="ltr">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{post.body}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                  <span>
                    {t.community.likesCount}: <span dir="ltr">{post.likesCount}</span>
                  </span>
                  <span>
                    {t.community.commentsCount}: <span dir="ltr">{post.commentsCount}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir={dir}>
          <div className="bg-white border border-[#E2E8F0] max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-[#0B2346] mb-1">
              {t.community.createPostTitle}
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              {locale === 'ar'
                ? 'سيتم نشر موضوعك للمشاركين المعتمدين في المجتمع.'
                : locale === 'fr'
                ? 'Votre sujet sera publié pour les participants vérifiés de la cohorte.'
                : 'Your post will be published to the verified cohort stream.'}
            </p>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <Input
                label={t.community.postTitleLabel}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.community.postTitlePlaceholder}
              />

              <div>
                <label className="block text-xs font-semibold text-[#0B2346] mb-1">
                  {t.community.postBodyLabel}
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full text-xs p-2 border border-[#E2E8F0] focus:border-[#0B2346] focus:outline-none"
                  placeholder={t.community.postBodyPlaceholder}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewPostModal(false)}
                  className="cursor-pointer"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  {submitting ? t.community.publishing : t.community.submitPostBtn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCmsSection, updateCmsSection } from '@/services/cmsService';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { FileText, Save, CheckCircle2, Loader2 } from 'lucide-react';

export const AdminCmsPage: React.FC = () => {
  const { profile } = useAuth();
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [announcementBanner, setAnnouncementBanner] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadCms() {
      setLoading(true);
      try {
        const homeData = await getCmsSection<{
          headline?: string;
          subheadline?: string;
          announcementBanner?: string;
          bannerActive?: boolean;
        }>('homepage');

        if (homeData) {
          setHeadline(homeData.headline || '');
          setSubheadline(homeData.subheadline || '');
          setAnnouncementBanner(homeData.announcementBanner || '');
          setBannerActive(!!homeData.bannerActive);
        } else {
          setHeadline('Advancing Cellular Performance & Precision Nutrition');
          setSubheadline('A scientific formulation engineered to support vitality, mitochondrial output, and physiological equilibrium across 90 focused days.');
          setAnnouncementBanner('Manufacturing Documentation & Laboratory Verification Portal Online.');
          setBannerActive(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateCmsSection(
        'homepage',
        {
          headline,
          subheadline,
          announcementBanner,
          bannerActive,
        },
        profile
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update CMS section:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] p-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-50 text-[#F28C28] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            CONTENT MANAGEMENT SYSTEM
          </div>
          <h1 className="text-xl font-black text-[#0B2346]">Dynamic Marketing CMS</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Modify public platform copy and broadcast banners stored directly in Cloud Firestore.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 font-mono bg-white border border-[#E2E8F0]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
          LOADING CMS DEFINITIONS...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Changes saved to Firestore successfully and logged to Audit Trail.</span>
              </div>
            )}

            <Input
              label="Homepage Hero Headline"
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-[#0B2346] mb-1">
                Homepage Hero Subheadline
              </label>
              <textarea
                rows={3}
                required
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full text-xs p-2 border border-[#E2E8F0] focus:border-[#0B2346] focus:outline-none"
              />
            </div>

            <Input
              label="Site-Wide Regulatory / Advisory Banner"
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
            />

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
              />
              <span>Display site-wide advisory banner</span>
            </label>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <Button type="submit" variant="primary" size="md" disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? 'Publishing to Firestore...' : 'Save CMS Content'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

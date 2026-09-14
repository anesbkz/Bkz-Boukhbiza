import { db, functionsInstance } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  CommunityAnnouncement,
  CommunityPost,
  UserProfile,
} from '@/types/models';
import { hasPermission } from '@/lib/rbac/permissions';

const ANNOUNCEMENTS_COLLECTION = 'communityAnnouncements';
const POSTS_COLLECTION = 'communityPosts';
const REPORTS_COLLECTION = 'communityReports';
const LIKES_COLLECTION = 'communityPostLikes';

/**
 * List official pinned/broadcast announcements.
 */
export async function listCommunityAnnouncements(): Promise<CommunityAnnouncement[]> {
  try {
    const q = query(
      collection(db, ANNOUNCEMENTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CommunityAnnouncement, 'id'>),
    }));
  } catch (error) {
    console.warn('Unable to load community announcements:', error);
    return [];
  }
}

/**
 * Admin: Create an announcement via authoritative Cloud Function.
 * Guarantees server validation and authoritative audit logging.
 */
export async function createCommunityAnnouncement(
  data: Omit<CommunityAnnouncement, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>,
  _actor?: UserProfile
): Promise<string> {
  const createCallable = httpsCallable<
    {
      title: unknown;
      content: unknown;
      isPinned?: boolean;
      priority?: string;
      tags?: string[];
    },
    { success: boolean; id: string }
  >(functionsInstance, 'createCommunityAnnouncement');

  try {
    const res = await createCallable({
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
      priority: data.priority,
      tags: data.tags || [],
    });
    return res.data.id;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to create community announcement.');
  }
}

/**
 * Admin: Update an announcement via authoritative Cloud Function.
 */
export async function updateCommunityAnnouncement(
  announcementId: string,
  updates: Partial<CommunityAnnouncement>
): Promise<void> {
  const updateCallable = httpsCallable<
    { announcementId: string; updates: Partial<CommunityAnnouncement> },
    { success: boolean }
  >(functionsInstance, 'updateCommunityAnnouncement');

  try {
    await updateCallable({ announcementId, updates });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to update community announcement.');
  }
}

/**
 * Admin: Delete an announcement via authoritative Cloud Function.
 */
export async function deleteCommunityAnnouncement(announcementId: string): Promise<void> {
  const deleteCallable = httpsCallable<
    { announcementId: string },
    { success: boolean }
  >(functionsInstance, 'deleteCommunityAnnouncement');

  try {
    await deleteCallable({ announcementId });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to delete community announcement.');
  }
}

/**
 * List active posts in the community (filtered by status == 'published').
 */
export async function listCommunityPosts(maxPosts = 25): Promise<CommunityPost[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(maxPosts)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CommunityPost, 'id'>),
    }));
  } catch (error) {
    console.warn('Unable to load community posts:', error);
    return [];
  }
}

/**
 * Creates a new community discussion post.
 * Subject must have community entitlement.
 * Field schema conforms strictly to Firestore security rules.
 */
export async function createCommunityPost(
  title: string,
  body: string,
  author: UserProfile,
  tags: string[] = []
): Promise<string> {
  if (!checkCommunityEntitlement(author)) {
    throw new Error('Subject does not possess verified community activation entitlement.');
  }

  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (cleanTitle.length === 0 || cleanTitle.length > 200) {
    throw new Error('Title must be between 1 and 200 characters.');
  }
  if (cleanBody.length === 0 || cleanBody.length > 5000) {
    throw new Error('Body must be between 1 and 5000 characters.');
  }

  const createCallable = httpsCallable<
    { title: string; body: string; tags: string[] },
    { success: boolean; postId: string; awardedXp?: number; totalXp?: number }
  >(functionsInstance, 'createCommunityPost');

  try {
    const res = await createCallable({
      title: cleanTitle,
      body: cleanBody,
      tags,
    });
    return res.data.postId;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to publish community post.');
  }
}

/**
 * Creates a comment on a community post via authoritative Cloud Function.
 * Verifies entitlement, persists comment, and awards 5 XP server-side.
 */
export async function createCommunityComment(
  postId: string,
  body: string
): Promise<string> {
  const cleanBody = body.trim();
  if (!cleanBody) {
    throw new Error('Comment body cannot be empty.');
  }

  const commentCallable = httpsCallable<
    { postId: string; body: string },
    { success: boolean; commentId: string; awardedXp?: number; totalXp?: number }
  >(functionsInstance, 'createCommunityComment');

  try {
    const res = await commentCallable({ postId, body: cleanBody });
    return res.data.commentId;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to submit comment.');
  }
}

/**
 * Toggles a like on a post using concurrency-safe server authority.
 * Interacts with /communityPostLikes and updates likesCount atomically via Cloud Function.
 */
export async function toggleCommunityPostLike(
  postId: string
): Promise<{ liked: boolean; likesCount: number }> {
  const toggleCallable = httpsCallable<
    { postId: string },
    { liked: boolean; likesCount: number }
  >(functionsInstance, 'togglePostLike');

  try {
    const response = await toggleCallable({ postId });
    return response.data;
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to toggle post like.');
  }
}

/**
 * Checks if the current user has liked a specific post.
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  if (!userId || !postId) return false;
  try {
    const likeDocRef = doc(db, LIKES_COLLECTION, `${postId}_${userId}`);
    const snap = await getDoc(likeDocRef);
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Moderator: Moderate post status, lock, or pin via authoritative Cloud Function.
 * Direct client updates to moderation fields are blocked by firestore.rules.
 */
export async function moderateCommunityPost(
  postId: string,
  newStatus: 'hidden' | 'flagged' | 'published',
  _moderator?: UserProfile,
  options?: { isLocked?: boolean; isPinned?: boolean }
): Promise<void> {
  const moderateCallable = httpsCallable<
    {
      postId: string;
      newStatus?: 'hidden' | 'flagged' | 'published';
      isLocked?: boolean;
      isPinned?: boolean;
    },
    { success: boolean }
  >(functionsInstance, 'moderateCommunityPost');

  try {
    await moderateCallable({
      postId,
      newStatus,
      isLocked: options?.isLocked,
      isPinned: options?.isPinned,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to moderate post.');
  }
}

/**
 * Moderator: Resolve or dismiss community reports via authoritative Cloud Function.
 * Derived server-side identity guarantees reporter and timestamp integrity.
 */
export async function resolveCommunityReport(
  reportId: string,
  status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING',
  notes: string = ''
): Promise<void> {
  const resolveCallable = httpsCallable<
    {
      reportId: string;
      status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING';
      notes?: string;
    },
    { success: boolean }
  >(functionsInstance, 'resolveCommunityReport');

  try {
    await resolveCallable({ reportId, status, notes });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message || 'Failed to resolve community report.');
  }
}

/**
 * Checks community entitlement.
 */
export function checkCommunityEntitlement(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return hasPermission(user, 'ACCESS_COMMUNITY');
}

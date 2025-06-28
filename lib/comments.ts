export type Comment = {
  id: string;
  user: string;
  text: string;
  date: string;
  replies?: Comment[];
};

const COMMENT_KEY_PREFIX = "comments_";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getComments(courseId: string, materialId: string): Comment[] {
  if (typeof window === "undefined") return [];
  const key = `${COMMENT_KEY_PREFIX}${courseId}_${materialId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addComment(
  courseId: string,
  materialId: string,
  user: string,
  text: string
): void {
  if (typeof window === "undefined") return;
  const key = `${COMMENT_KEY_PREFIX}${courseId}_${materialId}`;
  const comments = getComments(courseId, materialId);
  comments.push({
    id: generateId(),
    user,
    text,
    date: new Date().toISOString(),
    replies: [],
  });
  localStorage.setItem(key, JSON.stringify(comments));
}

export function editComment(
  courseId: string,
  materialId: string,
  commentId: string,
  newText: string
): void {
  if (typeof window === "undefined") return;
  const key = `${COMMENT_KEY_PREFIX}${courseId}_${materialId}`;
  const comments = getComments(courseId, materialId);
  function editRecursive(comments: Comment[]): boolean {
    for (const c of comments) {
      if (c.id === commentId) {
        c.text = newText;
        return true;
      }
      if (c.replies && editRecursive(c.replies)) return true;
    }
    return false;
  }
  editRecursive(comments);
  localStorage.setItem(key, JSON.stringify(comments));
}

export function deleteComment(
  courseId: string,
  materialId: string,
  commentId: string
): void {
  if (typeof window === "undefined") return;
  const key = `${COMMENT_KEY_PREFIX}${courseId}_${materialId}`;
  const comments = getComments(courseId, materialId);
  function deleteRecursive(comments: Comment[]): boolean {
    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx !== -1) {
      comments.splice(idx, 1);
      return true;
    }
    for (const c of comments) {
      if (c.replies && deleteRecursive(c.replies)) return true;
    }
    return false;
  }
  deleteRecursive(comments);
  localStorage.setItem(key, JSON.stringify(comments));
}

export function addReply(
  courseId: string,
  materialId: string,
  parentId: string,
  user: string,
  text: string
): void {
  if (typeof window === "undefined") return;
  const key = `${COMMENT_KEY_PREFIX}${courseId}_${materialId}`;
  const comments = getComments(courseId, materialId);
  function replyRecursive(comments: Comment[]): boolean {
    for (const c of comments) {
      if (c.id === parentId) {
        if (!c.replies) c.replies = [];
        c.replies.push({
          id: generateId(),
          user,
          text,
          date: new Date().toISOString(),
          replies: [],
        });
        return true;
      }
      if (c.replies && replyRecursive(c.replies)) return true;
    }
    return false;
  }
  replyRecursive(comments);
  localStorage.setItem(key, JSON.stringify(comments));
}

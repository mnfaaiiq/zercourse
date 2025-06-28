"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// Forum thread and reply types
interface ForumReply {
  id: string;
  user: string;
  content: string;
  date: string;
}
interface ForumThread {
  id: string;
  user: string;
  title: string;
  content: string;
  date: string;
  replies: ForumReply[];
  pinned?: boolean;
}

const FORUM_KEY = "forum_threads";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getThreads(): ForumThread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveThreads(threads: ForumThread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FORUM_KEY, JSON.stringify(threads));
}

export default function ForumPage() {
  const { user } = useUser();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [editThreadId, setEditThreadId] = useState<string | null>(null);
  const [editThreadTitle, setEditThreadTitle] = useState("");
  const [editThreadContent, setEditThreadContent] = useState("");
  const [editReplyId, setEditReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState("");

  useEffect(() => {
    setThreads(getThreads());
  }, []);

  const currentUserName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  const handleAddThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;
    const newThread: ForumThread = {
      id: generateId(),
      user: currentUserName,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
      replies: [],
      pinned: false,
    };
    const updated = [newThread, ...getThreads()];
    saveThreads(updated);
    setThreads(updated);
    setTitle("");
    setContent("");
  };

  const handleEditThread = (thread: ForumThread) => {
    setEditThreadId(thread.id);
    setEditThreadTitle(thread.title);
    setEditThreadContent(thread.content);
  };

  const handleSaveEditThread = (threadId: string) => {
    const updated = getThreads().map((t) =>
      t.id === threadId
        ? { ...t, title: editThreadTitle, content: editThreadContent }
        : t
    );
    saveThreads(updated);
    setThreads(updated);
    setEditThreadId(null);
    setEditThreadTitle("");
    setEditThreadContent("");
  };

  const handleDeleteThread = (threadId: string) => {
    const updated = getThreads().filter((t) => t.id !== threadId);
    saveThreads(updated);
    setThreads(updated);
  };

  const handlePinThread = (threadId: string) => {
    const updated = getThreads().map((t) =>
      t.id === threadId ? { ...t, pinned: !t.pinned } : t
    );
    // Pinned thread always at top
    updated.sort(
      (a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    saveThreads(updated);
    setThreads(updated);
  };

  const handleAddReply = (threadId: string) => {
    if (!replyText[threadId]?.trim() || !user) return;
    const updated = getThreads().map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: [
            ...t.replies,
            {
              id: generateId(),
              user: currentUserName,
              content: replyText[threadId].trim(),
              date: new Date().toISOString(),
            },
          ],
        };
      }
      return t;
    });
    saveThreads(updated);
    setThreads(updated);
    setReplyText((prev) => ({ ...prev, [threadId]: "" }));
  };

  const handleEditReply = (reply: ForumReply) => {
    setEditReplyId(reply.id);
    setEditReplyText(reply.content);
  };

  const handleSaveEditReply = (threadId: string, replyId: string) => {
    const updated = getThreads().map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.map((r) =>
            r.id === replyId ? { ...r, content: editReplyText } : r
          ),
        };
      }
      return t;
    });
    saveThreads(updated);
    setThreads(updated);
    setEditReplyId(null);
    setEditReplyText("");
  };

  const handleDeleteReply = (threadId: string, replyId: string) => {
    const updated = getThreads().map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: t.replies.filter((r) => r.id !== replyId),
        };
      }
      return t;
    });
    saveThreads(updated);
    setThreads(updated);
  };

  return (
    <main className="min-h-[60vh] flex flex-col items-center py-16">
      <h1 className="text-3xl font-bold mb-6">Forum</h1>
      {user ? (
        <form
          onSubmit={handleAddThread}
          className="mb-8 w-full max-w-xl flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded shadow"
        >
          <h2 className="font-semibold mb-2">Start a New Thread</h2>
          <input
            className="border rounded px-3 py-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="border rounded px-3 py-2"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700"
          >
            Post Thread
          </button>
        </form>
      ) : (
        <div className="mb-8 text-gray-500">
          Sign in to start a thread or reply.
        </div>
      )}
      <div className="w-full max-w-2xl">
        <h2 className="font-semibold mb-4">Threads</h2>
        {threads.length === 0 && (
          <div className="text-gray-400">No threads yet.</div>
        )}
        <ul className="space-y-6">
          {threads
            .sort(
              (a, b) =>
                (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((thread) => (
              <li
                key={thread.id}
                className={`bg-white dark:bg-gray-800 rounded shadow p-4 ${
                  thread.pinned ? "border-2 border-yellow-400" : ""
                }`}
              >
                {editThreadId === thread.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 mb-1 w-full"
                      value={editThreadTitle}
                      onChange={(e) => setEditThreadTitle(e.target.value)}
                    />
                    <textarea
                      className="border rounded px-2 py-1 mb-1 w-full"
                      value={editThreadContent}
                      onChange={(e) => setEditThreadContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700"
                        onClick={() => handleSaveEditThread(thread.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white rounded px-3 py-1 hover:bg-gray-500"
                        onClick={() => setEditThreadId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-1 text-lg font-semibold flex items-center gap-2">
                      {thread.title}
                      {thread.pinned && (
                        <span className="bg-yellow-400 text-white text-xs px-2 py-0.5 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                      {thread.content}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      By <span className="font-semibold">{thread.user}</span>{" "}
                      &middot; {new Date(thread.date).toLocaleString()}
                    </div>
                    {user && thread.user === currentUserName && (
                      <div className="flex gap-2 mb-2">
                        <button
                          className="text-xs text-yellow-600"
                          onClick={() => handleEditThread(thread)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs text-red-600"
                          onClick={() => handleDeleteThread(thread.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="text-xs text-yellow-700"
                          onClick={() => handlePinThread(thread.id)}
                        >
                          {thread.pinned ? "Unpin" : "Pin"}
                        </button>
                      </div>
                    )}
                  </>
                )}
                <div className="ml-4 mt-2">
                  <h4 className="font-semibold text-xs mb-1">Replies</h4>
                  {thread.replies.length === 0 && (
                    <div className="text-gray-400 text-xs">No replies yet.</div>
                  )}
                  <ul className="space-y-2">
                    {thread.replies.map((r) => (
                      <li
                        key={r.id}
                        className="text-xs flex items-center gap-2"
                      >
                        {editReplyId === r.id ? (
                          <>
                            <input
                              className="border rounded px-1 py-0.5 text-xs"
                              value={editReplyText}
                              onChange={(e) => setEditReplyText(e.target.value)}
                              maxLength={200}
                            />
                            <button
                              className="text-green-600 ml-1"
                              onClick={() =>
                                handleSaveEditReply(thread.id, r.id)
                              }
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-500 ml-1"
                              onClick={() => setEditReplyId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-blue-700 dark:text-blue-400">
                              {r.user}
                            </span>
                            : {r.content}
                            <span className="ml-2 text-gray-400">
                              {new Date(r.date).toLocaleString()}
                            </span>
                            {user && r.user === currentUserName && (
                              <>
                                <button
                                  className="text-xs text-yellow-600 ml-2"
                                  onClick={() => handleEditReply(r)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-xs text-red-600 ml-1"
                                  onClick={() =>
                                    handleDeleteReply(thread.id, r.id)
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  {user && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddReply(thread.id);
                      }}
                      className="flex gap-2 mt-2"
                    >
                      <input
                        className="border rounded px-2 py-1 text-xs flex-1"
                        placeholder="Write a reply..."
                        value={replyText[thread.id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [thread.id]: e.target.value,
                          }))
                        }
                        maxLength={200}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
                      >
                        Reply
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}

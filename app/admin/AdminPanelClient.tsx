"use client";

import { useState } from "react";
import { Course } from "../../lib/courses";
import Image from "next/image";

export default function AdminPanelClient({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    image: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCourses([
      ...courses,
      {
        id: (Date.now() + Math.random()).toString(),
        slug: form.title.toLowerCase().replace(/\s+/g, "-"),
        title: form.title,
        description: form.description,
        image: form.image || "/file.svg",
        materials: [],
      },
    ]);
    setForm({ title: "", description: "", image: "" });
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setEditForm({
      title: course.title,
      description: course.description,
      image: course.image,
    });
  };

  const handleEditSave = (id: string) => {
    setCourses(
      courses.map((c) =>
        c.id === id
          ? {
              ...c,
              title: editForm.title,
              description: editForm.description,
              image: editForm.image,
            }
          : c
      )
    );
    setEditingId(null);
  };

  return (
    <main className="min-h-[60vh] flex flex-col items-center py-16">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <form
        onSubmit={handleAdd}
        className="mb-8 w-full max-w-md flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded shadow"
      >
        <h2 className="font-semibold mb-2">Add New Course</h2>
        <input
          className="border rounded px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Image URL (optional)"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700"
        >
          Add Course
        </button>
      </form>
      <div className="w-full max-w-2xl">
        <h2 className="font-semibold mb-4">Courses</h2>
        <ul className="space-y-4">
          {courses.map((course) => (
            <li
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col gap-2"
            >
              {editingId === course.id ? (
                <>
                  <input
                    className="border rounded px-2 py-1 mb-1"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 mb-1"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 mb-1"
                    value={editForm.image}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, image: e.target.value }))
                    }
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700"
                      onClick={() => handleEditSave(course.id)}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white rounded px-3 py-1 hover:bg-gray-500"
                      onClick={() => setEditingId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {course.image && (
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={64}
                      height={64}
                      className="mb-2 rounded"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        {course.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-yellow-500 text-white rounded px-3 py-1 hover:bg-yellow-600"
                      onClick={() => handleEdit(course)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700"
                      onClick={() => handleDelete(course.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

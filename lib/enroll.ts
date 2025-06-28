// Utility for managing enrolled courses in localStorage per Clerk user

const ENROLL_KEY_PREFIX = "enrolled_courses_";
const PROGRESS_KEY_PREFIX = "course_progress_";
const MATERIAL_PROGRESS_KEY_PREFIX = "material_progress_";

export function getEnrolledCourses(userId: string): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ENROLL_KEY_PREFIX + userId);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function enrollCourse(userId: string, courseId: string): void {
  if (typeof window === "undefined") return;
  const enrolled = getEnrolledCourses(userId);
  if (!enrolled.includes(courseId)) {
    const updated = [...enrolled, courseId];
    localStorage.setItem(ENROLL_KEY_PREFIX + userId, JSON.stringify(updated));
  }
}

export function getMaterialProgress(
  userId: string,
  courseId: string,
  materialId: string
): boolean {
  if (typeof window === "undefined") return false;
  const key = `${MATERIAL_PROGRESS_KEY_PREFIX}${userId}_${courseId}_${materialId}`;
  return localStorage.getItem(key) === "1";
}

export function setMaterialProgress(
  userId: string,
  courseId: string,
  materialId: string,
  value: boolean
): void {
  if (typeof window === "undefined") return;
  const key = `${MATERIAL_PROGRESS_KEY_PREFIX}${userId}_${courseId}_${materialId}`;
  localStorage.setItem(key, value ? "1" : "0");
}

export function getCourseProgress(
  userId: string,
  courseId: string,
  materialsCount?: number
): number {
  if (typeof window === "undefined") return 0;
  if (materialsCount && materialsCount > 0) {
    let completed = 0;
    for (let i = 1; i <= materialsCount; i++) {
      const materialId = `m${i}`;
      if (getMaterialProgress(userId, courseId, materialId)) completed++;
    }
    return Math.round((completed / materialsCount) * 100);
  }
  // fallback to old progress
  const key = `${PROGRESS_KEY_PREFIX}${userId}_${courseId}`;
  const value = localStorage.getItem(key);
  if (!value) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function setCourseProgress(
  userId: string,
  courseId: string,
  progress: number
): void {
  if (typeof window === "undefined") return;
  const key = `${PROGRESS_KEY_PREFIX}${userId}_${courseId}`;
  localStorage.setItem(key, String(progress));
}

// Export a dummy value to ensure this file is always a module
export const __enrollModule = true;

"use server";

import {
  getLessonDetail as serviceGetLessonDetail,
  getCourseCategories as serviceGetCourseCategories,
  getExamsByCategory as serviceGetExamsByCategory,
  getLibraryLessonDetail as serviceGetLibraryLessonDetail,
  getLessonData as serviceGetLessonData,
  getLessonStaticParams as serviceGetLessonStaticParams
} from "@/lib/services/lesson.service";

export async function getLessonDetail(slug: string) {
  return serviceGetLessonDetail(slug);
}

export async function getCourseCategories() {
  return serviceGetCourseCategories();
}

export async function getExamsByCategory(categoryId: string) {
  return serviceGetExamsByCategory(categoryId);
}

export async function getLibraryLessonDetail(slugOrId: string) {
  return serviceGetLibraryLessonDetail(slugOrId);
}

export async function getLessonData(categoryId: string, slug: string) {
  return serviceGetLessonData(categoryId, slug);
}

export async function getLessonStaticParams(limit?: number) {
  return serviceGetLessonStaticParams(limit);
}

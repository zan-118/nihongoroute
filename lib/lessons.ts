import { client } from "@/sanity/lib/client";

export async function getLessonsByLevel(levelCode: string) {
  const query = `*[_type == "lesson" && level->code == $levelCode] | order(orderNumber asc)`;
  return await client.fetch(query, { levelCode });
}

export async function getLesson(levelCode: string, slug: string) {
  const query = `*[_type == "lesson" && level->code == $levelCode && slug.current == $slug][0]`;
  return await client.fetch(query, { levelCode, slug });
}

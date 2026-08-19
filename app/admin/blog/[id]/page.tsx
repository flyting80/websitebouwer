export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { blogPosts, siteThemes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BlogPostEditor } from "@/components/editor/BlogPostEditor";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!post) notFound();
  const [theme] = await db.select().from(siteThemes).where(eq(siteThemes.siteId, post.siteId));
  const parsedPost = {
    ...post,
    content: typeof post.content === "string" ? JSON.parse(post.content as string) : post.content,
  };
  return <BlogPostEditor post={parsedPost as typeof post} theme={theme} />;
}

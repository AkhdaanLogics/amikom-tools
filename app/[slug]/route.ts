// app/[slug]/route.ts
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const params = await context.params;
  const { data, error } = await supabase
    .from("short_urls")
    .select("original_url, clicks")
    .eq("slug", params.slug)
    .single();

  if (error || !data?.original_url) {
    return new Response("Link not found", { status: 404 });
  }

  // Update click count
  await supabase
    .from("short_urls")
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq("slug", params.slug);

  redirect(data.original_url);
}

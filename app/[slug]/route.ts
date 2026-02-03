import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const { data, error } = await supabase
    .from("short_urls")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ⛔ CEK EXPIRED
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/expired", req.url));
  }

  // 🔧 FIX URL
  let targetUrl = data.original_url;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  await supabase
    .from("short_urls")
    .update({ clicks: data.clicks + 1 })
    .eq("slug", slug);

  return NextResponse.redirect(targetUrl);
}

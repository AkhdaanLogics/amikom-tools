import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Simple JWT decode (tidak verify signature, hanya extract payload)
function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Decode base64url manually (tanpa Buffer)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const decoded = atob(base64 + padding);
    
    const payload = JSON.parse(decoded);
    return payload;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  // Normalize URL - add https:// if no protocol
  let normalizedUrl = url.trim();
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // Get Firebase UID from Authorization header
  const authHeader = req.headers.get("authorization");
  let userId = null;

  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const payload = decodeJWT(token);
      userId = payload?.sub; // Firebase stores UID in 'sub' claim
    } catch (error) {
      console.error("Token error:", error);
    }
  }

  const slug = nanoid(6);

  // ⏰ EXPIRE 7 HARI
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  try {
    const { data, error } = await supabase
      .from("short_urls")
      .insert({
        slug,
        original_url: normalizedUrl,
        clicks: 0,
        expires_at: expiresAt,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating short URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

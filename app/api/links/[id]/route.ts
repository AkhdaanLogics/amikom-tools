import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Simple JWT decode
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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = decodeJWT(token);
    const userId = payload?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user owns the link
    const { data: link } = await supabase
      .from("short_urls")
      .select("user_id")
      .eq("id", params.id)
      .single();

    console.log("Delete attempt - User:", userId, "Link owner:", link?.user_id);

    if (!link || link.user_id !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
          details: { userId, linkOwnerId: link?.user_id },
        },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("short_urls")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting link:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

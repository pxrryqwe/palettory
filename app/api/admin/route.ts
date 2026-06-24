import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkAuth(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("x-admin-password");
  return header === expected;
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!supabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "supabase not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 },
    );
  }

  const { data: participants, error: pErr } = await supabaseAdmin
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  const { data: responses, error: rErr } = await supabaseAdmin
    .from("responses")
    .select("*")
    .order("created_at", { ascending: false });
  if (rErr) {
    return NextResponse.json({ error: rErr.message }, { status: 500 });
  }

  return NextResponse.json({ participants, responses });
}

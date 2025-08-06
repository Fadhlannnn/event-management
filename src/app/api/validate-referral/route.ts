import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, event_id } = await req.json();

  const { data, error } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("code", code)
    .eq("event_id", event_id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { valid: false, message: "Invalid referral code." },
      { status: 400 }
    );
  }

  if (data.used_count >= data.max_usage) {
    return NextResponse.json(
      { valid: false, message: "Referral code has reached its usage limit." },
      { status: 400 }
    );
  }

  return NextResponse.json({ valid: true, discount: data.discount_percentage });
}

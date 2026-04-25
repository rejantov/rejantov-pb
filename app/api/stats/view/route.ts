import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("increment_stat", { stat_key: "blog_opens" })
    if (error) throw error
    return NextResponse.json({ count: data })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

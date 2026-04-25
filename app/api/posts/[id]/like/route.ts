import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action } = await request.json()
    const supabase = await createClient()

    const fn = action === "unlike" ? "decrement_post_likes" : "increment_post_likes"
    const { data, error } = await supabase.rpc(fn, { p_post_id: id })

    if (error) throw error
    return NextResponse.json({ likes: data })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

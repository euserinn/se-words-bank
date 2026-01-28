import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const groupId = searchParams.get("groupId");

  let query = supabase
    .from("words")
    .select("*, groups(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (date) {
    query = query.eq("date", date);
  }

  if (groupId) {
    query = query.eq("group_id", groupId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { word, meaning, groupId, date } = body;

  if (!word || !meaning) {
    return NextResponse.json(
      { error: "Word and meaning are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("words")
    .insert({
      user_id: user.id,
      word,
      meaning,
      group_id: groupId || null,
      date: date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { wordId, correctCount } = body;

  if (!wordId || correctCount === undefined) {
    return NextResponse.json(
      { error: "wordId and correctCount are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("words")
    .update({ correct_count: correctCount })
    .eq("id", wordId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("words")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

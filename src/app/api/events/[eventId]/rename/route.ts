import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();
    const eventId = params.eventId;

    // Verify the user is the event creator
    const eventCheck = await query(
      'SELECT creator_id, title FROM events WHERE id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventCheck.rows[0].creator_id !== session.user.id) {
      return NextResponse.json(
        { error: "Only event creator can rename the event" },
        { status: 403 }
      );
    }

    const oldTitle = eventCheck.rows[0].title;

    // Update event title
    await query(
      'UPDATE events SET title = $1 WHERE id = $2',
      [title, eventId]
    );

    return NextResponse.json({ 
      success: true,
      oldTitle,
      newTitle: title
    });
  } catch (error) {
    console.error("Error renaming event:", error);
    return NextResponse.json(
      { error: "Failed to rename event" },
      { status: 500 }
    );
  }
} 
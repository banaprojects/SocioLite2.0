import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant of the event
    const participantCheck = await query(
      `SELECT 1 FROM event_participants 
       WHERE event_id = $1 AND user_id = $2
       UNION
       SELECT 1 FROM events
       WHERE id = $1 AND creator_id = $2`,
      [eventId, session.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to view this event's messages" },
        { status: 403 }
      );
    }

    // Fetch messages with user details, ordered by creation time ascending
    const messages = await query(
      `SELECT m.*, u.name as user_name
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.event_id = $1
       ORDER BY m.created_at ASC
       LIMIT 50`,
      [eventId]
    );

    return NextResponse.json(messages.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, message, mediaUrl, mediaType } = await request.json();

    if (!eventId || !message) {
      return NextResponse.json(
        { error: "Event ID and message are required" },
        { status: 400 }
      );
    }

    // Create message
    const result = await query(
      `INSERT INTO messages (event_id, user_id, message_text, media_url, media_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [eventId, session.user.id, message || null, mediaUrl || null, mediaType || null]
    );

    // Get user information
    const userResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [session.user.id]
    );

    return NextResponse.json({
      success: true,
      messageId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      userName: userResult.rows[0].name
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
} 
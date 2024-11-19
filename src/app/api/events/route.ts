import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, eventDate } = await request.json();
    console.log('Received event data:', { title, description, eventDate });

    // Validate input
    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Title and event date are required" },
        { status: 400 }
      );
    }

    // Create event
    console.log('Creating event for user:', session.user.id);
    const result = await query(
      `INSERT INTO events (title, description, event_date, creator_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, event_date, created_at`,
      [title, description, new Date(eventDate).toISOString(), session.user.id]
    );

    // Add creator as a participant
    await query(
      `INSERT INTO event_participants (event_id, user_id)
       VALUES ($1, $2)`,
      [result.rows[0].id, session.user.id]
    );

    return NextResponse.json({
      success: true,
      event: result.rows[0],
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error creating event:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to create event", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch events where user is either creator or participant
    const events = await query(
      `SELECT 
        e.*,
        u.name as creator_name,
        (
          SELECT COUNT(*) 
          FROM event_participants 
          WHERE event_id = e.id
        ) as participant_count
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.creator_id = $1
       OR e.id IN (
         SELECT event_id 
         FROM event_participants 
         WHERE user_id = $1
       )
       ORDER BY e.event_date DESC`,
      [session.user.id]
    );

    // Add participant details to each event
    const eventsWithParticipants = await Promise.all(
      events.rows.map(async (event) => {
        const participants = await query(
          `SELECT u.name, u.email 
           FROM event_participants ep
           JOIN users u ON ep.user_id = u.id
           WHERE ep.event_id = $1`,
          [event.id]
        );

        return {
          ...event,
          participants: participants.rows,
        };
      })
    );

    return NextResponse.json(eventsWithParticipants);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error fetching events:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    );
  }
} 
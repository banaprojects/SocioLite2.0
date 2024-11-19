import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the user (cascading will handle related records)
    await query(
      'DELETE FROM users WHERE id = $1',
      [session.user.id]
    );

    // Clear auth cookie
    (await cookies()).set('auth_token', '', { expires: new Date(0) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
} 
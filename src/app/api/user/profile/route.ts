import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username) {
      return new NextResponse("Username is required", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: username },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, profilePicture } = body as {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
    };

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const nameRegex = /^[a-zA-Z\u0e00-\u0e7f\s]+$/;
    if (
      firstName.trim().length < 2 ||
      firstName.trim().length > 50 ||
      !nameRegex.test(firstName.trim())
    ) {
      return NextResponse.json(
        { error: "ชื่อต้องเป็นภาษาไทยหรือภาษาอังกฤษ ความยาว 2-50 ตัวอักษร และไม่มีตัวเลขหรืออักขระพิเศษ" },
        { status: 400 }
      );
    }

    if (
      lastName.trim().length < 2 ||
      lastName.trim().length > 50 ||
      !nameRegex.test(lastName.trim())
    ) {
      return NextResponse.json(
        { error: "นามสกุลต้องเป็นภาษาไทยหรือภาษาอังกฤษ ความยาว 2-50 ตัวอักษร และไม่มีตัวเลขหรืออักขระพิเศษ" },
        { status: 400 }
      );
    }

    let dbProfilePicture: string | undefined = undefined;

    if (profilePicture && profilePicture.startsWith("data:image")) {
      const match = profilePicture.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        const dir = path.join(process.cwd(), "public", "uploads", "profiles");
        await fs.promises.mkdir(dir, { recursive: true });

        const filename = `${userId}.png`;
        const filepath = path.join(dir, filename);
        await fs.promises.writeFile(filepath, buffer);

        dbProfilePicture = `/uploads/profiles/${filename}`;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(dbProfilePicture ? { profilePicture: dbProfilePicture } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

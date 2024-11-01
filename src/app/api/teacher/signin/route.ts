import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check if the teacher exists by email
    const existingTeacher = await db.teacher.findUnique({
      where: { email },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { message: "Invalid credentials. Please check your email." },
        { status: 401 }
      );
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await compare(password, existingTeacher.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials. Please check your password." },
        { status: 401 }
      );
    }

    // Return teacher data excluding the password
    const { password: _, ...teacherWithoutPassword } = existingTeacher;

    return NextResponse.json(
      { teacher: teacherWithoutPassword, message: "Signed in successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { z } from "zod";

// Define schema for student sign-in
const signinSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = signinSchema.parse(body);

    // Check if the student exists by email
    const existingStudent = await db.student.findUnique({
      where: { email },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { message: "Invalid credentials. Please check your email." },
        { status: 401 }
      );
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await compare(password, existingStudent.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials. Please check your password." },
        { status: 401 }
      );
    }

    // Respond with student data excluding the password
    const { password: _, ...studentWithoutPassword } = existingStudent;

    return NextResponse.json(
      { student: studentWithoutPassword, message: "Signed in successfully." },
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

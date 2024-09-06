import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path as per your project structure
import { z } from "zod";

// Define schema for Classroom
const classroomSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  teacherId: z.number().int().positive("Teacher ID is required"),
  principalId: z.number().int().positive("Principal ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate the request body using Zod schema
    const { subject, description, teacherId, principalId } = classroomSchema.parse(body);

    // Check if the teacher and principal exist
    const teacher = await db.teacher.findUnique({ where: { id: teacherId } });
    const principal = await db.principal.findUnique({ where: { id: principalId } });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    if (!principal) {
      return NextResponse.json({ message: "Principal not found" }, { status: 404 });
    }

    // Create the new Classroom in Prisma
    const newClassroom = await db.classroom.create({
      data: {
        subject,
        description,
        teacherId,
        principalId,
      },
    });

    // Respond with the created Classroom data
    return NextResponse.json(
      { classroom: newClassroom, message: "Classroom created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
    // Handle validation and other errors
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

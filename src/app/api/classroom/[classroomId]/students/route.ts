import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 
import { z } from "zod";

const querySchema = z.object({
  classroomId: z.number().int().positive("Valid Classroom ID is required"),
});

export async function GET(request: Request, { params }: { params: { classroomId: string } }) {
  try {
    const { classroomId } = querySchema.parse({ classroomId: parseInt(params.classroomId) });

    const students = await db.student.findMany({
      where: {
        classrooms: {
          some: {
            classroomId,
          },
        },
      },
      include: {
        principal: true,
        teacher: true,
        classrooms: true,
      },
    });

    return NextResponse.json(
      { students, message: "Students fetched successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
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

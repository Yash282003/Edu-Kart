import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define schema for validating the query parameters
const querySchema = z.object({
  teacherId: z.number().int().positive("Valid Teacher ID is required"),
  principalId: z.number().int().positive("Valid Principal ID is required"),
});

export async function GET(request: Request) {
  try {
    // Extract teacherId and principalId from the query parameters
    const url = new URL(request.url);
    const teacherIdParam = url.searchParams.get("teacherId");
    const principalIdParam = url.searchParams.get("principalId");

    // Validate the teacherId parameter
    if (!teacherIdParam || isNaN(parseInt(teacherIdParam))) {
      return NextResponse.json({ error: "Valid Teacher ID is required." }, { status: 400 });
    }

    // Validate the principalId parameter
    if (!principalIdParam || isNaN(parseInt(principalIdParam))) {
      return NextResponse.json({ error: "Valid Principal ID is required." }, { status: 400 });
    }

    const teacherId = parseInt(teacherIdParam);
    const principalId = parseInt(principalIdParam);

    // Validate both teacherId and principalId using Zod schema
    querySchema.parse({ teacherId, principalId });

    // Fetch classrooms associated with the validated teacherId and principalId
    const classrooms = await db.classroom.findMany({
      where: {
        teacherId,
        principalId, // Add principalId filter
      },
     
    });

    // Return the classrooms data with a success message
    return NextResponse.json(
      { classrooms, message: "Classrooms fetched successfully." },
      { status: 200 }
    );
  } catch (err) {
    // Handle errors and return the error message
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

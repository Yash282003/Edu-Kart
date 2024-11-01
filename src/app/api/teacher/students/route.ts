import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define schema for validating the query parameters
const querySchema = z.object({
  principalId: z.number().int().positive("Valid Principal ID is required"),
  teacherId: z.number().int().positive("Valid Teacher ID is required")
});

export async function GET(request: Request) {
  try {
    // Extract the principalId and teacherId from the query parameters
    const url = new URL(request.url);
    const principalId = url.searchParams.get("principalId");
    const teacherId = url.searchParams.get("teacherId");

    // Check if principalId and teacherId are valid numbers before parsing
    if (!principalId || isNaN(parseInt(principalId))) {
      throw new Error("Principal ID is required and must be a valid number.");
    }
    if (!teacherId || isNaN(parseInt(teacherId))) {
      throw new Error("Teacher ID is required and must be a valid number.");
    }

    // Convert the query parameters to numbers after validation
    const principalIdParsed = parseInt(principalId);
    const teacherIdParsed = parseInt(teacherId);

    // Validate both principalId and teacherId using Zod schema
    const { principalId: validPrincipalId, teacherId: validTeacherId } = querySchema.parse({
      principalId: principalIdParsed,
      teacherId: teacherIdParsed
    });

    // Fetch students associated with the validated principalId and teacherId
    const students = await db.student.findMany({
      where: {
        principalId: validPrincipalId,
        teacherId: validTeacherId
      },
    });

    // Return the students data with a success message
    return NextResponse.json(
      { students, message: "Students fetched successfully..." },
      { status: 200 }
    );
  } catch (err) {
    // Handle errors and return the error message
    console.error("ERROR: API - ", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Define schema for validating the query parameter
const querySchema = z.object({
  principalId: z.number().int().positive("Valid Principal ID is required"),
});

export async function GET(request: Request) {
  try {
    // Extract the principalId from the query parameters
    const url = new URL(request.url);
    const principalId = parseInt(url.searchParams.get("principalId") || "");

    // Validate the principalId using Zod schema
    const { principalId: validPrincipalId } = querySchema.parse({ principalId });

    // Fetch students associated with the validated principalId
    const students = await db.student.findMany({
      where: {
        principalId: validPrincipalId,
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
      { status: 500 }
    );
  }
}

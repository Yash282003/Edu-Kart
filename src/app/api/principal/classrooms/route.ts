//create classroom---> select teacher(name) dropdown
//students view-----> classrooms,onclick classroom details,enroll now button,post req to std-class schema,show all students enrolled in the same classroom
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db"; 

const querySchema = z.object({
  principalId: z.number().int().positive("Valid Principal ID is required"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const principalId = parseInt(url.searchParams.get("principalId") || "");

    const { principalId: validPrincipalId } = querySchema.parse({ principalId });

    const classrooms = await db.classroom.findMany({
      where: {
        principalId: validPrincipalId,
      },
    });

    if (classrooms.length === 0) {
      return NextResponse.json({ message: "No classrooms found for this principal ID." }, { status: 404 });
    }

    return NextResponse.json(
      { classrooms, message: "Classrooms fetched successfully." },
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



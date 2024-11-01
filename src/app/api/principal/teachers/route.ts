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
  
      const teachers = await db.teacher.findMany({
        where: {
          principalId: validPrincipalId,
        },
      });
  
      return NextResponse.json(
        { teachers, message: "Teachers fetched successfully..." },
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
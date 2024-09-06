import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { z } from "zod";

let connectionParams = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "WJ28@krhps",
  database: "school",
};
//post req to post teachers
const teacherSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
  name: z.string().min(1, "Name is required"),  // Include the name field
  principalId: z.number().int().positive("Principal ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, principalId } = teacherSchema.parse(body); // Parse request body including name

    // Check if the teacher already exists by email
    const existingTeacherByEmail = await db.teacher.findUnique({
      where: { email },
    });

    if (existingTeacherByEmail) {
      return NextResponse.json(
        { teacher: null, message: "Teacher already exists..." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the new teacher in Prisma
    const newTeacher = await db.teacher.create({
      data: {
        email,
        password: hashedPassword,
        name,  // Include the name when creating a teacher
        principalId, // Associate the teacher with the principal
      },
    });
    const { password: newTeacherPassword, ...rest } = newTeacher;

    // Insert the teacher into MySQL, ensuring unique email
    const connection = await mysql.createConnection(connectionParams);
    const insertQuery = `
      INSERT INTO teacher (email, password, name, principalId)
      SELECT ?, ?, ?, ?
      FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM teacher WHERE email = ?)
    `;
    const values = [email, hashedPassword, name, principalId, email];

    await connection.execute(insertQuery, values);
    await connection.end();

    // Respond with the created teacher data excluding the password
    return NextResponse.json(
      { teacher: rest, message: "Teacher created successfully..." },
      { status: 201 }
    );
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

//get req to get teachers using principalId
const querySchema = z.object({
    principalId: z.number().int().positive("Valid Principal ID is required"),
  });
  
  export async function GET(request: Request) {
    try {
      // Extract principalId from query parameters
      const url = new URL(request.url);
      const principalId = parseInt(url.searchParams.get("principalId") || "");
  
      // Validate principalId using zod
      const { principalId: validPrincipalId } = querySchema.parse({ principalId });
  
      // Fetch teachers associated with the specified principalId
      const teachers = await db.teacher.findMany({
        where: {
          principalId: validPrincipalId,
        },
      });
  
      // Respond with the list of teachers
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

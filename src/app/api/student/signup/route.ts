import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { z } from "zod";
import { studentSchema } from "../../schemas/student";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const classroomId = body.classroomId;
    const { email, password, name, principalId, teacherId } = studentSchema.parse(body);

    // Check if the student already exists by email
    const existingStudentByEmail = await db.student.findUnique({
      where: { email },
    });

    if (existingStudentByEmail) {
      return NextResponse.json(
        { student: null, message: "Student already exists..." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    const newStudent = await db.student.create({
      data: {
        email,
        password: hashedPassword,
        name,
        principalId,
        teacherId, 
      },
    });

    const studentClassroom = db.studentClassroom.create({
      data:{
        studentId: newStudent.id,
        classroomId
      }
    })

    const { password: newStudentPassword, ...rest } = newStudent;

    // Insert the student into MySQL, ensuring unique email
    // const connection = await mysql.createConnection(connectionParams);
    // const insertQuery = `
    //   INSERT INTO student (email, password, name, principalId, teacherId)
    //   SELECT ?, ?, ?, ?, ?
    //   FROM DUAL
    //   WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = ?)
    // `;
    // const values = [email, hashedPassword, name, principalId, teacherId, email];

    // await connection.execute(insertQuery, values);
    // await connection.end();

    // Respond with the created student data excluding the password
    return NextResponse.json(
      { student: rest, message: "Student created successfully... And its classroom assigned" },
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

//get req of students using principalId


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

    // Fetch students associated with the specified principalId
    const students = await db.student.findMany({
      where: {
        principalId: validPrincipalId,
      },
    });

    // Respond with the list of students
    return NextResponse.json(
      { students, message: "Students fetched successfully..." },
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

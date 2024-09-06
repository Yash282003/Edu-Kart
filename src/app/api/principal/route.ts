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

const userSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = userSchema.parse(body); 

    const existingUserByEmail = await db.principal.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { principal: null, message: "User already exists..." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await db.principal.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const { password: newUserPassword, ...rest } = newUser;

    const connection = await mysql.createConnection(connectionParams);
    const insertQuery = `
      INSERT INTO principal (email, password, name, createdAt, updatedAt)
      SELECT ?, ?, ?, NOW(), NOW()
      FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM principal WHERE email = ?)
    `;
    const values = [email, hashedPassword, name, email];

    await connection.execute(insertQuery, values);
    await connection.end();

    // Respond with the created user data excluding the password
    return NextResponse.json(
      { user: rest, message: "User created successfully..." },
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

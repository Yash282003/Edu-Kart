"use client";
import { useRouter } from "next/navigation";
import React, { useState, useContext, useEffect } from "react";
import { z } from "zod";
import styles from "../styles/ClassRoomForm.module.css"; 
import { DataContext } from "../context/ContextProvider";

interface Teacher {
  id: number;
  name: string;
  email: string;
  password: string;
  principalId: number;
}
// Zod schema for validating classroom data
const classroomSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  teacherId: z.number().positive("Teacher ID must be positive").int(),
  principalId: z.number().positive("Principal ID must be positive").int(),
});

const CreateClassroomForm = () => {
  const router = useRouter();
  const { principalId, setPrincipalId } = useContext(DataContext); // Access context
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState(""); // Store selected teacherId
  const [teachers, setTeachers] = useState<Teacher[]>([]); // Store list of teachers
  const [message, setMessage] = useState("");

  // Fetch and store principalId from localStorage on component mount
  useEffect(() => {
    const storedPrincipalId = localStorage.getItem("principalId");

    if (storedPrincipalId && !principalId) {
      setPrincipalId(Number(storedPrincipalId)); // Set principalId from localStorage if available
    }
  }, [principalId, setPrincipalId]);

  // Persist principalId to localStorage whenever it changes
  useEffect(() => {
    if (principalId) {
      localStorage.setItem("principalId", principalId.toString()); // Store principalId in localStorage
    }
  }, [principalId]);

  // Fetch teachers when the component mounts or principalId changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (principalId) {
        try {
          const response = await fetch(
            `/api/principal/teachers?principalId=${principalId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch teachers");
          }
          const data = await response.json();
          console.log(data.teachers)
          setTeachers(data.teachers); // Store teachers in state
          
        } catch (err: any) {
          setMessage(`Error: ${err.message}`); // Handle error
        }
      }
    };

    fetchTeachers();
  }, [principalId]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Form data
    const data = {
      subject,
      description,
      teacherId: Number(teacherId), // Use the selected teacherId
      principalId, // Get from context or localStorage
    };

    try {
      // Validate form data using Zod schema
      classroomSchema.parse(data);

      // Send the data to the API
      const response = await fetch(`/api/classroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage("Classroom created successfully!");
        router.push("/"); // Redirect on success
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }

      // Reset form fields after submission
      setSubject("");
      setDescription("");
      setTeacherId("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setMessage(error.errors[0].message); // Show validation error message
      } else {
        console.error("Error creating classroom:", error.message);
        setMessage("Failed to create classroom.");
      }
    }
  };

  return (
    <div className={styles.classroomContainer}>
      <form onSubmit={handleSubmit} className={styles.classroomForm}>
        <h2>Create Classroom</h2>

        {/* Subject input */}
        <label htmlFor="subject">Subject:</label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter the subject"
          required
        />

        {/* Description input */}
        <label htmlFor="description">Description:</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter the description"
          required
        />

        {/* Teacher dropdown */}
        <label htmlFor="teacher">Select Teacher:</label>
        <select
          id="teacher"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)} // Set teacherId based on selected teacher
          required
        >
          <option value="">teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>

        {/* Submit button */}
        <button type="submit" className={styles.classroomButton}>
          Create Classroom
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default CreateClassroomForm;

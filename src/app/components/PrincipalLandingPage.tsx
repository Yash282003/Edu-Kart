"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/PrincipalLandingPage.module.css";
import { DataContext } from "../context/ContextProvider";
import { Button } from "@nextui-org/react";

const PrincipalLandingPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachersError, setTeachersError] = useState(""); // Separate error state for teachers
  const [studentsError, setStudentsError] = useState(""); // Separate error state for students
  const { principalId, setPrincipalId } = useContext(DataContext); // From context
  const router = useRouter();

  useEffect(() => {
    const storedPrincipalId = localStorage.getItem("principalId");
    if (storedPrincipalId && !principalId) {
      setPrincipalId(storedPrincipalId);
    }
  }, [setPrincipalId, principalId]);

  useEffect(() => {
    if (principalId) {
      localStorage.setItem("principalId", principalId);
    }
  }, [principalId]);

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
          console.log(principalId)
          setTeachers(data.teachers);
        } catch (err: any) {
          setTeachersError(err.message);
        }
      }
    };

    const fetchStudents = async () => {
      if (principalId) {
        try {
          const response = await fetch(
            `/api/principal/students?principalId=${principalId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch students");
          }
          const data = await response.json();
          setStudents(data.students);
        } catch (err: any) {
          setStudentsError(err.message);
        }
      }
    };

    // Fetch both teachers and students once principalId is available
    if (principalId) {
      fetchTeachers();
      fetchStudents();
    }
  }, [principalId]);

  // Redirect if not authenticated
  useEffect(() => {
    const isAuthenticated = true; // Replace with real authentication check
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  const handleCreateTeacher = () => {
    router.push("/signup(teacher)");
  };
  const handleCreateStudent = () => {
    router.push("/signup(student)");
  };
  const handleCreateClassroom = () => {
    router.push("/create_classroom");
  };

  return (
    <div className={styles.container}>
      <h1>Principal Dashboard</h1>

      <div className={styles.tableContainer}>
        <h2>Teachers</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher: any) => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachersError && (
          <p className={styles.error}>Error: {teachersError}</p>
        )}{" "}
        {/* Show teachers error */}
      </div>

      <div className={styles.tableContainer}>
        <h2>Students</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {studentsError && (
          <p className={styles.error}>Error: {studentsError}</p>
        )}{" "}
        {/* Show students error */}
      </div>
      <div className={styles.button}>
        <div className={styles.add_button}>
          <Button
            color="primary"
            variant="bordered"
            onClick={handleCreateTeacher}
          >
            ADD TEACHER
          </Button>
        </div>
        <div className={styles.add_button}>
          <Button
            color="primary"
            variant="bordered"
            onClick={handleCreateStudent}
          >
            ADD STUDENT
          </Button>
        </div>
        <div className={styles.add_button}>
          <Button
            color="primary"
            variant="bordered"
            onClick={handleCreateClassroom}
          >
            Create Classroom
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalLandingPage;

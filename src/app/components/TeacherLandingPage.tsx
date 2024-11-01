"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/TeachersLandingPage.module.css"; // Adjust the path as needed
import { DataContext } from "../context/ContextProvider";
import { Button } from "@nextui-org/react";

const TeachersLandingPage = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [error, setError] = useState(""); 
  const { teacherId, setTeacherId } = useContext(DataContext); 
  const { principalId, setPrincipalId } = useContext(DataContext);
  const router = useRouter();

  // Fetch principalId from localStorage if it's available
  useEffect(() => {
    const storedPrincipalId = localStorage.getItem("principalId");
    if (storedPrincipalId && !principalId) {
      setPrincipalId(storedPrincipalId);
      console.log("Principal ID set from localStorage:", storedPrincipalId);
    }
  }, [setPrincipalId, principalId]);

  // Save principalId to localStorage when it is set
  useEffect(() => {
    if (principalId) {
      localStorage.setItem("principalId", principalId);
      console.log("Principal ID saved to localStorage:", principalId);
    }
  }, [principalId]);

  // Fetch teacherId from localStorage if it's available
  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId");
    if (storedTeacherId && !teacherId) {
      setTeacherId(storedTeacherId);
      console.log("Teacher ID set from localStorage:", storedTeacherId);
    }
  }, [setTeacherId, teacherId]);

  // Save teacherId to localStorage when it is set
  useEffect(() => {
    if (teacherId) {
      localStorage.setItem("teacherId", teacherId);
      console.log("Teacher ID saved to localStorage:", teacherId);
    }
  }, [teacherId]);

useEffect(() => {
  const fetchClassrooms = async () => {
    if (teacherId && principalId) {
      console.log("Fetching classrooms for Teacher ID:", teacherId, "and Principal ID:", principalId);
      try {
        const response = await fetch(`/api/teacher/classroom?principalId=${principalId}&teacherId=${teacherId}`);
        console.log("Response status:", response.status); // Log the response status
        if (!response.ok) {
          throw new Error("Failed to fetch classrooms");
        }
        const data = await response.json();
        console.log("Fetched classrooms data:", data); // Log the fetched data

        // Ensure the data has a classrooms array
        if (data && Array.isArray(data.classrooms)) {
          setClassrooms(data.classrooms); 
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err: any) {
        console.error("Error fetching classrooms:", err.message); 
        setError(err.message);
      }
    } else {
      console.log("teacherId or principalId is not available");
    }
  };

  fetchClassrooms();
}, [teacherId, principalId]);


  // Redirect if not authenticated
  useEffect(() => {
    const isAuthenticated = true; // Replace with real authentication check
    if (!isAuthenticated) {
      router.push("/login(teacher)");
    }
  }, [router]);

  const handleCreateClassroom = () => {
    router.push("/create_classroom");
  };

  return (
    <div className={styles.container}>
      <h1>Teacher Dashboard</h1>

      <div className={styles.tableContainer}>
        <h2>Classrooms</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Principal ID</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(classrooms) && classrooms.length > 0 ? (
              classrooms.map((classroom: any) => (
                <tr key={classroom.id}>
                  <td>{classroom.id}</td>
                  <td>{classroom.subject}</td>
                  <td>{classroom.description}</td>
                  <td>{classroom.principalId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No classrooms available</td>
              </tr>
            )}
          </tbody>
        </table>
        {error && <p className={styles.error}>Error: {error}</p>}
      </div>

      <div className={styles.button}>
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

export default TeachersLandingPage;

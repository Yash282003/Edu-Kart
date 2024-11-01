"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { z } from "zod";
import styles from "../styles/SignUpForm.module.css"; 
import { DataContext } from "../context/ContextProvider";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"), 
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

const SignUpTeacher = () => {
  const router = useRouter();
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { principalId } = useContext(DataContext); // Get the principalId from context

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = { name, email, password };

    try {
      // Validate form data using zod schema
      userSchema.parse(data);

      // Send the form data to the API along with the principalId
      const response = await fetch(`/api/teacher/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          principalId, 
        }),
      });
console.log(response)
      if (response.ok) {
        setMessage("Teacher created successfully!");
        router.push("/"); // Redirect on success
      } else {
        const errorText = await response.text();
        console.error("Error submitting data:", errorText);
        setMessage(`Error: ${errorText}`); 
      }

      // Reset form fields after submission
      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Validation error:", error.errors[0].message);
      setMessage(error.errors[0].message); // Show validation error message
    }
  };

  // Handle navigation to the sign-in page
  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className={styles.signupContainer}>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <h2>Create Teacher</h2>

        {/* Name input */}
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        {/* Email input */}
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mail@example.com"
          required
        />

        {/* Password input */}
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {/* Submit button */}
        <button type="submit" className={styles.signupButton}>
          Add Teacher
        </button>

       
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default SignUpTeacher;

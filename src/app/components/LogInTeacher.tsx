"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { z } from "zod";
import styles from "../styles/SignUpForm.module.css"; 
import { DataContext } from "../context/ContextProvider"
// Define schema for validation using Zod
const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { teacherId ,setTeacherId } = useContext(DataContext);
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create data object with email and password
    const data = { email, password };

    try {
      // Validate form data using Zod schema
      signInSchema.parse(data);

      // Make the API request
      const response = await fetch("/api/teacher/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData)
        const teacherId = responseData.teacher.id; 
        setTeacherId(teacherId); 
        setMessage("Sign-in successful!");
        console.log(teacherId)
        console.log(data)
        router.push("/teacher"); // Redirect on successful sign-in
      } else {
        const errorText = await response.text();
        console.error("Error submitting data:", errorText);
        setMessage(`Error: ${errorText}`); // Show server error
      }

      // Clear form fields
      setEmail("");
      setPassword("");
    } catch (error: any) {
      // Handle validation errors
      console.error("Validation error:", error.errors[0].message);
      setMessage(error.errors[0].message); // Show validation error message
    }
  };

  // Handle redirect to sign-up page
  const handleSignUp = () => {
    router.push("/signup(teacher)");
  };

  return (
    <div className={styles.signupContainer}>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <h2>Teacher's SignIn</h2>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mail@example.com"
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <button type="submit" className={styles.signupButton}>
          Sign In
        </button>
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          Don't have an account?{" "}
          <button type="button" onClick={handleSignUp}>
            Sign up
          </button>
        </p>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default SignInForm;

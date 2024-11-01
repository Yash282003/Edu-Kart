"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { z } from "zod";
import styles from "../styles/SignUpForm.module.css"; 

const userSchema = z.object({
  name: z.string().min(1, "Name is required"), 
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

const SignUpForm = () => {
  const router = useRouter();
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = { name, email, password };

    try {
      userSchema.parse(data);

      const response = await fetch("/api/principal/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage("Sign-up successful!");
        console.log(data)
        router.push("/login"); 
      } else {
        const errorText = await response.text();
        console.error("Error submitting data:", errorText);
        setMessage(`Error: ${errorText}`); 
      }

      setName("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Validation error:", error.errors[0].message);
      setMessage(error.errors[0].message); // Show validation error message
    }
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className={styles.signupContainer}>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <h2>Sign Up</h2>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
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
          Sign Up
        </button>
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          Already have an account?{" "}
          <button type="button" onClick={handleSignIn}>
            Sign in
          </button>
        </p>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;

"use client"
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css'; 

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>Welcome to the Dashboard</h1>
      <div className={styles.tabsContainer}>
        <div className={styles.tab}>
          <Link href="/signup" className={styles.link}>
            Signup as Principal
          </Link>
        </div>
        <div className={styles.tab}>
          <Link href="/login(teacher)" className={styles.link}>
            Login as Teacher
          </Link>
        </div>
        <div className={styles.tab}>
          <Link href="/student-login" className={styles.link}>
            Login as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // جرب تجيب اليوزر من الكوكيز أو API
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚀 Google OAuth Test</h1>

      {!user ? (
        <>
          <p>You are not logged in</p>
          <button onClick={handleLogin}>Login with Google</button>
        </>
      ) : (
        <>
          <p>Welcome, {user.name} ({user.email})</p>
          <img src={user.imageUrl} alt="profile" width={80} style={{ borderRadius: "50%" }} />
          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

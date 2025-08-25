import { useState, useEffect } from "react";
const BASE_URL = "https://breath-tech-backend-production.up.railway.app";

export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener("focus", fetchUser); // refresh on tab focus
    return () => window.removeEventListener("focus", fetchUser);
  }, []);

  return currentUser;
}

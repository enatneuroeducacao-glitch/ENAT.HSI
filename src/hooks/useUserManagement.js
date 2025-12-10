import { useCallback, useState } from "react";

export function useUserManagement() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("enat_current_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("enat_users");
    return stored ? JSON.parse(stored) : [];
  });

  const registerUser = useCallback(
    (userData) => {
      const newUser = {
        id: Date.now(),
        ...userData,
        registeredAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      localStorage.setItem("enat_users", JSON.stringify([...users, newUser]));
      setCurrentUser(newUser);
      localStorage.setItem("enat_current_user", JSON.stringify(newUser));

      return newUser;
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("enat_current_user");
  }, []);

  const updateUserConsent = useCallback((userId, consentData) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, consent: consentData, consentDate: new Date().toISOString() }
          : user
      )
    );
    localStorage.setItem("enat_users", JSON.stringify(users));
  }, [users]);

  const deleteUserData = useCallback((userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    localStorage.setItem("enat_users", JSON.stringify(users));
    if (currentUser?.id === userId) {
      logout();
    }
  }, [users, currentUser, logout]);

  const getUserById = useCallback(
    (userId) => users.find((user) => user.id === userId),
    [users]
  );

  return {
    currentUser,
    users,
    registerUser,
    logout,
    updateUserConsent,
    deleteUserData,
    getUserById,
  };
}

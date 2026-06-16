import { useState } from "react";
import { deleteUser, fetchUsers, updateUser } from "../../services/api";

function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const data = await fetchUsers(password);

      setUsers(data);
      setAuthorized(true);
      setError("");
    } catch {
      setError("Wrong admin password");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(password, id);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== id)
      );
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleRename = async (user) => {
    const newUsername = prompt("Enter new username:", user.username);

    if (!newUsername || newUsername === user.username) {
      return;
    }

    try {
      const updatedUser = await updateUser(password, user.id, newUsername);

      setUsers((currentUsers) =>
        currentUsers.map((u) => (u.id === user.id ? updatedUser : u))
      );
    } catch {
      alert("Failed to update user");
    }
  };

  // Render login view if not authorized
  if (!authorized) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-10 transition-colors dark:border-[#202020] dark:bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))]">
        <h1 className="mb-6 text-4xl font-extrabold text-black transition-colors dark:text-white">
          Admin Panel
        </h1>

        <div className="flex max-w-md flex-col gap-4">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="mb-6 rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg transition hover:scale-105 hover:border-green-500 dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:hover:border-[#deff9a]"
          >
            🏠
          </button>
          <input
            className="rounded-xl border border-gray-300 bg-white p-3 text-black transition-colors dark:border-[#2b2b2b] dark:bg-black dark:text-white"
            placeholder="Admin Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="rounded-xl bg-[#DEFF9A] p-3 font-bold text-black transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            onClick={handleLogin}
            type="button"
          >
            Enter
          </button>

          {error && <p className="font-bold text-red-500 dark:text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  // Render management table if authorized
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-10 transition-colors dark:border-[#202020] dark:bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))]">
      <h1 className="mb-8 text-4xl font-extrabold text-black transition-colors dark:text-white">
        User Management
      </h1>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg transition hover:scale-105 hover:border-green-500 dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:hover:border-[#deff9a]"
        >
          🏠
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 transition-colors dark:border-[#222]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200 transition-colors dark:bg-[#111]">
              <th className="p-4 text-black transition-colors dark:text-white">Username</th>
              <th className="p-4 text-black transition-colors dark:text-white">Role</th>
              <th className="p-4 text-black transition-colors dark:text-white">Hourly Wage</th>
              <th className="p-4 text-black transition-colors dark:text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 transition-colors dark:border-[#222]">
                <td className="p-4 text-black dark:text-gray-200">{user.username}</td>
                <td className="p-4 text-black dark:text-gray-200">{user.role}</td>
                <td className="p-4 text-black dark:text-gray-200">{user.hourlyWage}</td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white transition hover:bg-blue-700"
                      onClick={() => handleRename(user)}
                      type="button"
                    >
                      Rename
                    </button>

                    <button
                      className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white transition hover:bg-red-700"
                      onClick={() => handleDelete(user.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
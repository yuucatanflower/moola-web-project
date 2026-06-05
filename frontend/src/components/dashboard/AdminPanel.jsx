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
  const newUsername = prompt(
    "Enter new username:",
    user.username
  );

  if (!newUsername || newUsername === user.username) {
    return;
  }

  try {
    const updatedUser = await updateUser(
      password,
      user.id,
      newUsername
    );

    setUsers((currentUsers) =>
      currentUsers.map((u) =>
        u.id === user.id ? updatedUser : u
      )
    );
  } catch {
    alert("Failed to update user");
  }
};

  if (!authorized) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-10">
        <h1 className="mb-6 text-4xl font-extrabold text-white">
          Admin Panel
        </h1>

        <div className="flex max-w-md flex-col gap-4">
            <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="mb-6 rounded-lg border border-[#2b2b2b] bg-[#0b0b0b] px-3 py-2 text-lg transition hover:border-[#deff9a] hover:scale-105"
            >
            🏠
            </button>
          <input
            className="rounded-xl border border-[#2b2b2b] bg-black p-3 text-white"
            placeholder="Admin Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="rounded-xl bg-[#DEFF9A] p-3 font-bold text-black"
            onClick={handleLogin}
            type="button"
          >
            Enter
          </button>

          {error && (
            <p className="font-bold text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-10">
      <h1 className="mb-8 text-4xl font-extrabold text-white">
        User Management
      </h1>

        <div className="mb-4 flex justify-end">
        <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="rounded-lg border border-[#2b2b2b] bg-[#0b0b0b] px-3 py-2 text-lg transition hover:border-[#deff9a] hover:scale-105"
        >
            🏠
        </button>
        </div>

      <div className="overflow-hidden rounded-2xl border border-[#222]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#111]">
              <th className="p-4 text-white">Username</th>
              <th className="p-4 text-white">Role</th>
              <th className="p-4 text-white">Hourly Wage</th>
              <th className="p-4 text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-[#222]"
              >
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">{user.hourlyWage}</td>

            <td className="p-4">
            <div className="flex gap-2">
                <button
                className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white"
                onClick={() => handleRename(user)}
                type="button"
                >
                Rename
                </button>

                <button
                className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white"
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
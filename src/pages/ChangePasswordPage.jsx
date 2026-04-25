import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { changePassword } from "../api/auth";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword({ resetToken, password });
      toast.success("Password changed successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">New Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

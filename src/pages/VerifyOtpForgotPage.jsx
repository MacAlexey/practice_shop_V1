import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtpForgot } from "../api/auth";
import toast from "react-hot-toast";

export default function VerifyOtpForgotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await verifyOtpForgot({ email, otp });
      navigate("/change-password", { state: { resetToken: data.resetToken } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter the OTP code sent to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP code"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-xl tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}

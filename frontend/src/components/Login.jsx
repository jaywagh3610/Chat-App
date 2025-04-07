import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  function handleLogin(e) {
    e.preventDefault();
    if (mobileNumber) login(mobileNumber);
  }
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-8 w-[90%] max-w-sm text-white"
      >
        {/* User Icon */}
        <div className="flex justify-center mb-6">
          <FaUserCircle className="text-[80px] text-orange-400 drop-shadow-lg" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-orange-300 underline mb-6">
          Login
        </h1>

        {/* Mobile Input */}
        <label className="block mb-2 text-sm font-semibold tracking-wide">
          Mobile Number
        </label>
        <input
          type="text"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          maxLength={10}
          className="w-full px-4 py-2 rounded-lg outline-none bg-white/20 placeholder:text-white text-white focus:ring-2 ring-orange-300 transition"
          placeholder="Enter mobile number"
        />

        {/* Login Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 transition px-6 py-2 rounded-full text-white font-semibold shadow-lg hover:scale-105 active:scale-95"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;

import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  function handleRegistration(e) {
    e.preventDefault();
    if ((name, mobileNumber)) register.mutate({ name, mobileNumber });
  }
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#16222A] via-[#3A6073] to-[#1A1F25]">
      <form
        onSubmit={handleRegistration}
        className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 w-[90%] max-w-sm text-white"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <FaUserPlus className="text-[70px] text-green-400 drop-shadow-lg" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-green-300 underline mb-6">
          Register
        </h1>

        {/* Name Input */}
        <label className="block mb-1 text-sm font-semibold">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 mb-4 rounded-lg bg-white/20 placeholder:text-white text-white outline-none focus:ring-2 ring-green-400 transition"
        />

        {/* Mobile Input */}
        <label className="block mb-1 text-sm font-semibold">
          Mobile Number
        </label>
        <input
          type="text"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          placeholder="Enter mobile number"
          className="w-full px-4 py-2 mb-6 rounded-lg bg-white/20 placeholder:text-white text-white outline-none focus:ring-2 ring-green-400 transition"
        />

        {/* Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-green-400 hover:bg-green-500 transition px-6 py-2 rounded-full text-white font-semibold shadow-lg hover:scale-105 active:scale-95"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;

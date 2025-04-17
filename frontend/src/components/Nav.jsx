import { memo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../utils/AuthProvider";
import { useSearch } from "../utils/SearchProvider";

const Nav = memo(() => {
  const [number, setNumber] = useState("9850697872");
  const { user } = useAuth();
  const { search } = useSearch();

  function handleSearch(e) {
    e.preventDefault();
    // if (!number) console.log("error");
    console.log("hii");
    console.log(user);
    if (number && user?.data.mobileNumber !== number) search(number);
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-gradient-to-r from-[#101c2e] to-[#162d4c] text-white shadow-md">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-wide">ChatApp</h1>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full transition focus-within:ring-2 ring-[#00e0ff]"
      >
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="bg-transparent text-white placeholder:text-gray-300 outline-none border-none w-40 sm:w-56"
          placeholder="Search by number..."
        />
        <button
          type="submit"
          className="text-white hover:text-[#00e0ff] text-lg"
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
});
Nav.displayName = "Nav";

export default Nav;

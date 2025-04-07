import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const searchContext = createContext();

function SearchProvider({ children }) {
  const [chatPartner, setChatPartner] = useState([]);
  const search = async (mobileNumber) => {
    const res = await fetch(
      `http://localhost:3000/register/getUser?mobileNumber=${mobileNumber}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    const data = await res.json();

    if (data.success) {
      setChatPartner(data);
    }
  };
  const value = {
    search,
    chatPartner,
  };

  return (
    <searchContext.Provider value={value}>{children}</searchContext.Provider>
  );
}

const useSearch = () => {
  const context = useContext(searchContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export { SearchProvider, useSearch };

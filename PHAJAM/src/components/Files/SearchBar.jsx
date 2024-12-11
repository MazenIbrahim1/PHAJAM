import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../../ThemeContext";

const SearchBar = ({ search, setSearch }) => {
  const { darkMode } = useTheme();

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <TextField
      variant = "outlined"
      placeholder = "Search Files..."
      value = {search}
      onChange = {handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: darkMode ? "#ffffff" : "#000000" }}/>
            </InputAdornment>
          ),
        },
      }}
      fullWidth
      sx={{
        backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        borderRadius: "4px",
        input: {
          color: darkMode ? "#ffffff" : "#000000",
        },
      }}
    />
  )
}

export default SearchBar;
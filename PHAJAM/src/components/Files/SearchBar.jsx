import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ search, setSearch }) => {
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
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      fullWidth
    />
  )
}

export default SearchBar;
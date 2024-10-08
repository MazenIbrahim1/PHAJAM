import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import UploadIcon from "@mui/icons-material/Upload";

export default function Files() {

  const [search, setSearch] = useState('');

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "size",
      headerName: "size",
      flex: 0.5,
    },
  ];

  const mockData = [
    {
      id: 1,
      name: "hello.py",
      size: "10KB",
    },
    {
      id: 2,
      name: "script.sh",
      size: "20KB",
    },
    {
      id: 3,
      name: "hw4.php",
      size: "1GB",
    },
    {
      id: 4,
      name: "server.js",
      size: "1MB",
    }
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        marginLeft: "13vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx = {{
          display: "flex",
          flexDirection: "row",
          width: "100%"
        }}
      >
        <SearchBar search = {search} setSearch = {setSearch} />
        <Button
          variant = "contained"
          backgroundColor = "#0b3a53"
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
      </Box>
      <DataTable rows = {mockData} columns = {columns} search = {search} />
    </Box>
  );
}

import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);

  const columns = [
    { field: "pid", headerName: "Peer ID", flex: 2 },
    { field: "cost", headerName: "Cost", flex: 1 },
  ];

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await fetch("/getproviders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hash: searchQuery }),
        });

        if (!response.ok) {
          console.error("Failed to fetch providers");
          return;
        }

        const data = await response.json();

        // Assuming `data` is an array of objects like [{ pid: '...', cost: ... }, ...]
        setRows(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    }
  };

  return (
    <Box sx={{
      marginLeft: "14vw",
      marginRight: "1vw"
    }}>
      <TextField
        label="Search by Hash"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        autoHeight
        disableColumnMenu
        disableColumnResize
        sx={{
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
        getRowId={(row) => row.pid} // Ensure unique IDs for each row
      />
    </Box>
  );
}

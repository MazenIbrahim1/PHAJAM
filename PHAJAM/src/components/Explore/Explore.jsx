import React, { useState } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";

function CustomNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "gray",
        fontSize: "16px",
      }}
    >
      No providers found
    </Box>
  );
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);

  const columns = [
    { field: "ID", headerName: "Peer ID", flex: 2 },
    { field: "cost", headerName: "Cost", flex: 1 },
  ];

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await fetch("http://localhost:8080/getproviders", {
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
    <Box
      sx={{
        marginLeft: "14vw",
        marginRight: "1vw",
        marginTop: "2vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Search Hash..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
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
          width: "100%",
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
        getRowId={(row) => row.ID} // Ensure unique IDs for each row
        slots={{
          noRowsOverlay: CustomNoRowsOverlay, // Custom no-rows message
        }}
      />
    </Box>
  );
}

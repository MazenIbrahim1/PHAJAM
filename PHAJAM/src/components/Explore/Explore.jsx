import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, InputAdornment, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");

  const columns = [
    { field: "id", headerName: "Peer ID", flex: 2 },
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
        setRows(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    }
  };

  // Function to check if a row is selectable
  const isRowSelectable = (row) => {
    return row.row.id !== "Me";
  };

  useEffect(() => {
    if (!openDialog) {
      setOfferPrice("");
    }
  }, [openDialog]);

  // Handle row click
  const handleRowClick = (params) => {
    const clickedRow = params.row;
    setSelectedRow(clickedRow);
    setOpenDialog(true);
  };

  const handlePurchase = async (id, hash) => {
    try {
      const response = await fetch("http://localhost:8080/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, hash: hash})
      })

      const blob = await response.blob();
      console.log(blob)
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "test.js"; // Set the desired file name
      link.click(); // Trigger the download
      URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error("Error purchasing: ", error)
    }
  }

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
      <Typography>
        Choose a provider to start a transaction
      </Typography>
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
          "& .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        }}
        getRowId={(row) => row.id} // Ensure unique IDs for each row
        slots={{
          noRowsOverlay: CustomNoRowsOverlay, // Custom no-rows message
        }}
        isRowSelectable={isRowSelectable} // Make rows unselectable if cost is "N/A"
        sortModel={[{
          field: "cost",  // The column to sort by
          sort: "asc",    // "desc" for descending order
        }]}
        onRowClick={handleRowClick}  // Handle row click
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontSize: "24px", textAlign: "center" }}>
          Confirm Purchase
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Typography>Price: {selectedRow ? selectedRow.cost : "Loading..."} DC</Typography>
          <Typography>Balance After: 480 DC</Typography>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <TextField
              margin="dense"
              label="Set Offer Price"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ flex: 1 }}
              value={offerPrice} // Controlled input
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers, decimal points, and limit to one decimal point
                if (/^\d*\.?\d*$/.test(value)) {
                  setOfferPrice(value); // Update state only with valid input
                }
              }}
              slotProps={{
                input: {
                  inputMode: "decimal", // For mobile keyboards to show decimal keypad
                }
              }}
              required
            />
            <Button
              color="primary"
              sx={{
                backgroundColor: offerPrice ? "black" : "gray", // Dynamic color
                color: "white",
                ":hover": { backgroundColor: offerPrice ? "#3d3d3d" : "gray" },
              }}
              disabled={!offerPrice} // Disable if no value is inputted
            >
              Request
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", padding: "16px" }}>
          <Button
            onClick={() => setOpenDialog(false)}
            color="error"
            sx={{
              backgroundColor: "red",
              color: "white",
              ":hover": { backgroundColor: "#b83127" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handlePurchase(selectedRow.id, searchQuery)}
            color="primary"
            sx={{
              backgroundColor: "black",
              color: "white",
              ":hover": { backgroundColor: "#3d3d3d" },
            }}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

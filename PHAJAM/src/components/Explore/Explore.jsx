import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, InputAdornment, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../ThemeContext"; // Assuming useTheme is imported for dark mode context

function CustomNoRowsOverlay() {
  const { darkMode } = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: darkMode ? "#ffffff" : "gray",
        fontSize: "16px",
      }}
    >
      No providers found
    </Box>
  );
}

export default function Explore() {
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");

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

  const isRowSelectable = (row) => {
    return row.row.id !== "Me";
  };

  useEffect(() => {
    if (!openDialog) {
      setOfferPrice("");
    }
  }, [openDialog]);

  const handleRowClick = (params) => {
    const clickedRow = params.row;
    if (clickedRow.id === "Me") {
      return;
    }
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
        body: JSON.stringify({ id: id, hash: hash }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage("Purchase failed: Item not found.");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
        setErrorDialogOpen(true);
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition
          .split("filename=")[1]
          .replace(/["']/g, "");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error purchasing: ", error);
    } finally {
      setOpenDialog(false);
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
        color: darkMode ? "#ffffff" : "#000000",
        backgroundColor: darkMode ? "#333333" : "#ffffff",
        height: "100vh",
        padding: "16px",
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Search Hash..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: darkMode ? "#ffffff" : "#000000" }} />
            </InputAdornment>
          ),
        }}
        fullWidth
        sx={{
          backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
          borderRadius: "4px",
          input: {
            color: darkMode ? "#ffffff" : "#000000", // Text color inside TextField
          },
        }}
      />
      <Typography sx={{ color: darkMode ? "#ffffff" : "#000000" }}>
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
          color: darkMode ? "#ffffff" : "#000000",
          backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader": {
            color: darkMode ? "#ffffff" : "#000000",
            backgroundColor: darkMode ? "#333333" : "#f0f0f0",
          },
          "& .MuiTablePagination-caption": {
            color: darkMode ? "#ffffff" : "#000000", // Pagination text color
          },
        }}
        getRowId={(row) => row.id}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        isRowSelectable={isRowSelectable}
        onRowClick={handleRowClick}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: darkMode ? "#ffffff" : "#000000" }}>
          Confirm Purchase
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
          <Typography sx={{ color: darkMode ? "#ffffff" : "#000000" }}>
            Price: {selectedRow ? selectedRow.cost : "Loading..."} DC
          </Typography>
          <Typography sx={{ color: darkMode ? "#ffffff" : "#000000" }}>
            Balance After: 480 DC
          </Typography>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <TextField
              margin="dense"
              label="Set Offer Price"
              type="text"
              fullWidth
              variant="outlined"
              sx={{
                flex: 1,
                backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000",
                input: {
                  color: darkMode ? "#ffffff" : "#000000", // Text color inside TextField
                },
              }}
              value={offerPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setOfferPrice(value);
                }
              }}
            />
            <Button
              color="primary"
              sx={{
                backgroundColor: offerPrice ? (darkMode ? "#f06292" : "black") : "gray",
                color: "white",
                ":hover": {
                  backgroundColor: offerPrice ? "#7a99d9" : "gray",
                },
              }}
              disabled={!offerPrice}
            >
              Request
            </Button>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: "16px",
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
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
              backgroundColor: darkMode ? "#000000" : "black",
              color: "white",
              ":hover": { backgroundColor: "#3d3d3d" },
            }}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle sx={{ color: darkMode ? "#ffffff" : "#000000" }}>Error</DialogTitle>
        <DialogContent sx={{ backgroundColor: darkMode ? "#333333" : "#ffffff" }}>
          <Typography sx={{ color: darkMode ? "#ffffff" : "#000000" }}>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? "#333333" : "#ffffff" }}>
          <Button
            onClick={() => setErrorDialogOpen(false)}
            color="primary"
            sx={{ color: darkMode ? "#ffffff" : "#000000" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

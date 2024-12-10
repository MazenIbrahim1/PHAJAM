import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
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
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
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
          if (response.status === 404) {
            setErrorDialog({
              open: true,
              message: "No providers found for the given hash.",
            });
          } else {
            setErrorDialog({
              open: true,
              message: "Failed to fetch providers. Please try again later.",
            });
          }
          return;
        }

        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setErrorDialog({
          open: true,
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: "" });
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
    // (Purchase logic remains the same as in your original code)
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />
      <Typography>Choose a provider to start a transaction</Typography>
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
        getRowId={(row) => row.id}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        onRowClick={handleRowClick}
      />

      <Dialog open={errorDialog.open} onClose={handleCloseErrorDialog}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Dialog (same as your original code) */}
    </Box>
  );
}

import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useTheme } from "../../ThemeContext"

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
      No files uploaded
    </Box>
  );
}

const DataTable = ({ rows, columns, search, onDelete }) => {
  const { darkMode } = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState({ hash: "", filename: "" });

  const handleDeleteClick = (hash, filename) => {
    setFile({ hash, filename });
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(file.hash);
    setOpenDialog(false);
    setFile({ hash: "", filename: ""});
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setFile({ hash: "", filename: ""});
  };

  const filteredRows = rows.filter(
    (row) =>
      row.filename.toLowerCase().includes(search.toLowerCase()) || 
      row.hash.toLowerCase().includes(search.toLowerCase())
  );

  // Add a delete button column
  const deleteColumn = {
    field: "delete",
    headerName: "",
    width: 100,
    renderCell: (params) => (
      <Button
        color="error"
        size="small"
        onClick={() => handleDeleteClick(params.row.hash, params.row.filename)}
        sx={{
          backgroundColor: "red",
          color: "white",
          "&:hover": {
            backgroundColor: "#b83127",
          }
        }}
      >
        Delete
      </Button>
    ),
    sortable: false
  };

  const updatedColumns = columns.map((col) => {
    if (col.field === "cost") { // Replace 'cost' with the actual field name of your cost column
      return {
        ...col,
        renderCell: (params) => `${params.value} DC`, // Append " DC" to the cost value
      };
    }
    return col;
  }).concat(deleteColumn); // Add the delete column to the columns array

  return (
    <>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={updatedColumns}
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
            color: darkMode ? "#ffffff" : "#000000",
            backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
            borderRadius: "8px",
            "& .MuiDataGrid-columnHeader": {
              color: darkMode ? "#ffffff" : "#000000",
              backgroundColor: darkMode ? "#333333" : "#f0f0f0",
            },
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay
          }}
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the file <strong>{file.filename}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataTable;

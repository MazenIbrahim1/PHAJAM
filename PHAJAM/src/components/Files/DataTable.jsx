import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const DataTable = ({ rows, columns, search, onDelete }) => {
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
  };

  const updatedColumns = [...columns, deleteColumn]; // Add the delete column to the columns array

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
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
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

import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const DataTable = ({ rows, columns, search }) => {
  const filteredRows = rows.filter(
    (row) =>
      row.filename.toLowerCase().includes(search.toLowerCase()) || 
      row.hash.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={filteredRows}
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
        checkboxSelection
        sx={{
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
      />
    </Box>
  );
};

export default DataTable;

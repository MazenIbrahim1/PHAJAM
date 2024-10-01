import React from "react"
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ rows, columns, search }) => {
  const filteredRows = rows.filter(row =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style = {{ height: 400, width: "100%" }}>
      
      <DataGrid 
        rows = {filteredRows} 
        columns = {columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        checkboxSelection
        autoHeight
        disableColumnMenu
        disableColumnResize
      />

    </div>
  )
}

export default DataTable;
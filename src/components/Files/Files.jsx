import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Files() {

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
      <Typography>Files</Typography>
      <Box
        sx={{ width: "100%" }}>
        <DataGrid
          rows={mockData}
          columns={columns} 
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
      </Box>
    </Box>
  );
}

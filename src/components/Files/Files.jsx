import React, { useState } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from '@mui/icons-material/Close';

export default function Files() {

  const [search, setSearch] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadOpened, setUploadOpened] = useState(false);

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "size", headerName: "size", flex: 0.5 },
  ];

  const mockData = [
    { id: 1, name: "hello.py", size: "10KB" },
    { id: 2, name: "script.sh", size: "20KB" },
    { id: 3, name: "hw4.php", size: "1GB" },
    { id: 4, name: "server.js", size: "1MB" }
  ];

  const openUpload = () => {
    setUploadOpened(true);
  }

  const closeUpload = () => {
    setUploadOpened(false);
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    // Handle form submission

    closeUpload();
  }
  
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
      <Box
        sx = {{
          display: "flex",
          flexDirection: "row",
          width: "100%"
        }}
      >
        <SearchBar search = {search} setSearch = {setSearch} />
        <Button
          variant = "contained"
          backgroundColor = "#0b3a53"
          startIcon={<UploadIcon />}
          onClick = {openUpload}
        >
          Upload
        </Button>
      </Box>
      <DataTable rows = {mockData} columns = {columns} search = {search} />
        
        {/* Upload File Popup */}
        <Dialog open = {uploadOpened} onClose = {closeUpload}>
            <DialogTitle> Upload File </DialogTitle>
            <IconButton
                edge="end"
                color="inherit"
                onClick={closeUpload}
                aria-label="close"
                sx={{ position: 'absolute', right: "4%", top: "2%" }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <form onSubmit = {handleSubmit}>
                    <input
                        type = "file"
                        id = "file-upload"
                        onChange = {handleFileUpload}
                        style = {{ display: "none" }}
                        required
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                        <label htmlFor="file-upload">
                            <Button variant="contained" component="span" sx={{ marginTop: .4, marginRight: 1, fontSize: '.75rem' }}>
                                Choose File
                            </Button>
                        </label>
                        <TextField
                            // autoFocus
                            value = {fileName}
                            margin = "dense"
                            label = "File Name"
                            type = "text"
                            fullWidth
                            variant = "outlined"
                            InputProps={{
                                readOnly: true, // Make the text field read-only
                            }}
                            required
                        />

                    </Box>
                    <TextField
                        margin="dense"
                        label="Set Price"
                        type="text"
                        fullWidth
                        variant="outlined"
                        required
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant = "contained"
                    backgroundColor = "#0b3a53"
                    type = "submit" 
                    form = "uploadForm" 
                    sx={{ right: "3.3%", marginTop: -2, marginBottom: 1 }}
                  >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>

    </Box>
  );
}

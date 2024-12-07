import React, { useState } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from "../../ThemeContext";

export default function Files() {
  const { darkMode } = useTheme();
  
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [fileName, setFileName] = useState('');
  const [price, setPrice] = useState('');
  const [uploadOpened, setUploadOpened] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [uploading, setUploading] = useState(false);

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "size", headerName: "Size", flex: 0.5 },
  ];

  const mockData = [
    { id: 1, name: "hello.py", size: "10KB" },
    { id: 2, name: "script.sh", size: "20KB" },
    { id: 3, name: "hw4.php", size: "1GB" },
    { id: 4, name: "server.js", size: "1MB" }
  ];

  const openUpload = () => {
    setUploadOpened(true);
  };

  const closeUpload = () => {
    setUploadOpened(false);
    setFile(null);
    setFileName('');
    setPrice('');
    setUploadResponse(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file || !price) {
      alert("Please select a file to upload and set a price.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("price", price);

    try {
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if(!response.ok) {
        throw new Error("failed to upload file");
      }

      const result = await response.json();
      setUploadResponse(result);
    } catch(error) {
      console.error("Error during file upload:", error);
      alert("An error occurred while uploading the file");
    } finally {
      setUploading(false);
      closeUpload();
    }
  };

  return (
    <Box
      sx={{
        marginLeft: "14vw",
        marginRight: "1vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 1,
        }}
      >
        <SearchBar search={search} setSearch={setSearch} />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={openUpload}
          sx={{
            backgroundColor: darkMode ? "#f06292" : "#000000",
            "&:hover": {
              backgroundColor: "#7a99d9",
            },
          }}
        >
          Upload
        </Button>
      </Box>
      <DataTable rows={mockData} columns={columns} search={search} darkMode={darkMode} />
        
      {/* Upload File Popup */}
      <Dialog open={uploadOpened} onClose={closeUpload}>
        <DialogTitle>Upload File</DialogTitle>
        <IconButton
          edge="end"
          color="inherit"
          onClick={closeUpload}
          aria-label="close"
          sx={{ position: 'absolute', right: "4%", top: "3%" }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <form id="uploadForm" onSubmit={handleSubmit}>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              required
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="file-upload">
                <Button variant="contained" component="span" sx={{ marginTop: .4, marginRight: 1, fontSize: '.75rem' }}>
                  Choose File
                </Button>
              </label>
              <TextField
                value={fileName}
                margin="dense"
                label="File Name"
                type="text"
                fullWidth
                variant="outlined"
                InputProps={{
                  readOnly: true,
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            type="submit" 
            form="uploadForm" 
            disabled={!file || uploading}
            sx={{ right: "3.3%", marginTop: -2, marginBottom: 1 }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

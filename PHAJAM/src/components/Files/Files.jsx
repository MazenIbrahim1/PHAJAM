import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import SearchBar from "./SearchBar";
import DataTable from "./DataTable";
import { useTheme } from "../../ThemeContext";

export default function Files() {
  const { darkMode } = useTheme();

  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [fileName, setFileName] = useState("");
  const [price, setPrice] = useState("");
  const [uploadOpened, setUploadOpened] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });

  const columns = [
    { field: "filename", headerName: "File Name", flex: 2 },
    { field: "hash", headerName: "Hash", flex: 4 },
    { field: "cost", headerName: "Cost", flex: 1 },
    { field: "timestamp", headerName: "Uploaded At", flex: 2 },
  ];

  const openUpload = () => {
    setUploadOpened(true);
  };

  const closeUpload = () => {
    setUploadOpened(false);
    setFile(null);
    setFileName("");
    setPrice("");
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

      if (!response.ok) {
        const errorText = await response.text();
        setErrorPopup({ open: true, message: errorText });
        return;
      }

      const result = await response.json();
      setUploadResponse(result);
    } catch (error) {
      console.error("Error during file upload:", error);
      setErrorPopup({ open: true, message: `Unexpected Error: ${error.message}` });
    } finally {
      setUploading(false);
      closeUpload();
      fetchFiles();
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:8080/files");
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();

      const formattedData = data.map((item, index) => ({
        id: index + 1,
        filename: item.filename,
        hash: item.hash,
        cost: item.cost,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }));

      setFiles(formattedData);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hash) => {
    try {
      const response = await fetch(`http://localhost:8080/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Remove the deleted file from state
      setFiles((prevFiles) => prevFiles.filter((file) => file.hash !== hash));
    } catch (error) {
      console.error("Error deleting file:", error);
      setErrorPopup({ open: true, message: `Error deleting file: ${error.message}` });
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
      <Typography sx={{ color: "red" }}>
        *These files still persist even if you delete the files on your computer! Select a file to start deleting instead.
      </Typography>
      <DataTable rows={files} columns={columns} search={search} onDelete={handleDelete} />

      {/* Upload File Popup */}
      <Dialog open={uploadOpened} onClose={closeUpload}>
        <DialogTitle>Upload File</DialogTitle>
        <IconButton
          edge="end"
          color="inherit"
          onClick={closeUpload}
          aria-label="close"
          sx={{ position: "absolute", right: "4%", top: "3%" }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ paddingTop : 1 }}>
          <form id="uploadForm" onSubmit={handleSubmit}>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              required
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{ marginTop: 0.4, marginRight: 1, fontSize: ".75rem" }}
                >
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

      {/* Error Popup */}
      <Dialog open={errorPopup.open} onClose={() => setErrorPopup({ open: false, message: "" })}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorPopup.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorPopup({ open: false, message: "" })} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

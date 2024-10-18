import { useState, useEffect } from "react";
import React from "react";
import {
  AppBar,
  Box,
  Button,
  TextField,
  InputAdornment,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Download, Help, Search } from "@mui/icons-material";

// Function to handle download of a file
function handleDownload(selectedFile) {
  if (!selectedFile) {
    return;
  }

  // Create a Blob from the file's data (assuming selectedFile.data contains raw data)
  const fileBlob = new Blob([selectedFile.data], { type: selectedFile.type });

  // Create a temporary download link and trigger it
  const url = URL.createObjectURL(fileBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = selectedFile.name; // Use the file's name for the download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a); // Clean up the link element after clicking
  URL.revokeObjectURL(url); // Clean up the object URL
}

// Function to render single files
function RenderFileInfo({ selectedFile }) {
  if (!selectedFile) {
    return <Typography variant="h4">Select a file to view details</Typography>;
  }

  return (
    <>
      <Typography variant="h5">File Details</Typography>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1">
          <strong>Name:</strong> {selectedFile.name}
        </Typography>
        <Typography variant="body1">
          <strong>Size:</strong> {selectedFile.size}
        </Typography>
        <Typography variant="body1">
          <strong>Type:</strong> {selectedFile.type}
        </Typography>
        <Typography variant="body1">
          <strong>Date Posted:</strong> {selectedFile.date}
        </Typography>
        <Typography variant="body1">
          <strong>Hash:</strong> {selectedFile.hash}
        </Typography>
        <Typography variant="body1">
          <strong>Price:</strong>{" "}
          {selectedFile.price ? selectedFile.price : "tbd"}
        </Typography>
      </Box>
      <Button
        startIcon={<Download />}
        onClick={() => handleDownload(selectedFile)}
        variant="contained"
      >
        Download
      </Button>
    </>
  );
}

export default function Explore() {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "size",
      headerName: "Size",
      width: 100,
    },
    {
      field: "hash",
      headerName: "Hash",
      width: 420,
    },
  ];

  const mockData = [
    {
      id: 1,
      name: "file1.txt",
      size: "10 KB",
      type: "Text",
      date: "2024-09-15",
      hash: "QmW2WQi7j6c7Ug1MdK7V5i1vCdrQESdjy8JPbn2gkzGTxM",
      price: "20 Dolphin Coin",
    },
    {
      id: 2,
      name: "image1.png",
      size: "2 MB",
      type: "Image",
      date: "2024-09-16",
      hash: "Qmd3W5ty4UkFgP6AvjyzbdzFcfZy3KRfrbLVH5MNvSR1qy",
    },
    {
      id: 3,
      name: "video1.mp4",
      size: "15 MB",
      type: "Video",
      date: "2024-09-17",
      hash: "Qmc9shFA7RohHKDJYb6V2PSwiyV8XoL3vRU3nsi47hM6Rb",
    },
    {
      id: 4,
      name: "document.pdf",
      size: "1 MB",
      type: "PDF",
      date: "2024-09-18",
      hash: "QmW2WQi7j6c7Ug1MdK7V5i1vCdrQESdjy8JPbn2gkzGTxM",
    },
    {
      id: 5,
      name: "audio1.mp3",
      size: "5 MB",
      type: "Audio",
      date: "2024-09-19",
      hash: "QmeT4GfdwT5fZJfjsGaU1MPmX4r2KYbw8WjXxsyuKfmpwD",
    },
    {
      id: 6,
      name: "presentation.pptx",
      size: "3 MB",
      type: "Presentation",
      date: "2024-09-20",
      hash: "QmdTVqv8Uu64yZDS5KYsWfUbqTSqY6v3RhWE74ZdMka7vQ",
    },
    {
      id: 7,
      name: "spreadsheet.xlsx",
      size: "2 MB",
      type: "Spreadsheet",
      date: "2024-09-21",
      hash: "QmPKM6V4Swj7L8T1wVoWFAh5EuhwNz3avJ8MDphgdKFm2N",
    },
    {
      id: 8,
      name: "ebook.epub",
      size: "6 MB",
      type: "Ebook",
      date: "2024-09-22",
      hash: "QmS9D7djG9Fwmg9RC8nN9dkm6MC77Vi52JZpVjfZ4qxA4K",
    },
    {
      id: 9,
      name: "archive.zip",
      size: "50 MB",
      type: "Archive",
      date: "2024-09-23",
      hash: "QmRvZbWG56HdT9yqwfboEJdVjqAgcMG95R7jE8VfVFxmB5",
    },
    {
      id: 10,
      name: "research.docx",
      size: "1.5 MB",
      type: "Document",
      date: "2024-09-24",
      hash: "QmULHkg4vTXsB9y5FrwSBKcnJgsKbG82ZX4FvgNLchBgGy",
    },
    {
      id: 11,
      name: "image2.jpeg",
      size: "4 MB",
      type: "Image",
      date: "2024-09-25",
      hash: "QmN2TkfiXuwbyvYn4cJZ2dqPKFJXNg9i7VuCdYQwFw1XKP",
    },
    {
      id: 12,
      name: "backup.tar.gz",
      size: "200 MB",
      type: "Archive",
      date: "2024-09-26",
      hash: "QmRTdCB6gjq4Y1EdDZ8SaFZy5jNvnM7tLdPhmYGy7YRs5X",
    },
    {
      id: 13,
      name: "music_album.flac",
      size: "500 MB",
      type: "Audio",
      date: "2024-09-27",
      hash: "QmcKj7bqZzTH5uXZn9HtVBz5J7qZwec6hS2LVRLbkA2EKC",
    },
    {
      id: 14,
      name: "notes.txt",
      size: "15 KB",
      type: "Text",
      date: "2024-09-28",
      hash: "QmW2WQi7j6c7Ug1MdK7V5i1vCdrQESdjy8JPbn2gkzGTxM",
    },
    {
      id: 15,
      name: "game.iso",
      size: "4 GB",
      type: "ISO",
      date: "2024-09-29",
      hash: "QmdMn5XeYKbPgrz1exMqQjPp2UdVcPNEvvTgKdG78YGpNG",
    },
    {
      id: 16,
      name: "database.sql",
      size: "25 MB",
      type: "Database",
      date: "2024-09-30",
      hash: "QmQybnbmKuFKk74DkxLzodtHzXZwFw8nRZtvv4zRfWaAVF",
    },
    {
      id: 17,
      name: "design.sketch",
      size: "12 MB",
      type: "Design",
      date: "2024-10-01",
      hash: "QmPfWe9fGKgA6rPFEhMb9cdWsLvcEhrkyoCb3BoqSMqjvS",
    },
    {
      id: 18,
      name: "animation.gif",
      size: "8 MB",
      type: "Animation",
      date: "2024-10-02",
      hash: "QmTsfzFyG9nL3EFcCxpfjEzAnCJqudVMy7AQs3LzRs1NRh",
    },
    {
      id: 19,
      name: "source_code.zip",
      size: "100 MB",
      type: "Archive",
      date: "2024-10-03",
      hash: "QmVuRnPNeLZ6AK8FskAv4fU6rqYmNU8fFL2PAEZgkQm36G",
    },
    {
      id: 20,
      name: "project_plan.docx",
      size: "3 MB",
      type: "Document",
      date: "2024-10-04",
      hash: "QmSm3zjeD7HkFktK5pS9pFgB7uFbYbnMJP3mWsD4jFLQU5",
    },
  ];

  const [files, setFiles] = useState(mockData); // CHANGE TO REAL DATA LATER
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  // State for dialog visibility
  const [open, setOpen] = useState(false);
  const searchResults = mockData.filter((data) => data.hash === search);

  // Function to select a file in the market
  const handleRowClick = (params) => {
    setSelected(params.row);
  };

  // Open the dialog
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <AppBar
        position="absolute"
        sx={{
          width: "87vw",
          marginLeft: "13vw",
          bgcolor: "#7a99d9",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search by Hash..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              width: "50vw",
              bgcolor: "#f0f4f8",
              borderRadius: "4px",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleOpenDialog();
              }
            }}
          />
          <Button
            href="https://github.com/MazenIbrahim1/PHAJAM"
            target="_blank"
            variant="contained"
          >
            <Help />
          </Button>
        </Toolbar>
      </AppBar>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="hash-search-result-title"
        aria-describedby="hash-search-result-description"
      >
        <DialogTitle id="hash-search-result-title">{"Results:"}</DialogTitle>
        <DialogContent>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "#f5f5f5",
                  gap: 1,
                  padding: 2,
                  margin: 2,
                }}
              >
                <Typography key={result.id} variant="body1">
                  {"Name: " + result.name}
                </Typography>
                <Typography key={result.id} variant="body1">
                  {"Hash: " + result.hash.substring(0, 20) + "..."}
                </Typography>
                <Typography key={result.id} variant="body1">
                  {"Size: " + result.size}
                </Typography>
                <Typography key={result.id} variant="body1">
                  {"Price: " + (result.price ? result.price : "tbd")}
                </Typography>
                <Button
                  key={result.id}
                  startIcon={<Download />}
                  onClick={() => handleDownload(result)}
                  variant="contained"
                >
                  Download
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant="body1">No results found.</Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button variant="contained" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          height: "100vh",
          width: "87vw",
          marginLeft: "13vw",
          marginTop: "64px",
          display: "flex",
          flexDirection: { sm: "column", md: "row" },
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            height: "95vh",
            width: { xs: "25vw", md: "46vw" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 2,
            padding: 2,
          }}
        >
          <Typography variant="h3">Explore Files in the Network</Typography>
          <DataGrid
            rows={mockData}
            columns={columns}
            onRowClick={handleRowClick}
          />
        </Box>
        <Box
          sx={{
            width: { xs: "25vw", md: "37vw" },
            display: "flex",
            flexDirection: selected ? "column" : "center",
            alignItems: "center",
            bgcolor: "#f5f5f5",
            gap: 2,
            padding: 2,
          }}
        >
          <RenderFileInfo selectedFile={selected} />
        </Box>
      </Box>
    </>
  );
}

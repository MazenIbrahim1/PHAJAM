import { useState, useEffect } from "react";
import React from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Download, Help, Search } from "@mui/icons-material";

function handlePurchase(selectedFile) {
  if (!selectedFile) {
    return;
  }

  const fileBlob = new Blob([selectedFile.data], { type: selectedFile.type });

  // Create a temporary download link and trigger it
  const url = URL.createObjectURL(fileBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = selectedFile.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function RenderFileInfo({ selectedFile, func }) {
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
          {selectedFile.price ? selectedFile.price + " DC" : "tbd"}
        </Typography>
      </Box>
      <Button startIcon={<Download />} onClick={func} variant="contained">
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
      resizable: false,
    },
    {
      field: "size",
      headerName: "Size",
      width: 100,
      resizable: false,
    },
    {
      field: "hash",
      headerName: "Hash",
      width: 423,
      resizable: false,
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
      price: 20,
    },
    {
      id: 2,
      name: "image1.png",
      size: "2 MB",
      type: "Image",
      date: "2024-09-16",
      hash: "Qmd3W5ty4UkFgP6AvjyzbdzFcfZy3KRfrbLVH5MNvSR1qy",
      price: 50,
    },
    {
      id: 3,
      name: "video1.mp4",
      size: "15 MB",
      type: "Video",
      date: "2024-09-17",
      hash: "Qmc9shFA7RohHKDJYb6V2PSwiyV8XoL3vRU3nsi47hM6Rb",
      price: 100,
    },
    {
      id: 4,
      name: "document.pdf",
      size: "1 MB",
      type: "PDF",
      date: "2024-09-18",
      hash: "QmW2WQi7j6c7Ug1MdK7V5i1vCdrQESdjy8JPbn2gkzGTxM",
      price: 20,
    },
    {
      id: 5,
      name: "audio1.mp3",
      size: "5 MB",
      type: "Audio",
      date: "2024-09-19",
      hash: "QmeT4GfdwT5fZJfjsGaU1MPmX4r2KYbw8WjXxsyuKfmpwD",
      price: 75,
    },
    {
      id: 6,
      name: "presentation.pptx",
      size: "3 MB",
      type: "Presentation",
      date: "2024-09-20",
      hash: "QmdTVqv8Uu64yZDS5KYsWfUbqTSqY6v3RhWE74ZdMka7vQ",
      price: 35,
    },
    {
      id: 7,
      name: "spreadsheet.xlsx",
      size: "2 MB",
      type: "Spreadsheet",
      date: "2024-09-21",
      hash: "QmPKM6V4Swj7L8T1wVoWFAh5EuhwNz3avJ8MDphgdKFm2N",
      price: 40,
    },
    {
      id: 8,
      name: "ebook.epub",
      size: "6 MB",
      type: "Ebook",
      date: "2024-09-22",
      hash: "QmS9D7djG9Fwmg9RC8nN9dkm6MC77Vi52JZpVjfZ4qxA4K",
      price: 55,
    },
    {
      id: 9,
      name: "archive.zip",
      size: "50 MB",
      type: "Archive",
      date: "2024-09-23",
      hash: "QmRvZbWG56HdT9yqwfboEJdVjqAgcMG95R7jE8VfVFxmB5",
      price: 150,
    },
    {
      id: 10,
      name: "research.docx",
      size: "1.5 MB",
      type: "Document",
      date: "2024-09-24",
      hash: "QmW2WQi7j6c7Ug1MdK7V5i1vCdrQESdjy8JPbn2gkzGTxM",
      price: 20,
    },
    {
      id: 11,
      name: "image2.jpeg",
      size: "4 MB",
      type: "Image",
      date: "2024-09-25",
      hash: "QmN2TkfiXuwbyvYn4cJZ2dqPKFJXNg9i7VuCdYQwFw1XKP",
      price: 60,
    },
    {
      id: 12,
      name: "backup.tar.gz",
      size: "200 MB",
      type: "Archive",
      date: "2024-09-26",
      hash: "QmRTdCB6gjq4Y1EdDZ8SaFZy5jNvnM7tLdPhmYGy7YRs5X",
      price: 200,
    },
  ];

  const [files, setFiles] = useState(mockData); 
  const [balance, setBalance] = useState(500); 
  const [bid, setBid] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [openHash, setOpenHash] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const searchResults = mockData.filter((data) => data.hash === search);

  const handleRowClick = (params) => {
    setSelected(params.row);
  };

  const handleOpenDialogHash = () => {
    setOpenHash(true);
  };

  const handleCloseDialogHash = () => {
    setOpenHash(false);
  };

  const handleOpenDialogPurchase = () => {
    setOpenPurchase(true);
  };

  const handleCloseDialogPurchase = () => {
    setOpenPurchase(false);
  };

  return (
    <>
      <Dialog
        open={openHash}
        onClose={handleCloseDialogHash}
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
                  borderRadius: "4px",
                  boxShadow: 3,
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
                  onClick={handleOpenDialogPurchase}
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
          <Button variant="contained" onClick={handleCloseDialogHash}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPurchase}
        onClose={handleCloseDialogPurchase}
        aria-labelledby="purchase-title"
        aria-describedby="purchase-description"
      >
        <DialogTitle id="purchase-title">{"Confirm Purchase"}</DialogTitle>
        <DialogContent>
          {selected ? (
            <>
              <Typography>
                Price: {selected.price ? selected.price + " DC" : "tbd"}
              </Typography>
              <Typography>
                Balance After: {balance - selected.price} DC
              </Typography>
            </>
          ) : (
            <Typography>No file selected</Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Set Bid Price"
            autoComplete="off"
            value={bid}
            onChange={(event) => setBid(event.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => console.log("Requesting...")}
          >
            Request
          </Button>
        </DialogActions>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={handleCloseDialogPurchase}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handlePurchase(selected);
              setBalance(balance - selected.price);
              handleCloseDialogPurchase();
            }}
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          marginLeft: "14vw",
          width: "86vw",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search by Hash..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{
            width: "47vw",
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
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleOpenDialogHash();
            }
          }}
        />
        <Box
          sx={{
            width: "37vw",
            height: "55px",
            bgcolor: "#f0f4f8",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #bdc3c9",
          }}
        >
          <Typography variant="h4">Wallet Balance: {balance} DC</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          height: "85vh",
          width: "87vw",
          marginLeft: "13vw",
          display: "flex",
          flexDirection: { sm: "column", md: "row" },
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: { xs: "25vw", md: "46vw" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 2,
            padding: 2,
            height: "100%",
          }}
        >
          <DataGrid
            rows={mockData}
            columns={columns}
            onRowClick={handleRowClick}
            sx={{
              border: "1px solid #bdc3c9",
            }}
          />
        </Box>
        <Box
          sx={{
            width: { xs: "87vw", md: "35vw" },
            display: "flex",
            flexDirection: selected ? "column" : "center",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f0f4f8",
            gap: 2,
            borderRadius: "4px",
            padding: 2,
            marginTop: 2,
            height: "95%",
            border: "1px solid #bdc3c9",
          }}
        >
          <RenderFileInfo
            selectedFile={selected}
            func={handleOpenDialogPurchase}
          />
        </Box>
      </Box>
    </>
  );
}

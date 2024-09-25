import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Explore() {
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "size",
      headerName: "Size",
      width: 150,
    },
    {
      field: "type",
      headerName: "Type",
      type: "number",
      width: 110,
    },
    {
      field: "date",
      headerName: "Date",
      width: 110,
    },
    {
      field: "hash",
      headerName: "Hash",
      width: 200,
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
      hash: "QmTkj7k1vPRFPocjD3CPZVJNZGPtFmLhdWaf2pTTgDXTP7",
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
      hash: "QmdAKqRuU8KbySfhLsmFTNcmyMWmDHjP78WBZhRGD5bf5x",
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

  // Function to fetch all files from DHT database from libp2p

  return (
    <Box
      sx={{
        height: "100vh",
        width: "87vw",
        marginLeft: "13vw",
      }}
    >
      <Typography>Explore</Typography>
      <Box
        sx={{
          height: "90vh",
          width: "60vw",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: 2,
        }}
      >
        <DataGrid
          rows={files}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Box>
    </Box>
  );
}

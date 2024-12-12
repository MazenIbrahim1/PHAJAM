import React from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import axios from "axios";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from "../../ThemeContext";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const { darkMode, setDarkMode } = useTheme();
  const [minedBlocks, setMinedBlocks] = useState([]); // Store mined block hashes

  const transactions = [  //all the transactions in table (dummy data)
    {
      from: '0000000',
      to: '5555555',
      price: 0.5,  
      dateTime: '2024-10-20 12:30:45',
      transactionID: 'TXN1234567890',
      fileSize: '1.2 MB',
      status: 'Complete'
    },
    {
      from: '1234567',
      to: '7654321',
      price: 1.2,
      dateTime: '2024-10-19 14:12:23',
      transactionID: 'TXN9876543210',
      fileSize: '2.5 MB',
      status: 'Pending'
    },
    {
      from: '9999999',
      to: '1111111',
      price: 0.8,
      dateTime: '2024-10-18 09:45:12',
      transactionID: 'TXN5432167890',
      fileSize: '900 KB',
      status: 'Failed'
    },
    {
      from: '2468101',
      to: '1024680',
      price: 0.3,
      dateTime: '2024-10-17 11:22:10',
      transactionID: 'TXN3216549870',
      fileSize: '500 KB',
      status: 'Complete'
    },
    {
      from: '6543210',
      to: '0123456',
      price: 2.1,
      dateTime: '2024-10-16 17:35:50',
      transactionID: 'TXN1234509876',
      fileSize: '3.1 MB',
      status: 'Complete'
    },
    {
      from: '7777777',
      to: '3333333',
      price: 0.9,
      dateTime: '2024-10-15 10:24:00',
      transactionID: 'TXN7654321098',
      fileSize: '800 KB',
      status: 'Pending'
    },
    {
      from: '8888888',
      to: '4444444',
      price: 1.4,
      dateTime: '2024-10-14 13:18:47',
      transactionID: 'TXN1234987654',
      fileSize: '2.0 MB',
      status: 'Complete'
    },
    {
      from: '5555555',
      to: '9999999',
      price: 0.6,
      dateTime: '2024-10-13 08:55:30',
      transactionID: 'TXN6547893210',
      fileSize: '700 KB',
      status: 'Failed'
    },
    {
      from: '3141592',
      to: '2718281',
      price: 0.5,
      dateTime: '2024-10-12 12:10:00',
      transactionID: 'TXN3571592580',
      fileSize: '1.5 MB',
      status: 'Complete'
    },
    {
      from: '1234321',
      to: '9876543',
      price: 0.2,
      dateTime: '2024-10-11 15:45:50',
      transactionID: 'TXN0987654321',
      fileSize: '400 KB',
      status: 'Pending'
    }
  ];

  const data = {
    labels: transactions.map((_, index) => `${index + 1}`), 
    datasets: [
      {
        label: 'DolphinCoin Transactions',
        data: transactions.map(transaction => transaction.price),  
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
		color: darkMode ? "#ffffff" : "#000000"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable to allow manual height & widthhhh
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Dolphin Coin Transactions Over Time',
        color: darkMode ? "#ffffff" : "#000000",  
        font: { size: 24 },  
		
      },
    },
    scales: {
      x: { title: { display: true, text: 'Transaction Number', color: darkMode ? "#ffffff" : "#000000" } },
      y: { title: { display: true, text: 'Price (DolphinCoin)', color: darkMode ? "#ffffff" : "#000000" }, beginAtZero: true } 
    }
	
  };

  const handleMine = async () => {
    try {
      // Number of blocks to mine (e.g., 5 for demo)
      const numBlocks = 5;
  
      // API call to the backend
      const response = await axios.post("http://localhost:8080/mine", {
        num_blocks: numBlocks,
      });
  
      // Handle successful response
      alert(`Mining started: ${response.data.message}`);
      setMinedBlocks(response.data.block_hash); // Update mined blocks
      console.log("Block hashes:", response.data.block_hash);
    } catch (error) {
      // Handle errors
      alert("Error starting mining: " + error.response?.data?.error || error.message);
      console.error("Mining error:", error);
    }
  };

  return (
    <Box
      sx={{
        ml: "13vw",
        pl: "5vw",
        pr: "5vw",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: 'relative',
        minHeight: '100vh', // The page takes the full viewport height
      }}
    >
      {/* Page Title */}
      <Typography variant="h3" sx={{ mb: "16px", mt: "16px", color: darkMode ? "#ffffff" : "#000000" }}>
        Welcome to Dolphin Data Sharing!
      </Typography>
  
      {/* Box with Chart on the left and Mine section on the right */}
      <Box
        sx={{
          mt: 4,
          width: '100%',
          display: 'flex', // Flex layout for side-by-side boxes
          justifyContent: 'space-between',
          backgroundColor: darkMode ? "#333333" : "#ffffff",
        }}
      >
        {/* Outlined Box around Line Chart */}
        <Box
          sx={{
            width: '60%',
            height: '250px',
            border: '2px solid #b2dfdb', // Light teal outline around the boxes
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow around the boxes
          }}
        >
          <Line data={data} options={options} />
        </Box>
  
        {/* Outlined Box around "Mine Here" Section */}
        <Box
          sx={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '2px solid #b2dfdb',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
          <Box
            component="img"
            src="src/assets/logo.png" // Adding logo to the mine section
            alt="Logo"
            sx={{
              width: '100px',
              height: 'auto',
              mb: '16px',
            }}
          />
  
          <Typography variant="h4" sx={{ mb: "16px", color: darkMode ? "#ffffff" : "#000000" }}>
            Start Mining
          </Typography>
  
          <Button
            variant="contained"
            color="primary"
            onClick={handleMine} // Attach the handler here
            sx={{
              padding: "18px 36px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              width: "200px",
              height: "70px",
              backgroundColor: darkMode ? "#f06292" : "#000000",
              "&:hover": {
                backgroundColor: "#7a99d9",
              },
            }}
          >
            Mine Dolphin Coin!
          </Button>
        </Box>
      </Box>
  
      {/* Outlined Box to Display Mined Blocks */}
      <Box
        sx={{
          mt: 4,
          width: '80%',
          border: '2px solid #b2dfdb',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: darkMode ? "#333" : "#ffffff",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: darkMode ? "#ffffff" : "#000000" }}>
          Mined Blocks
        </Typography>
        {minedBlocks.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Block Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {minedBlocks.map((hash, index) => (
                  <TableRow key={index}>
                    <TableCell>{hash}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No blocks mined yet.</Typography>
        )}
      </Box>
  
      {/* Outlined Box for Transaction History
      <Box
        sx={{
          mt: 4,
          width: '80vw',
          border: '2px solid #b2dfdb',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: darkMode ? "#333" : "#ffffff",
          "& .MuiTableCell-root": {
            color: darkMode ? "#ffffff" : "#000000",
            backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
          },
          "& .MuiTableSortLabel-root": {
            color: darkMode ? "#ffffff" : "#000000",
            "&.Mui-active": {
              color: darkMode ? "#ffffff" : "#000000",
            },
          },
        }}
      >
        <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto', backgroundColor: darkMode ? "#4a4a4a" : "#ffffff" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
                <TableCell>Transaction Number</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Price (DolphinCoin)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{transaction.dateTime}</TableCell>
                  <TableCell>{transaction.transactionID}</TableCell>
                  <TableCell>{transaction.from}</TableCell>
                  <TableCell>{transaction.to}</TableCell>
                  <TableCell>{transaction.fileSize}</TableCell>
                  <TableCell>{transaction.price}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box> */}
    </Box>
  );
  
}

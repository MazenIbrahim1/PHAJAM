import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  TableSortLabel,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTheme } from "../../ThemeContext";

export default function Profile() {
  const { darkMode } = useTheme();
  
  const [balance, setBalance] = useState(500);
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Received", amount: 50, date: "2024-10-01T10:30:00", from: "0xabcdef123456", status: "Completed" },
    { id: 2, type: "Sent", amount: 25, date: "2024-10-05T14:15:00", to: "0x9876543210abcd", status: "Completed" },
    { id: 3, type: "Sent", amount: 15, date: "2024-10-10T09:45:00", to: "0x3333333333333333", status: "In Progress" },
  ]);
  const [address, setAddress] = useState("0x1234567890abcdef1234567890abcdef12345678");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  const handleSendMoney = () => {
    const amountToSend = parseFloat(parseFloat(amount).toFixed(2));
  
    if (isNaN(amountToSend) || amountToSend <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
  
    if (amountToSend > balance) {
      alert("Insufficient balance.");
      return;
    }
  
    setBalance((prevBalance) => parseFloat((prevBalance - amountToSend).toFixed(2)));
  
    const newTransaction = {
      id: transactions.length + 1,
      type: "Sent",
      amount: amountToSend,
      date: new Date().toISOString(),
      to: recipientAddress,
      status: "Completed",
    };
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  
    setRecipientAddress("");
    setAmount("");
    alert("Transaction successful!");
  };

  const handleTabChange = (event, newValue) => {
    setFilter(newValue);
  };

  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key: column, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredTransactions = sortedTransactions
    .filter((transaction) => {
      if (filter === "Sent") return transaction.type === "Sent";
      if (filter === "Received") return transaction.type === "Received";
      return true;
    })
    .filter((transaction) => {
      const searchTermLower = searchTerm.toLowerCase();
      const transactionDate = new Date(transaction.date).toLocaleDateString().toLowerCase();
      const transactionTime = new Date(transaction.date).toLocaleTimeString().toLowerCase();

      return (
        transaction.type.toLowerCase().includes(searchTermLower) ||
        (transaction.type === "Received" && transaction.from.toLowerCase().includes(searchTermLower)) ||
        (transaction.type === "Sent" && transaction.to.toLowerCase().includes(searchTermLower)) ||
        transactionDate.includes(searchTermLower) ||
        transactionTime.includes(searchTermLower)
      );
    });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: 4,
        gap: 4,
        maxWidth: "1200px",
        margin: "0 auto",
        paddingLeft: "13vw",
        color: darkMode ? "#ffffff" : "#000000",
        backgroundColor: darkMode ? "#18191e" : "#ffffff",
      }}
    >
      {/* Left column */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, maxWidth: "300px" }}> {/* Set a max width for the left column */}
        <Box
          sx={{
            padding: 2,
            border: '2px solid #b2dfdb', 
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
          <Typography variant="h6">Wallet Balance</Typography>
          <Typography variant="h4">{balance.toFixed(2)} DC</Typography>
        </Box>
  
        <Box
          sx={{
            padding: 2,
            border: '2px solid #b2dfdb', 
            borderRadius: "8px",
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
          <Typography variant="h6">Wallet Address</Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px",
              marginTop: "8px",
            }}
          >
            {address}
          </Typography>
          <IconButton onClick={handleCopyToClipboard} sx={{ marginLeft: 1 }}>
            <ContentCopyIcon sx={{ color: darkMode ? "#ffffff" : "#000000" }} />
          </IconButton>
        </Box>
  
        <Box
          sx={{
            padding: 2,
            border: '2px solid #b2dfdb', 
            borderRadius: "8px",
            backgroundColor: darkMode ? "#333333" : "#ffffff",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Send Money
          </Typography>
          <TextField
            label="Recipient Wallet Address"
            variant="outlined"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2, 
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
            }}
          />
          <TextField
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                setAmount(value);
              }
            }}
            fullWidth
            sx={{ marginBottom: 2, backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              }, }}
          />
          <Button variant="contained" 
            sx={{backgroundColor: darkMode ? "#f06292": "#000000",
              "&:hover": {
                backgroundColor: "#7a99d9"}}} 
                onClick={handleSendMoney} fullWidth>
            Send
          </Button>
        </Box>
      </Box>
  
      <Box
        sx={{
          flex: 2,
          border: '2px solid #b2dfdb',
          borderRadius: "8px",
          padding: 2,
          height: "600px", // Keep the height for the right column
          overflow: "hidden", // Prevent overflow if necessary
          backgroundColor: darkMode ? "#333333" : "#ffffff",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Your Transactions
        </Typography>
        <Tabs
          value={filter}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: darkMode ? "#ffffff" : "#000000", 
            },
          }}
        >
          <Tab
            label="All"
            value="All"
            sx={{
              color: darkMode ? "#ffffff" : "#000000",
              "&.Mui-selected": {
                color: darkMode ? "#ffffff" : "#000000", 
              },
            }}
          />
          <Tab
            label="Sent"
            value="Sent"
            sx={{
              color: darkMode ? "#ffffff" : "#000000",
              "&.Mui-selected": {
                color: darkMode ? "#ffffff" : "#000000", 
              },
            }}
          />
          <Tab
            label="Received"
            value="Received"
            sx={{
              color: darkMode ? "#ffffff" : "#000000",
              "&.Mui-selected": {
                color: darkMode ? "#ffffff" : "#000000", 
              },
            }}
          />
        </Tabs>

        <TextField
          label="Search transactions by either other person's wallet address or by date"
          variant="outlined"
          fullWidth
          sx={{
            marginY: 2,
            backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
            "& .MuiInputBase-input": {
              color: darkMode ? "#ffffff" : "#000000",
            },
            "& .MuiInputLabel-root": {
              color: darkMode ? "#ffffff" : "#000000",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover fieldset": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&.Mui-focused fieldset": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
            },
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
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
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {["id", "type", "amount", "date"].map((column) => (
                    <TableCell key={column}>
                      <TableSortLabel
                        active={sortConfig.key === column}
                        direction={sortConfig.key === column ? sortConfig.direction : "asc"}
                        onClick={() => handleSort(column)}
                      >
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>
                    {filter === "Sent" ? "To" : filter === "Received" ? "From" : "Other Wallet Address"}
                  </TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell sx={{ width: "80px" }}>{transaction.amount}</TableCell> {/* Smaller space for amount column */}
                    <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: "250px", 
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {transaction.type === "Sent" ? transaction.to : transaction.from}
                      </span>
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(transaction.type === "Sent" ? transaction.to : transaction.from);
                          alert("Wallet address copied to clipboard!");
                        }}
                        size="small"
                        sx={{ marginLeft: 1, color: darkMode ? "#ffffff" : "#000000" }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );    
}

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

export default function Profile() {
  const [balance, setBalance] = useState(100.5);
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
    const amountToSend = parseFloat(amount);

    if (isNaN(amountToSend) || amountToSend <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (amountToSend > balance) {
      alert("Insufficient balance.");
      return;
    }

    setBalance((prevBalance) => prevBalance - amountToSend);

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
      }}
    >
      {/* Left column */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Wallet Balance</Typography>
          <Typography variant="h4">{balance.toFixed(2)} DOL</Typography>
        </Box>

        <Box
          sx={{
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
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
            <ContentCopyIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
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
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSendMoney} fullWidth>
            Send
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 2,
          border: "2px solid #000", 
          borderRadius: "8px", 
          padding: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Your Transactions
        </Typography>
        <Tabs
          value={filter}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All" value="All" />
          <Tab label="Sent" value="Sent" />
          <Tab label="Received" value="Received" />
        </Tabs>
        <TextField
          label="Search transactions by either other person's wallet address or by date"
          variant="outlined"
          fullWidth
          sx={{ marginY: 2 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TableContainer component={Paper}>
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
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                  <TableCell>
                    {transaction.type === "Sent" ? transaction.to : transaction.from}
                  </TableCell>
                  <TableCell>{transaction.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

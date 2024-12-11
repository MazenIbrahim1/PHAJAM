import { useState, useEffect } from "react";
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

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("http://localhost:18080/wallet/balance");
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
        }
      } catch (err) {
        console.log("Error fetching balance: ", err);
      }
    };

    const fetchAddress = async () => {
      try {
        const request = await fetch("http://localhost:18080/wallet/address");
        if (!request.ok) {
          throw new Error(`HTTP error! Status: ${request.status}`);
        }
        const response = await request.json();
        setAddress(response.address);
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };

    fetchBalance();
    fetchAddress();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const transactionsRequest = await fetch(
        "http://localhost:18080/wallet/getTransactionHistory"
      );
      if (!transactionsRequest.ok) {
        throw new Error(
          `Transactions fetch failed: ${transactionsRequest.status}`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  const handleSendMoney = async () => {
    try {
      const amountToSend = parseFloat(parseFloat(amount).toFixed(2));
      if (isNaN(amountToSend) || amountToSend <= 0) {
        alert("Please enter a valid amount.");
        return;
      }
      if (amountToSend > balance) {
        alert("Insufficient balance.");
        return;
      }

      const response = await fetch("http://localhost:18080/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: recipientAddress,
          amount: amountToSend,
        }),
      });

      const newTransaction = {
        id: transactions.length + 1,
        type: "Sent",
        amount: amountToSend,
        date: new Date().toISOString(),
        to: recipientAddress,
        status: "Completed",
      };
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);

      setRecipientAddress("");
      setAmount("");
      alert("Transaction successful!");
    } catch (err) {
      console.log("Error sending money: ", err);
    }
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

  const sortedTransactions = transactions.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
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
      return (
        transaction.txid?.toLowerCase().includes(searchTermLower) ||
        transaction.to?.toLowerCase().includes(searchTermLower) ||
        new Date(transaction.date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchTermLower)
      );
    });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 4,
        gap: 4,
        maxWidth: "1200px",
        margin: "0 auto",
        color: darkMode ? "#ffffff" : "#000000",
        backgroundColor: darkMode ? "#18191e" : "#ffffff",
        marginLeft: "14%",
      }}
    >
      {/* Top Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* Wallet Balance */}
        <Box
          sx={{
            padding: 2,
            border: "2px solid #b2dfdb",
            borderRadius: "8px",
            textAlign: "center",
            flex: 1,
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            minHeight: "150px", // Ensure consistent height
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Align content vertically
          }}
        >
          <Typography variant="h6">Wallet Balance</Typography>
          <Typography variant="h4">{balance} DC</Typography>
        </Box>

        {/* Wallet Address */}
        <Box
          sx={{
            padding: 2,
            border: "2px solid #b2dfdb",
            borderRadius: "8px",
            flex: 2,
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            minHeight: "150px", // Ensure consistent height
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Align content vertically
          }}
        >
          <Typography variant="h6">Wallet Address</Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              marginTop: "8px",
            }}
          >
            {address}
          </Typography>
          <IconButton onClick={handleCopyToClipboard} sx={{ marginLeft: 1 }}>
            <ContentCopyIcon sx={{ color: darkMode ? "#ffffff" : "#000000" }} />
          </IconButton>
        </Box>

        {/* Send Money */}
        <Box
          sx={{
            padding: 2,
            border: "2px solid #b2dfdb",
            borderRadius: "8px",
            flex: 2,
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            minHeight: "150px", // Ensure consistent height
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Align content vertically
          }}
        >
          <Typography variant="h6">Send Money</Typography>
          <TextField
            label="Recipient Wallet Address"
            variant="outlined"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            fullWidth
            sx={{
              marginBottom: 2,
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
            }}
          />
          <TextField
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            sx={{
              marginBottom: 2,
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
            }}
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: darkMode ? "#f06292" : "#000000",
              "&:hover": { backgroundColor: "#7a99d9" },
            }}
            onClick={handleSendMoney}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Bottom Row */}
      <Box
        sx={{
          border: "2px solid #b2dfdb",
          borderRadius: "8px",
          padding: 2,
          backgroundColor: darkMode ? "#333333" : "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="h5">Your Transactions</Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: darkMode ? "#f06292" : "#000000",
              "&:hover": { backgroundColor: "#7a99d9" },
            }}
            onClick={fetchTransactions}
          >
            Refresh Transactions
          </Button>
        </Box>
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
          <Tab label="All" value="All" />
          <Tab label="Sent" value="Sent" />
          <Tab label="Received" value="Received" />
        </Tabs>
        <TextField
          label="Search transactions"
          variant="outlined"
          fullWidth
          sx={{
            marginY: 2,
            backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {/* Updated Column Headers */}
                {[
                  "Transaction ID",
                  "Cost",
                  "Time of Transaction",
                  "Type",
                  "Status",
                  "Other Wallet Address",
                ].map((column) => (
                  <TableCell key={column}>
                    <TableSortLabel
                      active={
                        sortConfig.key ===
                        column.toLowerCase().replace(/ /g, "_")
                      }
                      direction={sortConfig.direction}
                      onClick={() =>
                        handleSort(column.toLowerCase().replace(/ /g, "_"))
                      }
                    >
                      {column}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.txid}>
                  <TableCell>{transaction.txid}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.to}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

import { useState } from "react";
import { Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Profile() {
  // State for balance and transactions
  const [balance, setBalance] = useState(100.50); // Initial Dolphincoin balance
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Received", amount: 50, date: "2024-10-01", from: "0xabcdef123456" },
    { id: 2, type: "Sent", amount: 25, date: "2024-10-05", to: "0x9876543210abcd" },
    // Add more transaction objects here as needed
  ]);
  const [address, setAddress] = useState("0x1234567890abcdef1234567890abcdef12345678"); // Example wallet address

  // State for form inputs
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  // Function to handle copying the wallet address
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  // Function to handle sending money
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

    // Update the balance
    setBalance((prevBalance) => prevBalance - amountToSend);

    // Add a new transaction
    const newTransaction = {
      id: transactions.length + 1,
      type: "Sent",
      amount: amountToSend,
      date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      to: recipientAddress,
    };
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);

    // Clear the input fields
    setRecipientAddress("");
    setAmount("");
    alert("Transaction successful!");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 2,
        gap: 4,
      }}
    >
      {/* Top row with wallet balance and address */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "800px",
          gap: 2,
        }}
      >
        {/* Wallet Balance Box */}
        <Box
          sx={{
            flex: 1,
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Wallet Balance</Typography>
          <Typography variant="h4">{balance.toFixed(2)} DOL</Typography>
        </Box>

        {/* Wallet Address Box */}
        <Box
          sx={{
            flex: 1,
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Wallet Address</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              {address}
            </Typography>
            <IconButton onClick={handleCopyToClipboard} sx={{ marginLeft: 1 }}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper} sx={{ maxWidth: "800px", width: "100%", marginTop: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount (DOL)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>
                  {transaction.type === "Received" ? transaction.from : transaction.to}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Send Money Section */}
      <Box
        sx={{
          maxWidth: "800px",
          width: "100%",
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">Send Money</Typography>
        <TextField
          label="Recipient Address"
          variant="outlined"
          fullWidth
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMoney}>
          Send Money
        </Button>
      </Box>
    </Box>
  );
}

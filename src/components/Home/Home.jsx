{/*import { Box, Typography, Container, List, ListItem, ListItemText, ListItemIcon} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Home() {
	return (
    	<Box
        	sx={{
          		ml:"13vw",
              pl:"5vw",
              pr:"5vw",
          		height: "100vh",
          		display: "flex",
          		flexDirection: "column",
          		justifyContent: "center",
          		alignItems: "center",
        	}}
      	>
        	<Box  
        		sx={{
            		display: "flex",
            		flexDirection:"column",
            		alignItems: "center",
            		justifyContent: "center",
            		bgcolor: "#e0f7fa", // Light teal background color
            		padding: "16px",
            		borderRadius: "8px", // Rounded corners
            		mb: "24px", // Margin bottom to separate from the next content
          		}}
        	>
        		<Box sx={{ display: "flex" }}>
            		<CheckCircleIcon sx={{ fontSize:50, color:"green", mr:".5vw"}} />
            		<Typography variant="h3" sx={{color:"green"}}>Connected to Dolphin Data Sharing</Typography>
          		</Box>
          		<Typography variant="h5" > Have a fabulous file sharing frenzy! </Typography>
        	</Box>

      		
        	<Box
           		sx={{
            		display: "flex",
            	  	justifyContent: "space-between",
            	  	width: "100%", // Controls the overall width of the boxes container
            	  	mb: "24px", // Space below the boxes
            	}}
        	>	
        		// First Box *
            	<Box
              		sx={{
                		width: "50%", // Each box takes up about half the container width
                		bgcolor: "#f1f1f1", // Light background for the box
                		padding: "16px",
                		borderRadius: "8px", // Rounded corners
                		mr:"1vw",
              		}}
            	>
            		<Typography variant="h5">In this beautiful app, you can find...</Typography>
    
                	<List>
                  		<ListItem>
                    		<ListItemIcon>
                    	  		<NetworkCheckIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="STATUS: Check your connection status and other stats."  />
                  		</ListItem>

                  		<ListItem>
                    		<ListItemIcon>
                    	  		<DescriptionIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="FILES: View and manage files." />
                  		</ListItem>

                  		<ListItem>
                    		<ListItemIcon>
                     			<TravelExploreIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="EXPLORE: View the list of files posted by your peers." />
                  		</ListItem>

                  		<ListItem>
							<ListItemIcon>
								<PeopleIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="PEERS: Connect with and view active peers." />
                  		</ListItem>

                  		<ListItem>
                    		<ListItemIcon>
                      			<SettingsIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="SETTINGS: Customize your node settings." />
                  		</ListItem>

                  		<ListItem>
                    		<ListItemIcon>
                      			<GitHubIcon />
                    		</ListItemIcon>
                    		<ListItemText primary="GITHUB: Access the Demure Data Sharing README." />
                  		</ListItem>
                	</List>                   
            	</Box>

            	// Second Box 
            	<Box
              		sx={{
                		width: "50%", // Each box takes up about half the container width
                		bgcolor: "#f1f1f1", // Light background for the box
                		padding: "16px",
                		borderRadius: "8px", // Rounded corners
                		ml:"1vw",
              		}}
            	>
              		<Typography variant="h5">What is Demure Data Sharing?</Typography>
              		<br />
              		<Typography>
                		We are building Demure Data Sharing, a mindful decentralized file-sharing application powered by DolphinCoin. This blockchain-based platform offers secure and private peer-to-peer file sharing with key features including STATUS to monitor connection and network performance, FILES for managing personal data, and EXPLORE to browse files shared by peers. Users can connect with active peers through PEERS, customize their node settings in SETTINGS, and access the project README via GITHUB. Demure Data Sharing ensures efficient, secure, and fully decentralized file sharing, enhancing privacy and control.
              		</Typography>
            	</Box>
        	</Box>

    		<Typography>Home Page by Amelia and Arpitha :DDD</Typography>

		</Box>
  );
}
*/}
import React from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
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
  const transactions = [
    { from: '0000000', to: '5555555', amount: 0.5 },
    { from: '1234567', to: '7654321', amount: 1.2 },
    { from: '9999999', to: '1111111', amount: 0.8 },
    { from: '2468101', to: '1024680', amount: 0.3 },
    { from: '6543210', to: '0123456', amount: 2.1 },
    { from: '7777777', to: '3333333', amount: 0.9 },
    { from: '8888888', to: '4444444', amount: 1.4 },
    { from: '5555555', to: '9999999', amount: 0.6 },
    { from: '1234321', to: '9876543', amount: 0.2 },
    { from: '3141592', to: '2718281', amount: .5 },
    { from: '9988776', to: '6655443', amount: 3.5 },
    { from: '4455667', to: '8899001', amount: 0.7 },
    { from: '1122334', to: '5566778', amount: 1.9 },
    { from: '6655443', to: '9988776', amount: 0.4 },
    { from: '7788990', to: '2233445', amount: 2.2 },
    { from: '9876543', to: '1234321', amount: 1.6 },
    { from: '1928374', to: '5647382', amount: 1.3 },
    { from: '1029384', to: '2938475', amount: 1.5 },
    { from: '4567890', to: '0987654', amount: 0.8 }
  ];

  const data = {
    labels: transactions.map((_, index) => `${index + 1}`), // Just show 1, 2, 3, etc.
    datasets: [
      {
        label: 'DolphinCoin Transactions',
        data: transactions.map(transaction => transaction.amount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Dolphin Coin Transactions Over Time',
        color: 'black',  
        font: { size: 24 },  
      },
    },
    scales: {
      x: { title: { display: true, text: 'Transaction Number' } },
      y: { title: { display: true, text: 'Amount (DolphinCoin)' }, beginAtZero: true }
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
        minHeight: '100vh', // Make sure the page takes the full viewport height
      }}
    >
      {/* Page Title */}
      <Typography variant="h3" sx={{ mb: "16px", mt: "16px" }}> 
        Welcome to Dolphin Data Sharing!
      </Typography>

      {/* Line Chart for Transactions */}
      <Box sx={{ mt: 2, width: '80vw', height: '300px', display: 'flex', justifyContent: 'center' }}> 
        <Line data={data} options={options} />
      </Box>

      {/* scrollable tableeeeee */}
      <TableContainer component={Paper} sx={{ mt: 4, maxWidth: '80vw', maxHeight: '300px', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
              <TableCell>Transaction Number</TableCell> {/* transaction # */}
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount (DolphinCoin)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell> 
                <TableCell>{transaction.from}</TableCell>
                <TableCell>{transaction.to}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Button always visible at the bottom !! */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          pb: '16px', 
        }}
      >
        <Typography variant="h4" sx={{ mb: "16px" }}>
          Start Mining
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          sx={{ 
            padding: "18px 36px",  
            fontSize: "1.6rem",  
            borderRadius: "8px"
          }}
        >
          Mine Dolphin Coin!
        </Button>
      </Box>
    </Box>
  );
}


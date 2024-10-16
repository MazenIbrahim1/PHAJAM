import { Box, Typography, Container, List, ListItem, ListItemText, ListItemIcon} from "@mui/material";
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

      		{/* Two side-by-side boxes */}
        	<Box
           		sx={{
            		display: "flex",
            	  	justifyContent: "space-between",
            	  	width: "100%", // Controls the overall width of the boxes container
            	  	mb: "24px", // Space below the boxes
            	}}
        	>	
        		{/* First Box */}
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

            	{/* Second Box */}
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

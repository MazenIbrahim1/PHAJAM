import { Box, Typography, TextField, Button } from "@mui/material";

export default function SettingsPage() {
  return (
    <Box
      sx={{
        width: "98vw",          // Full width of the viewport
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,                   // Space between the boxes
        overflowY: "auto",        // Allow vertical scrolling
        overflowX: "hidden",      // Prevent horizontal scrolling
        height: "100vh",          // Full height for scrolling
        boxSizing: "border-box",  // Ensure padding doesn't affect width
      }}
    >
      {/* Box 1 */}
      <Box
        sx={{
          width: "81vw",    
          maxWidth: "81vw",           
          marginLeft: "13vw",           // Shift to the right to make space for sidebar
          backgroundColor: "#f0f0f0",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "170px",
        }}
      >
        <Typography variant="h6"  sx={{ marginBottom: 1, color: "#0d47a1"}}>
          RPC API ADDRESS
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          If your node is configured with a{" "}
          <Typography variant="body2" component="span" sx={{ color: "#0d47a1" }}>
            custom RPC API address
          </Typography>
          , including a port other than the default 5001, enter it here.
        </Typography>

        <TextField variant="outlined" placeholder="Enter a URL (http://127.0.0.5001) or a Multiaddr (/ip4/127.0.0.1/tcp/5001)" fullWidth sx={{ marginBottom: 2}} InputProps={{
          sx: { height: "40px", 
                backgroundColor: "white", 
                color: "black",
                "& input::placeholder": {  // Target the placeholder text color
                  color: "black",
                  opacity: 0.75,
                }
              }}}/>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained">Save</Button>
        </Box>
      </Box>

      {/* Box 2 */}
      <Box
        sx={{
          width: "81vw",    
          maxWidth: "81vw",  
          marginLeft: "13vw",         
          backgroundColor: "#f0f0f0",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "170px",
        }}
      >
        <Typography variant="h6"  sx={{ marginBottom: 1, color: "#0d47a1"}}>
          PUBLIC GATEWAY
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          Choose which{" "}
          <Typography variant="body2" component="span" sx={{ color: "#0d47a1" }}>
            public gateway
          </Typography>
          {" "} you want to use when generating shareable links.
        </Typography>

        <TextField variant="outlined" placeholder="Enter a URL (http://dweb.link)" fullWidth sx={{ marginBottom: 2}} InputProps={{
          sx: { height: "40px", 
                backgroundColor: "white", 
                color: "black",
                "& input::placeholder": {  // Target the placeholder text color
                  color: "black",
                  opacity: 0.75,
                }
              }}}/>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end", 
            gap: 2, 
            alignItems: "center",             // Ensure both buttons are aligned
          }}
        >
          {/* Left-side button */}
          <Button variant="contained" color="secondary">
            Reset
          </Button>

          {/* Right-side button */}
          <Button variant="contained">
            Save
          </Button>
        </Box>
      </Box>

      {/* Box 3 */}
      <Box
        sx={{
          width: "81vw",
          maxWidth: "81vw",
          marginLeft: "13vw", // Shift to the right to make space for sidebar
          backgroundColor: "#f0f0f0",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "top-down",
          minHeight: "300px", // Set minHeight to ensure height is applied
          height: "auto",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 1, color: "#0d47a1" }}>
          DDS PUBLISHING KEYS
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Demure Data Sharing (DDS) provides cryptographic addresses for publishing updates to content that is expected to change over time. This feature requires your node to be online at least once a day to ensure DDS records are kept alive on the public DHT.
          <Typography variant="body2" component="span" sx={{ color: "#0d47a1" }}>
            {" "}Learn more.
          </Typography>
        </Typography>

        {/* Table for Name and ID */}
        <Box
          component="table"
          sx={{
            width: "100%",
            backgroundColor: "white",
            borderCollapse: "collapse", // Prevent space between borders
            marginTop: 2
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  color: "#0d47a1",
                  width: "40%"
                }}
              >
                Name
              </td>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  color: "#0d47a1",
                  width: "60%"
                }}
              >
                ID
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  width: "40%",
                  height: "40px"
                }}
              >
                Demure Dolphin
              </td>
              <td
                 style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  width: "60%",
                  height: "40px"
                }}
              >
                b6k9n1f4p3w0e8z5q2r7j8m6x1h4d9t
              </td>
            </tr>
          </tbody>
        </Box>


        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2

         }}>
          <Button variant="contained"> + Generate Key</Button>
        </Box>
      </Box>


      {/* Box 4 */}
      <Box
        sx={{
          width: "81vw",
          maxWidth: "81vw",
          marginLeft: "13vw", // Shift to the right to make space for sidebar
          backgroundColor: "#f0f0f0",
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "top-down",
          minHeight: "320px", // Set minHeight to ensure height is applied
          height: "auto",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 1, color: "#0d47a1" }}>
          PINNING SERVICES
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Use local pinning when you want to ensure an item on your node is never garbage-collected, even if you remove it from Files. You can also link your accounts with other remote pinning services to automatically or selectively persist files with those providers, enabling you to keep backup copies of your first files and/or make them available to others when your local node is offline. 
          <Typography variant="body2" component="span" sx={{ color: "#0d47a1" }}>
            {" "}Learn more.
          </Typography>
        </Typography>

        {/* Table for Name and ID */}
        <Box
          component="table"
          sx={{
            width: "100%",
            backgroundColor: "white",
            borderCollapse: "collapse", // Prevent space between borders
            marginTop: 2
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  color: "#0d47a1",
                  width: "60%"
                }}
              >
                Service
              </td>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  color: "#0d47a1",
                  width: "20%"
                }}
              >
                Pins
              </td>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  color: "#0d47a1",
                  width: "20%"
                }}
              >
                Auto Upload
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  width: "60%",
                  height: "40px"
                }}
              >
                Local Pinning
              </td>
              <td
                 style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  width: "20%",
                  height: "40px"
                }}
              >
                1
              </td>
              <td
                 style={{
                  border: "1px solid #dcdcdc", // Light gray border
                  padding: "8px",
                  textAlign: "left",
                  width: "20%",
                  height: "40px"
                }}
              >
                -
              </td>
            </tr>
          </tbody>
        </Box>


        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2

         }}>
          <Button variant="contained"> + Add Service</Button>
        </Box>
      </Box>

    </Box>
  );
}

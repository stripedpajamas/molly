# Molly
The Quo Vadis DNS Update Tool

## Installation
Download from the [releases](https://github.com/stripedpajamas/molly/releases) page, then copy to the proper place:

Windows: `C:\QVDNS\Molly.exe`

Mac: `/Applications/Utilities/Molly`

Run the program to have it set up a scheduled task to update the custom DNS record.

### Caveats
The Mac's scheduled task is running in the user domain, so it will only update the DNS while the user is logged in. 

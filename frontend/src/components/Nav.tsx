import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton'; // For the menu icon on smaller screens
import MenuIcon from '@mui/icons-material/Menu'; // The actual menu icon
import Box from '@mui/material/Box'; // For responsive layout

const pages = [
  {
    label: 'Services',
    dropdown: ['Service 1', 'Service 2', 'Service 3']
  },
  {
    label: 'Media',
    dropdown: ['Photos', 'Videos', 'News']
  },
  {
    label: 'Locations',
    dropdown: ['Location A', 'Location B']
  },
  {
    label: 'Education',
    dropdown: ['Courses', 'Workshops']
  },
  'Publications',
  'Jobs',
  'Contact Us'
];

const Nav = () => {
  const [anchorElNav, setAnchorElNav] = useState(null); // For the main navbar menu on small screens
  const [anchorEl, setAnchorEl] = useState(null); // For the dropdown menus
  const [selectedDropdown, setSelectedDropdown] = useState(null); // To track which dropdown is open

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenMenu = (event, dropdown) => {
    setAnchorEl(event.currentTarget);
    setSelectedDropdown(dropdown);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedDropdown(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#e0f2f7', color: '#1a237e' }}> {/* Light Blue and Dark Blue-Indigo Theme */}
      <Toolbar>
        {/* Responsive Menu Button (Hidden on larger screens) */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            {/* Map through pages for the drawer */}
            {pages.map((page) => (
              <MenuItem key={page.label || page} onClick={handleCloseNavMenu}>
                <Button
                  sx={{ color: '#1a237e' }} // Dark Blue-Indigo color for text
                  href={page.label ? `/${page.label.toLowerCase()}` : `/${page.toLowerCase()}`} // Dynamic href
                >
                  {page.label || page}
                </Button>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Logo (You can replace this with your actual logo) */}
        <Box component="img" src="public/logo.jpg" alt="Your Logo" sx={{ height: 40, display: { xs: 'none', md: 'block' }, mr: 2 }} /> {/* Adjust height as needed */}

        {/* Navbar Buttons (Visible on medium screens and up) */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {pages.map((page) => (
            <React.Fragment key={page.label || page}>
              <Button
                onClick={(e) => page.dropdown ? handleOpenMenu(e, page.label) : null}
                sx={{ my: 2, color: '#1a237e', display: 'block' }} // Dark Blue-Indigo color for text
                href={page.label ? `/${page.label.toLowerCase()}` : `/${page.toLowerCase()}`} // Dynamic href
              >
                {page.label || page}
              </Button>
              {page.dropdown && (
                <Menu
                  anchorEl={anchorEl}
                  open={selectedDropdown === page.label}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-menu-button',
                  }}
                >
                  {page.dropdown.map((dropdownItem) => (
                    <MenuItem key={dropdownItem} onClick={handleCloseMenu}>
                      {dropdownItem}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
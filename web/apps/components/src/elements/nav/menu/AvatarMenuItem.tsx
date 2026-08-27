import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import { Avatar } from '@mui/material';

export interface AvatarMenuItemProps {
  menuItems?: { label: string; onClick?: () => void }[];
  src?: string;
  name: string;
}

export const AvatarMenuItem: React.FC<AvatarMenuItemProps> = ({ menuItems, src, name }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <>
      <IconButton
        color="inherit"
        onClick={menuItems?.length > 0 ? handleAvatarClick : undefined}
        size="small"
      >
        <Avatar src={src}>{!src && name ? name[0] : null}</Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuItems?.map((it, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              it.onClick?.();
              handleClose();
            }}
          >
            {it.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AvatarMenuItem;

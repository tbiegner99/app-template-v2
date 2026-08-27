import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { MenuItemProps, default as MenuItem } from './MenuItem';

export interface AccordionMenuProps {
  title: string;
  icon?: React.ReactNode;
  items?: MenuItemProps[];
  defaultOpen?: boolean;
}

export const AccordionMenu: React.FC<AccordionMenuProps> = ({
  title,
  icon,
  items = [],
  defaultOpen,
}) => {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const toggle = () => setOpen((s) => !s);

  return (
    <List disablePadding>
      <ListItemButton dense onClick={items?.length > 0 ? toggle : undefined} sx={{ px: 2 }}>
        {icon ? <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon> : null}
        <ListItemText primary={title} primaryTypographyProps={{ variant: 'body2' }} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((it, i) => (
            <MenuItem key={i} {...it} sx={{ pl: 4 }} />
          ))}
        </List>
      </Collapse>
    </List>
  );
};

export default AccordionMenu;

import React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import LanguageIcon from '@mui/icons-material/Language';
import Tooltip from '@mui/material/Tooltip';
import { useI18n } from '../../..';

export type Lang = { code: string; label: string; flag?: string };

export interface LanguageSelectorProps {
  languages?: Language[];
  value?: string;
  onChange?: (code: string) => void;
}

const langs: Lang[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];
export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
}

const defaultLanguages: Language[] = [Language.EN, Language.ES, Language.FR, Language.DE];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages = defaultLanguages,
  value,
  onChange,
}) => {
  const { setLocale } = useI18n();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const langData: Lang[] = languages.map((code) => {
    return langs.find((l) => l.code === code);
  });
  const current = langData.find((l) => l.code === value) || langData[0];

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (code: string) => {
    onChange?.(code);
    setLocale(code);
    handleClose();
  };

  return (
    <>
      <Tooltip title={`Language: ${current.label}`}>
        <IconButton color="inherit" onClick={handleOpen} size="small">
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {langData.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === current.code}
            onClick={() => handleSelect(lang.code)}
          >
            <ListItemIcon sx={{ minWidth: 50, color: 'text.primary' }}>{lang.flag}</ListItemIcon>
            <ListItemText>{lang.label}</ListItemText>
            {lang.code === current.code ? <CheckIcon fontSize="small" sx={{ ml: 1 }} /> : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;

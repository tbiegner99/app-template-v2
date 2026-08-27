import React from 'react';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionProps {
  summary: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  onChange?: (expanded: boolean) => void;
  square?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  summary,
  children,
  defaultExpanded,
  disabled,
  onChange,
  square,
}) => {
  const handleChange = (_: React.SyntheticEvent, expanded: boolean) => {
    onChange?.(expanded);
  };

  return (
    <MuiAccordion defaultExpanded={defaultExpanded} disabled={disabled} onChange={handleChange} square={square}>
      <MuiAccordionSummary expandIcon={<ExpandMoreIcon />}>
        {typeof summary === 'string' ? <Typography>{summary}</Typography> : summary}
      </MuiAccordionSummary>
      <MuiAccordionDetails>{children}</MuiAccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;

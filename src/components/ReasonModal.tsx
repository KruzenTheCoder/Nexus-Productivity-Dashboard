// src/components/ReasonModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Typography,
  Fade
} from '@mui/material';

export default function ReasonModal({
  open,
  statusLabel,
  reasons,
  onClose,
  onConfirm
}: {
  open: boolean;
  statusLabel?: string;
  reasons: string[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [value, setValue] = React.useState(reasons[0] || 'Other');

  React.useEffect(() => {
    if (reasons?.length) setValue(reasons[0]);
    else setValue('Other');
  }, [reasons, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionComponent={Fade}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 3,                // ~24px
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        }
      }}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0,0,0,0.6)' } // dim backdrop like your screenshot
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h6" fontWeight={800}>Select reason</Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Select
          size="small"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          {(reasons?.length ? reasons : ['Other']).map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, fontWeight: 800 }}
          onClick={() => onConfirm(value)}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
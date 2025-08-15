import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Fade,
} from '@mui/material';

export default function ComposeMessageDialog({
  open,
  onClose,
  onSend,
  title = 'Message',
}: {
  open: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  title?: string;
}) {
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    if (open) setText('');
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Fade}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        },
      }}
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.6)' } }}
    >
      {/* DialogTitle is a heading h2 by default; do not nest a heading inside it */}
      <DialogTitle component="div" sx={{ fontWeight: 800 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (text.trim()) onSend(text.trim());
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
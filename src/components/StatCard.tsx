import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h6" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{String(value)}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
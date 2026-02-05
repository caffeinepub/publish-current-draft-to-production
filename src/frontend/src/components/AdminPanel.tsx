import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield } from 'lucide-react';

export default function AdminPanel() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          You have administrator privileges for this application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Admin controls and monitoring features are available through the backend interface.
        </p>
      </CardContent>
    </Card>
  );
}

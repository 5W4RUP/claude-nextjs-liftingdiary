import { auth } from '@clerk/nextjs/server';

export default async function DebugPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <div className="bg-card border rounded p-4">
          <p className="text-sm font-mono break-all">
            <strong>Your User ID:</strong> {userId || 'Not authenticated'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Copy this ID and provide it to insert sample workout data for your account.
          </p>
        </div>
      </div>
    </div>
  );
}

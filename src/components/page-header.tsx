import { Leaf } from 'lucide-react';

export function PageHeader() {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3 sm:px-6">
        <Leaf className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-bold text-foreground sm:text-3xl">
          TeaLeaf AI
        </h1>
      </div>
    </header>
  );
}

import { PageHeader } from "@/components/page-header";
import { TeaLeafClient } from "@/components/tea-leaf-client";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <TeaLeafClient />
      </main>
    </div>
  );
}

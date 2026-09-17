import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { cardClass } from "@/lib/ui";

export default function SignupPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-grid">
      <div className={`${cardClass} p-8 sm:p-10 flex flex-col items-center w-full max-w-sm`}>
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          Create your account
        </h1>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </main>
  );
}

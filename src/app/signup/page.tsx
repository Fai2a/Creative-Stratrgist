import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}

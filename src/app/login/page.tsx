import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to SocioLite
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}

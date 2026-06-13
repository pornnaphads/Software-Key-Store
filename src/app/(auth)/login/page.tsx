import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    registered?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      callbackUrl={params.callbackUrl}
      registered={params.registered === "1"}
    />
  );
}

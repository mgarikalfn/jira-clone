import { SignInCard } from "@/features/auth/components/sign-in-card";
import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

const SignInPage = async () => {
  const user = await getCurrent();

  if (user) redirect("/");
  return (
    <div>
      <SignInCard />
    </div>
  );
};

export default SignInPage;

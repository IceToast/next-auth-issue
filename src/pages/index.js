import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const { data, status } = useSession();
  console.log("sessionData", data);

  if (status === "authenticated") {
    return <div> You are logged in!</div>;
  }

  return (
    <div>
      {"Login via OAuth -> Google"}
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
};
export default LoginPage;

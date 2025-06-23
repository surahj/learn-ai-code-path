import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@/contexts/AuthContext";

interface GoogleSignInProps {
  buttonText?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  buttonText = "Sign in with Google",
}) => {
  const { googleLogin, setCurrentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const { user } = await googleLogin(credentialResponse.credential);
        setCurrentUser(user as User);
        toast({
          title: "Success",
          description: "Logged in successfully.",
        });
        navigate("/dashboard");
      } catch (error: unknown) {
        console.error("Google login failed:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        toast({
          title: "Google Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      console.error("Google login failed: no credential response");
      toast({
        title: "Google Login Failed",
        description:
          "Did not receive credential from Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.error("Google login failed");
          toast({
            title: "Google Login Error",
            description: "An error occurred during Google login.",
            variant: "destructive",
          });
        }}
        useOneTap={false}
        width="100%"
        theme="outline"
        size="large"
        text={
          buttonText === "Sign up with Google" ? "signup_with" : "signin_with"
        }
      />
    </div>
  );
};

export default GoogleSignIn;

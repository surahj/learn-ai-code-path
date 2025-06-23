import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Mail, Lock, ArrowLeft, KeyRound } from "lucide-react";

interface FormErrors {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}

// Step 1: Email Input Component
const EmailInputStep: React.FC<{
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}> = ({ email, setEmail, onSubmit, isSubmitting, error }) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      onSubmit();
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <Brain className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a password reset OTP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Sending..." : "Send Reset OTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 2: OTP Verification Component
const OTPVerificationStep: React.FC<{
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerify: () => void;
  onResend: () => void;
  isSubmitting: boolean;
  isResending: boolean;
  error: string | null;
  successMessage: string | null;
}> = ({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  isSubmitting,
  isResending,
  error,
  successMessage,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateOTP = (): boolean => {
    const newErrors: FormErrors = {};
    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit OTP";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateOTP()) {
      onVerify();
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>
          Enter the OTP sent to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="mb-4">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password (OTP)</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className={errors.otp ? "border-red-500" : ""}
            />
            {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
          </div>
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the OTP?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onResend}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 3: New Password Component
const NewPasswordStep: React.FC<{
  email: string;
  otp: string;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}> = ({
  email,
  otp,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePassword = (): boolean => {
    const newErrors: FormErrors = {};
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword()) {
      onSubmit();
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`pl-10 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to send reset OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // For password reset, we just need to verify the OTP is valid
      // The actual password reset happens in the next step
      setStep(3);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await forgotPassword(email);
      setSuccessMessage(response.message);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword({ email, otp, password });
      // Redirect to login page with success message
      navigate("/login", {
        state: {
          message:
            "Password reset successfully! You can now log in with your new password.",
        },
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {step === 1 && (
          <EmailInputStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}

        {step === 2 && (
          <OTPVerificationStep
            email={email}
            otp={otp}
            setOtp={setOtp}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            isSubmitting={isSubmitting}
            isResending={isResending}
            error={error}
            successMessage={successMessage}
          />
        )}

        {step === 3 && (
          <NewPasswordStep
            email={email}
            otp={otp}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handlePasswordReset}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { User, Settings } from "lucide-react";

interface UserProfile {
  age: number;
  level: string;
  background: string;
  preferred_language: string;
  interests: string;
  country: string;
}

interface UserProfileSetupProps {
  onProfileComplete: (profile: UserProfile) => void;
  loading?: boolean;
  onBack?: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  onProfileComplete,
  loading = false,
  onBack,
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    level: "beginner",
    background: "",
    preferred_language: "English",
    interests: "",
    country: "US",
  });

  const { currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileComplete(profile);
  };

  const countries = [
    { code: "US", name: "United States" },
    { code: "NG", name: "Nigeria" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IN", name: "India" },
    { code: "BR", name: "Brazil" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "CN", name: "China" },
    { code: "RU", name: "Russia" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "FI", name: "Finland" },
    { code: "CH", name: "Switzerland" },
    { code: "AT", name: "Austria" },
    { code: "BE", name: "Belgium" },
    { code: "IE", name: "Ireland" },
    { code: "NZ", name: "New Zealand" },
    { code: "SG", name: "Singapore" },
    { code: "MY", name: "Malaysia" },
    { code: "TH", name: "Thailand" },
    { code: "VN", name: "Vietnam" },
    { code: "PH", name: "Philippines" },
    { code: "ID", name: "Indonesia" },
    { code: "MX", name: "Mexico" },
    { code: "AR", name: "Argentina" },
    { code: "CL", name: "Chile" },
    { code: "CO", name: "Colombia" },
    { code: "PE", name: "Peru" },
    { code: "VE", name: "Venezuela" },
    { code: "ZA", name: "South Africa" },
    { code: "EG", name: "Egypt" },
    { code: "KE", name: "Kenya" },
    { code: "GH", name: "Ghana" },
    { code: "ET", name: "Ethiopia" },
    { code: "UG", name: "Uganda" },
    { code: "TZ", name: "Tanzania" },
    { code: "RW", name: "Rwanda" },
    { code: "BW", name: "Botswana" },
    { code: "ZM", name: "Zambia" },
    { code: "ZW", name: "Zimbabwe" },
    { code: "MW", name: "Malawi" },
    { code: "MZ", name: "Mozambique" },
    { code: "AO", name: "Angola" },
    { code: "NA", name: "Namibia" },
    { code: "LS", name: "Lesotho" },
    { code: "SZ", name: "Eswatini" },
    { code: "MG", name: "Madagascar" },
    { code: "MU", name: "Mauritius" },
    { code: "SC", name: "Seychelles" },
    { code: "CV", name: "Cape Verde" },
    { code: "GW", name: "Guinea-Bissau" },
    { code: "SL", name: "Sierra Leone" },
    { code: "LR", name: "Liberia" },
    { code: "CI", name: "Ivory Coast" },
    { code: "BF", name: "Burkina Faso" },
    { code: "ML", name: "Mali" },
    { code: "NE", name: "Niger" },
    { code: "TD", name: "Chad" },
    { code: "SD", name: "Sudan" },
    { code: "SS", name: "South Sudan" },
    { code: "CF", name: "Central African Republic" },
    { code: "CM", name: "Cameroon" },
    { code: "GQ", name: "Equatorial Guinea" },
    { code: "GA", name: "Gabon" },
    { code: "CG", name: "Republic of the Congo" },
    { code: "CD", name: "Democratic Republic of the Congo" },
    { code: "BI", name: "Burundi" },
    { code: "DJ", name: "Djibouti" },
    { code: "ER", name: "Eritrea" },
    { code: "SO", name: "Somalia" },
    { code: "KM", name: "Comoros" },
    { code: "YT", name: "Mayotte" },
    { code: "RE", name: "Réunion" },
    { code: "ST", name: "São Tomé and Príncipe" },
    { code: "EH", name: "Western Sahara" },
    { code: "MA", name: "Morocco" },
    { code: "DZ", name: "Algeria" },
    { code: "TN", name: "Tunisia" },
    { code: "LY", name: "Libya" },
    { code: "MR", name: "Mauritania" },
    { code: "SN", name: "Senegal" },
    { code: "GM", name: "Gambia" },
    { code: "GN", name: "Guinea" },
    { code: "TG", name: "Togo" },
    { code: "BJ", name: "Benin" },
    { code: "NG", name: "Nigeria" },
  ];

  const levels = [
    { value: "beginner", label: "Beginner - Just starting out" },
    { value: "intermediate", label: "Intermediate - Some experience" },
    { value: "advanced", label: "Advanced - Experienced learner" },
    { value: "expert", label: "Expert - Deep knowledge" },
  ];

  const backgrounds = [
    "Student",
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "Designer",
    "Marketing Professional",
    "Sales Professional",
    "Teacher/Educator",
    "Healthcare Professional",
    "Finance Professional",
    "Legal Professional",
    "Entrepreneur",
    "Freelancer",
    "Unemployed",
    "Retired",
    "Other",
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese (Mandarin)",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Bengali",
    "Urdu",
    "Turkish",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Polish",
    "Czech",
    "Hungarian",
    "Romanian",
    "Bulgarian",
    "Greek",
    "Hebrew",
    "Persian",
    "Thai",
    "Vietnamese",
    "Indonesian",
    "Malay",
    "Filipino",
    "Swahili",
    "Yoruba",
    "Hausa",
    "Igbo",
    "Amharic",
    "Zulu",
    "Xhosa",
    "Afrikaans",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </Button>
            )}
            <div className="flex-1"></div>
          </div>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Help us personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      age: parseInt(e.target.value) || 25,
                    })
                  }
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={profile.country}
                  onValueChange={(value) =>
                    setProfile({ ...profile, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Experience Level</Label>
                <Select
                  value={profile.level}
                  onValueChange={(value) =>
                    setProfile({ ...profile, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Professional Background</Label>
                <Select
                  value={profile.background}
                  onValueChange={(value) =>
                    setProfile({ ...profile, background: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your background" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgrounds.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={profile.preferred_language}
                  onValueChange={(value) =>
                    setProfile({ ...profile, preferred_language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">
                Interests & Learning Goals (Optional)
              </Label>
              <Textarea
                id="interests"
                placeholder="Tell us about your interests, hobbies, or specific learning goals. This helps us personalize your experience."
                value={profile.interests}
                onChange={(e) =>
                  setProfile({ ...profile, interests: e.target.value })
                }
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Examples: "I love coding, want to learn AI, interested in web
                development"
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={
                loading ||
                !profile.age ||
                !profile.country ||
                !profile.level ||
                !profile.background
              }
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Profile...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Complete Profile Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileSetup;

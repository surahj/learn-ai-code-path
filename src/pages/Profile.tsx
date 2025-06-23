import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../contexts/AuthContext";
import authAPI from "../api/auth";
import { User, Settings, ArrowLeft, Save, Edit } from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  daily_commitment: number;
  learning_goal: string;
  age?: number;
  level?: string;
  background?: string;
  preferred_language?: string;
  interests?: string;
  country?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    age: 25,
    level: "beginner",
    background: "",
    preferred_language: "English",
    interests: "",
    country: "US",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const userData = await authAPI.getProfile(token);
      setProfile(userData as UserProfile);

      // Initialize edit form with current values
      setEditForm({
        age: (userData as UserProfile).age || 25,
        level: (userData as UserProfile).level || "beginner",
        background: (userData as UserProfile).background || "",
        preferred_language:
          (userData as UserProfile).preferred_language || "English",
        interests: (userData as UserProfile).interests || "",
        country: (userData as UserProfile).country || "US",
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError(null);

      await authAPI.updateProfile(token, editForm);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Reload profile to get updated data
      await loadProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="user-controls">
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Profile Settings
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Manage your account information and preferences
                </p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Your personal details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Email
                    </Label>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Name
                    </Label>
                    <p className="text-sm text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Profile Details
                  </CardTitle>
                  <CardDescription>
                    Additional information to personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="13"
                            max="120"
                            value={editForm.age}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                age: parseInt(e.target.value) || 25,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={editForm.country}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, country: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.code}
                                  value={country.code}
                                >
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="level">Experience Level</Label>
                          <Select
                            value={editForm.level}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, level: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="background">
                            Professional Background
                          </Label>
                          <Select
                            value={editForm.background}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, background: value })
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
                            value={editForm.preferred_language}
                            onValueChange={(value) =>
                              setEditForm({
                                ...editForm,
                                preferred_language: value,
                              })
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
                          Interests & Learning Goals
                        </Label>
                        <Textarea
                          id="interests"
                          placeholder="Tell us about your interests, hobbies, or specific learning goals."
                          value={editForm.interests}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              interests: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            // Reset form to current values
                            setEditForm({
                              age: profile.age || 25,
                              level: profile.level || "beginner",
                              background: profile.background || "",
                              preferred_language:
                                profile.preferred_language || "English",
                              interests: profile.interests || "",
                              country: profile.country || "US",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Age
                        </Label>
                        <p className="text-sm text-gray-900">
                          {profile.age || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Country
                        </Label>
                        <p className="text-sm text-gray-900">
                          {countries.find((c) => c.code === profile.country)
                            ?.name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Experience Level
                        </Label>
                        <p className="text-sm text-gray-900">
                          {levels.find((l) => l.value === profile.level)
                            ?.label || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Professional Background
                        </Label>
                        <p className="text-sm text-gray-900">
                          {profile.background || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Preferred Language
                        </Label>
                        <p className="text-sm text-gray-900">
                          {profile.preferred_language || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Interests & Goals
                        </Label>
                        <p className="text-sm text-gray-900">
                          {profile.interests || "Not specified"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

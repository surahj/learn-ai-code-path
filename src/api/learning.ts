// src/api/learning.ts
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://ai-mentor-backend-w5gs.onrender.com";

// Backend request interfaces
interface StructureRequest {
  goal: string;
  total_weeks: number;
  daily_commitment: number;
}

interface ContentRequest {
  plan_id: number;
  week_number: number;
  user_progress: Record<string, unknown>;
}

interface DailyMilestone {
  day_number: number;
  topic: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
}

// Backend response interfaces
interface ErrorResponse {
  error_code: number;
  error_message: string;
}

interface SuccessResponse {
  status: number;
  message: string;
  data: Record<string, unknown>;
}

interface LearningPlanStructure {
  id: number;
  user_id: number;
  goal: string;
  total_weeks: number;
  structure: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface WeeklyTheme {
  week_number: number;
  theme: string;
  objectives: string[];
  key_concepts: string[];
  prerequisites: string[];
}

interface CompleteLearningPlan {
  id: number;
  goal: string;
  total_weeks: number;
  daily_commitment_minutes: number;
  weekly_themes: WeeklyTheme[];
  prerequisites: Record<string, string[]>;
  adaptive_rules: Record<string, string>;
}

interface WeeklyContent {
  theme: string;
  objectives: string[];
  key_concepts: string[];
  prerequisites: string[];
  daily_milestones: DailyMilestone[];
  adaptive_notes: string;
}

interface Resource {
  type: string;
  title: string;
  url: string;
  description: string;
}

interface DailyContent {
  id: number;
  plan_id: number;
  week_number: number;
  day_number: number;
  content: LessonContent;
  exercises: Record<string, unknown>;
  resources: Resource[];
}

interface LessonContent {
  title: string;
  summary: string;
  explanation: string;
  key_points: string[];
}

interface ValidateGoalRequest {
  goal: string;
}

interface ValidateGoalResponse {
  appropriate: boolean;
  reason: string;
}

const learningAPI = {
  // GET /learnings - Get user's learning plans
  getLearnings: async (token: string): Promise<LearningPlanStructure[]> => {
    try {
      const response = await axios.get<SuccessResponse>(
        `${API_URL}/learnings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Learnings response:", response.data);
      return response.data.data as unknown as LearningPlanStructure[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Get learnings error:",
        axiosError.response?.data || axiosError.message
      );

      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      throw new Error(axiosError.message || "Failed to fetch learning plans");
    }
  },

  // POST /learnings/structure - Generate learning plan structure
  generatePlanStructure: async (
    token: string,
    request: StructureRequest
  ): Promise<{ id: number; plan: CompleteLearningPlan }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/learnings/structure`,
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Generate plan structure response:", response.data);

      if (!response.data.data?.id || !response.data.data?.plan) {
        throw new Error("Invalid response format from server");
      }

      const data = response.data.data as {
        id: number;
        plan: CompleteLearningPlan;
      };
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Generate plan structure error:",
        axiosError.response?.data || axiosError.message
      );

      // Handle backend error response
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      // Handle network errors
      if (
        axiosError.code === "NETWORK_ERROR" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }

      // Handle timeout errors
      if (axiosError.code === "ECONNABORTED") {
        throw new Error("Request timed out. Please try again.");
      }

      // Handle other errors
      throw new Error(
        axiosError.message || "Failed to generate learning plan structure"
      );
    }
  },

  // GET /learnings/structure/{id} - Get specific plan structure
  getPlanStructure: async (
    token: string,
    planId: number
  ): Promise<{ id: number; plan: CompleteLearningPlan }> => {
    try {
      const response = await axios.get<SuccessResponse>(
        `${API_URL}/learnings/structure/${planId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Get plan structure raw response:", response);
      console.log("Get plan structure response.data:", response.data);
      console.log("Get plan structure response.data.data:", response.data.data);

      if (!response.data.data) {
        console.error("No data field in response:", response.data);
        throw new Error("Invalid response format from server");
      }

      const data = response.data.data as {
        id: number;
        plan: CompleteLearningPlan;
      };

      console.log("Parsed data:", data);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Get plan structure error:",
        axiosError.response?.data || axiosError.message
      );

      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      throw new Error(axiosError.message || "Failed to fetch plan structure");
    }
  },

  // GET /learnings/weekly-content/{week_number}/{plan_id} - Get weekly content
  getWeekContent: async (
    token: string,
    planId: number,
    weekNumber: number
  ): Promise<WeeklyContent> => {
    try {
      const response = await axios.get<SuccessResponse>(
        `${API_URL}/learnings/weekly-content/${weekNumber}/${planId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data as unknown as WeeklyContent;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        // This is not a "real" error, it just means content hasn't been generated yet.
        // We'll throw a specific error to handle this case.
        throw new Error("NOT_FOUND");
      }
      console.error(
        "Get week content error:",
        axiosError.response?.data || axiosError.message
      );
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(axiosError.message || "Failed to fetch weekly content");
    }
  },

  // POST /learnings/weekly-content - Generate weekly content
  generateWeekContent: async (
    token: string,
    request: ContentRequest
  ): Promise<{ id: number; content: WeeklyContent }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/learnings/weekly-content`,
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Generate week content response:", response.data);
      const data = response.data.data as { id: number; content: WeeklyContent };
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Generate week content error:",
        axiosError.response?.data || axiosError.message
      );

      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      throw new Error(
        axiosError.message || "Failed to generate weekly content"
      );
    }
  },

  // GET /learnings/daily-content/{day_number}/{week_number}/{plan_id} - Get daily content
  getDailyContent: async (
    token: string,
    planId: number,
    weekNumber: number,
    dayNumber: number
  ): Promise<DailyContent> => {
    try {
      const response = await axios.get<SuccessResponse>(
        `${API_URL}/learnings/daily-content/${dayNumber}/${weekNumber}/${planId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Get daily content response:", response.data);
      return response.data.data as unknown as DailyContent;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Get daily content error:",
        axiosError.response?.data || axiosError.message
      );

      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      throw new Error(axiosError.message || "Failed to fetch daily content");
    }
  },

  validateGoal: async (
    token: string,
    request: ValidateGoalRequest
  ): Promise<ValidateGoalResponse> => {
    try {
      const response = await axios.post<ValidateGoalResponse>(
        `${API_URL}/learnings/validate-goal`,
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Validate goal error:",
        axiosError.response?.data || axiosError.message
      );
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(axiosError.message || "Failed to validate goal");
    }
  },

  deletePlan: async (token: string, planId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/learnings/plan/${planId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Delete plan error:",
        axiosError.response?.data || axiosError.message
      );
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(axiosError.message || "Failed to delete plan");
    }
  },
};

export default learningAPI;
export type {
  LearningPlanStructure,
  CompleteLearningPlan,
  WeeklyTheme,
  WeeklyContent,
  StructureRequest,
  ContentRequest,
  DailyMilestone,
  DailyContent,
  LessonContent,
  Resource,
  ValidateGoalRequest,
  ValidateGoalResponse,
};

import { toast } from "@/components/ui/toast";
import { ApiError, clearAccessToken } from "@/services/api";

interface HandleApiErrorOptions {
  fallbackMessage?: string;
  onSessionExpired?: () => void;
}

export function handleApiError(error: unknown, options?: HandleApiErrorOptions) {
  const fallbackMessage = options?.fallbackMessage ?? "Couldn't reach the server";

  if (error instanceof ApiError) {
    if (error.status === 401) {
      toast.add({
        type: "error",
        title: "Authentication Error",
        description: "Your session expired — please log in again.",
      });
      clearAccessToken();
      if (options?.onSessionExpired) {
        options.onSessionExpired();
      }
      return;
    }

    if (error.status === 429) {
      toast.add({
        type: "error",
        title: "Rate Limited",
        description: "Too many requests — please wait a moment and try again.",
      });
      return;
    }

    if ([400, 403, 404, 409, 413].includes(error.status)) {
      toast.add({
        type: "error",
        title: `Error ${error.status}`,
        description: error.message,
      });
      return;
    }

    if ([500, 502, 503].includes(error.status)) {
      toast.add({
        type: "error",
        title: "Server Error",
        description: "Something went wrong on our end. Please try again shortly.",
      });
      return;
    }

    // Default ApiError behavior for unhandled statuses
    toast.add({
      type: "error",
      title: `Error ${error.status}`,
      description: error.message,
    });
  } else {
    // Non-ApiError / network failure
    toast.add({
      type: "error",
      title: "Connection Error",
      description: fallbackMessage,
    });
  }
}

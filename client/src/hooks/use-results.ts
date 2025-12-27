import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGameResult } from "@shared/routes";

export function useGameResults() {
  return useQuery({
    queryKey: [api.results.list.path],
    queryFn: async () => {
      const res = await fetch(api.results.list.path);
      if (!res.ok) throw new Error("Failed to fetch game history");
      return api.results.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGameResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGameResult) => {
      const validated = api.results.create.input.parse(data);
      const res = await fetch(api.results.create.path, {
        method: api.results.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           // Try to parse error message if available
           const err = await res.json().catch(() => ({}));
           throw new Error(err.message || "Invalid game result data");
        }
        throw new Error("Failed to save game result");
      }
      
      return api.results.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.list.path] });
    },
  });
}

import { useState, useCallback } from "react";
import { ApiResponse } from "@/services/api";

/**
 * Hook for handling async API calls with loading and error states
 * 
 * Usage:
 * const { data, loading, error, execute } = useAsync(getProjects);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export const useAsync = <T,>(
  fn: () => Promise<ApiResponse<T>>,
  immediate = false
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  if (immediate) {
    execute();
  }

  return { data, loading, error, execute, setData };
};

/**
 * Hook for handling mutations (create/update/delete operations)
 * 
 * Usage:
 * const { execute: createProj, loading } = useMutation(
 *   (data) => createProject(data)
 * );
 * 
 * const handleCreate = async () => {
 *   await createProj({ name: "New Project" });
 * };
 */
export const useMutation = <T, Args = void>(
  fn: (args: Args) => Promise<ApiResponse<T>>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(args);
        if (result.error) {
          setError(result.error);
          setData(null);
          return null;
        } else {
          setData(result.data);
          setError(null);
          return result.data;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        setData(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { data, loading, error, execute, setData };
};

/**
 * Hook for managing paginated API calls
 * 
 * Usage:
 * const { data, page, nextPage, prevPage } = usePaginate(
 *   (page) => getTasks(projectId, page),
 *   1,
 *   10
 * );
 */
export const usePaginate = <T,>(
  fn: (page: number) => Promise<ApiResponse<T[]>>,
  initialPage = 1,
  pageSize = 10
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const result = await fn(currentPage);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || []);
        setHasMore((result.data?.length || 0) >= pageSize);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fn, pageSize]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      const newPage = page + 1;
      setPage(newPage);
      fetch(newPage);
    }
  }, [page, hasMore, fetch]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetch(newPage);
    }
  }, [page, fetch]);

  const goToPage = useCallback(
    (targetPage: number) => {
      setPage(targetPage);
      fetch(targetPage);
    },
    [fetch]
  );

  return { data, page, loading, error, hasMore, nextPage, prevPage, goToPage };
};

import { useState, useEffect } from "react";
import { getParentDashboard } from "../services/parentService";
import { getUserData } from "../utils/tokenStorage";

/**
 * Hook that resolves the primary studentId for the logged-in parent.
 * Returns { studentId, student, loading, error }
 */
export default function useParentStudent() {
  const [studentId, setStudentId]   = useState(null);
  const [student,   setStudent]     = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);

  useEffect(() => {
    // 1️⃣ Try to get studentId from local storage first (fast path)
    const stored = getUserData();
    const fromStorage = stored?.studentId || stored?.childId;

    if (fromStorage) {
      setStudentId(Number(fromStorage));
      setLoading(false);
      return;
    }

    // 2️⃣ Fall back to API
    getParentDashboard()
      .then((res) => {
        const data = res.data;
        const firstStudent =
          data?.defaultStudent || (data?.students && data.students[0]);
        if (firstStudent) {
          setStudent(firstStudent);
          setStudentId(firstStudent.id);
        } else {
          setError("No student linked to this parent account.");
        }
      })
      .catch(() => setError("Could not load student information."))
      .finally(() => setLoading(false));
  }, []);

  return { studentId, student, loading, error };
}

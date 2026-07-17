// src/common/components/StudentPicker.jsx
// Lightweight searchable student dropdown. Fetches the school's student list
// once and filters client-side by name / admission number.

import { useEffect, useState, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { getStudents } from "../services/api";

export default function StudentPicker({ value, onChange, placeholder = "Search student by name..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStudents(0, 200)
      .then((data) => {
        if (!cancelled) setStudents(data?.content || []);
      })
      .catch(() => {
        if (!cancelled) setStudents([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return students.slice(0, 30);
    const q = query.toLowerCase();
    return students
      .filter((s) => {
        const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
        return name.includes(q) || (s.admissionNumber || "").toLowerCase().includes(q);
      })
      .slice(0, 30);
  }, [query, students]);

  const selected = students.find((s) => String(s.id) === String(value));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-left"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected
            ? `${selected.firstName} ${selected.lastName}${selected.classRoom ? ` (${selected.classRoom.grade}${selected.classRoom.section ? "-" + selected.classRoom.section : ""})` : ""}`
            : placeholder}
        </span>
        <span className="flex items-center gap-1">
          {selected && (
            <X
              size={14}
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            />
          )}
          <ChevronDown size={14} className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a name..."
              className="w-full text-sm outline-none"
            />
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 p-3">Loading students...</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 p-3">No students found</p>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); setQuery(""); }}
                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between"
              >
                <span className="text-gray-800">{s.firstName} {s.lastName}</span>
                <span className="text-xs text-gray-400">
                  {s.classRoom ? `${s.classRoom.grade}${s.classRoom.section ? "-" + s.classRoom.section : ""}` : ""}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

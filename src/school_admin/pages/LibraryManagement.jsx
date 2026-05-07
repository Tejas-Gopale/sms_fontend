import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import {
  Search, Plus, Book, BookOpen, Trash2,
  RotateCcw, X, User, Loader2, ArrowLeft,
  AlertTriangle, CheckCircle, Clock, Edit3,
  ChevronLeft, ChevronRight, BookMarked, RefreshCw,
  IndianRupee
} from "lucide-react";

const TABS = ["Catalog", "Issued Books", "Return Book"];

export default function LibraryManagement() {
  const [activeTab, setActiveTab] = useState("Catalog");
  const [schoolId] = useState("1");

  // ─── Catalog State ────────────────────────────────────────────
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Issues State ─────────────────────────────────────────────
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuePage, setIssuePage] = useState(0);
  const [issueTotalPages, setIssueTotalPages] = useState(1);

  // ─── Modals ───────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  // ─── Forms ────────────────────────────────────────────────────
  const [issueForm, setIssueForm] = useState({ admissionNumber: "", dueDate: "" });
  const [returnFine, setReturnFine] = useState(0);
  const [markingOverdue, setMarkingOverdue] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────
  useEffect(() => { fetchBooks(); }, [page, searchQuery]);
  useEffect(() => { if (activeTab === "Issued Books") fetchIssues(); }, [activeTab, issuePage]);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      let url = `/library/schools/${schoolId}/books`;
      const params = { page, size: 9 };
      if (searchQuery) {
        url = `/library/schools/${schoolId}/books/search`;
        params.q = searchQuery;
      }
      const res = await API.get(url, { params });
      setBooks(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await API.get(`/library/schools/${schoolId}/issues`, {
        params: { page: issuePage, size: 10 }
      });
      setIssues(res.data.content || []);
      setIssueTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  // ─── Book CRUD ────────────────────────────────────────────────




  const handleDeleteBook = async (id) => {
    if (!window.confirm("Remove this book record? This will fail if copies are currently issued.")) return;
    try {
      await API.delete(`/library/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert("Cannot delete: Some copies are currently issued.");
    }
  };

  const openEditModal = (book) => {
    setShowEditModal(book);
  };

  // ─── Issue Book ───────────────────────────────────────────────
  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      // Send admissionNumber — backend resolves to student entity
      await API.post(`/library/schools/${schoolId}/issue`, {
        bookId: showIssueModal.id,
        admissionNumber: issueForm.admissionNumber,
        dueDate: issueForm.dueDate || undefined
      });
      setShowIssueModal(null);
      setIssueForm({ admissionNumber: "", dueDate: "" });
      fetchBooks();
      alert("Book issued successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      alert("Issue failed: " + (msg || "Check admission number or book availability."));
    }
  };

  // ─── Return Book ──────────────────────────────────────────────
  const handleReturnBook = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/library/issues/${showReturnModal.id}/return`, null, {
        params: { fine: returnFine }
      });
      setShowReturnModal(null);
      setReturnFine(0);
      fetchIssues();
      fetchBooks();
      alert("Book returned successfully!");
    } catch (err) {
      alert("Return failed. Please try again.");
    }
  };

  // ─── Mark Overdue ─────────────────────────────────────────────
  const handleMarkOverdue = async () => {
    if (!window.confirm("Mark all overdue books for this school? This is normally run automatically.")) return;
    setMarkingOverdue(true);
    try {
      await API.post(`/library/schools/${schoolId}/mark-overdue`);
      alert("Overdue books marked successfully.");
      if (activeTab === "Issued Books") fetchIssues();
    } catch (err) {
      alert("Failed to mark overdue books.");
    } finally {
      setMarkingOverdue(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      ISSUED:   { bg: "bg-blue-50 text-blue-700",   icon: <Clock size={12} /> },
      OVERDUE:  { bg: "bg-red-50 text-red-700",     icon: <AlertTriangle size={12} /> },
      RETURNED: { bg: "bg-green-50 text-green-700", icon: <CheckCircle size={12} /> }
    };
    const s = map[status] || { bg: "bg-slate-100 text-slate-600", icon: null };
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${s.bg}`}>
        {s.icon}{status}
      </span>
    );
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  // ─── Shared Modal Field Component ─────────────────────────────
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Library Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage books, issue records, and returns.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleMarkOverdue}
              disabled={markingOverdue}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              {markingOverdue ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Mark Overdue
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-md text-sm font-semibold transition-all"
            >
              <Plus size={16} /> New Book
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: CATALOG ══════════════ */}
        {activeTab === "Catalog" && (
          <>
            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN…"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                />
              </div>
              <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
            </div>

            {/* Grid */}
            {loadingBooks ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={36} />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <BookMarked size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No books found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                  <motion.div
                    layoutId={`book-${book.id}`}
                    key={book.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Book size={22} />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                          title="Edit book"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete book"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-3">by {book.author}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {book.isbn}
                      </span>
                      {book.category && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                          {book.category}
                        </span>
                      )}
                      {book.shelfLocation && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
                          📍 {book.shelfLocation}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Available</p>
                        <p className="font-bold text-slate-800 text-lg">
                          {book.availableCopies}
                          <span className="text-slate-400 text-sm font-normal"> / {book.totalCopies}</span>
                        </p>
                      </div>
                      <button
                        disabled={book.availableCopies === 0}
                        onClick={() => setShowIssueModal(book)}
                        className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                      >
                        <RotateCcw size={13} /> Issue
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600 font-medium">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ══════════════ TAB: ISSUED BOOKS ══════════════ */}
        {activeTab === "Issued Books" && (
          <>
            {loadingIssues ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={36} />
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No issued books found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Student</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Admission No.</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Grade / Section</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Book</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Issue Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Due Date</th>
                      <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Status</th>
                      <th className="px-5 py-3.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, i) => {
                      const overdue = issue.status === "ISSUED" && isOverdue(issue.dueDate);
                      return (
                        <motion.tr
                          key={issue.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${overdue ? "bg-red-50/40" : ""}`}
                        >
                          {/* Student Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {issue.studentFirstName
                                  ? `${issue.studentFirstName[0]}${issue.studentLastName?.[0] ?? ""}`
                                  : <User size={14} />}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {issue.studentFirstName} {issue.studentLastName}
                                </p>
                                <p className="text-[11px] text-slate-400">ID: {issue.studentId}</p>
                              </div>
                            </div>
                          </td>

                          {/* Admission No */}
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                              {issue.admissionNumber || "—"}
                            </span>
                          </td>

                          {/* Grade / Section */}
                          <td className="px-5 py-3.5">
                            <span className="text-slate-700 font-medium">
                              {issue.grade ? `${issue.grade}` : "—"}
                              {issue.section ? ` – ${issue.section}` : ""}
                            </span>
                          </td>

                          {/* Book Title */}
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 line-clamp-1">{issue.bookTitle}</p>
                            <p className="text-[11px] text-slate-400">Book ID: {issue.bookId}</p>
                          </td>

                          {/* Issue Date */}
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            {issue.issueDate ?? "—"}
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={overdue ? "text-red-600 font-semibold" : "text-slate-500"}>
                              {issue.dueDate ?? "—"}
                              {overdue && <span className="text-[10px] ml-1">(Overdue)</span>}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {statusBadge(issue.status)}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3.5">
                            {issue.status !== "RETURNED" && (
                              <button
                                onClick={() => { setShowReturnModal(issue); setReturnFine(0); }}
                                className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all whitespace-nowrap"
                              >
                                <ArrowLeft size={12} /> Return
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={issuePage === 0}
                onClick={() => setIssuePage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-600 font-medium">
                Page {issuePage + 1} of {issueTotalPages}
              </span>
              <button
                disabled={issuePage >= issueTotalPages - 1}
                onClick={() => setIssuePage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ══════════════ TAB: RETURN BOOK ══════════════ */}
        {activeTab === "Return Book" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-500" /> Process a Book Return
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  When a student returns a book at the counter, search by Issue ID to confirm and close the record.
                </p>
              </div>
              <QuickReturnForm onSuccess={fetchBooks} />
            </div>
          </div>
        )}
      </main>

      {/* ══════════ MODAL: ADD BOOK ══════════ */}
      <AnimatePresence>
        {showAddModal && (
          <AddBookModal
            schoolId={schoolId}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); fetchBooks(); }}
          />
        )}
      </AnimatePresence>

      {/* ══════════ MODAL: EDIT BOOK ══════════ */}
      <AnimatePresence>
        {showEditModal && (
          <EditBookModal
            book={showEditModal}
            onClose={() => setShowEditModal(null)}
            onSuccess={() => { setShowEditModal(null); fetchBooks(); }}
          />
        )}
      </AnimatePresence>

      {/* ══════════ MODAL: ISSUE BOOK ══════════ */}
      <AnimatePresence>
        {showIssueModal && (
          <Modal onClose={() => setShowIssueModal(null)} maxW="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <BookOpen size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 italic">"{showIssueModal.title}"</h2>
                <p className="text-xs text-slate-500">Issue to Student · {showIssueModal.availableCopies} copies available</p>
              </div>
              <button onClick={() => setShowIssueModal(null)} className="ml-auto p-1 text-slate-400 hover:text-slate-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <Field label="Admission Number">
                <input required placeholder="e.g. ADM-2024-001"
                  className={inputCls}
                  value={issueForm.admissionNumber}
                  onChange={e => setIssueForm({ ...issueForm, admissionNumber: e.target.value })} />
                <p className="text-[11px] text-slate-400 mt-1">Enter the student's admission number exactly as registered.</p>
              </Field>
              <Field label="Return Due Date (Optional)">
                <input type="date" className={inputCls}
                  value={issueForm.dueDate}
                  onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })} />
                <p className="text-[11px] text-slate-400 mt-1">Leave blank to use the default 14-day period.</p>
              </Field>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowIssueModal(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-md">
                  Confirm Issue
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══════════ MODAL: RETURN BOOK ══════════ */}
      <AnimatePresence>
        {showReturnModal && (() => {
          const bookIsOverdue = isOverdue(showReturnModal.dueDate);
          const daysLate = showReturnModal.dueDate
            ? Math.ceil((new Date() - new Date(showReturnModal.dueDate)) / (1000 * 60 * 60 * 24))
            : 0;
          return (
            <Modal onClose={() => setShowReturnModal(null)} maxW="max-w-md">
              <ModalHeader title="Return Book" onClose={() => setShowReturnModal(null)} />

              {/* Book + Student Summary */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <p className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Book Being Returned</p>
                <p className="font-semibold text-slate-800 text-base">{showReturnModal.bookTitle}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Student ID: <strong className="text-slate-700">{showReturnModal.studentId}</strong></span>
                  {showReturnModal.admissionNumber && (
                    <span>Adm: <strong className="text-slate-700">{showReturnModal.admissionNumber}</strong></span>
                  )}
                </div>
                {showReturnModal.dueDate && (
                  <div className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg ${
                    bookIsOverdue
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-green-50 text-green-700 border border-green-100"
                  }`}>
                    {bookIsOverdue
                      ? <><AlertTriangle size={13} /> Overdue by {daysLate} day{daysLate !== 1 ? "s" : ""} — Due was {showReturnModal.dueDate}</>
                      : <><CheckCircle size={13} /> On time — Due {showReturnModal.dueDate}</>
                    }
                  </div>
                )}
              </div>

              {/* Fine — only if overdue */}
              {bookIsOverdue && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4"
                >
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <IndianRupee size={12} /> Late Fine
                    </p>
                    <p className="text-xs text-amber-600 mb-3">
                      This book is {daysLate} day{daysLate !== 1 ? "s" : ""} late. Enter the fine amount to collect from the student (leave 0 to waive).
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400"
                        value={returnFine}
                        placeholder="0"
                        onChange={e => setReturnFine(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {returnFine > 0 && (
                      <p className="text-xs text-amber-700 font-semibold mt-2">
                        ₹{returnFine} fine will be recorded for this student.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleReturnBook}>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReturnModal(null)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    {bookIsOverdue && returnFine > 0 ? `Return & Collect ₹${returnFine}` : "Confirm Return"}
                  </button>
                </div>
              </form>
            </Modal>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared Modal Wrapper ────────────────────────────────────────────────────
function Modal({ children, onClose, maxW = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className={`bg-white rounded-2xl p-7 w-full ${maxW} shadow-2xl`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}

// ─── Quick Return Form (Return Book Tab) ────────────────────────────────────
// How to use: Student walks in to return a book.
// Step 1 → Enter the Issue ID (printed on the issue slip / visible in Issued Books tab) and click Search.
// Step 2 → Verify the book & student details shown. If overdue, enter fine. Click Return.
function QuickReturnForm({ onSuccess }) {
  const [issueId, setIssueId]       = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [fine, setFine]             = useState(0);
  const [returning, setReturning]   = useState(false);
  const [detail, setDetail]         = useState(null);   // found issue record
  const [notFound, setNotFound]     = useState(false);
  const [done, setDone]             = useState(false);

  const isOver = (dueDate) => dueDate && new Date(dueDate) < new Date();
  const daysLate = detail?.dueDate
    ? Math.max(0, Math.ceil((new Date() - new Date(detail.dueDate)) / 86400000))
    : 0;

  const handleSearch = async () => {
    if (!issueId.trim()) return;
    setNotFound(false);
    setDetail(null);
    setFine(0);
    setLookupLoading(true);
    try {
      const res = await API.get(`/library/issues/${issueId}`);
      setDetail(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleReturn = async () => {
    setReturning(true);
    try {
      await API.put(`/library/issues/${detail.id}/return`, null, { params: { fine } });
      setDone(true);
      onSuccess();
    } catch {
      alert("Return failed. The book may already be returned.");
    } finally {
      setReturning(false);
    }
  };

  const reset = () => {
    setIssueId(""); setDetail(null); setFine(0);
    setNotFound(false); setDone(false);
  };

  // ── Success screen ──
  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Book Returned!</h3>
        <p className="text-sm text-slate-500 mb-1">
          <strong>{detail?.bookTitle}</strong> has been marked as returned.
        </p>
        {fine > 0 && (
          <p className="text-sm text-amber-600 font-semibold mb-4">₹{fine} fine collected.</p>
        )}
        <button onClick={reset}
          className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
          Return Another Book
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Context Banner ── */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
        <strong>How to use:</strong> When a student comes to return a book, find their
        Issue ID from the <em>Issued Books</em> tab or from their issue slip, enter it below and click <strong>Search</strong>.
      </div>

      {/* ── Step 1: Search ── */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Step 1 — Enter Issue ID
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="e.g. 42"
            value={issueId}
            onChange={e => { setIssueId(e.target.value); setNotFound(false); setDetail(null); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={!issueId.trim() || lookupLoading}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </button>
        </div>
        {notFound && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} /> No issue record found for ID "{issueId}". Please check and try again.
          </p>
        )}
      </div>

      {/* ── Step 2: Confirm + Fine ── */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Step 2 — Verify & Confirm Return
            </label>

            {/* Already returned guard */}
            {detail.status === "RETURNED" ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                <CheckCircle size={16} className="inline mr-2" />
                This book was already returned on {detail.returnDate ?? "an earlier date"}.
              </div>
            ) : (
              <>
                {/* Book + Student Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                      <Book size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight">{detail.bookTitle}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Book ID: {detail.bookId}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Student ID</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detail.studentId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Issue Date</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detail.issueDate ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Due Date</p>
                      <p className={`font-semibold mt-0.5 ${isOver(detail.dueDate) ? "text-red-600" : "text-green-600"}`}>
                        {detail.dueDate ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Status</p>
                      <p className={`font-bold mt-0.5 ${detail.status === "OVERDUE" ? "text-red-600" : "text-blue-600"}`}>
                        {detail.status}
                      </p>
                    </div>
                  </div>

                  {/* Overdue badge */}
                  {isOver(detail.dueDate) && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                      <AlertTriangle size={13} />
                      Overdue by {daysLate} day{daysLate !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Fine — only if overdue */}
                {isOver(detail.dueDate) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl"
                  >
                    <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <IndianRupee size={12} /> Late Fine (Optional)
                    </p>
                    <p className="text-xs text-amber-600 mb-3">
                      This book is {daysLate} day{daysLate !== 1 ? "s" : ""} overdue.
                      Enter a fine amount to collect from the student, or leave it at 0 to waive the fine.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={fine}
                        placeholder="0"
                        onChange={e => setFine(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-300/30 focus:border-amber-400"
                      />
                    </div>
                    {fine > 0 && (
                      <p className="text-xs text-amber-700 font-semibold mt-2">
                        ₹{fine} will be recorded as fine for this student.
                      </p>
                    )}
                    {fine === 0 && (
                      <p className="text-xs text-amber-500 mt-2">Fine waived (₹0).</p>
                    )}
                  </motion.div>
                )}

                {/* Return Button */}
                <button
                  onClick={handleReturn}
                  disabled={returning}
                  className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {returning
                    ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                    : <><CheckCircle size={15} />
                        {isOver(detail.dueDate) && fine > 0
                          ? `Return & Collect ₹${fine}`
                          : "Confirm Return"}
                      </>
                  }
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── Add Book Modal (own local state → no parent re-render on keypress) ───────
function AddBookModal({ schoolId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", author: "", isbn: "", category: "", totalCopies: 1, shelfLocation: ""
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/library/schools/${schoolId}/books`, {
        ...form,
        totalCopies: parseInt(form.totalCopies) || 1
      });
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      alert("Failed to add book. " + (msg || "Please check the details."));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Add Book to Catalog" onClose={onClose} />
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-6">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Book Title</label>
          <input required className={inputCls} placeholder="e.g. To Kill a Mockingbird"
            value={form.title} onChange={set("title")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Author</label>
          <input required className={inputCls} placeholder="Author name"
            value={form.author} onChange={set("author")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ISBN</label>
          <input required className={inputCls} placeholder="978-..."
            value={form.isbn} onChange={set("isbn")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Copies</label>
          <input type="number" min={1} className={inputCls}
            value={form.totalCopies} onChange={set("totalCopies")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
          <input className={inputCls} placeholder="e.g. Science, History"
            value={form.category} onChange={set("category")} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shelf / Rack Location</label>
          <input className={inputCls} placeholder="e.g. A-12, Rack 3"
            value={form.shelfLocation} onChange={set("shelfLocation")} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save to Catalog"}
        </button>
      </form>
    </Modal>
  );
}

// ─── Edit Book Modal (own local state → no parent re-render on keypress) ──────
function EditBookModal({ book, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title:         book.title         ?? "",
    author:        book.author        ?? "",
    isbn:          book.isbn          ?? "",
    category:      book.category      ?? "",
    totalCopies:   book.totalCopies   ?? 1,
    shelfLocation: book.shelfLocation ?? ""
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/library/books/${book.id}`, {
        ...form,
        totalCopies: parseInt(form.totalCopies) || 1
      });
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || "";
      alert("Failed to update book. " + (msg || ""));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Edit: ${book.title}`} onClose={onClose} />
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-6">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Book Title</label>
          <input required className={inputCls} value={form.title} onChange={set("title")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Author</label>
          <input required className={inputCls} value={form.author} onChange={set("author")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ISBN</label>
          <input required className={inputCls} value={form.isbn} onChange={set("isbn")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Copies</label>
          <input type="number" min={1} className={inputCls}
            value={form.totalCopies} onChange={set("totalCopies")} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
          <input className={inputCls} value={form.category} onChange={set("category")} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shelf / Rack Location</label>
          <input className={inputCls} value={form.shelfLocation} onChange={set("shelfLocation")} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Update Book"}
        </button>
      </form>
    </Modal>
  );
}
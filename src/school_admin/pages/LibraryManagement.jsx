import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchoolAdminSidebar from "../components/SchoolAdminSidebar";
import API from "../../common/services/api";
import { 
  Search, Plus, Book, BookOpen, Trash2, 
  RotateCcw, Info, X, Save, User, Hash, Loader2 
} from "lucide-react";

export default function LibraryManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId] = useState("1"); // Dynamic based on your app logic

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(null); // Stores book object

  // Form States
  const [bookForm, setBookForm] = useState({
    title: "", author: "", isbn: "", category: "", 
    totalCopies: 1, rackLocation: ""
  });
  const [issueForm, setIssueForm] = useState({ studentId: "", dueDate: "" });

  useEffect(() => {
    fetchBooks();
  }, [page, searchQuery]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/library/schools/${schoolId}/books`;
      const params = { page, size: 10 };
      
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
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/library/schools/${schoolId}/books`, bookForm);
      setShowAddModal(false);
      fetchBooks();
      setBookForm({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
    } catch (err) {
      alert("Failed to add book");
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/library/schools/${schoolId}/issue`, {
        bookId: showIssueModal.id,
        studentId: issueForm.studentId,
        returnDate: issueForm.dueDate
      });
      setShowIssueModal(null);
      fetchBooks(); // Refresh copies count
      alert("Book issued successfully! 📚");
    } catch (err) {
      alert("Issue failed: Check if student ID is correct or book is available.");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure? This will remove the book record.")) return;
    try {
      await API.delete(`/library/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert("Cannot delete book: Copies might be currently issued.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SchoolAdminSidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Library Catalog</h1>
            <p className="text-slate-500">Search books, manage inventory, and track issues.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-md font-medium"
            >
              <Plus size={18} /> New Book
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Total Pages: {totalPages}</span>
          </div>
        </div>

        {/* BOOK GRID */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <motion.div 
                layoutId={book.id}
                key={book.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Book size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{book.title}</h3>
                <p className="text-slate-500 text-sm mb-3">by {book.author}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 px-2 py-1 rounded">ISBN: {book.isbn}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">{book.category}</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Available</p>
                    <p className="font-bold text-slate-700">{book.availableCopies} / {book.totalCopies}</p>
                  </div>
                  <button 
                    disabled={book.availableCopies === 0}
                    onClick={() => setShowIssueModal(book)}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:bg-slate-200"
                  >
                    <RotateCcw size={14} /> Issue
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ADD BOOK MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Library Book</h2>
                <button onClick={() => setShowAddModal(false)}><X /></button>
              </div>
              <form onSubmit={handleAddBook} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Book Title</label>
                  <input required className="w-full p-2.5 bg-slate-50 border rounded-xl mt-1" 
                    onChange={e => setBookForm({...bookForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Author</label>
                  <input required className="w-full p-2.5 bg-slate-50 border rounded-xl mt-1" 
                    onChange={e => setBookForm({...bookForm, author: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">ISBN</label>
                  <input required className="w-full p-2.5 bg-slate-50 border rounded-xl mt-1" 
                    onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Copies</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border rounded-xl mt-1" 
                    onChange={e => setBookForm({...bookForm, totalCopies: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <input className="w-full p-2.5 bg-slate-50 border rounded-xl mt-1" 
                    onChange={e => setBookForm({...bookForm, category: e.target.value})} />
                </div>
                <button className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-indigo-700 transition-all">
                  Save to Catalog
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ISSUE BOOK MODAL */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BookOpen /></div>
                <div>
                  <h2 className="text-xl font-bold italic">"{showIssueModal.title}"</h2>
                  <p className="text-sm text-slate-500">Issue to Student</p>
                </div>
              </div>
              <form onSubmit={handleIssueBook} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><User size={12}/> Student ID</label>
                  <input required placeholder="Enter Admission ID" className="w-full p-2.5 border rounded-xl mt-1" 
                    onChange={e => setIssueForm({...issueForm, studentId: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">Return Due Date</label>
                  <input required type="date" className="w-full p-2.5 border rounded-xl mt-1" 
                    onChange={e => setIssueForm({...issueForm, dueDate: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => setShowIssueModal(null)} className="flex-1 py-3 border rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Confirm Issue</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
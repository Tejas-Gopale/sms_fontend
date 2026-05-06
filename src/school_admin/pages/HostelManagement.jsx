import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, BedDouble, Users, LogOut, Phone, MapPin,
  Plus, X, Loader2, ChevronRight, ShieldCheck, Wifi,
  Bath, Wind, AlertCircle, CheckCircle2, Search,
  Hash, CalendarDays, StickyNote, UserCheck, RefreshCw,
  Home, Layers
} from 'lucide-react';
import API from '../../common/services/api';
import SchoolAdminSidebar from '../components/SchoolAdminSidebar';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const HOSTEL_TYPES = ['BOYS', 'GIRLS', 'CO_ED'];
const ROOM_TYPES   = ['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'];

const HOSTEL_TYPE_META = {
  BOYS:   { label: 'Boys',   color: 'bg-blue-100 text-blue-700'   },
  GIRLS:  { label: 'Girls',  color: 'bg-pink-100 text-pink-700'   },
  CO_ED:  { label: 'Co-Ed',  color: 'bg-purple-100 text-purple-700' },
};

const ROOM_TYPE_META = {
  SINGLE:    { label: 'Single',    color: 'bg-sky-50 text-sky-700'      },
  DOUBLE:    { label: 'Double',    color: 'bg-indigo-50 text-indigo-700' },
  TRIPLE:    { label: 'Triple',    color: 'bg-violet-50 text-violet-700' },
  DORMITORY: { label: 'Dormitory', color: 'bg-amber-50 text-amber-700'  },
};

// ─── EMPTY FORMS ──────────────────────────────────────────────────────────

const EMPTY_HOSTEL = {
  hostelName: '', hostelType: 'BOYS', wardenName: '',
  wardenPhone: '', totalRooms: '', address: '',
};

const EMPTY_ROOM = {
  roomNumber: '', capacity: '', roomType: 'SINGLE',
  monthlyFee: '', floor: '', hasAC: false, hasAttachedBath: false,
};

const EMPTY_ALLOT = {
  studentId: '', allotmentDate: new Date().toISOString().split('T')[0], remarks: '',
};

// ─── SUB COMPONENTS ──────────────────────────────────────────────────────────

/**
 * Modal wrapper — uses a normal flow container (not fixed) so the
 * iframe viewport is not collapsed. Works like a faux backdrop.
 */
const Modal = ({ isOpen, onClose, title, children, maxW = 'max-w-lg' }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-8"
        style={{ background: 'rgba(15,15,30,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className={`bg-white rounded-2xl w-full ${maxW} shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-7 py-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Reusable labelled input wrapper */
const Field = ({ label, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all ' +
  'placeholder:text-slate-300';

const selectCls = inputCls + ' cursor-pointer';

/** Occupancy bar */
const OccupancyBar = ({ current, max }) => {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const color = pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/** Single hostel card in the sidebar list */
const HostelCard = ({ hostel, selected, onClick }) => {
  const meta = HOSTEL_TYPE_META[hostel.hostelType] ?? HOSTEL_TYPE_META.BOYS;
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
        selected
          ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
          : 'border-transparent bg-white hover:border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-slate-800 text-sm leading-tight">{hostel.hostelName}</span>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
        <ShieldCheck size={11} className="shrink-0" />
        <span className="truncate">{hostel.wardenName}</span>
        {hostel.wardenPhone && <span>· {hostel.wardenPhone}</span>}
      </div>
      {hostel.address && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{hostel.address}</span>
        </div>
      )}
      {selected && (
        <ChevronRight
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
        />
      )}
    </motion.div>
  );
};

/** Single room tile */
const RoomTile = ({ room, onAllot }) => {
  const isFull = room.currentOccupancy >= room.capacity;
  const typeMeta = ROOM_TYPE_META[room.roomType] ?? ROOM_TYPE_META.SINGLE;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group overflow-hidden"
    >
      {/* Room number */}
      <p className="text-2xl font-black text-slate-700 tracking-tighter leading-none mb-1">
        {room.roomNumber}
      </p>

      <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${typeMeta.color}`}>
        {typeMeta.label}
      </span>

      {/* Fee */}
      <p className="text-[11px] text-slate-400 mt-2">
        ₹{Number(room.monthlyFee ?? 0).toLocaleString('en-IN')}/mo
      </p>

      {/* Occupancy */}
      <p className="text-[11px] text-slate-500 mt-1">
        {room.currentOccupancy ?? 0} / {room.capacity}
        <span className="text-slate-400"> beds</span>
      </p>
      <OccupancyBar current={room.currentOccupancy ?? 0} max={room.capacity} />

      {/* Amenities */}
      <div className="flex gap-2 mt-2">
        {room.hasAC && <Wind size={11} className="text-sky-400" title="AC" />}
        {room.hasAttachedBath && <Bath size={11} className="text-violet-400" title="Attached Bath" />}
        {room.floor && (
          <span className="text-[9px] text-slate-400">Floor {room.floor}</span>
        )}
      </div>

      {/* Allot button — appears on hover */}
      {!isFull && (
        <button
          onClick={() => onAllot(room)}
          className="absolute top-2 right-2 p-1.5 bg-indigo-600 text-white rounded-lg shadow-md
                     opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100
                     transition-all duration-200"
          title="Allot student"
        >
          <UserCheck size={13} />
        </button>
      )}

      {isFull && (
        <span className="absolute top-2 right-2 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
          Full
        </span>
      )}
    </motion.div>
  );
};

/** Allotment table row */
const AllotmentRow = ({ allotment, onVacate, vacating }) => (
  <tr className="group hover:bg-slate-50 transition-colors">
    <td className="px-5 py-4">
      <p className="font-bold text-slate-800 text-sm">
        {allotment.student?.fullName ?? `Student #${allotment.studentId ?? allotment.student?.id}`}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        ID: {allotment.student?.id ?? allotment.studentId}
      </p>
    </td>
    <td className="px-5 py-4 text-sm text-slate-600">
      <span className="font-medium">{allotment.room?.hostel?.hostelName ?? '—'}</span>
      <span className="text-slate-400"> / </span>
      <span>Room {allotment.room?.roomNumber ?? '—'}</span>
    </td>
    <td className="px-5 py-4 text-sm text-slate-500">
      {allotment.allotmentDate ? new Date(allotment.allotmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
    </td>
    <td className="px-5 py-4">
      {allotment.remarks && (
        <span className="text-[11px] text-slate-400 italic max-w-[120px] block truncate">
          {allotment.remarks}
        </span>
      )}
    </td>
    <td className="px-5 py-4 text-right">
      <button
        onClick={() => onVacate(allotment.id)}
        disabled={vacating === allotment.id}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50
                   px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
      >
        {vacating === allotment.id
          ? <Loader2 size={13} className="animate-spin" />
          : <LogOut size={13} />}
        Vacate
      </button>
    </td>
  </tr>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const HostelManagement = () => {
  const schoolId = 1; // TODO: replace with useAuth() hook

  // ── Data state ──────────────────────────────────────────────
  const [hostels,       setHostels]       = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms,         setRooms]         = useState([]);
  const [allotments,    setAllotments]    = useState([]);

  // ── UI state ────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('inventory');
  const [loadingHostels, setLoadingHostels] = useState(false);
  const [loadingRooms,  setLoadingRooms]  = useState(false);
  const [loadingAllotments, setLoadingAllotments] = useState(false);
  const [vacatingId,    setVacatingId]    = useState(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [error,         setError]         = useState('');
  const [successMsg,    setSuccessMsg]    = useState('');

  // ── Modal state ─────────────────────────────────────────────
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showRoomModal,   setShowRoomModal]   = useState(false);
  const [showAllotModal,  setShowAllotModal]  = useState(false);
  const [savingHostel,    setSavingHostel]    = useState(false);
  const [savingRoom,      setSavingRoom]      = useState(false);
  const [savingAllot,     setSavingAllot]     = useState(false);

  // ── Form state ───────────────────────────────────────────────
  const [hostelForm,  setHostelForm] = useState(EMPTY_HOSTEL);
  const [roomForm,    setRoomForm]   = useState(EMPTY_ROOM);
  const [allotForm,   setAllotForm]  = useState(EMPTY_ALLOT);
  const [targetRoom,  setTargetRoom] = useState(null); // room selected for allotment

  // ── Toast helpers ────────────────────────────────────────────
  const toast = useCallback((msg, isError = false) => {
    if (isError) setError(msg); else setSuccessMsg(msg);
    setTimeout(() => { setError(''); setSuccessMsg(''); }, 3500);
  }, []);

  // ─── FETCH ───────────────────────────────────────────────────────────────

  const fetchHostels = useCallback(async () => {
    setLoadingHostels(true);
    try {
      const res = await API.get(`/hostel/schools/${schoolId}`);
      setHostels(res.data ?? []);
    } catch (err) {
      toast('Hostels load nahi hue. Server check karein.', true);
    } finally {
      setLoadingHostels(false);
    }
  }, [schoolId, toast]);

  const fetchRooms = useCallback(async (hostelId) => {
    setLoadingRooms(true);
    setRooms([]);
    try {
      const res = await API.get(`/hostel/hostels/${hostelId}/rooms`);
      setRooms(res.data ?? []);
    } catch (err) {
      toast('Rooms load nahi hue.', true);
    } finally {
      setLoadingRooms(false);
    }
  }, [toast]);

  const fetchAllotments = useCallback(async () => {
    setLoadingAllotments(true);
    try {
      const res = await API.get(`/hostel/schools/${schoolId}/allotments/active`);
      setAllotments(res.data ?? []);
    } catch (err) {
      toast('Allotments load nahi hue.', true);
    } finally {
      setLoadingAllotments(false);
    }
  }, [schoolId, toast]);

  // ─── EFFECTS ─────────────────────────────────────────────────────────────

  useEffect(() => { fetchHostels(); }, [fetchHostels]);
  useEffect(() => {
    if (activeTab === 'residents') fetchAllotments();
  }, [activeTab, fetchAllotments]);

  const handleSelectHostel = (hostel) => {
    setSelectedHostel(hostel);
    fetchRooms(hostel.id);
  };

  // ─── FORM SUBMIT HANDLERS ─────────────────────────────────────────────────

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    setSavingHostel(true);
    try {
      await API.post(`/hostel/schools/${schoolId}`, {
        ...hostelForm,
        totalRooms: Number(hostelForm.totalRooms),
      });
      setShowHostelModal(false);
      setHostelForm(EMPTY_HOSTEL);
      toast('Hostel building add ho gaya! 🏠');
      fetchHostels();
    } catch (err) {
      toast(err?.response?.data?.message ?? 'Hostel create nahi hua.', true);
    } finally {
      setSavingHostel(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!selectedHostel) return;
    setSavingRoom(true);
    try {
      await API.post(`/hostel/rooms`, {
        ...roomForm,
        hostelId: selectedHostel.id,
        capacity: Number(roomForm.capacity),
        monthlyFee: Number(roomForm.monthlyFee),
      });
      setShowRoomModal(false);
      setRoomForm(EMPTY_ROOM);
      toast(`Room ${roomForm.roomNumber} add ho gaya!`);
      fetchRooms(selectedHostel.id);
    } catch (err) {
      toast(err?.response?.data?.message ?? 'Room add nahi hua.', true);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleAllotRoom = async (e) => {
    e.preventDefault();
    if (!targetRoom) return;
    setSavingAllot(true);
    try {
      await API.post(`/hostel/schools/${schoolId}/allot`, {
        roomId: targetRoom.id,
        studentId: Number(allotForm.studentId),
        allotmentDate: allotForm.allotmentDate,
        remarks: allotForm.remarks,
      });
      setShowAllotModal(false);
      setAllotForm(EMPTY_ALLOT);
      setTargetRoom(null);
      toast('Student allot ho gaya! ✅');
      if (selectedHostel) fetchRooms(selectedHostel.id);
      if (activeTab === 'residents') fetchAllotments();
    } catch (err) {
      toast(err?.response?.data?.message ?? 'Allotment nahi hua.', true);
    } finally {
      setSavingAllot(false);
    }
  };

  const handleVacate = async (allotmentId) => {
    if (!window.confirm('Is student ko vacate karein?')) return;
    setVacatingId(allotmentId);
    try {
      await API.put(`/hostel/allotments/${allotmentId}/vacate`);
      toast('Room vacate ho gaya.');
      fetchAllotments();
      if (selectedHostel) fetchRooms(selectedHostel.id);
    } catch (err) {
      toast('Vacate nahi hua.', true);
    } finally {
      setVacatingId(null);
    }
  };

  const openAllotModal = (room) => {
    setTargetRoom(room);
    setAllotForm(EMPTY_ALLOT);
    setShowAllotModal(true);
  };

  // ─── DERIVED DATA ─────────────────────────────────────────────────────────

  const filteredHostels = hostels.filter(
    (h) =>
      !searchQuery ||
      h.hostelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.wardenName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllotments = allotments.filter(
    (a) =>
      !searchQuery ||
      (a.student?.fullName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.room?.roomNumber ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.room?.hostel?.hostelName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary stats
  const totalRooms    = rooms.length;
  const occupiedRooms = rooms.filter((r) => (r.currentOccupancy ?? 0) >= r.capacity).length;
  const availRooms    = totalRooms - occupiedRooms;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SchoolAdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Home size={22} className="text-indigo-500" />
              Hostel Hub
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Inventory, rooms & resident management</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50
                           focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 w-48"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Tab switcher */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('residents')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'residents'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Residents
              </button>
            </div>
          </div>
        </header>

        {/* ── Toast notifications ── */}
        <AnimatePresence>
          {(error || successMsg) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-8 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              {error || successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6">

          {/* ══════════════════════════════════════════
               INVENTORY TAB
             ══════════════════════════════════════════ */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ── Left panel: Hostel Buildings ── */}
              <aside className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Buildings ({filteredHostels.length})
                  </h2>
                  <div className="flex gap-1.5">
                    <button
                      onClick={fetchHostels}
                      disabled={loadingHostels}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Refresh"
                    >
                      <RefreshCw size={14} className={loadingHostels ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => { setHostelForm(EMPTY_HOSTEL); setShowHostelModal(true); }}
                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                      title="Add building"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {loadingHostels ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={22} className="animate-spin text-indigo-400" />
                  </div>
                ) : filteredHostels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <Building2 size={36} />
                    <p className="text-sm mt-3 font-medium">
                      {searchQuery ? 'Koi building nahi mili' : 'Abhi koi hostel nahi hai'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setShowHostelModal(true)}
                        className="mt-4 text-xs font-bold text-indigo-500 hover:underline"
                      >
                        + Pehla hostel add karein
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHostels.map((h) => (
                      <HostelCard
                        key={h.id}
                        hostel={h}
                        selected={selectedHostel?.id === h.id}
                        onClick={() => handleSelectHostel(h)}
                      />
                    ))}
                  </div>
                )}
              </aside>

              {/* ── Right panel: Rooms Grid ── */}
              <section className="lg:col-span-8">
                {!selectedHostel ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center
                                  border-2 border-dashed border-slate-200 rounded-3xl text-slate-300">
                    <Layers size={40} />
                    <p className="mt-3 font-semibold text-sm">Building select karein rooms dekhne ke liye</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Room panel header */}
                    <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">{selectedHostel.hostelName}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {HOSTEL_TYPE_META[selectedHostel.hostelType]?.label} Hostel
                          {selectedHostel.totalRooms ? ` · ${selectedHostel.totalRooms} rooms total` : ''}
                        </p>
                      </div>

                      {/* Room summary pills */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600">
                          {totalRooms} rooms
                        </span>
                        <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                          {availRooms} available
                        </span>
                        <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-600">
                          {occupiedRooms} full
                        </span>
                        <button
                          onClick={() => { setRoomForm(EMPTY_ROOM); setShowRoomModal(true); }}
                          className="px-3 py-1 text-[11px] font-bold rounded-full bg-slate-900 text-white
                                     hover:bg-slate-700 transition-all flex items-center gap-1"
                        >
                          <Plus size={11} /> Add Room
                        </button>
                      </div>
                    </div>

                    {/* Rooms grid */}
                    <div className="p-6">
                      {loadingRooms ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2 size={24} className="animate-spin text-indigo-400" />
                        </div>
                      ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                          <BedDouble size={36} />
                          <p className="mt-3 text-sm font-medium">Is hostel mein abhi koi room nahi</p>
                          <button
                            onClick={() => { setRoomForm(EMPTY_ROOM); setShowRoomModal(true); }}
                            className="mt-4 text-xs font-bold text-indigo-500 hover:underline"
                          >
                            + Pehla room add karein
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {rooms.map((room) => (
                            <RoomTile key={room.id} room={room} onAllot={openAllotModal} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ══════════════════════════════════════════
               RESIDENTS TAB
             ══════════════════════════════════════════ */}
          {activeTab === 'residents' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" />
                    Active Residents
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{allotments.length} students currently residing</p>
                </div>
                <button
                  onClick={fetchAllotments}
                  disabled={loadingAllotments}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <RefreshCw size={15} className={loadingAllotments ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingAllotments ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={24} className="animate-spin text-indigo-400" />
                </div>
              ) : filteredAllotments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                  <Users size={40} />
                  <p className="mt-3 text-sm font-medium">
                    {searchQuery ? 'Search se koi result nahi mila' : 'Abhi koi active resident nahi hai'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student</th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Hostel / Room</th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Joined</th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Remarks</th>
                        <th className="px-5 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAllotments.map((a) => (
                        <AllotmentRow
                          key={a.id}
                          allotment={a}
                          onVacate={handleVacate}
                          vacating={vacatingId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════
           MODAL: CREATE HOSTEL BUILDING
         ══════════════════════════════════════════ */}
      <Modal
        isOpen={showHostelModal}
        onClose={() => !savingHostel && setShowHostelModal(false)}
        title="New Hostel Building"
      >
        <form onSubmit={handleCreateHostel} className="space-y-4">
          <Field label="Building Name">
            <input
              required
              className={inputCls}
              placeholder="e.g. Ganga Boys Hostel"
              value={hostelForm.hostelName}
              onChange={(e) => setHostelForm({ ...hostelForm, hostelName: e.target.value })}
            />
          </Field>

          <Field label="Hostel Type">
            <select
              className={selectCls}
              value={hostelForm.hostelType}
              onChange={(e) => setHostelForm({ ...hostelForm, hostelType: e.target.value })}
            >
              {HOSTEL_TYPES.map((t) => (
                <option key={t} value={t}>{HOSTEL_TYPE_META[t]?.label ?? t}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Warden Name">
              <input
                required
                className={inputCls}
                placeholder="Full Name"
                value={hostelForm.wardenName}
                onChange={(e) => setHostelForm({ ...hostelForm, wardenName: e.target.value })}
              />
            </Field>
            <Field label="Warden Phone">
              <input
                required
                className={inputCls}
                placeholder="10-digit number"
                value={hostelForm.wardenPhone}
                onChange={(e) => setHostelForm({ ...hostelForm, wardenPhone: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Total Rooms (approx.)">
            <input
              required
              type="number"
              min="1"
              className={inputCls}
              placeholder="e.g. 40"
              value={hostelForm.totalRooms}
              onChange={(e) => setHostelForm({ ...hostelForm, totalRooms: e.target.value })}
            />
          </Field>

          <Field label="Address">
            <textarea
              rows={2}
              className={inputCls}
              placeholder="Building location / block"
              value={hostelForm.address}
              onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })}
            />
          </Field>

          <button
            type="submit"
            disabled={savingHostel}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                       text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
          >
            {savingHostel ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
            {savingHostel ? 'Saving…' : 'Save Building'}
          </button>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════
           MODAL: ADD ROOM
         ══════════════════════════════════════════ */}
      <Modal
        isOpen={showRoomModal}
        onClose={() => !savingRoom && setShowRoomModal(false)}
        title={`Add Room · ${selectedHostel?.hostelName ?? ''}`}
      >
        <form onSubmit={handleAddRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room Number">
              <input
                required
                className={inputCls}
                placeholder="101 / A-12"
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              />
            </Field>
            <Field label="Capacity (beds)">
              <input
                required
                type="number"
                min="1"
                className={inputCls}
                placeholder="e.g. 2"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Room Type">
            <select
              className={selectCls}
              value={roomForm.roomType}
              onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{ROOM_TYPE_META[t]?.label ?? t}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Fee (₹)">
              <input
                required
                type="number"
                min="0"
                className={inputCls}
                placeholder="e.g. 3500"
                value={roomForm.monthlyFee}
                onChange={(e) => setRoomForm({ ...roomForm, monthlyFee: e.target.value })}
              />
            </Field>
            <Field label="Floor (optional)">
              <input
                className={inputCls}
                placeholder="e.g. 2"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              />
            </Field>
          </div>

          {/* Amenity toggles */}
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={roomForm.hasAC}
                onChange={(e) => setRoomForm({ ...roomForm, hasAC: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1.5">
                <Wind size={14} className="text-sky-500" /> AC Room
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={roomForm.hasAttachedBath}
                onChange={(e) => setRoomForm({ ...roomForm, hasAttachedBath: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1.5">
                <Bath size={14} className="text-violet-500" /> Attached Bath
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={savingRoom}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700
                       text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
          >
            {savingRoom ? <Loader2 size={16} className="animate-spin" /> : <BedDouble size={16} />}
            {savingRoom ? 'Adding…' : 'Add to Inventory'}
          </button>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════
           MODAL: ALLOT ROOM TO STUDENT
         ══════════════════════════════════════════ */}
      <Modal
        isOpen={showAllotModal}
        onClose={() => !savingAllot && setShowAllotModal(false)}
        title="Assign Student to Room"
        maxW="max-w-md"
      >
        <form onSubmit={handleAllotRoom} className="space-y-4">
          {/* Target room info card */}
          {targetRoom && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
                <BedDouble size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Target Room</p>
                <p className="font-bold text-indigo-800 text-sm">
                  Room {targetRoom.roomNumber}
                  <span className="ml-2 font-normal text-indigo-500 text-[11px]">
                    {ROOM_TYPE_META[targetRoom.roomType]?.label}
                    {' · '}{targetRoom.currentOccupancy ?? 0}/{targetRoom.capacity} occupied
                  </span>
                </p>
                <p className="text-[11px] text-indigo-400 mt-0.5">
                  ₹{Number(targetRoom.monthlyFee ?? 0).toLocaleString('en-IN')}/month
                </p>
              </div>
            </div>
          )}

          <Field label="Student ID">
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="number"
                className={`${inputCls} pl-9`}
                placeholder="Enter student ID"
                value={allotForm.studentId}
                onChange={(e) => setAllotForm({ ...allotForm, studentId: e.target.value })}
              />
            </div>
          </Field>

          <Field label="Allotment Date">
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="date"
                className={`${inputCls} pl-9`}
                value={allotForm.allotmentDate}
                onChange={(e) => setAllotForm({ ...allotForm, allotmentDate: e.target.value })}
              />
            </div>
          </Field>

          <Field label="Remarks (optional)">
            <div className="relative">
              <StickyNote size={14} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                className={`${inputCls} pl-9`}
                placeholder="Any special notes…"
                value={allotForm.remarks}
                onChange={(e) => setAllotForm({ ...allotForm, remarks: e.target.value })}
              />
            </div>
          </Field>

          <button
            type="submit"
            disabled={savingAllot}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                       text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
          >
            {savingAllot ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            {savingAllot ? 'Confirming…' : 'Confirm Allotment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HostelManagement;
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, Smartphone, History, TrendingDown, TrendingUp, Sun, Moon, AlertCircle, Search, Trash2, Download, PlusCircle, Share2, Copy, Check, Eye, EyeOff, Target, Sparkles, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("pengeluaran");
  const [balanceOnline, setBalanceOnline] = useState(1350000);
  const [balanceCash, setBalanceCash] = useState(-50000);
  const [nominal, setNominal] = useState("");
  const [source, setSource] = useState("Online");
  const [category, setCategory] = useState("Makan & Minum");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [note, setNote] = useState("");
  
  const [transactions, setTransactions] = useState([
    { id: 1, type: "pengeluaran", amount: 50000, source: "Cash", category: "Makan & Minum", note: "Beli kopi siang", date: "1 November 2023" }
  ]);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [budgetLimit, setBudgetLimit] = useState(1000000);
  const [showAlert, setShowAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Fitur Baru: Privacy Mode (Sembunyikan Saldo)
  const [hideBalance, setHideBalance] = useState(false);

  // Fitur Baru: Toast Notification Message
  const [toastMessage, setToastMessage] = useState(null);

  // Fitur Baru: Target Tabungan (Goals)
  const [goalTitle, setGoalTitle] = useState("Beli Laptop Impian");
  const [goalTarget, setGoalTarget] = useState(5000000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalTitle, setTempGoalTitle] = useState("");
  const [tempGoalTarget, setTempGoalTarget] = useState("");

  const totalWealth = balanceOnline + balanceCash;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleTransaction = (e) => {
    e.preventDefault();
    const val = parseFloat(nominal);
    if (!val || val <= 0) return;

    const finalCategory = isCustomCategoryActive && customCategory.trim() ? customCategory.trim() : category;

    if (activeTab === "pengeluaran") {
      if (source === "Online") setBalanceOnline(prev => prev - val);
      else setBalanceCash(prev => prev - val);
    } else if (activeTab === "pemasukan") {
      if (source === "Online") setBalanceOnline(prev => prev + val);
      else setBalanceCash(prev => prev + val);
    } else if (activeTab === "mutasi") {
      if (source === "Online") {
        setBalanceOnline(prev => prev - val);
        setBalanceCash(prev => prev + val);
      } else {
        setBalanceCash(prev => prev - val);
        setBalanceOnline(prev => prev + val);
      }
    }

    const newTx = {
      id: Date.now(),
      type: activeTab,
      amount: val,
      source: source,
      category: activeTab === "mutasi" ? "Transfer Saldo" : finalCategory,
      note: note || "-",
      date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setTransactions([newTx, ...transactions]);
    setNominal("");
    setNote("");
    setCustomCategory("");
    showToast(`Berhasil mencatat ${activeTab}!`);
  };

  const handleDeleteTransaction = (id) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    if (txToDelete.type === "pengeluaran") {
      if (txToDelete.source === "Online") setBalanceOnline(prev => prev + txToDelete.amount);
      else setBalanceCash(prev => prev + txToDelete.amount);
    } else if (txToDelete.type === "pemasukan") {
      if (txToDelete.source === "Online") setBalanceOnline(prev => prev - txToDelete.amount);
      else setBalanceCash(prev => prev - txToDelete.amount);
    } else if (txToDelete.type === "mutasi") {
      if (txToDelete.source === "Online") {
        setBalanceOnline(prev => prev + txToDelete.amount);
        setBalanceCash(prev => prev - txToDelete.amount);
      } else {
        setBalanceCash(prev => prev + txToDelete.amount);
        setBalanceOnline(prev => prev - txToDelete.amount);
      }
    }

    setTransactions(transactions.filter(t => t.id !== id));
    showToast("Transaksi berhasil dihapus & saldo disesuaikan.");
  };

  const totalPengeluaranBulanIni = transactions
    .filter(t => t.type === "pengeluaran")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const budgetPercentage = Math.min(Math.round((totalPengeluaranBulanIni / budgetLimit) * 100), 100);
  const goalPercentage = Math.min(Math.round((Math.max(totalWealth, 0) / goalTarget) * 100), 100);

  useEffect(() => {
    if (totalPengeluaranBulanIni >= budgetLimit * 0.8) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [totalPengeluaranBulanIni, budgetLimit]);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Tipe,Nominal,Sumber,Kategori,Catatan,Tanggal\n";
    transactions.forEach(t => {
      csvContent += `${t.id},${t.type},${t.amount},${t.source},"${t.category}","${t.note}",${t.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_keuangan_cashflowly.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File laporan CSV berhasil diunduh!");
  };

  const handleShare = async () => {
    let textSummary = `*Laporan Keuangan CashFlowly*\n`;
    textSummary += `Total Kekayaan: ${formatRupiah(totalWealth)}\n`;
    textSummary += `Pengeluaran Bulan Ini: ${formatRupiah(totalPengeluaranBulanIni)}\n\n`;
    textSummary += `*Riwayat Transaksi Terakhir:*\n`;
    
    transactions.slice(0, 5).forEach((t, index) => {
      textSummary += `${index + 1}. [${t.type.toUpperCase()}] ${formatRupiah(t.amount)} (${t.category}) - ${t.note}\n`;
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Laporan CashFlowly', text: textSummary });
      } catch (err) {
        console.log("Share dibatalkan");
      }
    } else {
      navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("Ringkasan laporan berhasil disalin ke clipboard!");
    }
  };

  const formatRupiah = (val) => {
    if (hideBalance) return "Rp •••••••";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const pieData = [
    { name: "Makan & Minum", value: transactions.filter(t => t.category === "Makan & Minum" && t.type === "pengeluaran").reduce((a,c) => a+c.amount, 0) },
    { name: "Hobi & Digital", value: transactions.filter(t => t.category === "Hobi & Digital" && t.type === "pengeluaran").reduce((a,c) => a+c.amount, 0) },
    { name: "Transportasi", value: transactions.filter(t => t.category === "Transportasi" && t.type === "pengeluaran").reduce((a,c) => a+c.amount, 0) },
    { name: "Lainnya", value: transactions.filter(t => t.category === "Lainnya" && t.type === "pengeluaran").reduce((a,c) => a+c.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Toast Notification Pop-up */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'}`}>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">CashFlowly</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            title="Bagikan Ringkasan"
            className={`p-2 rounded-full transition flex items-center gap-1.5 text-xs font-medium px-3 ${isDarkMode ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-slate-100 text-emerald-600 hover:bg-slate-200'}`}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? "Disalin!" : "Bagikan"}
          </button>
          <button 
            onClick={exportToCSV}
            title="Download Laporan CSV"
            className={`p-2 rounded-full transition flex items-center gap-1.5 text-xs font-medium px-3 ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Download size={16} /> Ekspor
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* Total Wealth & Privacy Toggle Card */}
        <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} relative overflow-hidden text-center space-y-4`}>
          <button 
            onClick={() => setHideBalance(!hideBalance)}
            className="absolute top-4 right-4 p-2 rounded-lg opacity-60 hover:opacity-100 transition"
            title={hideBalance ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
          >
            {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Total Kekayaan</p>
            <h2 className="text-3xl font-extrabold mt-1">{formatRupiah(totalWealth)}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-center gap-1.5 text-xs opacity-70 mb-1">
                <Smartphone size={14} /> Online
              </div>
              <p className="font-bold text-base">{formatRupiah(balanceOnline)}</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-center gap-1.5 text-xs opacity-70 mb-1">
                <Wallet size={14} /> Uang Cash
              </div>
              <p className="font-bold text-base">{formatRupiah(balanceCash)}</p>
            </div>
          </div>
        </div>

        {/* Fitur Baru: Target Celengan Impian (Goals) */}
        <div className={`p-4 rounded-2xl shadow-md border space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              <Target size={15} className="text-blue-400" /> Target: {goalTitle}
            </div>
            <button 
              onClick={() => {
                if (!isEditingGoal) {
                  setTempGoalTitle(goalTitle);
                  setTempGoalTarget(goalTarget);
                }
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-[11px] text-blue-400 hover:underline"
            >
              {isEditingGoal ? "Simpan" : "Ubah Target"}
            </button>
          </div>

          {isEditingGoal ? (
            <div className="space-y-2 pt-1">
              <input 
                type="text" 
                value={tempGoalTitle} 
                onChange={(e) => setTempGoalTitle(e.target.value)}
                placeholder="Nama target..."
                className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
              <input 
                type="number" 
                value={tempGoalTarget} 
                onChange={(e) => setTempGoalTarget(e.target.value)}
                placeholder="Nominal target (Rp)..."
                className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              />
              <button 
                onClick={() => {
                  if (tempGoalTitle) setGoalTitle(tempGoalTitle);
                  if (tempGoalTarget) setGoalTarget(parseFloat(tempGoalTarget));
                  setIsEditingGoal(false);
                  showToast("Target tabungan diperbarui!");
                }}
                className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Terapkan Target Baru
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-[11px] opacity-70">
                <span>Terkumpul {goalPercentage}%</span>
                <span>Target: {formatRupiah(goalTarget)}</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${goalPercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>

        {/* Indikator Budget & Progress Bar */}
        <div className={`p-4 rounded-2xl shadow-md border space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between text-xs font-medium">
            <span className="opacity-70">Pengeluaran vs Limit Budget</span>
            <span className={budgetPercentage >= 80 ? "text-red-400 font-bold" : "opacity-90"}>
              {formatRupiah(totalPengeluaranBulanIni)} / {formatRupiah(budgetLimit)}
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div 
              className={`h-full transition-all duration-500 ${budgetPercentage >= 80 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-400'}`}
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Alert Budget */}
        {showAlert && (
          <div className={`p-3 rounded-xl flex items-center gap-3 border ${isDarkMode ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <AlertCircle size={22} className="shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Peringatan Budget!</span> Pengeluaran sudah mencapai atau melewati 80% dari batas limit.
            </div>
          </div>
        )}

        {/* Tab Navigasi Transaksi */}
        <div className={`flex rounded-xl p-1 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={() => setActiveTab("pengeluaran")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "pengeluaran" ? 'bg-blue-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
          >
            Pengeluaran
          </button>
          <button 
            onClick={() => setActiveTab("pemasukan")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "pemasukan" ? 'bg-emerald-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
          >
            Pemasukan
          </button>
          <button 
            onClick={() => setActiveTab("mutasi")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "mutasi" ? 'bg-amber-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
          >
            Mutasi Saldo
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleTransaction} className={`p-5 rounded-2xl shadow-md border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <label className="block text-xs font-medium opacity-70 mb-1.5">Nominal (Rp)</label>
            <input 
              type="number" 
              value={nominal} 
              onChange={(e) => setNominal(e.target.value)}
              placeholder="Contoh: 50000"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-70 mb-1.5">Sumber / Tujuan Dana</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource("Online")}
                className={`py-2 rounded-xl text-xs font-medium border transition ${source === "Online" ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-transparent opacity-60'}`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setSource("Cash")}
                className={`py-2 rounded-xl text-xs font-medium border transition ${source === "Cash" ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-transparent opacity-60'}`}
              >
                Cash
              </button>
            </div>
          </div>

          {activeTab !== "mutasi" && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium opacity-70">Kategori</label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategoryActive(!isCustomCategoryActive)}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <PlusCircle size={12} /> {isCustomCategoryActive ? "Pilih Kategori Standar" : "Buat Kategori Baru"}
                </button>
              </div>

              {isCustomCategoryActive ? (
                <input 
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ketik nama kategori baru..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-slate-100' : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800'}`}
                  required
                />
              ) : (
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  required
                >
                  <option value="Makan & Minum">Makan & Minum</option>
                  <option value="Hobi & Digital">Hobi & Digital</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium opacity-70 mb-1.5">Catatan (Opsional)</label>
            <input 
              type="text" 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Beli makan siang di kantin..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold text-sm shadow-lg hover:opacity-95 transition"
          >
            Catat {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </form>

        {/* Grafik Distribusi Pengeluaran & Smart Insight */}
        {pieData.length > 0 && (
          <div className={`p-5 rounded-2xl shadow-md border space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-semibold text-center">Distribusi Pengeluaran</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Smart Insight Asisten Pintar */}
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${isDarkMode ? 'bg-blue-950/30 border-blue-900/50 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              <Sparkles size={16} className="shrink-0" />
              <span>
                {budgetPercentage < 50 ? "Keuangan bulan ini terpantau sangat sehat dan terkontrol dengan baik! 🎉" : budgetPercentage < 80 ? "Pengeluaran stabil, tetap jaga alokasi dana ya!" : "Waspada! Pengeluaran mendekati batas limit bulananmu."}
              </span>
            </div>
          </div>
        )}

        {/* Riwayat Transaksi & Fitur Pencarian */}
        <div className={`p-5 rounded-2xl shadow-md border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <History size={16} /> Riwayat Transaksi
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={14} className="opacity-50" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="bg-transparent outline-none w-full text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-2 px-2">Tanggal / Tipe</th>
                  <th className="py-2 px-2">Kategori</th>
                  <th className="py-2 px-2">Catatan</th>
                  <th className="py-2 px-2 text-right">Nominal</th>
                  <th className="py-2 px-1 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 opacity-50">Tidak ada transaksi yang ditemukan.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-2">
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-[10px] opacity-50">{tx.date} • {tx.source}</div>
                      </td>
                      <td className="py-3 px-2 font-medium">{tx.category}</td>
                      <td className="py-3 px-2 opacity-85 italic max-w-[120px] truncate" title={tx.note}>
                        {tx.note}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${tx.type === 'pemasukan' ? 'text-emerald-400' : tx.type === 'pengeluaran' ? 'text-red-400' : 'text-amber-400'}`}>
                        {tx.type === 'pemasukan' ? '+' : tx.type === 'pengeluaran' ? '-' : '⇄'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-1 text-center">
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

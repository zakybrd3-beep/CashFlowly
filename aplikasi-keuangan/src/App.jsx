import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, PlusCircle, Trash2, 
  Search, Download, Share2, Eye, EyeOff, Bell, Target, 
  Tag, RefreshCw, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export default function App() {
  // State Keuangan & Saldo Awal
  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('cashflowly_initial_balance');
    return saved ? Number(saved) : 1000000;
  });
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(initialBalance);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('cashflowly_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Gaji Bulanan', amount: 4500000, type: 'income', category: 'Gaji', date: '2026-10-01' },
      { id: 2, title: 'Belanja Bulanan', amount: 750000, type: 'expense', category: 'Belanja', date: '2026-10-02' },
      { id: 3, title: 'Bensin & Transport', amount: 150000, type: 'expense', category: 'Transport', date: '2026-10-03' }
    ];
  });

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('cashflowly_categories');
    return saved ? JSON.parse(saved) : ['Gaji', 'Belanja', 'Transport', 'Makanan', 'Hiburan', 'Lainnya'];
  });

  const [savingsTarget, setSavingsTarget] = useState(() => {
    const saved = localStorage.getItem('cashflowly_target');
    return saved ? Number(saved) : 5000000;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('cashflowly_budget');
    return saved ? Number(saved) : 2000000;
  });

  const [privacyMode, setPrivacyMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Selamat datang di CashFlowly! Kelola keuanganmu dengan mudah.', time: 'Baru saja' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form Input Transaksi Baru
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Makanan');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Simpan ke LocalStorage
  useEffect(() => {
    localStorage.setItem('cashflowly_initial_balance', initialBalance);
    localStorage.setItem('cashflowly_transactions', JSON.stringify(transactions));
    localStorage.setItem('cashflowly_categories', JSON.stringify(customCategories));
    localStorage.setItem('cashflowly_target', savingsTarget);
    localStorage.setItem('cashflowly_budget', monthlyBudget);
  }, [initialBalance, transactions, customCategories, savingsTarget, monthlyBudget]);

  // Hitung Total Keuangan
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const currentNetWorth = initialBalance + totalIncome - totalExpense;
  const budgetPercentage = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;
  const savingsPercentage = savingsTarget > 0 ? Math.min((currentNetWorth / savingsTarget) * 100, 100) : 0;

  // Tambah Transaksi
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newTx = {
      id: Date.now(),
      title,
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTx, ...transactions]);
    setTitle('');
    setAmount('');

    // Tambah Notifikasi
    setNotifications([
      { id: Date.now(), text: `Berhasil mencatat ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${title}`, time: 'Baru saja' },
      ...notifications
    ]);
  };

  // Hapus Transaksi
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Tambah Kategori Kustom
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName && !customCategories.includes(newCategoryName)) {
      setCustomCategories([...customCategories, newCategoryName]);
      setCategory(newCategoryName);
      setNewCategoryName('');
    }
  };

  // Ekspor CSV
  const exportToCSV = () => {
    const headers = "ID,Judul,Jumlah,Tipe,Kategori,Tanggal\n";
    const rows = transactions.map(t => `${t.id},"${t.title}",${t.amount},${t.type},${t.category},${t.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cashflowly_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Transaksi
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || t.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatRupiah = (number) => {
    if (privacyMode) return 'Rp ••••••••';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Header & Navigasi */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                CashFlowly
              </h1>
              <p className="text-xs text-slate-400">Pencatat Keuangan Estetik & Pintar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Mode Privasi */}
            <button 
              onClick={() => setPrivacyMode(!privacyMode)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              title="Sembunyikan/Tampilkan Saldo"
            >
              {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Tombol Notifikasi */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Notifikasi Aktivitas
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-slate-200">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Kartu Total Kekayaan & Edit Saldo Awal */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Total Kekayaan / Saldo Utama
            </span>
            <button 
              onClick={() => { setIsEditingBalance(true); setTempBalance(initialBalance); }}
              className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-lg transition font-medium text-white"
            >
              ✏️ Edit Saldo Awal
            </button>
          </div>

          {isEditingBalance ? (
            <div className="flex gap-2 mt-3 bg-white/10 p-3 rounded-2xl backdrop-blur">
              <input 
                type="number" 
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                className="px-3 py-2 rounded-xl text-slate-900 font-bold w-full focus:outline-none"
                placeholder="Masukkan saldo awal..."
              />
              <button 
                onClick={() => {
                  const parsed = Number(tempBalance);
                  setInitialBalance(isNaN(parsed) ? 0 : parsed);
                  setIsEditingBalance(false);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl font-bold text-sm text-white transition shadow-lg"
              >
                Simpan
              </button>
            </div>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
              {formatRupiah(currentNetWorth)}
            </h2>
          )}

          {/* Ringkasan Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Pemasukan</p>
                <p className="text-sm sm:text-base font-bold text-emerald-300">{formatRupiah(totalIncome)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-rose-500/20 p-2.5 rounded-xl">
                <TrendingDown className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Pengeluaran</p>
                <p className="text-sm sm:text-base font-bold text-rose-300">{formatRupiah(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Budget & Target Tabungan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Batas Budget Bulanan
              </span>
              <span className="text-xs text-slate-400">{Math.round(budgetPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full transition-all duration-500 ${budgetPercentage > 85 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                style={{ width: `${budgetPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Terpakai: {formatRupiah(totalExpense)}</span>
              <span>Limit: {formatRupiah(monthlyBudget)}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Target Tabungan Impian
              </span>
              <span className="text-xs text-slate-400">{Math.round(savingsPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${savingsPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Terkumpul: {formatRupiah(currentNetWorth)}</span>
              <span>Target: {formatRupiah(savingsTarget)}</span>
            </div>
          </div>
        </div>

        {/* Form Tambah Transaksi & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-lg">
            <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-400" /> Tambah Transaksi Baru
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Judul Transaksi</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Beli Kopi" 
                    className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 25000" 
                    className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Jenis</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="expense">Pengeluaran (-)</option>
                    <option value="income">Pemasukan (+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Simpan Transaksi
              </button>
            </form>
          </div>

          {/* Pengaturan Kategori & Ekspor */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" /> Kategori Kustom
              </h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nama kategori baru..."
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold py-2 rounded-xl transition"
                >
                  Tambah Kategori
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button 
                onClick={exportToCSV}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" /> Ekspor ke CSV
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'CashFlowly', text: `Total Kekayaan saya saat ini: ${formatRupiah(currentNetWorth)}` });
                  } else {
                    alert('Fitur bagikan tidak didukung di browser ini.');
                  }
                }}
                className="w-full bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-300 font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs"
              >
                <Share2 className="w-4 h-4" /> Bagikan Laporan
              </button>
            </div>
          </div>
        </div>

        {/* Riwayat Transaksi & Pencarian */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h3 className="text-base font-bold text-slate-200">Riwayat Transaksi</h3>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full bg-slate-800 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select 
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">Semua Kategori</option>
                {customCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">Belum ada transaksi yang ditemukan.</p>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center bg-slate-800/60 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">{t.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-md text-slate-300">{t.category}</span>
                        <span className="text-[10px] text-slate-400">{t.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

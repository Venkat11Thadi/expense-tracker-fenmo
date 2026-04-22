import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Plus, Search, Calendar, Tag, FileText } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/expenses';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?sort=${sortOrder}`;
      if (filterCategory) url += `&category=${filterCategory}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a slight debounce to the filter so it doesn't spam the API on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filterCategory, sortOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const amountInCents = Math.round(parseFloat(amount) * 100);

    const newExpense = {
      amount: amountInCents,
      category,
      description,
      date,
      idempotency_key: uuidv4(),
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error('Failed to save expense');

      setAmount('');
      setCategory('');
      setDescription('');
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalVisible = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 100;

  // Shared input styling for a cohesive UI
  const inputClass = "w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#2F2F2F] font-sans selection:bg-gray-200">
      <div className="max-w-2xl mx-auto p-8 pt-16">

        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-black mb-2">Expenses</h1>
          <p className="text-gray-500 text-sm">Track and manage your spending.</p>
        </header>

        {error && (
          <div className="mb-8 p-4 text-sm border-l-4 border-black bg-gray-100 text-black">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm mb-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Amount ($)
                </label>
                <input
                  type="number" step="0.01" min="0.01" required
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className={inputClass} placeholder="0.00"
                />
              </div>
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Tag className="w-3 h-3 mr-1" /> Category
                </label>
                <input
                  type="text" required
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className={inputClass} placeholder="e.g., Food"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <FileText className="w-3 h-3 mr-1" /> Description
              </label>
              <input
                type="text" required
                value={description} onChange={(e) => setDescription(e.target.value)}
                className={inputClass} placeholder="What was this for?"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
              <div className="w-full md:w-1/2">
                <label className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Calendar className="w-3 h-3 mr-1" /> Date
                </label>
                <input
                  type="date" required
                  value={date} onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full md:w-1/2 h-[42px] bg-black text-white text-sm font-medium rounded-md flex justify-center items-center hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4 mr-2" /> Add Entry</>}
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Total Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by category..."
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-9 p-2 text-sm bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
            />
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">Total</span>
            <span className="text-lg font-bold text-black">${totalVisible.toFixed(2)}</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {expenses.length === 0 && !loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">No expenses found.</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="group bg-white p-4 border border-gray-100 hover:border-gray-300 rounded-lg flex justify-between items-center transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black mb-1">{exp.description}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase text-gray-600">
                      {exp.category}
                    </span>
                    <span>{exp.date}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-black">
                  ${(exp.amount / 100).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
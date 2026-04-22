import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Plus, Search, Calendar, Tag, FileText, Trash2, Edit2, X } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/expenses';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  
  // Filter & Sort State
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
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filterCategory, sortOrder]);

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    const expenseData = {
      amount: amountInCents,
      category,
      description,
      date,
      idempotency_key: editingId ? undefined : uuidv4(), 
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      
      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'save'} expense`);
      
      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Populate form for editing
  const handleEdit = (exp) => {
    setAmount((exp.amount / 100).toFixed(2));
    setCategory(exp.category);
    setDescription(exp.description);
    setDate(exp.date);
    setEditingId(exp.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // Handle Deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      
      if (editingId === id) resetForm();
      
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const totalVisible = expenses.reduce((sum, exp) => sum + exp.amount, 0) / 100;

  const inputClass = "w-full p-2.5 text-sm bg-[#FBFCFA] border border-[#CCD4C5] rounded-md focus:bg-white focus:ring-2 focus:ring-[#728A76] focus:border-[#728A76] outline-none transition-all placeholder:text-[#88998C] text-[#1A231C]";

  return (
    <div className="min-h-screen bg-[#F2F4F0] text-[#1A231C] font-sans selection:bg-[#CCD4C5]">
      <div className="max-w-2xl mx-auto p-8 pt-16">
        
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#1A231C] mb-2">Expenses</h1>
          <p className="text-[#516355] text-sm font-medium">Track and manage your spending.</p>
        </header>

        {error && (
          <div className="mb-8 p-4 text-sm border-l-4 border-red-400 bg-red-50 text-red-800 rounded-r-md shadow-sm">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className={`bg-white p-8 border ${editingId ? 'border-[#728A76] shadow-md' : 'border-[#E1E6D9] shadow-sm'} rounded-xl mb-12 relative overflow-hidden transition-all duration-300`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 ${editingId ? 'bg-[#2A3C2F]' : 'bg-[#728A76]'} transition-colors`}></div>

          <div className="flex justify-between items-center mt-2 mb-6">
             <h2 className="text-sm font-bold text-[#1A231C] uppercase tracking-wider">
               {editingId ? 'Edit Expense' : 'New Expense'}
             </h2>
             {editingId && (
               <button type="button" onClick={resetForm} className="text-[#88998C] hover:text-[#1A231C] text-xs font-bold uppercase flex items-center transition-colors">
                 <X className="w-3.5 h-3.5 mr-1" /> Cancel Edit
               </button>
             )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-xs font-bold text-[#516355] uppercase tracking-wider mb-2">
                  Amount ($)
                </label>
                <input 
                  type="number" step="0.01" min="0.01" required 
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className={inputClass} placeholder="0.00"
                />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[#516355] uppercase tracking-wider mb-2">
                  <Tag className="w-3.5 h-3.5 mr-1.5 text-[#728A76]" /> Category
                </label>
                <input 
                  type="text" required 
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className={inputClass} placeholder="e.g., Food"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center text-xs font-bold text-[#516355] uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-[#728A76]" /> Description
              </label>
              <input 
                type="text" required 
                value={description} onChange={(e) => setDescription(e.target.value)}
                className={inputClass} placeholder="What was this for?"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
              <div className="w-full md:w-1/2">
                <label className="flex items-center text-xs font-bold text-[#516355] uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#728A76]" /> Date
                </label>
                <input 
                  type="date" required 
                  value={date} onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full md:w-1/2 h-[42px] bg-[#2A3C2F] text-[#F2F4F0] text-sm font-semibold rounded-md flex justify-center items-center hover:bg-[#1A231C] disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                  editingId ? <><Edit2 className="w-4 h-4 mr-2" /> Update Entry</> : <><Plus className="w-4 h-4 mr-2" /> Add Entry</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Total Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#88998C]" />
            <input 
              type="text" 
              placeholder="Filter by category..." 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-9 p-2.5 text-sm bg-white border border-[#E1E6D9] rounded-md focus:ring-2 focus:ring-[#728A76] focus:border-[#728A76] outline-none transition-all text-[#1A231C] shadow-sm"
            />
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-md border border-[#E1E6D9] shadow-sm">
            <span className="text-xs font-bold text-[#516355] uppercase tracking-wider mr-3">Total</span>
            <span className="text-xl font-bold text-[#2A3C2F]">${totalVisible.toFixed(2)}</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {expenses.length === 0 && !loading ? (
            <div className="bg-white border border-dashed border-[#CCD4C5] rounded-xl p-10 flex flex-col items-center justify-center text-[#88998C]">
              <FileText className="w-8 h-8 mb-3 opacity-50" />
              <p className="text-sm font-medium">No expenses match your criteria.</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="group bg-white p-4 border border-[#E1E6D9] hover:border-[#A9B8A5] rounded-xl flex justify-between items-center transition-all shadow-sm hover:shadow relative">
                
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-[#1A231C] mb-1.5 text-left">{exp.description}</span>
                  <div className="flex items-center gap-3 text-xs text-[#516355]">
                    <span className="bg-[#E6EBE0] text-[#2A3C2F] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {exp.category}
                    </span>
                    <span className="font-medium">{exp.date}</span>
                  </div>
                </div>

                {/* Price and Actions Wrapper */}
                <div className="flex items-center gap-4">
                   <div className="text-base font-bold text-[#1A231C]">
                    ${(exp.amount / 100).toFixed(2)}
                  </div>
                  
                  {/* FIXED: Edit and Delete Actions are now permanently visible */}
                  <div className="flex items-center gap-1.5 border-l border-[#E1E6D9] pl-4">
                     <button 
                       onClick={() => handleEdit(exp)}
                       className="p-1.5 text-[#728A76] hover:text-[#2A3C2F] hover:bg-[#E6EBE0] rounded transition-colors"
                       title="Edit Expense"
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDelete(exp.id)}
                       className="p-1.5 text-[#E07A5F] hover:text-[#C15C42] hover:bg-red-50 rounded transition-colors"
                       title="Delete Expense"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
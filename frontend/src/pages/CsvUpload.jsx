import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import { FileUp, CheckCircle, AlertCircle, UploadCloud, FileText } from 'lucide-react';

const CsvUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState('bulk');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/admin/upload-cutoffs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatus('success');
      setFile(null);
    } catch (err) {
      console.error('Upload error', err);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.06),_transparent_24%),linear-gradient(180deg,#f8fafc,#f1f5f9)] text-slate-800">
      <AdminSidebar />
      
      <main className="flex-1 p-12">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">Bulk Data Upload</h1>
          <p className="text-slate-500 max-w-2xl">Upload CSV files containing historical TS EAMCET cutoff data in a premium admin workflow.</p>
        </header>

        <div className="max-w-3xl">
          <div className="mb-8 flex flex-wrap gap-3">
            <button onClick={() => setMode('bulk')} className={`px-4 py-2 rounded-xl transition ${mode==='bulk' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300/80'}`}>Bulk Upload (CSV)</button>
            <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-xl transition ${mode==='manual' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300/80'}`}>Add College Manually</button>
          </div>

          {mode === 'bulk' ? (
            <>
              <div className={`border-2 border-dashed rounded-[3rem] p-16 text-center transition-all ${
                file ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
              }`}>
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-colors ${
                  file ? 'bg-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-100 text-slate-400'
                }`}>
                  {file ? <FileText size={48} /> : <UploadCloud size={48} />}
                </div>

                {file ? (
                  <div className="mb-8">
                    <p className="text-xl font-bold text-slate-900 mb-1">{file.name}</p>
                    <p className="text-slate-455 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-xl font-bold text-slate-900 mb-2">Select a CSV File</p>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                      Drag and drop your file here, or click the button below to browse your computer.
                    </p>
                  </div>
                )}

                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <label 
                    htmlFor="file-upload"
                    className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-black px-10 py-5 rounded-2xl cursor-pointer transition-all uppercase tracking-widest text-xs"
                  >
                    Choose File
                  </label>
                ) : (
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => setFile(null)}
                      className="bg-slate-100 hover:bg-slate-205 text-slate-700 border border-slate-200 font-black px-8 py-5 rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-black px-10 py-5 rounded-2xl transition-all uppercase tracking-widest text-xs shadow-xl shadow-purple-600/20 disabled:opacity-50"
                    >
                      {uploading ? 'Processing...' : 'Confirm Upload'}
                    </button>
                  </div>
                )}
              </div>

              {status === 'success' && (
                <div className="mt-8 bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] flex items-center gap-4 text-emerald-800">
                  <CheckCircle size={24} className="text-emerald-600" />
                  <div>
                    <p className="font-bold">Upload Successful!</p>
                    <p className="text-sm opacity-80">EAMCET cutoff database has been updated with new records.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-[2rem] flex items-center gap-4 text-red-800">
                  <AlertCircle size={24} className="text-red-655" />
                  <div>
                    <p className="font-bold">Upload Failed</p>
                    <p className="text-sm opacity-80">There was an error processing the CSV file. Please check the format.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Add College Manually</h3>
              <ManualCollegeForm onAdded={() => { setMode('bulk'); setStatus('success'); }} />
            </div>
          )}
          
        </div>

        {/* Instructions */}
        <div className="mt-16 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-slate-805 font-bold mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-purple-605 text-purple-600" />
            CSV Format Requirements
          </h3>
          <ul className="space-y-4 text-slate-600 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-800 font-bold flex-shrink-0">1</span>
              Columns must be in order: <code>institute_code, institute_name, place, district_code, branch_code, branch_name, category, gender, closing_rank, year</code>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-800 font-bold flex-shrink-0">2</span>
              Gender values should be <code>M</code> (Male) or <code>F</code> (Female). <code>B</code> (Both) is also accepted for co-ed.
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-800 font-bold flex-shrink-0">3</span>
              File must be in <code>.csv</code> format and under 10MB in size.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

const ManualCollegeForm = ({ onAdded }) => {
  const [meta, setMeta] = useState({ institute_code: '', institute_name: '', place: '', district_code: '', year: new Date().getFullYear(), is_autonomous: false });
  const [cutoffsJson, setCutoffsJson] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cutoffs = JSON.parse(cutoffsJson);
      setSaving(true);
      await api.post('/admin/colleges', { ...meta, cutoffs });
      setSaving(false);
      setMeta({ institute_code: '', institute_name: '', place: '', district_code: '', year: new Date().getFullYear(), is_autonomous: false });
      setCutoffsJson('');
      onAdded && onAdded();
    } catch (err) {
      console.error('Failed to add college', err);
      alert('Invalid cutoffs JSON or server error');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={meta.institute_code} onChange={e => setMeta({...meta, institute_code: e.target.value})} placeholder="Institute Code" className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" required />
        <input value={meta.institute_name} onChange={e => setMeta({...meta, institute_name: e.target.value})} placeholder="Institute Name" className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" required />
        <input value={meta.place} onChange={e => setMeta({...meta, place: e.target.value})} placeholder="Place" className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" />
        <input value={meta.district_code} onChange={e => setMeta({...meta, district_code: e.target.value})} placeholder="District Code" className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" />
      </div>

      <div>
        <label className="text-sm text-slate-500 mb-2 block font-semibold">Cutoffs (JSON array)</label>
        <textarea value={cutoffsJson} onChange={e => setCutoffsJson(e.target.value)} placeholder='Example: [{"branch_code":"CSE","branch_name":"Computer Science","category":"OC","gender":"M","closing_rank":1200}]' className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 h-40 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" required />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-750 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-purple-600/10">{saving ? 'Saving...' : 'Add College'}</button>
      </div>
    </form>
  );
};

export default CsvUpload;

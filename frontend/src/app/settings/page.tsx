'use client';

import { useEffect, useState } from 'react';
import { Save, Bell, Shield, SlidersHorizontal, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-neutral-400 mt-2">Manage global behavior and notification channels.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Detection Rules */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold border-b border-[#222] pb-2">
            <Shield size={20} className="text-teal-500" /> Detection Rules
          </div>
          
          <div className="p-5 rounded-xl bg-[#111] border border-[#222] space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Severity Threshold</label>
              <select 
                value={settings.severity_threshold || ''} 
                onChange={e => handleChange('severity_threshold', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              >
                <option value="info">Info (All findings)</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5"><AlertTriangle size={12}/> Controls when the action fails the CI build.</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold border-b border-[#222] pb-2">
            <Bell size={20} className="text-orange-500" /> Notifications
          </div>
          
          <div className="p-5 rounded-xl bg-[#111] border border-[#222] space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">GitHub Issues</div>
                <div className="text-xs text-neutral-500 mt-1">Create or update a tracking issue per repo.</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings.notify_github_issue === 'true' || settings.notify_github_issue === true}
                  onChange={e => handleChange('notify_github_issue', String(e.target.checked))}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.notify_github_issue === 'true' || settings.notify_github_issue === true ? 'bg-teal-500' : 'bg-[#333]'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.notify_github_issue === 'true' || settings.notify_github_issue === true ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Webhook Alerts</div>
                <div className="text-xs text-neutral-500 mt-1">Send summary payload via POST request.</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings.notify_webhook === 'true' || settings.notify_webhook === true}
                  onChange={e => handleChange('notify_webhook', String(e.target.checked))}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${settings.notify_webhook === 'true' || settings.notify_webhook === true ? 'bg-teal-500' : 'bg-[#333]'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.notify_webhook === 'true' || settings.notify_webhook === true ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

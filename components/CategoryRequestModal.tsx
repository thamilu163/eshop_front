import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryRequestModal({ onClose, onSuccess }: Props) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/seller/categories/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName, description, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit request');
      }
      onSuccess();
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Request New Category</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Category Name</label>
            <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Reason</label>
            <Input value={reason} onChange={e => setReason(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>Submit Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

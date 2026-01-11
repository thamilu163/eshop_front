"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function fetchCategories() {
  return fetch('/api/admin/categories').then(res => res.json());
}
function fetchRequests() {
  return fetch('/api/admin/categories/requests/pending').then(res => res.json());
}
function createCategory(name: string) {
  return fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(res => res.json());
}
function deleteCategory(id: string) {
  return fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
}
function approveRequest(id: string, remarks: string) {
  return fetch(`/api/admin/categories/requests/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved: true, remarks }),
  }).then(res => res.json());
}
function rejectRequest(id: string, remarks: string) {
  return fetch(`/api/admin/categories/requests/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved: false, remarks }),
  }).then(res => res.json());
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchRequests().then(setRequests);
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createCategory(newCategory);
    setNewCategory('');
    setLoading(false);
    fetchCategories().then(setCategories);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteCategory(id);
    setLoading(false);
    fetchCategories().then(setCategories);
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    await approveRequest(id, remarks);
    setLoading(false);
    fetchRequests().then(setRequests);
    fetchCategories().then(setCategories);
    setRemarks('');
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    await rejectRequest(id, remarks);
    setLoading(false);
    fetchRequests().then(setRequests);
    setRemarks('');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" required />
        <Button type="submit" disabled={loading}>+ Add New Category</Button>
      </form>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Category List</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="p-2">{cat.id}</td>
                <td className="p-2">{cat.name}</td>
                <td className="p-2">
                  {/* Edit can be added here */}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cat.id)} disabled={loading}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">Category Name</th>
              <th className="p-2">Seller</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td className="p-2">{req.id}</td>
                <td className="p-2">{req.categoryName}</td>
                <td className="p-2">{req.sellerName}</td>
                <td className="p-2">{req.reason}</td>
                <td className="p-2 flex gap-2">
                  <Input
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Remarks"
                    className="w-32"
                  />
                  <Button size="sm" onClick={() => handleApprove(req.id)} disabled={loading}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} disabled={loading}>Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

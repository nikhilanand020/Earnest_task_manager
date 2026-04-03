"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../../lib/api";
import { toast } from "react-hot-toast";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controls state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadTasks = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (search) queryParams.append("search", search);

      const res = await fetchApi(`/tasks?${queryParams.toString()}`);
      setTasks(res.tasks);
      setTotal(res.total);
    } catch (err: any) {
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("accessToken");
        router.replace("/login");
      } else {
        toast.error("Failed to load tasks");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, limit, statusFilter, search, router]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadTasks();
  }, [page, statusFilter, loadTasks, router]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1); 
      loadTasks(true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search, loadTasks]);

  const handleLogout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
    } catch (err) {}
    localStorage.removeItem("accessToken");
    router.replace("/login");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: newTaskTitle }),
      });
      setNewTaskTitle("");
      setPage(1); 
      loadTasks(true);
      toast.success("Task created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await fetchApi(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle }),
      });
      setEditingId(null);
      loadTasks(true);
      toast.success("Task updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update task");
    }
  };

  const toggleTask = async (id: string, currentStatus: string) => {
    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: currentStatus === 'completed' ? 'pending' : 'completed' } : t));
      await fetchApi(`/tasks/${id}/toggle`, { method: "PATCH" });
      loadTasks(true); 
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      loadTasks(true); 
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetchApi(`/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
      const currentItems = tasks.length;
      if (currentItems === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadTasks(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="flex h-screen items-center justify-center p-8 bg-gray-50"><p className="text-gray-500">Loading your tasks...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">Task Management</h1>
            <p className="text-sm text-gray-500 mt-1">Stay organized and productive.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 sm:w-auto"
          >
            Logout
          </button>
        </header>

        {/* Filter & Add */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="flex-1 rounded border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="w-full md:w-36 rounded border border-gray-300 p-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <form onSubmit={handleCreateTask} className="mb-8 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="What needs to be done?"
            className="flex-1 text-base rounded border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newTaskTitle.trim()}
            className="w-full sm:w-auto shrink-0 rounded bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Add Task
          </button>
        </form>

        {/* List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-500">
              {search || statusFilter !== 'all' ? 'No tasks match your criteria.' : 'You have no tasks yet. Add one above!'}
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex flex-col gap-3 rounded-lg border p-4 transition sm:flex-row sm:items-center sm:justify-between ${task.status === 'completed' ? 'bg-gray-50/70 border-gray-200' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}
              >
                <div className="flex flex-1 items-start gap-4 sm:items-center">
                  <div className="flex h-full items-center pt-1 sm:pt-0">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => toggleTask(task.id, task.status)}
                      className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-600"
                    />
                  </div>
                  
                  {/* Inline Editing */}
                  {editingId === task.id ? (
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <input 
                        autoFocus
                        type="text"
                        className="flex-1 rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(task.id)} className="rounded bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition">Save</button>
                        <button onClick={() => setEditingId(null)} className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col">
                      <span className={`text-base font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        <span>&middot;</span>
                        <span className={`capitalize font-medium ${task.status === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>
                          {task.status}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {editingId !== task.id && (
                  <div className="flex justify-end gap-2 border-t pt-3 sm:border-0 sm:pt-0">
                    <button 
                      onClick={() => startEdit(task)}
                      className="rounded bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {total > limit && (
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-500">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAccessToken } from "../api";
import { useProjectSocket } from "../useSocket";
import NotificationBell from "../NotificationBell";

interface Task {
  id: number;
  title: string;
  status: string;
  assigneeId: number | null;
}

interface Member {
  userId: number;
  role: "OWNER" | "MEMBER" | "VIEWER";
  user: { id: number; name: string; email: string };
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  tasks: Task[];
  members: Member[];
}

interface Me {
  id: number;
  name: string;
  email: string;
}

const STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const STATUS_COLORS: Record<string, string> = {
  "todo": "bg-gray-100 text-gray-700",
  "in-progress": "bg-yellow-100 text-yellow-800",
  "done": "bg-green-100 text-green-800",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-800",
  MEMBER: "bg-blue-100 text-blue-800",
  VIEWER: "bg-gray-100 text-gray-600",
};

function AddTask({
  projectId, members, onChanged,
}: { projectId: number; members: Member[]; onChanged: () => void }) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, projectId, assigneeId: assigneeId || undefined }),
    });
    setTitle("");
    setAssigneeId("");
    onChanged();
  };

  return (
    <form onSubmit={submit} className="flex gap-2 mt-3">
      <input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="New task..."
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className="border rounded px-2 py-1 text-sm" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>{m.user.name}</option>
        ))}
      </select>
      <button className="bg-gray-800 text-white text-sm rounded px-3">Add</button>
    </form>
  );
}

function TaskRow({
  task, members, canEdit, onChanged,
}: { task: Task; members: Member[]; canEdit: boolean; onChanged: () => void }) {
  const changeStatus = async (status: string) => {
    await api(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    onChanged();
  };

  const changeAssignee = async (assigneeId: string) => {
    await api(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ assigneeId: assigneeId || null }),
    });
    onChanged();
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await api(`/tasks/${task.id}`, { method: "DELETE" });
    onChanged();
  };

  const assignee = members.find((m) => m.userId === task.assigneeId);

  return (
    <li className="flex items-center justify-between gap-2 border-b py-2 text-sm">
      <div>
        <span className={task.status === "done" ? "line-through text-gray-400" : ""}>
          {task.title}
        </span>
        <div className="text-[11px] text-gray-400">
          {assignee ? `Assigned to ${assignee.user.name}` : "Unassigned"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit && (
          <select
            value={task.assigneeId ?? ""}
            onChange={(e) => changeAssignee(e.target.value)}
            className="rounded px-2 py-1 text-xs border"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
        )}
        <select
          value={task.status}
          disabled={!canEdit}
          onChange={(e) => changeStatus(e.target.value)}
          className={`rounded px-2 py-1 text-xs disabled:opacity-60 ${STATUS_COLORS[task.status] ?? ""}`}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {canEdit && (
          <button onClick={remove} className="text-red-600 text-xs hover:underline">
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

function MembersPanel({
  project, isOwner, onChanged,
}: { project: Project; isOwner: boolean; onChanged: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api(`/projects/${project.id}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setEmail("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member");
    }
  };

  const remove = async (userId: number) => {
    if (!window.confirm("Remove this member?")) return;
    await api(`/projects/${project.id}/members/${userId}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <div className="mt-4 border-t pt-3">
      <h4 className="text-sm font-semibold mb-2">Members</h4>
      <ul className="space-y-1 mb-3">
        {project.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between text-sm">
            <span>{m.user.name} <span className="text-gray-400">({m.user.email})</span></span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${ROLE_COLORS[m.role]}`}>{m.role}</span>
              {isOwner && m.role !== "OWNER" && (
                <button onClick={() => remove(m.userId)} className="text-red-600 text-xs hover:underline">
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={invite} className="flex gap-2">
          {error && <p className="text-red-600 text-xs w-full">{error}</p>}
          <input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Invite by email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="border rounded px-2 py-1 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button className="bg-gray-800 text-white text-sm rounded px-3">Invite</button>
        </form>
      )}
    </div>
  );
}

function ProjectCard({ project, me, onChanged }: { project: Project; me: Me | null; onChanged: () => void }) {
  useProjectSocket(project.id, onChanged);

  const role = project.members.find((m) => m.userId === me?.id)?.role;
  const canEdit = role === "OWNER" || role === "MEMBER";

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        {role && (
          <span className={`text-xs px-2 py-0.5 rounded ${ROLE_COLORS[role]}`}>
            Your role: {role}
          </span>
        )}
      </div>
      {project.description && <p className="text-gray-600 text-sm">{project.description}</p>}

      <ul className="mt-3">
        {project.tasks.map((task) => (
          <TaskRow key={task.id} task={task} members={project.members} canEdit={canEdit} onChanged={onChanged} />
        ))}
      </ul>

      {canEdit && <AddTask projectId={project.id} members={project.members} onChanged={onChanged} />}

      <MembersPanel project={project} isOwner={role === "OWNER"} onChanged={onChanged} />
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      const [meData, projectsData] = await Promise.all([
        api<Me>("/users/me"),
        api<Project[]>("/projects"),
      ]);
      setMe(meData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/projects", { method: "POST", body: JSON.stringify({ name, description }) });
    setName("");
    setDescription("");
    loadAll();
  };

  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setAccessToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DevFlow</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          {me && <span className="text-sm text-gray-600">{me.name}</span>}
          <button onClick={logout} className="text-sm text-red-600">Logout</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={createProject} className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="font-semibold">New project</h2>
          <input className="w-full border rounded px-3 py-2" placeholder="Project name"
            value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Description (optional)"
            value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="bg-blue-600 text-white rounded px-4 py-2">Create project</button>
        </form>

        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} me={me} onChanged={loadAll} />
        ))}
      </main>
    </div>
  );
}
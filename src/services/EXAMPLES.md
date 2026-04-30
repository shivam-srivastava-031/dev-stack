/**
 * Usage Examples for Stack REST APIs
 * 
 * This file demonstrates common patterns for using the REST API services
 * in React components
 */

// ============================================================================
// Example 1: Fetch Projects in a Component
// ============================================================================

import { useEffect, useState } from "react";
import { getProjects, Project } from "@/services";

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await getProjects();
      if (error) {
        setError(error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
};

// ============================================================================
// Example 2: Create a Project
// ============================================================================

import { createProject } from "@/services";

export const ProjectForm = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { data, error } = await createProject({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    });

    if (error) {
      alert(`Error: ${error}`);
    } else {
      alert(`Project created: ${data?.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" placeholder="Project name" required />
      <textarea
        name="description"
        placeholder="Project description"
      ></textarea>
      <button type="submit">Create Project</button>
    </form>
  );
};

// ============================================================================
// Example 3: Fetch and Update Tasks
// ============================================================================

import { getProjectTasks, updateTaskStatus, Task } from "@/services";

export const TaskBoard = ({ projectId }: { projectId: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await getProjectTasks(projectId);
      setTasks(data || []);
    };

    fetchTasks();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const { data, error } = await updateTaskStatus(
      taskId,
      newStatus as "todo" | "in_progress" | "done"
    );

    if (!error) {
      setTasks(tasks.map((t) => (t.id === taskId ? data! : t)));
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Example 4: Get User Profile
// ============================================================================

import { getCurrentUserProfile, updateProfile } from "@/services";

export const ProfileView = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    };

    fetchProfile();
  }, []);

  const handleUpdateName = async (newName: string) => {
    const { data } = await updateProfile({ full_name: newName });
    setProfile(data);
  };

  return (
    <div>
      <h2>{profile?.full_name}</h2>
      <button onClick={() => handleUpdateName("New Name")}>Update Name</button>
    </div>
  );
};

// ============================================================================
// Example 5: Manage Project Members
// ============================================================================

import { addProjectMember, removeProjectMember, getProjectMembers } from "@/services";

export const MembersManager = ({ projectId }: { projectId: string }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await getProjectMembers(projectId);
      setMembers(data || []);
    };

    fetchMembers();
  }, [projectId]);

  const handleAddMember = async (userId: string) => {
    const { error } = await addProjectMember(projectId, userId, "member");
    if (!error) {
      // Refresh members list
      const { data } = await getProjectMembers(projectId);
      setMembers(data || []);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await removeProjectMember(projectId, userId);
    if (!error) {
      setMembers(members.filter((m) => m.user_id !== userId));
    }
  };

  return (
    <div>
      <h3>Team Members ({members.length})</h3>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <span>{member.user_id}</span>
            <button onClick={() => handleRemoveMember(member.user_id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

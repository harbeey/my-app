export type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type Comment = {
  id: string;
  authorId: string;
  text: string;
  createdAt: Date;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

export type SubTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Task = {
  id: string;
  text: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  priority?: "high" | "medium" | "low";
  assignedTo?: string[];
  dueDate?: string;
  lastUpdatedAt?: Date;
  subTasks?: SubTask[];
  comments?: Comment[];
  attachments?: Attachment[];
};

export type List = {
  id: string;
  title: string;
  tasks: Task[];
};

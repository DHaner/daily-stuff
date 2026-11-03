export type TransactionKind = 'expense' | 'income';
export type Mood = 'good' | 'normal' | 'meh' | 'bad' | 'awful';

export interface Category {
  id: string;
  kind: TransactionKind;
  label: string;
  icon: string;
  color: string;
  position: number;
}

export interface CategoryInput {
  kind: TransactionKind;
  label: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  concept: string;
  amount: number;
  description: string;
  categoryId: string;
  /** `yyyy-MM-dd` */
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export interface JournalLabel {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export type JournalLabelInput = Pick<JournalLabel, 'name' | 'icon' | 'color'>;

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  note: string;
  labelIds: string[];
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JournalEntryInput = Pick<JournalEntry, 'mood' | 'note' | 'labelIds'>;

export interface TodoList {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export type TodoListInput = Pick<TodoList, 'name' | 'icon' | 'color'>;

export interface TodoTask {
  id: string;
  title: string;
  description: string;
  listId: string | null;
  dueDate: string | null;
  /** Local `yyyy-MM-ddTHH:mm`; the mobile app schedules the notification. */
  reminderAt: string | null;
  fileName: string | null;
  hasFile: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: string;
}

export type TodoTaskInput = Pick<TodoTask, 'title' | 'description' | 'listId' | 'dueDate' | 'reminderAt' | 'favorite'>;

export interface CategoryTotal {
  categoryId: string;
  label: string;
  color: string;
  amount: number;
}

export interface MonthTrend {
  /** `yyyy-MM` */
  month: string;
  income: number;
  expense: number;
}

export interface Dashboard {
  month: string;
  income: number;
  expense: number;
  balance: number;
  expensesByCategory: CategoryTotal[];
  trend: MonthTrend[];
  recentTransactions: Transaction[];
  pendingTasks: number;
  dueTasks: TodoTask[];
  journalEntries: number;
  moods: { mood: Mood; count: number }[];
}

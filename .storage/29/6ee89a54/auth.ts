// Authentication system using localStorage
export type UserRole = 'user' | 'creator' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  totalPoints: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_KEY = 'stylebank_auth';
const USERS_KEY = 'stylebank_users';

// Get all users from localStorage
export const getAllUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get current auth state
export const getAuthState = (): AuthState => {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) {
    return { user: null, isAuthenticated: false };
  }
  const user = JSON.parse(auth);
  return { user, isAuthenticated: true };
};

// Sign up new user
export const signUp = (email: string, password: string, username: string, role: UserRole = 'user'): { success: boolean; error?: string; user?: User } => {
  const users = getAllUsers();
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: '이미 존재하는 이메일입니다.' };
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return { success: false, error: '이미 존재하는 사용자명입니다.' };
  }
  
  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    username,
    role,
    totalPoints: 0,
    createdAt: new Date().toISOString()
  };
  
  // Save user
  users.push(newUser);
  saveUsers(users);
  
  // Store password separately (in real app, this would be hashed)
  const passwords = JSON.parse(localStorage.getItem('stylebank_passwords') || '{}');
  passwords[email] = password;
  localStorage.setItem('stylebank_passwords', JSON.stringify(passwords));
  
  // Auto login
  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  
  return { success: true, user: newUser };
};

// Sign in existing user
export const signIn = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }
  
  // Check password
  const passwords = JSON.parse(localStorage.getItem('stylebank_passwords') || '{}');
  if (passwords[email] !== password) {
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }
  
  // Set auth
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  
  return { success: true, user };
};

// Sign out
export const signOut = () => {
  localStorage.removeItem(AUTH_KEY);
};

// Update user profile
export const updateProfile = (updates: Partial<User>): { success: boolean; error?: string; user?: User } => {
  const authState = getAuthState();
  if (!authState.user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }
  
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === authState.user!.id);
  
  if (userIndex === -1) {
    return { success: false, error: '사용자를 찾을 수 없습니다.' };
  }
  
  // Update user
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  // Update auth state
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
  
  return { success: true, user: updatedUser };
};

// Add points to user
export const addPoints = (points: number): { success: boolean; user?: User } => {
  const authState = getAuthState();
  if (!authState.user) {
    return { success: false };
  }
  
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === authState.user!.id);
  
  if (userIndex === -1) {
    return { success: false };
  }
  
  users[userIndex].totalPoints += points;
  saveUsers(users);
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(users[userIndex]));
  
  return { success: true, user: users[userIndex] };
};

// Check if user has role
export const hasRole = (role: UserRole | UserRole[]): boolean => {
  const authState = getAuthState();
  if (!authState.user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(authState.user.role);
  }
  
  return authState.user.role === role;
};
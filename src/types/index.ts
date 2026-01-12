export type Size = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type Weight =
  | 'thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'
  | 'extrablack';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPwd: string;
}

export interface loginFormData {
  identifier: string;
  password: string;
}

export interface registerFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPwd?: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
export interface TodoState {
  data: Todo[];
  error: string | null | unknown;
}

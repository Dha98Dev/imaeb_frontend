export type ToastType =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;

  title: string;
  message?: string;

  duration: number;
  closable: boolean;

  actionLabel?: string;
  action?: () => void;
}

export interface ToastOptions {
  duration?: number;
  closable?: boolean;

  actionLabel?: string;
  action?: () => void;
}
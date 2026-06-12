import { ChangeEvent, MouseEvent } from 'react';
import { DocumentData } from 'firebase/firestore';

declare global {
  type FirebaseDoc = DocumentData & { id: string };
  
  interface ReactChangeEvent<T = HTMLInputElement> extends ChangeEvent<T> {}
  interface ReactMouseEvent<T = HTMLElement> extends MouseEvent<T> {}
}

export {}; 
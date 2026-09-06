import { X } from 'lucide-react';

export function Modal({ title, children, onClose }) {
  return <div className="overlay"><section className="modal"><button className="close" onClick={onClose}><X /></button><h2>{title}</h2>{children}</section></div>;
}

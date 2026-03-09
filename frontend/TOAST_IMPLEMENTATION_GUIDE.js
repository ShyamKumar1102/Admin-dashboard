/**
 * TOAST & CONFIRM MODAL IMPLEMENTATION GUIDE
 * 
 * Apply to all pages with alert() or window.confirm()
 * 
 * 1. Add imports:
 */
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';

/**
 * 2. Add state in component:
 */
const [confirmDelete, setConfirmDelete] = useState(null);
const { toast, showToast, hideToast } = useToast();

/**
 * 3. Replace alert() with:
 */
// alert('Success message');
showToast('Success message', 'success');

// alert('Error message');
showToast('Error message', 'error');

/**
 * 4. Replace window.confirm() with:
 */
// OLD:
// if (window.confirm('Are you sure?')) {
//   // delete logic
// }

// NEW:
const handleDelete = (id) => {
  setConfirmDelete(id);
};

const confirmDeleteAction = async () => {
  const id = confirmDelete;
  setConfirmDelete(null);
  // delete logic here
  showToast('Deleted successfully', 'success');
};

/**
 * 5. Add before closing </div>:
 */
{toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
{confirmDelete && (
  <ConfirmModal
    message="Are you sure you want to delete? This action cannot be undone."
    onConfirm={confirmDeleteAction}
    onCancel={() => setConfirmDelete(null)}
  />
)}

/**
 * PAGES COMPLETED:
 * ✅ Banners.jsx
 * ✅ Invoices.jsx
 * ✅ Customers.jsx
 * 
 * PAGES REMAINING:
 * - Devices.jsx
 * - Engineers.jsx
 * - Subscriptions.jsx
 * - FaultDevices.jsx
 */

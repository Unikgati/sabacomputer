import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import LaptopForm from '../../components/admin/LaptopForm.tsx';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { EditIcon, TrashIcon } from '../../components/Icons';
import { AdminRowSkeleton } from '../../components/DetailSkeletons';

interface Laptop {
    id: number;
    name: string;
    price?: number;
    categories?: string[];
    imageUrl?: string;
    galleryImages?: string[];
}

interface AdminLaptopsPageProps {
    laptops: Laptop[];
    onSave: (laptop: any) => void;
    onDelete: (id: number) => void;
}

export const AdminLaptopsPage: React.FC<AdminLaptopsPageProps> = ({ laptops = [], onSave, onDelete }) => {
    const { showToast } = useToast();
    const [editingLaptop, setEditingLaptop] = useState<any | null>(null);
    const [laptopToDelete, setLaptopToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { const t = setTimeout(() => setIsLoading(false), 300); return () => clearTimeout(t); }, []);

    const allCategories = useMemo(() => {
        const set = new Set<string>();
        laptops.forEach(l => { (l.categories || []).forEach(c => set.add(c)); });
        return Array.from(set).sort();
    }, [laptops]);

    const handleAddNew = () => {
        const template = { id: 0, name: '', price: 0, categories: [], imageUrl: '', galleryImages: [], description: '', inclusions: [] };
        setEditingLaptop(template); setIsFormVisible(true);
    };
    const handleEdit = (l: any) => { setEditingLaptop(l); setIsFormVisible(true); };

    const handleSave = async (laptop: any) => {
        try { await onSave(laptop); try { showToast('Laptop berhasil disimpan', 'success'); } catch {} setIsFormVisible(false); setEditingLaptop(null); } catch (err) { console.error('Save laptop failed', err); try { showToast('Gagal menyimpan laptop', 'error'); } catch {} }
    };

    const handleDeleteRequest = (l: any) => setLaptopToDelete(l);
    const handleConfirmDelete = async () => {
        if (!laptopToDelete) return; setIsDeleting(true);
        try { await Promise.resolve(onDelete(laptopToDelete.id)); try { showToast('Laptop berhasil dihapus', 'success'); } catch {} setLaptopToDelete(null); } catch (err) { console.error('Delete laptop failed', err); try { showToast('Gagal menghapus laptop', 'error'); } catch {} } finally { setIsDeleting(false); }
    };

    const formatPrice = (p?: number) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

    if (isFormVisible && editingLaptop) {
        return <LaptopForm laptop={editingLaptop} onSave={handleSave} onCancel={() => { setIsFormVisible(false); setEditingLaptop(null); }} allCategories={allCategories} />
    }

    return (
        <div>
            <div className="admin-page-actions">
                {(!isLoading && laptops.length > 0) && (<button className="btn btn-primary" onClick={handleAddNew}>Tambah Laptop</button>)}
            </div>
            <div className="admin-grid">
                {isLoading && Array.from({ length: 6 }).map((_, i) => (<AdminRowSkeleton key={i} />))}
                {!isLoading && laptops.length === 0 && (
                    <div className="admin-empty-state">
                        <h3>Belum ada laptop</h3>
                        <p>Tambahkan laptop baru untuk mulai menambahkan katalog.</p>
                        <div style={{ marginTop: '1rem' }}><button className="btn btn-primary" onClick={handleAddNew}>Tambah Laptop</button></div>
                    </div>
                )}
                {!isLoading && laptops.length > 0 && (
                    laptops.map(l => (
                        <div key={l.id} className="admin-item-card">
                            <img src={l.imageUrl} alt={l.name} className="admin-item-image" loading="lazy" decoding="async" />
                            <div className="admin-item-info">
                                <h3>{l.name}</h3>
                                <p>{formatPrice(l.price)}</p>
                            </div>
                            <div className="admin-item-actions">
                                <button className="btn-icon" onClick={() => handleEdit(l)} aria-label={`Edit ${l.name}`}><EditIcon /></button>
                                <button className="btn-icon delete" onClick={() => handleDeleteRequest(l)} aria-label={`Hapus ${l.name}`}><TrashIcon /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {laptopToDelete && (
                <ConfirmationModal isOpen={!!laptopToDelete} onClose={() => setLaptopToDelete(null)} onConfirm={handleConfirmDelete} title="Konfirmasi Penghapusan" confirmButtonText="Hapus" confirmButtonVariant="danger" isLoading={isDeleting}>
                    <p>Apakah Anda yakin ingin menghapus laptop <strong>{laptopToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AdminLaptopsPage;

import React, { useState, useRef } from 'react';
import { useToast } from '../../components/Toast';
import { XIcon, UploadCloudIcon, StarIcon, SpinnerIcon } from '../Icons';
import uploadToCloudinary from '../../lib/cloudinary';
import { ConfirmationModal } from '../ConfirmationModal';

interface LaptopFormProps {
    laptop: any;
    onSave: (laptop: any) => void;
    onCancel: () => void;
    allCategories: string[];
}

export const LaptopForm: React.FC<LaptopFormProps> = ({ laptop, onSave, onCancel, allCategories }) => {
    const { showToast } = useToast();
    const initial = { ...laptop, price: laptop.id === 0 ? '' : laptop.price, inclusions: laptop.inclusions || [] };
    const [formData, setFormData] = useState<any>(initial);
    const [imageUrls, setImageUrls] = useState<string[]>((laptop.galleryImages && laptop.galleryImages.length > 0) ? laptop.galleryImages : (laptop.imageUrl ? [laptop.imageUrl] : []));
    const [publicIds, setPublicIds] = useState<(string | null)[]>((laptop.galleryPublicIds && laptop.galleryPublicIds.length > 0) ? laptop.galleryPublicIds : (laptop.imagePublicId ? [laptop.imagePublicId] : []));
    const [uploadFiles, setUploadFiles] = useState<(File | null)[]>(imageUrls.map(() => null));
    const [uploadProgress, setUploadProgress] = useState<number[]>(imageUrls.map(() => 100));
    const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customInclusion, setCustomInclusion] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        if (name === 'price') setFormData((p: any) => ({ ...p, [name]: value === '' ? '' : Number(value) }));
        else setFormData((p: any) => ({ ...p, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return; const files = Array.from(e.target.files) as File[];
        files.forEach(file => {
            const reader = new FileReader(); reader.onloadend = () => {
                setImageUrls(prev => { const newIndex = prev.length; setUploadProgress(pp => { const np = [...pp]; np.splice(newIndex, 0, -2); return np; }); setUploadFiles(pp => { const nf = [...pp]; nf.splice(newIndex, 0, file); return nf; }); setPublicIds(pp => { const np = [...pp]; np.splice(newIndex, 0, null); return np; }); return [...prev, reader.result as string]; });
            }; reader.readAsDataURL(file as Blob);
        }); if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteImage = (index: number) => {
        const currentPid = publicIds[index];
        if (currentPid) setRemovedPublicIds(prev => prev.includes(currentPid) ? prev : [...prev, currentPid]);
        setPublicIds(prev => prev.filter((_, i) => i !== index));
        setImageUrls(prev => prev.filter((_, i) => i !== index));
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
        setUploadProgress(prev => prev.filter((_, i) => i !== index));
    };

    const handleSetMain = (index: number) => {
        if (index === 0) return; const newUrls = [...imageUrls]; const item = newUrls.splice(index, 1); const reordered = [item[0], ...newUrls]; setImageUrls(reordered);
        setUploadProgress(prev => { const p = [...prev]; const it = p.splice(index,1); return [it[0], ...p]; });
        setUploadFiles(prev => { const p = [...prev]; const it = p.splice(index,1); return [it[0], ...p]; });
        setPublicIds(prev => { const p = [...prev]; const it = p.splice(index,1); return [it[0], ...p]; });
    };

    const retryUpload = async (index: number) => { const file = uploadFiles[index]; if (!file) return; setUploadProgress(prev => { const np = [...prev]; np[index] = 0; return np; }); try { const res = await uploadToCloudinary(file, (pct: number) => setUploadProgress(prev => { const np = [...prev]; np[index] = pct; return np; })); setImageUrls(prev => { const arr = [...prev]; arr[index] = res.url; return arr; }); setPublicIds(prev => { const arr = [...prev]; arr[index] = res.public_id || null; return arr; }); setUploadFiles(prev => { const arr = [...prev]; arr[index] = null; return arr; }); setUploadProgress(prev => { const np = [...prev]; np[index] = 100; return np; }); } catch (err) { setUploadProgress(prev => { const np = [...prev]; np[index] = -1; return np; }); } };

    const addInclusion = () => { if (!customInclusion.trim()) return; if ((formData.inclusions || []).includes(customInclusion.trim())) return; setFormData((p:any) => ({ ...p, inclusions: [...(p.inclusions || []), customInclusion.trim()] })); setCustomInclusion(''); };
    const removeInclusion = (inc: string) => setFormData((p:any) => ({ ...p, inclusions: (p.inclusions || []).filter((i:string) => i !== inc) }));

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsSaving(true); setTimeout(async () => {
        const finalImageUrls = [...imageUrls]; const localPublicIds = finalImageUrls.map((_, i) => (publicIds[i] ?? null));
        for (let i = 0; i < finalImageUrls.length; i++) { const file = uploadFiles[i]; if (file) { try { setUploadProgress(prev => { const np = [...prev]; np[i] = 0; return np; }); const res = await uploadToCloudinary(file, (pct: number) => setUploadProgress(prev => { const np = [...prev]; np[i] = pct; return np; })); finalImageUrls[i] = res.url; localPublicIds[i] = res.public_id || null; setUploadFiles(prev => { const nf = [...prev]; nf[i] = null; return nf; }); setUploadProgress(prev => { const np = [...prev]; np[i] = 100; return np; }); } catch (err) { setUploadProgress(prev => { const np = [...prev]; np[i] = -1; return np; }); } } }
        setPublicIds(localPublicIds);
        const slug = formData.slug && formData.slug.trim() !== '' ? formData.slug.trim() : String(formData.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const finalData = { ...formData, slug, imageUrl: finalImageUrls[0] || '', galleryImages: finalImageUrls, imagePublicId: localPublicIds && localPublicIds[0] ? localPublicIds[0] : null, galleryPublicIds: localPublicIds && localPublicIds.length > 0 ? localPublicIds : [], ...(removedPublicIds && removedPublicIds.length > 0 ? { removed_public_ids: Array.from(new Set(removedPublicIds.filter(Boolean))) } : {}), price: formData.price === '' ? 0 : Number(formData.price) || 0, inclusions: formData.inclusions || [], categories: formData.categories || [] };
        try { await onSave(finalData); } catch (err:any) { const msg = (err && err.message) ? err.message : 'Gagal menyimpan laptop'; try { showToast(msg, 'error'); } catch {} }
    setIsSaving(false); }, 1200); };

    return (
        <div className="admin-card">
            <div className="admin-form-header"><h2>{formData.id === 0 ? 'Tambah' : 'Edit'} Laptop</h2></div>
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group"><label>Nama</label><input name="name" value={formData.name} onChange={handleChange} required/></div>
                <div className="form-group"><label>Galeri Gambar</label>
                    <div className="image-upload-grid">{imageUrls.map((url, index) => (
                        <div key={index} className="image-preview-item">
                            <img src={url} alt={`Preview ${index+1}`} loading="lazy" decoding="async" />
                            {index === 0 && <div className="main-image-badge">Utama</div>}
                            {uploadProgress[index] !== undefined && uploadProgress[index] >=0 && uploadProgress[index] < 100 && (<div className="upload-overlay"><div className="progress-circle">{uploadProgress[index]}%</div></div>)}
                            {uploadProgress[index] === -1 && (<div className="upload-overlay upload-failed"><button type="button" className="btn btn-secondary btn-small" onClick={() => retryUpload(index)}>Retry</button></div>)}
                            <div className="image-actions"><button type="button" className={`image-action-btn star ${index===0?'active':''}`} onClick={() => handleSetMain(index)} disabled={index===0}><StarIcon filled={index===0} /></button><button type="button" className="image-action-btn delete" onClick={() => handleDeleteImage(index)}><XIcon /></button></div>
                        </div>
                    ))}
                    <button type="button" className="upload-placeholder" onClick={() => fileInputRef.current?.click()}><UploadCloudIcon /><span>Unggah</span></button>
                    <input type="file" ref={fileInputRef} className="hidden-file-input" multiple accept="image/*" onChange={handleFileChange} />
                    </div></div>

                <div className="form-group"><label>Deskripsi</label><textarea name="description" value={formData.description} onChange={handleChange} /></div>

                <div className="form-group"><label>Kategori</label><input name="categories" value={(formData.categories || []).join(', ')} onChange={(e)=> setFormData((p:any)=>({...p, categories: String(e.target.value).split(',').map((s:string)=>s.trim()).filter(Boolean)}))} placeholder="pisahkan dengan koma" /></div>

                <div className="form-row-compact" style={{gridTemplateColumns: '1fr 1fr'}}>
                    <div className="form-group"><label>Harga (IDR)</label><input name="price" value={formData.price} onChange={handleChange} inputMode="numeric" /></div>
                    <div className="form-group"><label>Kelengkapan / yang didapat</label>
                        {formData.inclusions && formData.inclusions.length > 0 && (<div className="selected-facilities-list">{formData.inclusions.map((inc:string)=> (<div key={inc} className="selected-facility-item"><span>{inc}</span><button type="button" onClick={()=>removeInclusion(inc)}>&times;</button></div>))}</div>)}
                        <div style={{display:'flex', gap:8, marginTop:8}}><input value={customInclusion} onChange={(e)=>setCustomInclusion(e.target.value)} placeholder="Tambah kelengkapan..." /> <button type="button" className="btn btn-secondary" onClick={addInclusion}>Tambah</button></div>
                    </div>
                </div>

                <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>Batal</button>
                <button type="submit" className={`btn btn-primary ${isSaving ? 'loading' : ''}`} disabled={isSaving}>{isSaving && <SpinnerIcon/>}<span>Simpan</span></button></div>
            </form>
        </div>
    );
};

export default LaptopForm;

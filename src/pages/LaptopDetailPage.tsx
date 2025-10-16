import React, { useState, useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import Seo from '../components/Seo';
import { useNavigate } from 'react-router-dom';

interface LaptopDetailPageProps {
  laptop: any;
  setPage?: (p: any) => void;
  onBuyNow?: (l: any) => void;
}

export const LaptopDetailPage: React.FC<LaptopDetailPageProps> = ({ laptop, setPage, onBuyNow }) => {
  const [isLoading, setIsLoading] = useState(true);
  const imgs = useMemo(() => (Array.isArray(laptop.galleryImages) && laptop.galleryImages.length > 0) ? laptop.galleryImages : (laptop.imageUrl ? [laptop.imageUrl] : []), [laptop.galleryImages, laptop.imageUrl]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'accessories'>('about');
  const mainImageContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 300); return () => clearTimeout(t); }, []);

  const formattedPrice = laptop && laptop.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(laptop.price) : '-';

  useEffect(() => { window.scrollTo(0,0); try { document.title = laptop.name || 'Laptop'; } catch (e) {} }, [laptop.name]);

  if (isLoading) return <div className="page-container"><div className="container">Memuat...</div></div>;

  return (
    <div className="page-container laptop-detail-page">
      <Seo title={`${laptop.name} - ${document.title || ''}`} description={(laptop.description || '').slice(0,160)} url={window.location.href} image={laptop.imageUrl} siteName={document.title || ''} />
      <div className="container">
        <div className="page-header-with-back">
          <h1>{laptop.name}</h1>
        </div>

        <section className="gallery-container">
          <div className="main-image" ref={(el) => (mainImageContainerRef.current = el)}>
            <div className="main-image-track" style={{ transform: `translateX(${-currentIndex * 100}%)` }}>
              {imgs.map((src:string, idx:number) => (
                <div key={idx} className={`main-image-slide ${idx === currentIndex ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
              ))}
            </div>
          </div>
          <div className="thumbnail-grid">
            {imgs.map((img:string, idx:number) => (
              <button key={idx} className={`thumbnail ${idx === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(idx)} aria-label={`Lihat gambar ${idx+1}`}>
                <img src={img} alt={`Thumbnail ${idx+1}`} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </section>

        <div className="destination-content-layout">
          <main className="destination-main-content">
            <div className="destination-tabs">
              <div className="tab-list" role="tablist" aria-label="Informasi Laptop">
                <button className={`tab-button ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')} role="tab" aria-selected={activeTab === 'about'}>Deskripsi</button>
                <button className={`tab-button ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')} role="tab" aria-selected={activeTab === 'specs'}>Spesifikasi</button>
                <button className={`tab-button ${activeTab === 'accessories' ? 'active' : ''}`} onClick={() => setActiveTab('accessories')} role="tab" aria-selected={activeTab === 'accessories'}>Kelengkapan</button>
              </div>
            </div>

            <div className="tab-panel">
              {activeTab === 'about' && <div className="blog-detail-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(laptop.description || '') }} />}
              {activeTab === 'specs' && (
                <section className="specs-section">
                  <table className="specs-table">
                    <tbody>
                      <tr><th>RAM</th><td>{laptop.ram || '-'}</td></tr>
                      <tr><th>Storage</th><td>{laptop.storage || '-'}</td></tr>
                      <tr><th>CPU</th><td>{laptop.cpu || '-'}</td></tr>
                      <tr><th>Layar</th><td>{laptop.displayInch ? `${laptop.displayInch} inch` : '-'}</td></tr>
                      <tr><th>Kondisi</th><td>{laptop.condition || '-'}</td></tr>
                      <tr><th>Grade</th><td>{laptop.grade || '-'}</td></tr>
                    </tbody>
                  </table>
                </section>
              )}
              {activeTab === 'accessories' && (
                <section className="accessories-section">
                  <ul>
                    {(laptop.accessories || []).map((a:string, i:number) => (<li key={i}>{a}</li>))}
                  </ul>
                </section>
              )}
            </div>
          </main>

          <aside className="info-sidebar">
            <h3>Informasi Produk</h3>
            <div className="info-item"><strong>Harga</strong><div>{formattedPrice}</div></div>
            <div className="info-item"><strong>Kondisi</strong><div>{laptop.condition || '-'}</div></div>
            <div className="info-item"><strong>Grade</strong><div>{laptop.grade || '-'}</div></div>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary btn-large" onClick={() => { try { onBuyNow && onBuyNow(laptop); } catch {} }}>Beli Sekarang</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LaptopDetailPage;

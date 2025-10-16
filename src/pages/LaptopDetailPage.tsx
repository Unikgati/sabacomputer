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
            {/* Unified content: Description -> Specs (modern rounded table) -> Accessories */}
            <section className="laptop-unified-content">
              <div className="blog-detail-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(laptop.description || '') }} />

              <div className="specs-card specs-card--shadow" style={{ marginTop: '1.25rem' }}>
                <div className="specs-card-header">
                  <h3>Spesifikasi</h3>
                </div>
                <table className="specs-table">
                  <tbody>
                    {[
                      ['RAM', laptop.ram || '-'],
                      ['Storage', laptop.storage || '-'],
                      ['CPU', laptop.cpu || '-'],
                      ['Layar', laptop.displayInch ? `${laptop.displayInch} inch` : '-'],
                      ['Kondisi', laptop.condition || '-'],
                      ['Grade', laptop.grade || '-'],
                    ].map(([k, v], i) => (
                      <tr key={String(k)} className="specs-row">
                        <th className="specs-key">{k}</th>
                        <td className="specs-val">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(laptop.accessories && laptop.accessories.length > 0) && (
                <section className="accessories-section" style={{ marginTop: '1rem' }}>
                  <h3>Kelengkapan</h3>
                  <ul>
                    {(laptop.accessories || []).map((a:string, i:number) => (<li key={i}>{a}</li>))}
                  </ul>
                </section>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Sticky buy bar (similar to destination) */}
      <div className="sticky-booking-bar">
        <div className="container booking-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="booking-price-label">Harga</span>
            <span className="booking-price" style={{ display: 'block', fontSize: '1.125rem', fontWeight: 700 }}>{formattedPrice}</span>
          </div>
          <div>
            <button className="btn btn-primary btn-large" onClick={() => { try { onBuyNow && onBuyNow(laptop); } catch {} }}>Beli Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopDetailPage;

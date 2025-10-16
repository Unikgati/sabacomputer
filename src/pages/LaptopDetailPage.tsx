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
  // Drag / swipe state for carousel
  const mainImageTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mainImageTouchEndRef = useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState<number>(0);
  const dragXRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animTimeoutRef = useRef<number | null>(null);
  const ANIM_DURATION = 300; // ms
  // Precompute slide styles to avoid re-creating objects on each render
  const slideStyles = useMemo(() => imgs.map(src => ({ backgroundImage: `url(${src})` })), [imgs]);
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

        

        <div className="laptop-detail-grid">
          <div className="left-column">
            <section className="gallery-container">
              <div className="main-image square" ref={(el) => (mainImageContainerRef.current = el)}>
                <div
                  className="main-image-track"
                  onTouchStart={(e) => {
                    if (isAnimating) return;
                    const t = e.touches[0];
                    mainImageTouchStartRef.current = { x: t.clientX, y: t.clientY };
                    mainImageTouchEndRef.current = null;
                    if (animTimeoutRef.current) window.clearTimeout(animTimeoutRef.current);
                  }}
                  onTouchMove={(e) => {
                    if (isAnimating) return;
                    const start = mainImageTouchStartRef.current;
                    if (!start) return;
                    const t = e.touches[0];
                    const dx = t.clientX - start.x;
                    setDragX(dx);
                    dragXRef.current = dx;
                    mainImageTouchEndRef.current = { x: t.clientX, y: t.clientY };
                  }}
                  onTouchEnd={() => {
                    if (isAnimating) return;
                    const start = mainImageTouchStartRef.current;
                    const end = mainImageTouchEndRef.current;
                    if (!start) {
                      setDragX(0);
                      return;
                    }
                    const dx = (end ? end.x : start.x) - start.x;
                    const dy = end ? end.y - start.y : 0;
                    const absDx = Math.abs(dx);
                    const absDy = Math.abs(dy);
                    const SWIPE_THRESHOLD = 40; // px
                    if (absDx > SWIPE_THRESHOLD && absDx > absDy) {
                      if (dx < 0) {
                        setCurrentIndex(i => Math.min(imgs.length - 1, i + 1));
                      } else {
                        setCurrentIndex(i => Math.max(0, i - 1));
                      }
                    }
                    // animate snap back
                    setIsAnimating(true);
                    setDragX(0);
                    animTimeoutRef.current = window.setTimeout(() => {
                      setIsAnimating(false);
                      animTimeoutRef.current = null;
                    }, ANIM_DURATION);
                    mainImageTouchStartRef.current = null;
                    mainImageTouchEndRef.current = null;
                  }}
                  style={{
                    transform: `translateX(${ -currentIndex * 100 + (dragX / (mainImageContainerRef.current?.clientWidth || window.innerWidth)) * 100 }%)`,
                    transition: isAnimating ? `transform ${ANIM_DURATION}ms ease` : 'none',
                  }}
                >
                  {imgs.map((src:string, idx:number) => (
                    <div key={idx} className={`main-image-slide ${idx === currentIndex ? 'active' : ''}`} style={slideStyles[idx]} />
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
              <div className="blog-detail-content" style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(laptop.description || '') }} />
            </section>
          </div>
          <aside className="right-column">
            <div className="specs-card specs-card--shadow" style={{ marginTop: 0 }}>
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

              {(laptop.accessories && laptop.accessories.length > 0) && (
                <section className="accessories-section" style={{ marginTop: '1rem' }}>
                  <h3>Kelengkapan</h3>
                  <div className="accessories-badges" aria-label="Kelengkapan">
                    {(laptop.accessories || []).map((a:string, i:number) => (
                      <span key={i} className="accessory-badge" title={a}>{a}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
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

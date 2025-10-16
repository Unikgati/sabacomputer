import React from 'react';
// wishlist button moved to laptop detail page; keep card minimal

interface LaptopCardProps {
  laptop: any;
  onViewDetail: (l: any) => void;
  onBuyNow?: (l: any) => void;
  showCategories?: boolean;
}

const LaptopCardComponent: React.FC<LaptopCardProps> = ({ laptop, onViewDetail, onBuyNow, showCategories = true }) => {
  const id = laptop?.id;
  const name = laptop?.name || '';
  const imageUrl = laptop?.imageUrl || '';
  const galleryImages = laptop?.galleryImages || (imageUrl ? [imageUrl] : []);
  const price = Number(laptop?.price || 0);
  const formattedPrice = price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price) : '-';
  const categories = laptop?.categories || [];

  // wishlist handled on the laptop detail page

  const createSnippet = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent || '';
    const txt = tempDiv.textContent || tempDiv.innerText || '';
    return txt.slice(0, 180);
  };

  const snippet = createSnippet(laptop?.description || laptop?.longDescription || '');

  return (
    <article className="destination-card laptop-card" aria-labelledby={`laptop-title-${id}`} onClick={() => onViewDetail(laptop)}>
      <div className="card-image-container">
        <img src={galleryImages[0] || imageUrl} alt={name} loading="lazy" decoding="async" />
      </div>
      <div className="card-content">
        {showCategories && categories.length > 0 && (
          <div className="card-category-list">{categories.slice(0,2).map((c:string) => <span key={c} className="card-category-badge">{c}</span>)}</div>
        )}
        <h3 id={`laptop-title-${id}`}>{name}</h3>
        <p className="card-description">{snippet}</p>
        <div className="card-footer">
          <div>
            <span className="price-label">Harga</span>
            <p className="card-price">{formattedPrice}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export const LaptopCard = React.memo(LaptopCardComponent, (prevProps, nextProps) => {
  return prevProps.laptop?.id === nextProps.laptop?.id
    && prevProps.onViewDetail === nextProps.onViewDetail
    && prevProps.onBuyNow === nextProps.onBuyNow
    && prevProps.showCategories === nextProps.showCategories;
});

export default LaptopCard;

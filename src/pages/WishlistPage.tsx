import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Destination, Page } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { DestinationCard } from '../components/DestinationCard';
import { LaptopCard } from '../components/LaptopCard';
import { ArrowLeftIcon } from '../components/Icons';

interface WishlistPageProps {
    setPage: (page: Page) => void;
    onViewDetail: (d: Destination) => void;
    onBookNow: (d: Destination) => void;
    allDestinations: Destination[];
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ setPage, onViewDetail, onBookNow, allDestinations }) => {
    const { wishlist } = useWishlist();
    // assume wishlist now stores laptop ids; attempt to map against laptops first
    const wishlistedItems = allDestinations.filter(item => wishlist.includes(item.id));
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header">
                    <h1>Wishlist Saya</h1>
                    <p>Produk yang Anda simpan akan muncul di sini.</p>
                </div>
                {wishlistedItems.length > 0 ? (
                    <div className="destinations-grid homepage-grid wishlist-grid">
                        {wishlistedItems.map(item => <LaptopCard key={item.id} laptop={item} onViewDetail={onViewDetail} onBuyNow={onBookNow} showCategories={false} />)}
                    </div>
                ) : (
                    <div className="wishlist-empty-state">
                        <h2>Wishlist Anda kosong</h2>
                        <p>Mulai jelajahi produk dan tambahkan yang Anda suka ke sini!</p>
                        <button className="btn btn-primary" onClick={() => { navigate('/laptops'); try { setPage && (setPage as any)('laptops'); } catch {} }}>Jelajahi Produk</button>
                    </div>
                )}
            </div>
        </div>
    );
};
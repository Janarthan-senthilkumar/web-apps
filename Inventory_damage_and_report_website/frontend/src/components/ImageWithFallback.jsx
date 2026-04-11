import { useState } from 'react';
import { HiOutlinePhotograph } from 'react-icons/hi';

/**
 * Image component that handles loading errors by showing a fallback design.
 */
export default function ImageWithFallback({ src, alt, className, style, onClick, keyword }) {
    const [imgState, setImgState] = useState('initial'); // 'initial', 'unsplash', 'fallback'

    // Compute original intended image source
    let currentSrc = src;

    // If the original source failed, or was completely missing, try Unsplash
    if ((!src || imgState === 'unsplash') && imgState !== 'fallback') {
        if (keyword) {
            // Unsplash dynamic search URL
            currentSrc = `https://source.unsplash.com/featured/?${encodeURIComponent(keyword)}`;
        } else {
            // If no keyword is provided, skip right to static fallback
            setImgState('fallback');
        }
    }

    // If Unsplash ALSO failed (or was skipped), use local static fallbacks
    if (imgState === 'fallback') {
        const isDamage = keyword && keyword.toLowerCase().includes('damage') || src && src.toLowerCase().includes('damage');
        currentSrc = isDamage ? '/images/fallback-damage.png' : '/images/fallback-inventory.png';
    }

    const handleError = () => {
        if (imgState === 'initial') {
            // First failure: try unsplash
            setImgState('unsplash');
        } else if (imgState === 'unsplash') {
            // Second failure: stick to local static fallback
            setImgState('fallback');
        }
    };

    return (
        <img
            src={currentSrc}
            alt={alt || keyword || "Image"}
            className={className}
            style={{ ...style, objectFit: imgState === 'fallback' || imgState === 'unsplash' ? 'cover' : style?.objectFit }}
            onClick={onClick}
            onError={handleError}
            loading="lazy"
        />
    );
}

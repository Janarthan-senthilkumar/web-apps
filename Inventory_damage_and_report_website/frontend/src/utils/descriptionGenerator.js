/**
 * Generates a dynamic, unique description for a damaged item based on the item name and damage type.
 * 
 * @param {string} itemName - The name of the inventory item (e.g., "Laptop", "Glass Bottle")
 * @param {string} damageDescription - The original damage type/description from the DB (e.g., "Scratched", "Cracked")
 * @returns {string} The dynamically generated, contextual description.
 */
export const generateDynamicDescription = (itemName, damageDescription) => {
    if (!itemName || !damageDescription) return damageDescription || 'No description provided.';

    const lowerDamage = damageDescription.toLowerCase().trim();
    const cleanItemName = itemName.trim();

    // Contextual sentence templates based on common storage/warehouse damage types
    if (lowerDamage.includes('crack') || lowerDamage.includes('broken')) {
        return `${cleanItemName} with visible cracks/breakage caused by impact during handling.`;
    }

    if (lowerDamage.includes('tear') || lowerDamage.includes('torn')) {
        return `Packaging or surface of ${cleanItemName.toLowerCase()} torn on the side due to rough handling or moisture exposure.`;
    }

    if (lowerDamage.includes('scratch')) {
        return `${cleanItemName} surface scratched due to friction during transportation.`;
    }

    if (lowerDamage.includes('dent')) {
        return `${cleanItemName} dented on the exterior due to improper stacking or collision.`;
    }

    if (lowerDamage.includes('water') || lowerDamage.includes('wet') || lowerDamage.includes('spilled')) {
        return `${cleanItemName} shows signs of water/liquid damage due to accidental spills or a leaking environment.`;
    }

    // Default intelligent fallback combining both
    return `${cleanItemName} reported as: "${damageDescription}". Requires further inspection.`;
};

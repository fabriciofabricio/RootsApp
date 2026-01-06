import React from 'react';

const PRODUCTS = [
    { id: 'b1', name: 'Draft Beer (Pint)', price: 5.00, category: 'Beer' },
    { id: 'b2', name: 'Draft Beer (Half)', price: 3.00, category: 'Beer' },
    { id: 'b3', name: 'Bottled Lager', price: 4.50, category: 'Beer' },
    { id: 'b4', name: 'Craft IPA', price: 6.00, category: 'Beer' },
    { id: 'b5', name: 'Stout', price: 6.00, category: 'Beer' },
    { id: 'c1', name: 'Cola', price: 2.50, category: 'Soft Drink' },
    { id: 'c2', name: 'Lemonade', price: 2.50, category: 'Soft Drink' },
    { id: 's1', name: 'Chips', price: 1.50, category: 'Snack' },
    { id: 's2', name: 'Peanuts', price: 1.00, category: 'Snack' },
];

const ProductList = ({ onAddProduct }) => {
    return (
        <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto p-1">
            {PRODUCTS.map(product => (
                <button
                    key={product.id}
                    onClick={() => onAddProduct(product)}
                    className="flex flex-col items-center justify-center p-3 bg-surface hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-border rounded-lg shadow-sm active:scale-95 transition-all text-center"
                >
                    <span className="font-semibold text-sm text-main">{product.name}</span>
                    <span className="text-xs text-muted">${product.price.toFixed(2)}</span>
                </button>
            ))}
        </div>
    );
};

export default ProductList;

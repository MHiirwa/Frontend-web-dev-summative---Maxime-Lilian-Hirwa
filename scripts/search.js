// Search module
export const Search = {
    // Basic text search
    basicSearch(transactions, query) {
        if (!query) return transactions;
        
        const searchLower = query.toLowerCase();
        return transactions.filter(transaction => 
            transaction.description.toLowerCase().includes(searchLower) ||
            transaction.category.toLowerCase().includes(searchLower)
        );
    },

    // Advanced search with multiple criteria
    advancedSearch(transactions, criteria) {
        return transactions.filter(transaction => {
            let matches = true;
            
            if (criteria.type && transaction.type !== criteria.type) {
                matches = false;
            }
            
            if (criteria.category && transaction.category !== criteria.category) {
                matches = false;
            }
            
            if (criteria.minAmount && transaction.amount < criteria.minAmount) {
                matches = false;
            }
            
            if (criteria.maxAmount && transaction.amount > criteria.maxAmount) {
                matches = false;
            }
            
            if (criteria.startDate && new Date(transaction.date) < new Date(criteria.startDate)) {
                matches = false;
            }
            
            if (criteria.endDate && new Date(transaction.date) > new Date(criteria.endDate)) {
                matches = false;
            }
            
            return matches;
        });
    },

    // Search examples for demo purposes
    searchExamples: {
        'Food expenses': { type: 'expense', category: 'Food' },
        'Large transactions': { minAmount: 100 },
        'This month': { 
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
        }
    }
};
// Validation module
export const Validators = {
    patterns: {
        description: /^[a-zA-Z0-9\s\-.,!?]+$/, // Alphanumeric with common punctuation
        amount: /^\d+(\.\d{1,2})?$/, // Positive number with up to 2 decimals
        date: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
    },

    // Validate input against pattern
    validate(value, type) {
        if (!this.patterns[type]) {
            throw new Error(`Unknown validation type: ${type}`);
        }
        return this.patterns[type].test(value);
    },

    // Validate transaction object
    validateTransaction(transaction) {
        const errors = {};
        
        if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
            errors.type = 'Transaction type must be income or expense';
        }
        
        if (!transaction.description || !this.validate(transaction.description, 'description')) {
            errors.description = 'Description is required and can only contain letters, numbers, and common punctuation';
        }
        
        if (!transaction.amount || !this.validate(transaction.amount.toString(), 'amount')) {
            errors.amount = 'Amount must be a positive number with up to 2 decimal places';
        }
        
        if (!transaction.category) {
            errors.category = 'Category is required';
        }
        
        if (!transaction.date || !this.validate(transaction.date, 'date')) {
            errors.date = 'Valid date is required (YYYY-MM-DD)';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Validate settings object
    validateSettings(settings) {
        const errors = {};
        
        if (!settings.baseCurrency || !['USD', 'EUR', 'GBP'].includes(settings.baseCurrency)) {
            errors.baseCurrency = 'Invalid base currency';
        }
        
        if (settings.monthlyBudget && settings.monthlyBudget < 0) {
            errors.monthlyBudget = 'Monthly budget cannot be negative';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};
ALU Spend Wise - Personal Finance Tracker

Design Prototype
Figma Design: View Full Design Prototype :https://www.figma.com/design/aqZAnQ4eRzDNPMyaBf41xW/summative?node-id=0-1&t=4KUAu86LyUEb6g59-1

ALU Spend Wise is a modern, responsive web application designed to help students and individuals track their income and expenses effectively. With support for multiple currencies (USD/RWF) and an intuitive interface, it makes personal finance management simple and accessible.

Key Features
Financial Dashboard
Real-time Overview: Track your current balance, monthly income, expenses, and savings at a glance

Visual Statistics: Color-coded stat cards with hover effects for better user experience

Recent Transactions: Quick access to your latest financial activities

Transaction Management
Add Transactions: Simple form to record income and expenses with categories

Edit & Delete: Full CRUD functionality for transaction management

Smart Categorization: Pre-defined categories (Food, Entertainment, Transportation, Education, Housing, Income, Other)

Search & Sort: Find transactions quickly and sort by date or amount

Smart Settings
Multi-Currency Support: Switch between USD and RWF with custom conversion rates

Budget Tracking: Set and monitor monthly spending limits

Data Management: Export your financial data as JSON files and import when needed

Theme Options: Toggle between light and dark modes

User Experience
Responsive Design: Works perfectly on desktop, tablet, and mobile devices

Modern UI: Clean, professional interface with smooth animations

Interactive Elements: Hover effects, notifications, and intuitive navigation

Burger Menu: Compact navigation for mobile devices

Getting Started
Prerequisites
Modern web browser (Chrome, Firefox, Safari, Edge)

JavaScript enabled

Installation
Download the index.html file

Open it in your web browser

Start adding your transactions!

No server setup required - everything runs locally in your browser.

How to Use
Adding Transactions
Click "Add Transaction" in the navigation menu

Select transaction type (Income/Expense)

Fill in description, amount, category, and date

Click "Add Transaction" to save

Managing Transactions
View All: Go to "Transactions" to see your complete history

Search: Use the search bar to find specific transactions

Sort: Click "Sort by Date" or "Sort by Amount" to organize your data

Edit: Click the edit icon on any transaction

Delete: Click the delete icon to remove transactions

Setting Up Currency
Go to "Settings"

Select your base currency (USD or RWF)

Set the conversion rate (if using RWF)

Click "Save Currency Settings"

Budget Management
Navigate to "Settings"

Enter your monthly budget amount

Click "Save Budget"

Monitor your spending against your budget on the dashboard

Data Management
Exporting Data
Go to Settings -> Data Management

Click "Export Data" to download a JSON file with all your transactions and settings

Importing Data
Click "Import Data"

Select your previously exported JSON file

Your data will be automatically loaded

Clearing Data
Use "Clear All Data" to reset the application (irreversible)

Key Benefits for Students
Budget Awareness: Track spending against your monthly allowance

Multi-Currency: Perfect for international students dealing with different currencies

Simple Interface: Easy to use without financial expertise

Privacy: All data stored locally on your device

No Subscription: Completely free to use

Technical Details
Built With
HTML5: Semantic structure and accessibility

CSS3: Modern styling with Flexbox and Grid

JavaScript: Client-side functionality and data management

Local Storage: Persistent data storage in browser

Browser Compatibility
Chrome 60+

Firefox 55+

Safari 12+

Edge 79+

Data Structure
javascript
{
  "id": "unique_identifier",
  "type": "income|expense",
  "description": "Transaction description",
  "amount": 100.00,
  "category": "Food|Entertainment|Transportation|Education|Housing|Income|Other",
  "date": "YYYY-MM-DD",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
Support
For technical support or feature requests, please contact:

Email: support@aluspendwise.com

License
This project is open source and available under the MIT License.

Version History
v1.0.0 (Current)
Initial release with core functionality

Multi-currency support (USD/RWF)

Complete transaction management

Responsive design

Project Structure
text
ALU-Spend-Wise/
├── index.html              # Main application file
├── css/
│   ├── style.css          # Main stylesheet
│   ├── dashboard.css      # Dashboard components
│   └── responsive.css     # Mobile responsiveness
├── js/
│   ├── app.js             # Main application logic
│   ├── transactions.js    # Transaction management
│   ├── currency.js        # Currency handling
│   └── storage.js         # Local storage operations
└── assets/
    └── screenshots/       # Application previews
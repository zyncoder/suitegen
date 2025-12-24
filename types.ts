export enum AppTool {
  MD_TO_PDF = 'MD_TO_PDF',
  INVOICE_GENERATOR = 'INVOICE_GENERATOR',
  POMODORO = 'POMODORO',
  JSON_BEAUTIFIER = 'JSON_BEAUTIFIER'
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
  currency: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

// Initial/Default data
export const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  fromName: 'Your Company',
  fromEmail: 'hello@company.com',
  fromAddress: '123 Business Rd, Tech City, CA',
  toName: 'Client Name',
  toEmail: 'client@example.com',
  toAddress: '456 Client Ln, Business City, NY',
  items: [
    { description: 'Consulting Services', quantity: 10, price: 150 },
    { description: 'Software Development', quantity: 20, price: 120 }
  ],
  notes: 'Thank you for your business. Please pay within 14 days.',
  taxRate: 10,
  currency: 'USD'
};

export const DEFAULT_MARKDOWN = `# Project Proposal
## Executive Summary
This document outlines the strategy for the upcoming Q4 deliverables.

### Key Objectives
1. **Increase Performance**: Optimization of the core engine.
2. **User Experience**: Revamp the dashboard UI.
3. **Security**: Implement 2FA for all users.

> "Innovation distinguishes between a leader and a follower." - Steve Jobs

### Timeline
- [x] Phase 1: Planning
- [ ] Phase 2: Execution
- [ ] Phase 3: Review

| Feature | Status | Priority |
| :--- | :--- | :--- |
| Auth | Complete | High |
| Billing | In Progress | High |
| Analytics | Pending | Medium |
`;
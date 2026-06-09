-- Sales Module Tables

-- Proposals Table
CREATE TABLE IF NOT EXISTS sales_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(255) NOT NULL,
  customer VARCHAR(255) NOT NULL,
  project VARCHAR(255),
  prepared_for VARCHAR(255),
  prepared_by VARCHAR(255),
  date DATE NOT NULL,
  valid_until DATE,
  currency VARCHAR(10) DEFAULT 'USD',
  overview TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, declined, expired
  amount DECIMAL(15, 2),
  discount_type VARCHAR(50), -- percentage, fixed
  discount_value DECIMAL(15, 2),
  notes TEXT,
  allow_comments BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Estimates Table
CREATE TABLE IF NOT EXISTS sales_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number VARCHAR(50) UNIQUE,
  customer VARCHAR(255) NOT NULL,
  bill_to TEXT,
  ship_to TEXT,
  estimate_date DATE NOT NULL,
  expiry_date DATE,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, declined, expired
  payment_mode VARCHAR(50),
  bank_account_id VARCHAR(255),
  signature_id VARCHAR(255),
  signature_designation VARCHAR(255),
  sale_agent VARCHAR(255),
  discount_type VARCHAR(50),
  discount_value DECIMAL(15, 2),
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  total_amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE,
  customer VARCHAR(255) NOT NULL,
  bill_to TEXT,
  ship_to TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  payment_mode VARCHAR(50),
  bank_account_id VARCHAR(255),
  signature_id VARCHAR(255),
  signature_designation VARCHAR(255),
  sale_agent VARCHAR(255),
  discount_type VARCHAR(50),
  discount_value DECIMAL(15, 2),
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  total_amount DECIMAL(15, 2),
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS sales_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_invoice_id UUID NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_mode VARCHAR(50),
  payment_date DATE NOT NULL,
  transaction_id VARCHAR(255),
  notes TEXT,
  signature_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (record_invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE
);

-- Credit Notes Table
CREATE TABLE IF NOT EXISTS sales_credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number VARCHAR(50) UNIQUE,
  customer VARCHAR(255) NOT NULL,
  related_invoice_id UUID,
  credit_note_date DATE NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  reason VARCHAR(255),
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  total_amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'draft', -- draft, issued, used, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (related_invoice_id) REFERENCES sales_invoices(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_customer ON sales_proposals(customer);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON sales_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_date ON sales_proposals(date);

CREATE INDEX IF NOT EXISTS idx_estimates_customer ON sales_estimates(customer);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON sales_estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_date ON sales_estimates(estimate_date);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON sales_invoices(customer);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON sales_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON sales_invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON sales_payments(record_invoice_id);

CREATE INDEX IF NOT EXISTS idx_credit_notes_customer ON sales_credit_notes(customer);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON sales_credit_notes(status);

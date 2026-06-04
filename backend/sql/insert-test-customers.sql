-- Insert test customer data for communication logging
-- Run this if the customers table is empty

INSERT INTO public.customers (company_name, contact_person, email, phone, address, created_at)
VALUES 
  ('Tech Solutions Inc', 'John Doe', 'john@techsolutions.com', '+1-555-0101', '123 Tech Street, San Francisco, CA', NOW()),
  ('Global Trading Ltd', 'Jane Smith', 'jane@globaltrading.com', '+1-555-0102', '456 Business Ave, New York, NY', NOW()),
  ('Innovation Labs', 'Mike Johnson', 'mike@innolabs.com', '+1-555-0103', '789 Future Blvd, Austin, TX', NOW()),
  ('Services Pro', 'Sarah Williams', 'sarah@servicespro.com', '+1-555-0104', '321 Commerce Drive, Chicago, IL', NOW())
ON CONFLICT DO NOTHING;

-- Verify customers were inserted
SELECT id, company_name, contact_person, email FROM public.customers LIMIT 5;

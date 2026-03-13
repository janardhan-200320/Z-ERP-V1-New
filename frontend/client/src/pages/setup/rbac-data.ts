export type AccessAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface ComponentNode {
  component: string;
  actions: AccessAction[];
}

export interface SectionNode {
  section: string;
  components: ComponentNode[];
}

export interface ModuleNode {
  module: string;
  sections: SectionNode[];
}

export interface RoleTemplate {
  key: string;
  name: string;
  description: string;
  level: 'Admin' | 'Manager' | 'User';
  permissionKeys: string[];
  defaultSettings: string[];
}

export const ACTION_LABEL: Record<AccessAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
};

export const RBAC_TREE: ModuleNode[] = [
  {
    module: 'Dashboard',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Dashboard Home', actions: ['view', 'export'] },
          { component: 'Widgets', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
  {
    module: 'Projects',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Project List', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Project Detail', actions: ['view', 'edit', 'approve', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'HRM',
    sections: [
      {
        section: 'Core',
        components: [
          { component: 'HRM Dashboard', actions: ['view', 'export'] },
          { component: 'Employees', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Attendance', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Payroll', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Insurance', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Assets', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Performance', actions: ['view', 'create', 'edit', 'approve'] },
          { component: 'Letters', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Travel Expense', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Automation', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Workflows', actions: ['view', 'create', 'edit', 'approve'] },
          { component: 'Onboarding', actions: ['view', 'create', 'approve'] },
        ],
      },
    ],
  },
  {
    module: 'CRM',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'CRM Dashboard', actions: ['view', 'export'] },
          { component: 'Call Status', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Sales',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Sales Dashboard', actions: ['view', 'export'] },
          { component: 'Proposals', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { component: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Accounts',
    sections: [
      {
        section: 'Banking',
        components: [
          { component: 'Bank Accounts', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Bank Reconciliation', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Cheque Management', actions: ['view', 'create', 'edit', 'approve', 'delete'] },
          { component: 'Cash & Bank Entries', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        ],
      },
      {
        section: 'Income & Expense',
        components: [
          { component: 'Income', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Expenses', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Receivables', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Payables', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Reports', actions: ['view', 'export'] },
          { component: 'Settings', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
  {
    module: 'Recruitment',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Recruitment Dashboard', actions: ['view', 'create', 'edit', 'approve', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Customers',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Dashboard', actions: ['view', 'export'] },
          { component: 'Customers List', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Groups', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Communication', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Contracts',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Dashboard', actions: ['view', 'export'] },
          { component: 'Active Contracts', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { component: 'Renewals', actions: ['view', 'create', 'edit', 'approve'] },
          { component: 'Alerts', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Types', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
  {
    module: 'Vendors',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Vendor List', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Vendor Payments', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { component: 'Documentation', actions: ['view', 'create', 'edit', 'delete', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Team Space',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Dashboard', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Calls', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Chat', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
  {
    module: 'Profile',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Employee Profile', actions: ['view', 'create', 'edit', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Subscription',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Subscription Plans', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Setup',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Staff', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { component: 'Groups', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Permissions', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
  {
    module: 'Leads',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Lead Intake', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
          { component: 'Assignment', actions: ['view', 'create', 'edit', 'approve'] },
          { component: 'Sources', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Status', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Call Status', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Notes', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Communication', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { component: 'Proposals', actions: ['view', 'create', 'edit', 'approve', 'export'] },
        ],
      },
    ],
  },
  {
    module: 'Admin',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Company Details', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Domain Setup', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Users', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
          { component: 'Roles & Permissions', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
        ],
      },
    ],
  },
  {
    module: 'Settings',
    sections: [
      {
        section: 'Main',
        components: [
          { component: 'Overview', actions: ['view', 'export'] },
          { component: 'General', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Email', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'E-Sign', actions: ['view', 'create', 'edit', 'delete'] },
          { component: 'Leads Settings', actions: ['view', 'create', 'edit', 'delete'] },
        ],
      },
    ],
  },
];

export const keyOf = (module: string, section: string, component: string, action: AccessAction) =>
  `${module}|${section}|${component}|${action}`;

export const flattenPermissionKeys = (tree: ModuleNode[] = RBAC_TREE) =>
  tree.flatMap((mod) =>
    mod.sections.flatMap((sec) =>
      sec.components.flatMap((comp) => comp.actions.map((action) => keyOf(mod.module, sec.section, comp.component, action))),
    ),
  );

const allKeys = flattenPermissionKeys();
const supportKeys = allKeys.filter((k) =>
  k.startsWith('Dashboard|') ||
  k.startsWith('CRM|') ||
  k.startsWith('Leads|') ||
  k.startsWith('Team Space|') ||
  k.endsWith('|view'),
);
const hrKeys = allKeys.filter((k) => k.startsWith('HRM|') || k.includes('Onboarding'));
const customerKeys = allKeys.filter((k) => k.startsWith('Customers|') && (k.endsWith('|view') || k.endsWith('|create')));
const onboardingKeys = allKeys.filter((k) =>
  k.endsWith('|view') ||
  k.startsWith('HRM|Core|Onboarding|create') ||
  k.startsWith('Dashboard|Main|Dashboard Home|view'),
);

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    key: 'super-admin',
    name: 'Admin',
    description: 'Full control over modules, settings, and user access.',
    level: 'Admin',
    permissionKeys: allKeys,
    defaultSettings: ['Full navigation', 'Can assign any role', 'Can override approvals'],
  },
  {
    key: 'staff',
    name: 'Staff',
    description: 'Daily operational access for assigned modules.',
    level: 'User',
    permissionKeys: supportKeys,
    defaultSettings: ['Dashboard quick links', 'Lead board shortcuts'],
  },
  {
    key: 'customer',
    name: 'Customer',
    description: 'Restricted self-service access to customer-facing records.',
    level: 'User',
    permissionKeys: customerKeys,
    defaultSettings: ['Customer portal menu'],
  },
  {
    key: 'new-joinee',
    name: 'New Joinee',
    description: 'Temporary starter access for onboarding period.',
    level: 'User',
    permissionKeys: onboardingKeys,
    defaultSettings: ['Onboarding checklist', 'Starter dashboard'],
  },
  {
    key: 'hr',
    name: 'HR',
    description: 'Manage employee lifecycle, attendance, and payroll approvals.',
    level: 'Manager',
    permissionKeys: hrKeys,
    defaultSettings: ['Employee actions menu', 'HR approvals queue'],
  },
];

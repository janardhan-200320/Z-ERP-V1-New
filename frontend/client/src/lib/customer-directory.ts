export type CustomerDirectoryEntry = {
  id: number;
  companyName: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
  active: boolean;
  groups: string[];
  dateCreated: string;
};

export const customerDirectory: CustomerDirectoryEntry[] = [
  {
    id: 7,
    companyName: 'Arun Pixels Studio',
    primaryContact: '',
    primaryEmail: '',
    phone: '8971766616',
    active: true,
    groups: [],
    dateCreated: '2025-09-15 13:28:11'
  },
  {
    id: 8,
    companyName: 'C Janardhan',
    primaryContact: '',
    primaryEmail: '',
    phone: '8088983604',
    active: true,
    groups: [],
    dateCreated: '2025-10-29 12:06:08'
  },
  {
    id: 4,
    companyName: 'Greeen Dot',
    primaryContact: 'Sajeer Moidu',
    primaryEmail: 'info@greendotdesigns.com',
    phone: '+971 58 667 7503',
    active: true,
    groups: [],
    dateCreated: '2025-09-04 18:53:05'
  },
  {
    id: 5,
    companyName: 'Hello hello',
    primaryContact: '',
    primaryEmail: '',
    phone: '121221212',
    active: true,
    groups: [],
    dateCreated: '2025-09-08 11:46:09'
  },
  {
    id: 2,
    companyName: 'Jack',
    primaryContact: '',
    primaryEmail: '',
    phone: '+917550379111',
    active: true,
    groups: [],
    dateCreated: '2025-08-31 21:34:40'
  },
  {
    id: 6,
    companyName: 'jack',
    primaryContact: '',
    primaryEmail: '',
    phone: '7550379111',
    active: true,
    groups: [],
    dateCreated: '2025-09-08 12:57:31'
  },
  {
    id: 1,
    companyName: 'Sarmad',
    primaryContact: 'Sarmad Staff',
    primaryEmail: 'admin@erpdemo.zedunix.com',
    phone: '+923318144482',
    active: true,
    groups: [],
    dateCreated: '2025-08-25 21:06:48'
  },
  {
    id: 10,
    companyName: 'Zapier Technologies',
    primaryContact: '',
    primaryEmail: '',
    phone: '8317450103',
    active: true,
    groups: [],
    dateCreated: '2026-02-11 15:52:07'
  },
  {
    id: 9,
    companyName: 'Zollid',
    primaryContact: 'Ragni ca',
    primaryEmail: 'raginichavan1703@gmail.com',
    phone: '12',
    active: true,
    groups: [],
    dateCreated: '2026-01-07 12:06:36'
  }
];

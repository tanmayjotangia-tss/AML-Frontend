export interface TenantUIFeature {
  id: string;
  label: string;
  route: string;
  icon?: string;
  roles: string[];
}

export const TENANT_UI_CONFIG: TenantUIFeature[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/tenant/dashboard',
    icon: 'dashboard',
    roles: ['BANK_ADMIN', 'COMPLIANCE_OFFICER']
  },
  {
    id: 'alerts',
    label: 'Alerts',
    route: '/tenant/alerts',
    icon: 'notifications',
    roles: ['BANK_ADMIN', 'COMPLIANCE_OFFICER']
  },
  {
    id: 'cases',
    label: 'Cases',
    route: '/tenant/cases',
    icon: 'folder',
    roles: ['BANK_ADMIN', 'COMPLIANCE_OFFICER']
  },
  {
    id: 'investigation',
    label: 'Investigation',
    route: '/tenant/investigation',
    icon: 'search',
    roles: ['COMPLIANCE_OFFICER']
  },
  {
    id: 'str',
    label: 'STR Filing',
    route: '/tenant/str',
    icon: 'assignment',
    roles: ['COMPLIANCE_OFFICER']
  },
  {
    id: 'rule-engine',
    label: 'Tenant Rules',
    route: '/tenant/rule-engine',
    icon: 'gavel',
    roles: ['BANK_ADMIN']
  },
  {
    id: 'users',
    label: 'User Management',
    route: '/tenant/users',
    icon: 'people',
    roles: ['BANK_ADMIN']
  },
  {
    id: 'upload',
    label: 'Batch Upload',
    route: '/tenant/upload',
    icon: 'cloud_upload',
    roles: ['BANK_ADMIN']
  }
];

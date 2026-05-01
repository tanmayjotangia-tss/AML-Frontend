export interface PlatformAuditLog {
  id?: string;
  actorId?: string;
  actorRole: string;
  tenantId?: string;
  schemaName?: string;
  actionCategory: string;
  actionPerformed: string;
  targetEntityType: string;
  targetEntityId?: string;
  previousState?: string;
  newState?: string;
  ipAddress?: string;
  userAgent?: string;
  sysCreatedAt: string;
}

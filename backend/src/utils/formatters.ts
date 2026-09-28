export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const formatAuditTarget = toAuditTarget;

export const formatPartCode = (partCode: string) => `[${partCode}]`;

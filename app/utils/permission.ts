export const hasPermission = (
  adminPermissions: string[] | undefined,
  required: string | string[]
) => {
  if (!adminPermissions) return false;

  if (Array.isArray(required)) {
    return required.every(p => adminPermissions.includes(p));
  }

  return adminPermissions.includes(required);
};

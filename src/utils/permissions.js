export const checkPermission = (user, moduleName) => {
    if (!user) return 'no_access';

    // Global Admin / Full Control override
    // Global Admin / Full Control override
    // We rely on 'permission' field now, so even Owners can be restricted if needed
    if (user.permission === 'full_control') {
        return 'full_control';
    }

    // Global Data Entry override
    if (user.permission === 'data_entry') {
        return 'data_entry';
    }

    // Module specific permission
    const modulePerm = user.modulePermissions?.[moduleName];

    // Explicit 'no_access' check
    if (modulePerm === 'no_access') return 'no_access';

    // Default to 'view_only' if not specified (unless explicitly 'no_access')
    if (!modulePerm) return 'view_only';
    return modulePerm;
};

export const canEnterData = (permission) => {
    return permission === 'data_entry' || permission === 'full_control';
};

export const canEditDelete = (permission, itemCreatedAt = null) => {
    if (permission === 'full_control') return true;

    // Restricted (Data Entry) users have 30 minutes to edit/delete their OWN entries
    // Note: The UI usually passes 'item' which has 'createdAt'. 
    // If no createdAt is passed, we default to blocking edit for safety OR we could allow if we assume it's a new item? 
    // Better to block if unsure.
    if (permission === 'data_entry' && itemCreatedAt) {
        const created = new Date(itemCreatedAt).getTime();
        const now = Date.now();
        const diffMins = (now - created) / 1000 / 60;
        return diffMins <= 30;
    }

    return false;
};

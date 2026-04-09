export interface IProfileCreate {
    avatar?: string;
    bio?: string;
    address?: string;
}

export interface IProfileUpdate {
    name?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    themePreference?: string;
}

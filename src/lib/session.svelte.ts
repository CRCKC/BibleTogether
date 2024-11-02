type User = {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    uid?: string | null;
};

export type SessionState = {
    user: User | null;
    loading?: boolean;
    loggedIn?: boolean;
};


export function createSession() {
    let value: SessionState = $state({ user: null });

    return {
        get v() { return value },
        set(state: SessionState) {
            value = state;
        },
        update(fn: (state: SessionState) => SessionState) {
            value = fn(value);
        }
    };
}

export const session = createSession();